// Imports nécessaires pour les routes /api/recipes
import { connectDB } from "@/lib/mongodb";                       // Connexion MongoDB
import Recipe from "@/models/Recipe";                            // Modèle Recipe
import { NextRequest, NextResponse } from "next/server";          // Types Next.js
import { extractTokenFromRequest, verifyToken } from "@/lib/auth"; // Auth JWT
import { validateRecipe } from '@/lib/validation';                 // Validation des données

// Nettoie et formate les données reçues du client (sécurité anti-injection)
// Convertit les types et trim les strings
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

// Endpoint GET /api/recipes - Liste les recettes avec recherche, filtres et pagination
export async function GET(request: NextRequest) {
  try {
    // 1. Connexion MongoDB
    await connectDB();

    // 2. Récupération des paramètres de l'URL (?page=1&limit=10&q=...)
    const searchParams = request.nextUrl.searchParams;
    // Pagination : page minimum 1, limit max 50
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));
    const skip = (page - 1) * limit;  // Nombre d'éléments à sauter

    // 3. Récupération des filtres de recherche
    const q = (searchParams.get('q') || '').trim();              // Recherche textuelle
    const country = (searchParams.get('country') || '').trim();   // Filtre pays
    const type = (searchParams.get('type') || '').trim();         // Filtre type
    const difficulty = searchParams.get('difficulty');            // Filtre difficulté
    const diet = (searchParams.get('diet') || '').trim();         // Filtre régime

    // 4. Construction dynamique de la requête MongoDB
    const query: Record<string, unknown> = {};

    // Recherche textuelle dans nom, pays ou ingrédients (insensible à la casse)
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },           // i = insensible casse
        { country: { $regex: q, $options: 'i' } },
        { ingredients: { $elemMatch: { $regex: q, $options: 'i' } } },  // recherche dans tableau
      ];
    }
    // Application des filtres exacts
    if (country) query.country = country;
    if (type) query.type = type;
    if (diet) query.diet = diet;
    if (difficulty && !Number.isNaN(Number(difficulty))) query.difficulty = Number(difficulty);

    // 5. Exécution en parallèle des deux requêtes (performance)
    const [recipes, total] = await Promise.all([
      Recipe.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),  // Recettes paginées
      Recipe.countDocuments(query),                                          // Total pour pagination
    ]);

    return NextResponse.json({
      success: true,
      data: recipes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    console.error('Erreur dans GET /api/recipes:', error);
    return NextResponse.json({ success: false, error: 'Erreur lors de la récupération des recettes' }, { status: 500 });
  }
}

// Endpoint POST /api/recipes - Crée une nouvelle recette (authentification requise)
export async function POST(request: NextRequest) {
  try {
    // 1. Connexion MongoDB
    await connectDB();

    // 2. Extraction et vérification du token JWT
    const token = extractTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ success: false, error: "Token d'authentification manquant" }, { status: 401 });
    }

    // Vérifie le token et récupère le payload (userId, email, username)
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Token invalide' }, { status: 401 });
    }

    // 3. Lecture, nettoyage et validation des données
    const body = await request.json();
    const recipeData = sanitizeRecipePayload(body);     // Nettoyage anti-injection
    const validation = validateRecipe(recipeData);       // Validation métier
    if (!validation.isValid) {
      return NextResponse.json({ success: false, error: validation.errors.join(' | ') }, { status: 400 });
    }

    // 4. Création de la recette en associant l'auteur (utilisateur connecté)
    const recipe = await Recipe.create({ ...recipeData, authorId: payload.userId });

    // 5. Réponse 201 Created avec la recette créée
    return NextResponse.json({ success: true, data: recipe, message: 'Recette créée avec succès' }, { status: 201 });
  } catch (error) {
    console.error('Erreur dans POST /api/recipes:', error);
    return NextResponse.json({ success: false, error: 'Erreur lors de la création de la recette' }, { status: 500 });
  }
}
