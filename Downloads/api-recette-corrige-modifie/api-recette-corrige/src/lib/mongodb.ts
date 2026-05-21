// Import de Mongoose pour la connexion à MongoDB
import mongoose from "mongoose";

// Récupère l'URI MongoDB depuis les variables d'environnement (.env.local)
const MONGODB_URI = process.env.MONGODB_URI as string;

// Vérifie que l'URI est bien défini, sinon erreur au démarrage
if (!MONGODB_URI) {
  throw new Error("❌ MONGODB_URI manquant dans .env.local");
}

// Variable globale pour suivre l'état de la connexion (singleton pattern)
// Évite de créer plusieurs connexions à chaque requête
let isConnected = false;

// Fonction pour se connecter à MongoDB
// À appeler avant chaque opération sur la base de données
export async function connectDB() {
  // Si déjà connecté, ne rien faire (économie de ressources)
  if (isConnected) {
    return;
  }

  // Connexion à MongoDB via l'URI
  const db = await mongoose.connect(MONGODB_URI);
  // readyState === 1 signifie "connecté"
  isConnected = db.connections[0].readyState === 1;

  console.log("📌 Connecté à MongoDB");
}
