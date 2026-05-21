// Imports Next.js et fonction de vérification JWT
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

// Middleware global Next.js - s'exécute avant chaque requête
// Protège les pages et routes API en vérifiant l'authentification
export function middleware(request: NextRequest) {
  // Liste des routes publiques (accessibles sans authentification)
  const publicRoutes = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/recipes',
    '/api/recipes/[id]',
    '/login',
    '/register',
    '/',
    '/recettes',
    '/recettes/[id]',
    '/api/system/indexes'
  ];

  // Vérifie si la route demandée est dans la liste des routes publiques
  const isPublicRoute = publicRoutes.some(route => {
    // Convertit les paramètres dynamiques [id] en regex (ex: /recettes/[id])
    const routePattern = route.replace(/\[.*?\]/g, '[^/]+');
    const regex = new RegExp(`^${routePattern}$`);
    return regex.test(request.nextUrl.pathname);
  });

  // Route publique → accès autorisé sans vérification
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // === ROUTES API PROTÉGÉES ===
  // Pour les routes API non publiques, vérifie le token JWT dans le header
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Récupère le token depuis le header "Authorization: Bearer <token>"
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    // Pas de token → 401 Unauthorized
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'Token d\'authentification manquant'
        },
        { status: 401 }
      );
    }

    // Vérifie la validité du token (signature et expiration)
    const payload = verifyToken(token);

    // Token invalide ou expiré → 401
    if (!payload) {
      return NextResponse.json(
        {
          success: false,
          error: 'Token d\'authentification invalide ou expiré'
        },
        { status: 401 }
      );
    }

    // Ajoute les infos utilisateur dans les headers pour les routes API
    // Permet aux handlers de récupérer l'utilisateur connecté
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.userId);
    requestHeaders.set('x-user-email', payload.email);
    requestHeaders.set('x-user-username', payload.username);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // === PAGES PROTÉGÉES ===
  // Pour les pages (non-API), vérifie le token via cookie
  const token = request.cookies.get('auth-token')?.value;

  // Pas de cookie → redirige vers /login avec paramètre redirect pour revenir après
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Vérifie la validité du token
  const payload = verifyToken(token);

  // Token invalide → redirige vers /login
  if (!payload) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Tout est OK → laisse passer la requête
  return NextResponse.next();
}

// Configuration du middleware - définit sur quelles routes il s'applique
export const config = {
  matcher: [
    /*
     * S'applique à toutes les routes SAUF :
     * - _next/static (fichiers statiques)
     * - _next/image (images optimisées)
     * - favicon.ico
     * - fichiers images (svg, png, jpg, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
