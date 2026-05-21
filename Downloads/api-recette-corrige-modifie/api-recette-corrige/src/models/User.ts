// Import de Mongoose - ODM (Object Data Modeling) pour MongoDB
import mongoose, { Schema, models } from "mongoose";

// Définition du schéma Utilisateur - structure d'un user dans MongoDB
const UserSchema = new Schema(
  {
    // Nom d'utilisateur unique (3 à 30 caractères)
    username: { 
      type: String, 
      required: true,    // Champ obligatoire
      unique: true,      // Doit être unique dans la base
      trim: true,        // Supprime les espaces en début/fin
      minlength: 3,      // Minimum 3 caractères
      maxlength: 30      // Maximum 30 caractères
    },
    // Email unique de l'utilisateur (sert d'identifiant pour la connexion)
    email: { 
      type: String, 
      required: true, 
      unique: true,      // Pas deux utilisateurs avec le même email
      lowercase: true,   // Convertit automatiquement en minuscules
      trim: true
    },
    // Mot de passe HASHÉ avec bcrypt (jamais stocké en clair !)
    password: { 
      type: String, 
      required: true,
      minlength: 6       // Minimum 6 caractères avant hashage
    },
    // Prénom
    firstName: { 
      type: String, 
      required: true,
      trim: true
    },
    // Nom de famille
    lastName: { 
      type: String, 
      required: true,
      trim: true
    },
    // URL de l'avatar (optionnel)
    avatar: { 
      type: String, 
      default: null 
    },
    // Biographie courte de l'utilisateur
    bio: { 
      type: String, 
      maxlength: 500,    // Max 500 caractères
      default: ""
    },
    // Liste des recettes favorites - références vers le modèle Recipe
    favorites: [{ 
      type: Schema.Types.ObjectId,  // Type ID MongoDB
      ref: 'Recipe'                 // Référence au modèle Recipe (relation)
    }],
    // Statut du compte (actif/désactivé)
    isActive: { 
      type: Boolean, 
      default: true 
    },
    // Date de la dernière connexion
    lastLogin: { 
      type: Date, 
      default: null 
    }
  },
  { 
    timestamps: true     // Ajoute automatiquement createdAt et updatedAt
  }
);

// Index pour optimiser les recherches sur email et username (performance)
UserSchema.index({ email: 1 });     // Index ascendant sur email
UserSchema.index({ username: 1 });  // Index ascendant sur username

// Création du modèle - réutilise s'il existe déjà (évite erreurs hot-reload)
const User = models.User || mongoose.model("User", UserSchema);
export default User;
