// Imports nécessaires pour la route de connexion
import { connectDB } from "@/lib/mongodb";              // Connexion à MongoDB
import User from "@/models/User";                       // Modèle User
import { NextRequest, NextResponse } from "next/server"; // Types Next.js
import { comparePassword, createAuthResponse } from "@/lib/auth"; // Fonctions auth

export interface LoginData {
  email: string;
  password: string;
}

// Valide les données de connexion (email + mot de passe)
export function validateLoginData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validation de l'email avec regex (format: x@y.z)
  if (!data.email || typeof data.email !== 'string') {
    errors.push('L\'email est requis');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('L\'email n\'est pas valide');
  }

  // Vérification de la présence du mot de passe
  if (!data.password || typeof data.password !== 'string') {
    errors.push('Le mot de passe est requis');
  }

  return {
    isValid: errors.length === 0,  // Valide si aucune erreur
    errors
  };
}

// Endpoint POST /api/auth/login - Connexion utilisateur
export async function POST(request: NextRequest) {
  try {
    // 1. Connexion à la base de données MongoDB
    await connectDB();

    // 2. Récupération des données du body de la requête (JSON)
    const body = await request.json();

    // 3. Validation des données reçues
    const validation = validateLoginData(body);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Données invalides',
          details: validation.errors
        },
        { status: 400 }
      );
    }

    // Extraction des champs depuis le body
    const { email, password } = body;

    // 4. Recherche de l'utilisateur dans la base par email
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Utilisateur introuvable → message générique (sécurité : ne révèle pas si l'email existe)
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email ou mot de passe incorrect'
        },
        { status: 401 }
      );
    }

    // 5. Vérifie que le compte n'est pas désactivé
    if (!user.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: 'Ce compte a été désactivé'
        },
        { status: 401 }
      );
    }

    // 6. Vérifie le mot de passe avec bcrypt (compare hash vs clair)
    const isPasswordValid = await comparePassword(password, user.password);

    // Mot de passe incorrect → même message générique
    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email ou mot de passe incorrect'
        },
        { status: 401 }
      );
    }

    // 7. Met à jour la date de dernière connexion
    user.lastLogin = new Date();
    await user.save();

    // 8. Génère le token JWT et retourne la réponse avec les infos utilisateur
    const response = createAuthResponse(user);
    return NextResponse.json(response);

  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la connexion'
      },
      { status: 500 }
    );
  }
}
