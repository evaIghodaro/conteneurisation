# Recettes du Monde

Plateforme communautaire pour découvrir et partager des recettes du monde entier, construite avec **Next.js 16**, **TypeScript** et **MongoDB**.

## Fonctionnalités

- Authentification sécurisée (JWT + bcrypt)
- CRUD complet sur les recettes (créer, modifier, supprimer)
- Recherche avancée + filtres (pays, type, difficulté, régime)
- Système de favoris
- Upload d'images optimisé (conversion WebP automatique)
- Interface responsive

## Stack

| Catégorie | Technologies |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Lucide |
| Backend | Next.js API Routes, Mongoose |
| Base de données | MongoDB |
| Sécurité | JWT, bcryptjs |

## Démarrage

### Prérequis
- Node.js 18+
- MongoDB (local ou Atlas)

### Installation

```bash
# Installer les dépendances
npm install

# Créer un fichier .env.local (voir section ci-dessous)

# Lancer le serveur
npm run dev
```

L'application sera disponible sur **http://localhost:3001**

### Variables d'environnement

Créer un fichier `.env.local` à la racine :

```env
MONGODB_URI=mongodb://localhost:27017/recettes-du-monde
JWT_SECRET=votre-secret-jwt-tres-securise
```

## Structure

```
src/
├── app/                  # Pages + routes API (App Router)
│   ├── api/              # Endpoints REST (auth, recipes, favorites…)
│   ├── recettes/         # Liste et détail des recettes
│   ├── recipes/          # Création et édition de recettes
│   ├── login, register   # Pages d'authentification
│   ├── favorites         # Page favoris (protégée)
│   ├── my-recipes        # Mes recettes (protégée)
│   └── profile           # Profil utilisateur (protégée)
├── components/           # Header, RecipeSearch, RecipeCover, ImageUploadField
├── context/              # AuthContext (état global)
├── lib/                  # auth, mongodb, validation, errorHandler, middleware
├── models/               # Schémas Mongoose : User, Recipe
└── middleware.ts         # Protection globale des routes
```

## Endpoints API

### Authentification

| Méthode | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Non | Créer un compte |
| POST | `/api/auth/login` | Non | Se connecter |

### Recettes

| Méthode | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/recipes` | Non | Liste paginée + filtres |
| POST | `/api/recipes` | Oui | Créer une recette |
| GET | `/api/recipes/[id]` | Non | Détail d'une recette |
| PUT | `/api/recipes/[id]` | Oui | Modifier (auteur) |
| DELETE | `/api/recipes/[id]` | Oui | Supprimer (auteur) |
| GET | `/api/recipes/my-recipes` | Oui | Mes recettes |

### Favoris

| Méthode | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/favorites` | Oui | Liste des favoris |
| POST | `/api/favorites` | Oui | Ajouter un favori |
| DELETE | `/api/favorites/[id]` | Oui | Retirer un favori |

### Paramètres de filtres (GET /api/recipes)

`?page=1&limit=10&q=texte&country=France&type=Plat&difficulty=3&diet=Vegetarien`

## Sécurité

- **Mots de passe hashés** avec bcrypt (12 rounds)
- **Tokens JWT** signés, expiration 7 jours
- **Middleware global** qui protège toutes les routes sensibles
- **Validation côté serveur** sur tous les inputs
- **Permissions** : seul l'auteur peut modifier/supprimer sa recette

## Format de réponse standard

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "pages": 5
  }
}
```

## Déploiement

Le projet est prêt pour Vercel : connecte le repo, configure `MONGODB_URI` et `JWT_SECRET`, et déploie.

```bash
# Build production
npm run build
npm start
```
