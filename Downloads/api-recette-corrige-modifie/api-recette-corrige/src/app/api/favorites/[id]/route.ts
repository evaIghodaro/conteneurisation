import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Recipe from "@/models/Recipe";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

async function getRouteId(context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  return params.id;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const recipeId = await getRouteId(context);
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Token d'authentification manquant" },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Token invalide' },
        { status: 401 }
      );
    }

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return NextResponse.json(
        { success: false, error: 'Recette non trouvée' },
        { status: 404 }
      );
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    const alreadyFavorite = (user.favorites || []).some((favoriteId: unknown) => String(favoriteId) === recipeId);
    if (!alreadyFavorite) {
      user.favorites = [...(user.favorites || []), recipe._id];
      await user.save();
    }

    return NextResponse.json({
      success: true,
      message: alreadyFavorite
        ? 'Recette déjà dans les favoris'
        : 'Recette ajoutée aux favoris avec succès',
      data: {
        userId: user._id,
        favorites: user.favorites,
      },
    });
  } catch (error) {
    console.error('Erreur dans POST /api/favorites/[id]:', error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de l'ajout aux favoris",
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const recipeId = await getRouteId(context);
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Token d'authentification manquant" },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Token invalide' },
        { status: 401 }
      );
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    user.favorites = (user.favorites || []).filter((favoriteId: unknown) => String(favoriteId) !== recipeId);
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Recette retirée des favoris avec succès',
      data: {
        userId: user._id,
        favorites: user.favorites,
      },
    });
  } catch (error) {
    console.error('Erreur dans DELETE /api/favorites/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors du retrait des favoris' },
      { status: 500 }
    );
  }
}
