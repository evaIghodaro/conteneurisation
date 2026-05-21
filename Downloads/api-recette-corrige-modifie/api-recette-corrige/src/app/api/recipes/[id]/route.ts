import { connectDB } from "@/lib/mongodb";
import Recipe from "@/models/Recipe";
import { NextRequest, NextResponse } from "next/server";
import { extractTokenFromRequest, verifyToken } from "@/lib/auth";
import { validateRecipe } from '@/lib/validation';

async function getRouteId(context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  return params.id;
}

function sanitizeRecipePayload(body: Record<string, unknown>) {
  return {
    name: typeof body.name === 'string' ? body.name.trim() : '',
    country: typeof body.country === 'string' ? body.country.trim() : '',
    type: typeof body.type === 'string' ? body.type : 'Plat',
    diet: typeof body.diet === 'string' ? body.diet : 'Normal',
    ingredients: Array.isArray(body.ingredients) ? body.ingredients.map((v) => String(v).trim()).filter(Boolean) : [],
    steps: Array.isArray(body.steps) ? body.steps.map((v) => String(v).trim()).filter(Boolean) : [],
    prepTime: Number(body.prepTime) || 0,
    difficulty: Number(body.difficulty) || 1,
    image: typeof body.image === 'string' ? body.image.trim() : '',
    rating: Number(body.rating) || 0,
  };
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const recipeId = await getRouteId(context);

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return NextResponse.json({ success: false, error: 'Recette non trouvée' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: recipe });
  } catch (error) {
    console.error('Erreur dans GET /api/recipes/[id]:', error);
    return NextResponse.json({ success: false, error: 'Erreur lors de la récupération de la recette' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const token = extractTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ success: false, error: "Token d'authentification manquant" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Token invalide' }, { status: 401 });
    }

    const recipeId = await getRouteId(context);
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return NextResponse.json({ success: false, error: 'Recette non trouvée' }, { status: 404 });
    }

    if (String(recipe.authorId) !== payload.userId) {
      return NextResponse.json({ success: false, error: "Vous n'êtes pas autorisé à modifier cette recette" }, { status: 403 });
    }

    const body = await request.json();
    const recipeData = sanitizeRecipePayload(body);
    const validation = validateRecipe(recipeData);
    if (!validation.isValid) {
      return NextResponse.json({ success: false, error: validation.errors.join(' | ') }, { status: 400 });
    }

    Object.assign(recipe, recipeData, { updatedAt: new Date() });
    await recipe.save();

    return NextResponse.json({ success: true, data: recipe, message: 'Recette mise à jour avec succès' });
  } catch (error) {
    console.error('Erreur dans PUT /api/recipes/[id]:', error);
    return NextResponse.json({ success: false, error: 'Erreur lors de la mise à jour de la recette' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const token = extractTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ success: false, error: "Token d'authentification manquant" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Token invalide' }, { status: 401 });
    }

    const recipeId = await getRouteId(context);
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return NextResponse.json({ success: false, error: 'Recette non trouvée' }, { status: 404 });
    }

    if (String(recipe.authorId) !== payload.userId) {
      return NextResponse.json({ success: false, error: "Vous n'êtes pas autorisé à supprimer cette recette" }, { status: 403 });
    }

    await Recipe.findByIdAndDelete(recipeId);

    return NextResponse.json({ success: true, message: 'Recette supprimée avec succès' });
  } catch (error) {
    console.error('Erreur dans DELETE /api/recipes/[id]:', error);
    return NextResponse.json({ success: false, error: 'Erreur lors de la suppression de la recette' }, { status: 500 });
  }
}
