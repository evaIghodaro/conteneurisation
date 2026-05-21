import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Recipe from "@/models/Recipe";
import { NextRequest, NextResponse } from "next/server";

// POST : ajouter une recette aux favoris (version simplifiée)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 Début de la requête POST favorites...');
    
    await connectDB();
    console.log('✅ Connexion à MongoDB réussie');

    const recipeId = params.id;
    console.log(`📝 Recipe ID: ${recipeId}`);

    // Récupérer le token du header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      console.log('❌ Token manquant');
      return NextResponse.json(
        {
          success: false,
          error: 'Token d\'authentification manquant'
        },
        { status: 401 }
      );
    }

    console.log('✅ Token trouvé');

    // Vérifier que la recette existe
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      console.log('❌ Recette non trouvée');
      return NextResponse.json(
        {
          success: false,
          error: 'Recette non trouvée'
        },
        { status: 404 }
      );
    }

    console.log('✅ Recette trouvée');

    // Pour l'instant, on simule l'ajout aux favoris
    // TODO: Implémenter la vraie logique avec l'utilisateur
    
    return NextResponse.json(
      {
        success: true,
        message: 'Recette ajoutée aux favoris avec succès (simulation)'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Erreur dans POST favorites:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de l\'ajout aux favoris',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
