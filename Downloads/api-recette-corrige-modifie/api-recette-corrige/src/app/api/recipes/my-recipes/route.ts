import { connectDB } from "@/lib/mongodb";
import Recipe from "@/models/Recipe";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

// GET : récupérer les recettes de l'utilisateur connecté
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Récupérer le token du header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'Token d\'authentification manquant'
        },
        { status: 401 }
      );
    }

    // Vérifier le token
    const payload = verifyToken(token);
    
    if (!payload) {
      return NextResponse.json(
        {
          success: false,
          error: 'Token invalide'
        },
        { status: 401 }
      );
    }

    // Récupérer les paramètres de pagination
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    const skip = (page - 1) * limit;

    // Récupérer les recettes de l'utilisateur
    const recipes = await Recipe.find({ authorId: payload.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Recipe.countDocuments({ authorId: payload.userId });

    return NextResponse.json({
      success: true,
      data: recipes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('❌ Erreur dans GET my-recipes:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération des recettes',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
