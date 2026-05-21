// Import des librairies pour l'authentification
import bcrypt from 'bcryptjs';           // Pour le hashage des mots de passe
import jwt from 'jsonwebtoken';           // Pour la génération et vérification des tokens JWT
import { NextRequest } from 'next/server'; // Type pour les requêtes Next.js

// Configuration JWT - secret et expiration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'; // Clé secrète pour signer les tokens
const JWT_EXPIRES_IN = '7d';  // Durée de validité du token (7 jours)

// Interface définissant la structure du payload JWT
export interface JWTPayload {
  userId: string;      // ID de l'utilisateur
  email: string;       // Email de l'utilisateur
  username: string;    // Nom d'utilisateur
}

// Fonction pour hasher un mot de passe avec bcrypt
// Le hashage rend le mot de passe irréversible et sécurisé
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;  // Nombre de tours de hashage (plus = plus sécurisé mais plus lent)
  return bcrypt.hash(password, saltRounds);
}

// Fonction pour comparer un mot de passe en clair avec son hash
// Retourne true si le mot de passe correspond au hash
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Fonction pour générer un token JWT
// Le token contient les infos utilisateur et est signé avec la clé secrète
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Fonction pour vérifier et décoder un token JWT
// Retourne le payload si le token est valide, null sinon
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;  // Token invalide ou expiré
  }
}

// Fonction pour extraire le token JWT d'une requête
// Cherche le token dans l'en-tête Authorization ou dans les cookies
export function extractTokenFromRequest(request: NextRequest): string | null {
  // 1. Cherche dans l'en-tête Authorization (format: "Bearer <token>")
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);  // Retire "Bearer " pour obtenir le token
  }

  // 2. Cherche dans les cookies HTTP-only
  const cookieToken = request.cookies.get('auth-token')?.value;
  if (cookieToken) {
    return decodeURIComponent(cookieToken);  // Décode le token s'il est URL-encoded
  }

  return null;  // Aucun token trouvé
}

// Fonction pour créer une réponse d'authentification standardisée
// Formate les données utilisateur et génère un token si demandé
export function createAuthResponse(user: any, includeToken: boolean = true) {
  // Crée un objet utilisateur avec seulement les champs nécessaires (pas le mot de passe !)
  const userResponse = {
    id: user._id,              // ID MongoDB
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    avatar: user.avatar,
    bio: user.bio,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin
  };

  // Si un token est demandé, le génère et l'inclut dans la réponse
  if (includeToken) {
    const token = generateToken({
      userId: user._id.toString(),  // Convertit l'ID MongoDB en string
      email: user.email,
      username: user.username
    });

    return {
      success: true,
      data: {
        user: userResponse,  // Données utilisateur
        token                // Token JWT
      }
    };
  }

  // Sinon, retourne seulement les données utilisateur
  return {
    success: true,
    data: userResponse
  };
}
