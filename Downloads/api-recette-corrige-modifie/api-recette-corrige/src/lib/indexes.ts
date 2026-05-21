import mongoose from 'mongoose';
import Recipe from '@/models/Recipe';
import User from '@/models/User';

export async function createIndexes() {
  try {
    console.log('🔍 Création des index MongoDB...');

    // Index pour les recettes
    await Recipe.collection.createIndex(
      { 
        name: 'text', 
        country: 'text', 
        ingredients: 'text',
        type: 'text',
        diet: 'text'
      },
      { 
        name: 'recipe_search_index',
        weights: {
          name: 10,
          country: 5,
          ingredients: 3,
          type: 2,
          diet: 1
        }
      }
    );
    
    // Index pour les filtres courants
    await Recipe.collection.createIndex({ country: 1 }, { name: 'recipe_country_index' });
    await Recipe.collection.createIndex({ type: 1 }, { name: 'recipe_type_index' });
    await Recipe.collection.createIndex({ diet: 1 }, { name: 'recipe_diet_index' });
    await Recipe.collection.createIndex({ difficulty: 1 }, { name: 'recipe_difficulty_index' });
    await Recipe.collection.createIndex({ rating: -1 }, { name: 'recipe_rating_index' });
    
    // Index composés pour les requêtes complexes
    await Recipe.collection.createIndex({ country: 1, type: 1 }, { name: 'recipe_country_type_index' });
    await Recipe.collection.createIndex({ diet: 1, difficulty: 1 }, { name: 'recipe_diet_difficulty_index' });
    
    // Index pour l'auteur et les dates
    await Recipe.collection.createIndex({ authorId: 1 }, { name: 'recipe_author_index' });
    await Recipe.collection.createIndex({ createdAt: -1 }, { name: 'recipe_created_at_index' });
    await Recipe.collection.createIndex({ updatedAt: -1 }, { name: 'recipe_updated_at_index' });
    
    // Index pour la pagination
    await Recipe.collection.createIndex({ createdAt: -1, _id: 1 }, { name: 'recipe_pagination_index' });

    // Index pour les utilisateurs
    await User.collection.createIndex({ email: 1 }, { name: 'user_email_index', unique: true });
    await User.collection.createIndex({ favorites: 1 }, { name: 'user_favorites_index' });
    await User.collection.createIndex({ createdAt: -1 }, { name: 'user_created_at_index' });

    console.log('✅ Index MongoDB créés avec succès');
    
    // Afficher les index créés
    const recipeIndexes = await Recipe.collection.getIndexes();
    const userIndexes = await User.collection.getIndexes();
    
    console.log('📊 Index des recettes:', Object.keys(recipeIndexes));
    console.log('📊 Index des utilisateurs:', Object.keys(userIndexes));
    
  } catch (error) {
    console.error('❌ Erreur lors de la création des index:', error);
    throw error;
  }
}

// Fonction pour vérifier et créer les index si nécessaire
export async function ensureIndexes() {
  try {
    const recipeIndexes = await Recipe.collection.getIndexes();
    const hasSearchIndex = Object.keys(recipeIndexes).includes('recipe_search_index');
    
    if (!hasSearchIndex) {
      console.log('🔧 Index manquants détectés, création en cours...');
      await createIndexes();
    } else {
      console.log('✅ Index déjà existants');
    }
  } catch (error) {
    console.error('❌ Erreur lors de la vérification des index:', error);
  }
}
