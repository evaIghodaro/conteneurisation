// Import Mongoose pour la modélisation MongoDB
import mongoose, { Schema, models } from "mongoose";

// Schéma Recipe - définit la structure d'une recette dans MongoDB
const RecipeSchema = new Schema(
  {
    // Nom de la recette (obligatoire)
    name: { type: String, required: true, trim: true },
    // Pays d'origine de la recette
    country: { type: String, required: true, trim: true },
    // Type de plat - limité à 3 valeurs (enum = liste fermée)
    type: { type: String, enum: ['Entrée', 'Plat', 'Dessert'], required: true },
    // Régime alimentaire - 5 options possibles
    diet: { type: String, enum: ['Normal', 'Végétarien', 'Végan', 'Halal', 'Casher'], default: 'Normal' },
    // Liste des ingrédients (tableau de chaînes)
    ingredients: { type: [String], required: true },
    // Étapes de préparation (tableau de chaînes, optionnel)
    steps: { type: [String], default: [] },
    // Temps de préparation en minutes
    prepTime: { type: Number, required: true },
    // Niveau de difficulté de 1 (facile) à 5 (très difficile)
    difficulty: { type: Number, min: 1, max: 5, required: true },
    // URL de l'image de la recette
    image: { type: String, default: '' },
    // ID de l'auteur (utilisateur qui a créé la recette)
    authorId: { type: String, default: 'anonymous' },
    // Note moyenne 0 à 5 étoiles
    rating: { type: Number, default: 0, min: 0, max: 5 },
  },
  { timestamps: true }   // Ajoute automatiquement createdAt et updatedAt
);

// Création du modèle Recipe (évite la redéfinition lors du hot-reload)
const Recipe = models.Recipe || mongoose.model("Recipe", RecipeSchema);
export default Recipe;
