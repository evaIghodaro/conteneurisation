import { connectDB } from "@/lib/mongodb";
import Recipe from "@/models/Recipe";
import { NextResponse } from "next/server";

const defaultRecipes = [
  {
    name: "Pasta Carbonara",
    country: "Italy",
    type: "Plat",
    diet: "Normal",
    ingredients: ["Pasta", "Eggs", "Bacon", "Pecorino Romano"],
    steps: ["Faire bouillir l'eau salée", "Cuire les pâtes", "Préparer la sauce", "Mélanger"],
    prepTime: 20,
    difficulty: 2,
    rating: 4.5
  },
  {
    name: "Pad Thai",
    country: "Thailand",
    type: "Plat",
    diet: "Normal",
    ingredients: ["Rice noodles", "Shrimp", "Eggs", "Peanuts", "Lime"],
    steps: ["Préparer les nouilles", "Faire sauter les crevettes", "Ajouter les nouilles", "Garnir"],
    prepTime: 25,
    difficulty: 2,
    rating: 4.3
  },
  {
    name: "Coq au Vin",
    country: "France",
    type: "Plat",
    diet: "Normal",
    ingredients: ["Chicken", "Red wine", "Mushrooms", "Pearl onions"],
    steps: ["Préparer le poulet", "Mariner", "Cuire à feu doux", "Servir"],
    prepTime: 90,
    difficulty: 4,
    rating: 4.8
  },
  {
    name: "Sushi Roll",
    country: "Japan",
    type: "Plat",
    diet: "Normal",
    ingredients: ["Sushi rice", "Nori", "Fish", "Cucumber", "Avocado"],
    steps: ["Cuire le riz", "Préparer le nori", "Assembler", "Trancher"],
    prepTime: 45,
    difficulty: 4,
    rating: 4.6
  },
  {
    name: "Tacos al Pastor",
    country: "Mexico",
    type: "Plat",
    diet: "Normal",
    ingredients: ["Pork", "Pineapple", "Tortillas", "Cilantro", "Lime"],
    steps: ["Mariner la viande", "Faire cuire", "Préparer les tortillas", "Assembler"],
    prepTime: 30,
    difficulty: 2,
    rating: 4.4
  },
  {
    name: "Tikka Masala",
    country: "India",
    type: "Plat",
    diet: "Normal",
    ingredients: ["Chicken", "Yogurt", "Tomato sauce", "Spices", "Cream"],
    steps: ["Mariner le poulet", "Griller", "Préparer la sauce", "Mélanger"],
    prepTime: 50,
    difficulty: 3,
    rating: 4.7
  },
  {
    name: "Paella",
    country: "Spain",
    type: "Plat",
    diet: "Normal",
    ingredients: ["Rice", "Saffron", "Seafood", "Peppers", "Onions"],
    steps: ["Préparer le bouillon", "Faire revenir", "Ajouter le riz", "Cuire"],
    prepTime: 60,
    difficulty: 3,
    rating: 4.5
  },
  {
    name: "Moussaka",
    country: "Greece",
    type: "Plat",
    diet: "Végétarien",
    ingredients: ["Eggplant", "Ground lamb", "Béchamel", "Tomato sauce"],
    steps: ["Cuire l'aubergine", "Préparer la viande", "Faire la béchamel", "Assembler et cuire"],
    prepTime: 75,
    difficulty: 4,
    rating: 4.6
  },
  {
    name: "Tom Yum Soup",
    country: "Thailand",
    type: "Entrée",
    diet: "Normal",
    ingredients: ["Shrimp", "Galangal", "Lemongrass", "Lime", "Chili"],
    steps: ["Faire bouillir le bouillon", "Ajouter les épices", "Cuire les crevettes", "Assaisonner"],
    prepTime: 30,
    difficulty: 2,
    rating: 4.3
  },
  {
    name: "Falafel",
    country: "Middle East",
    type: "Entrée",
    diet: "Végan",
    ingredients: ["Chickpeas", "Herbs", "Spices", "Flour"],
    steps: ["Faire tremper les pois chiches", "Moudre", "Former les boules", "Frire"],
    prepTime: 40,
    difficulty: 2,
    rating: 4.2
  },
  {
    name: "Tiramisu",
    country: "Italy",
    type: "Dessert",
    diet: "Normal",
    ingredients: ["Mascarpone", "Ladyfingers", "Coffee", "Cocoa", "Eggs"],
    steps: ["Tremper les biscuits", "Préparer la crème", "Assembler les couches", "Réfrigérer"],
    prepTime: 20,
    difficulty: 2,
    rating: 4.9
  }
];

export async function GET() {
  try {
    await connectDB();
    
    // Vérifier si des recettes existent déjà
    const existingCount = await Recipe.countDocuments();
    if (existingCount > 0) {
      return NextResponse.json(
        { message: 'Les recettes existent déjà', count: existingCount },
        { status: 200 }
      );
    }

    // Ajouter les recettes par défaut
    const recipes = await Recipe.insertMany(defaultRecipes);
    
    return NextResponse.json(
      { 
        message: 'Recettes initialisées avec succès',
        count: recipes.length 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error initializing recipes:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'initialisation des recettes' },
      { status: 500 }
    );
  }
}
