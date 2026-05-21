// Imports Next.js et fonctions d'authentification
import { NextRequest, NextResponse } from "next/server";
import { verifyToken, extractTokenFromRequest } from "@/lib/auth";

// Type étendant NextRequest avec les infos utilisateur (après authentification)
export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string;
    email: string;
    username: string;
  };
}

// Higher-Order Function (HOF) qui protège une route API par authentification JWT
// Usage: export const POST = withAuth(async (req) => { ... })
export function withAuth(handler: (req: NextRequest, context?: any) => Promise<NextResponse>) {
  return async (req: NextRequest, context?: any) => {
    try {
      // 1. Extraire le token JWT de la requête (header ou cookie)
      const token = extractTokenFromRequest(req);

      // 2. Si pas de token → 401 Unauthorized
      if (!token) {
        return NextResponse.json(
          {
            success: false,
            error: 'Token d\'authentification manquant'
          },
          { status: 401 }
        );
      }

      // 3. Vérifier la validité du token
      const payload = verifyToken(token);

      // 4. Si token invalide/expiré → 401
      if (!payload) {
        return NextResponse.json(
          {
            success: false,
            error: 'Token d\'authentification invalide ou expiré'
          },
          { status: 401 }
        );
      }

      // 5. Ajouter les infos utilisateur à la requête (accessible dans le handler)
      (req as any).user = payload;

      // 6. Exécuter le handler original avec la requête authentifiée
      return handler(req, context);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Erreur d\'authentification'
        },
        { status: 500 }
      );
    }
  };
}

// Alias de withAuth - rend l'authentification obligatoire
export function requireAuth(handler: (req: NextRequest, context?: any) => Promise<NextResponse>) {
  return withAuth(handler);
}

// Middleware pour les routes publiques avec auth optionnelle
// Si l'utilisateur est connecté, ses infos sont ajoutées à la requête
// Sinon, la requête continue sans authentification
export function optionalAuth(handler: (req: NextRequest, context?: any) => Promise<NextResponse>) {
  return async (req: NextRequest, context?: any) => {
    try {
      // Tente d'extraire et vérifier le token (sans bloquer si absent)
      const token = extractTokenFromRequest(req);

      if (token) {
        const payload = verifyToken(token);
        if (payload) {
          // Ajoute les infos utilisateur si token valide
          (req as any).user = payload;
        }
      }

      // Toujours exécuter le handler, même sans authentification
      return handler(req, context);
    } catch (error) {
      console.error('Optional auth middleware error:', error);
      // Continue sans authentification en cas d'erreur
      return handler(req, context);
    }
  };
}
