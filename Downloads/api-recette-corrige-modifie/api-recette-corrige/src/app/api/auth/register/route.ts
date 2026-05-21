// Imports nécessaires pour la route d'inscription
import { connectDB } from "@/lib/mongodb";              // Connexion MongoDB
import User from "@/models/User";                       // Modèle User
import { NextRequest, NextResponse } from "next/server"; // Types Next.js
import { hashPassword, createAuthResponse } from "@/lib/auth"; // Hashage + réponse auth

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export function validateRegisterData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.username || typeof data.username !== 'string') {
    errors.push('Le nom d\'utilisateur est requis');
  } else if (data.username.length < 3 || data.username.length > 30) {
    errors.push('Le nom d\'utilisateur doit contenir entre 3 et 30 caractères');
  }

  if (!data.email || typeof data.email !== 'string') {
    errors.push('L\'email est requis');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('L\'email n\'est pas valide');
  }

  if (!data.password || typeof data.password !== 'string') {
    errors.push('Le mot de passe est requis');
  } else if (data.password.length < 6) {
    errors.push('Le mot de passe doit contenir au moins 6 caractères');
  }

  if (!data.firstName || typeof data.firstName !== 'string' || data.firstName.trim().length < 1) {
    errors.push('Le prénom est requis');
  }

  if (!data.lastName || typeof data.lastName !== 'string' || data.lastName.trim().length < 1) {
    errors.push('Le nom de famille est requis');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Endpoint POST /api/auth/register - Inscription d'un nouvel utilisateur
export async function POST(request: NextRequest) {
  try {
    // 1. Connexion MongoDB
    await connectDB();

    // 2. Lecture du body JSON
    const body = await request.json();

    // 3. Validation des champs (username, email, password, firstName, lastName)
    const validation = validateRegisterData(body);
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

    // Extraction des champs du body
    const { username, email, password, firstName, lastName } = body;

    // 4. Vérifie si un utilisateur avec cet email OU username existe déjà
    // $or = OR logique en MongoDB
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'nom d\'utilisateur';
      return NextResponse.json(
        {
          success: false,
          error: `Cet ${field} est déjà utilisé`
        },
        { status: 409 }
      );
    }

    // 5. Hashage du mot de passe avec bcrypt (sécurité)
    const hashedPassword = await hashPassword(password);

    // 6. Création de l'utilisateur en base avec les données nettoyées
    const user = await User.create({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,           // Mot de passe hashé (jamais en clair)
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      lastLogin: new Date()
    });

    // 7. Génère le token JWT et retourne 201 Created
    const response = createAuthResponse(user);
    return NextResponse.json(response, { status: 201 });

  } catch (error: any) {
    console.error('Error during registration:', error);

    // Erreur 11000 = duplication MongoDB (unique constraint)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const fieldName = field === 'email' ? 'email' : 'nom d\'utilisateur';
      return NextResponse.json(
        {
          success: false,
          error: `Cet ${fieldName} est déjà utilisé`
        },
        { status: 409 }
      );
    }

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        {
          success: false,
          error: 'Erreur de validation',
          details: errors
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de l\'inscription'
      },
      { status: 500 }
    );
  }
}
