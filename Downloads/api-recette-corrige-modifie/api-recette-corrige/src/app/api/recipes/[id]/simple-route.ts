import { connectDB } from "@/lib/mongodb";
import Recipe from "@/models/Recipe";
import { NextRequest, NextResponse } from "next/server";

// GET : récupérer une recette par ID (version simplifiée)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 Début de la requête GET recipe by ID...');
    console.log(`📝 Recipe ID: ${params.id}`);
    
    await connectDB();
    console.log('✅ Connexion à MongoDB réussie');

    const recipeId = params.id;
    
    // Vérifier que l'ID est valide
    if (!recipeId) {
      console.log('❌ ID manquant');
      return NextResponse.json(
        { 
          success: false,
          error: 'ID de recette manquant' 
        },
        { status: 400 }
      );
    }

    console.log(`🔍 Recherche de la recette avec ID: ${recipeId}`);
    
    const recipe = await Recipe.findById(recipeId);
    console.log(`📊 Résultat de la recherche:`, recipe ? 'trouvé' : 'non trouvé');

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

    console.log('✅ Recette trouvée:', recipe.name);
    
    return NextResponse.json({
      success: true,
      data: recipe
    });
  } catch (error) {
    console.error('❌ Erreur dans GET recipe by ID:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur lors de la récupération de la recette',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
