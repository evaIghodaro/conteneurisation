import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Recipe from "@/models/Recipe";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

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

    const page = Math.max(1, parseInt(request.nextUrl.searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(request.nextUrl.searchParams.get('limit') || '10', 10)));

    const user = await User.findById(payload.userId).select('favorites');
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    const favoriteIds = (user.favorites || []).map((favoriteId: unknown) => String(favoriteId));
    const total = favoriteIds.length;
    const start = (page - 1) * limit;
    const pageIds = favoriteIds.slice(start, start + limit);

    const favoriteRecipes = pageIds.length
      ? await Recipe.find({ _id: { $in: pageIds } }).sort({ createdAt: -1 })
      : [];

    return NextResponse.json({
      success: true,
      data: favoriteRecipes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    console.error('Erreur dans GET /api/favorites:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des favoris' },
      { status: 500 }
    );
  }
}
