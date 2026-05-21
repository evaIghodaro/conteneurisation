# 📖 API Documentation - Recettes du Monde

## Base URL
```
http://localhost:3001/api
```

## Authentication
La plupart des routes nécessitent un token JWT dans l'en-tête :
```
Authorization: Bearer <votre-token-jwt>
```

## 📋 Endpoints

### 🔐 Authentification

#### POST /auth/register
**Description** : Inscription d'un nouvel utilisateur

**Body** :
```json
{
  "firstName": "Jean",
  "lastName": "Dupont",
  "email": "jean.dupont@email.com",
  "password": "password123"
}
```

**Réponse** :
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "firstName": "Jean",
      "lastName": "Dupont",
      "email": "jean.dupont@email.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Utilisateur créé avec succès"
}
```

#### POST /auth/login
**Description** : Connexion utilisateur

**Body** :
```json
{
  "email": "jean.dupont@email.com",
  "password": "password123"
}
```

**Réponse** :
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "firstName": "Jean",
      "lastName": "Dupont",
      "email": "jean.dupont@email.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Connexion réussie"
}
```

---

### 🍽️ Recettes

#### GET /recipes
**Description** : Récupérer la liste des recettes avec pagination et filtres

**Query Parameters** :
- `page` (number, optional) : Page actuelle (défaut: 1)
- `limit` (number, optional) : Nombre d'éléments par page (défaut: 12)
- `q` (string, optional) : Recherche textuelle
- `country` (string, optional) : Filtrer par pays
- `type` (string, optional) : Filtrer par type (Entrée, Plat, Dessert)
- `diet` (string, optional) : Filtrer par régime (Normal, Végétarien, Végan, etc.)
- `difficulty` (number, optional) : Filtrer par difficulté (1-5)

**Exemple** :
```
GET /api/recipes?page=1&limit=10&q=pasta&country=Italy&difficulty=2
```

**Réponse** :
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "name": "Pasta Carbonara",
      "country": "Italy",
      "type": "Plat",
      "diet": "Normal",
      "ingredients": ["Pasta", "Eggs", "Bacon", "Pecorino Romano"],
      "prepTime": 20,
      "difficulty": 2,
      "rating": 4.5,
      "authorId": "64f8a1b2c3d4e5f6a7b8c9d0",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

#### GET /recipes/{id}
**Description** : Récupérer une recette spécifique

**Réponse** :
```json
{
  "success": true,
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
    "name": "Pasta Carbonara",
    "country": "Italy",
    "type": "Plat",
    "diet": "Normal",
    "ingredients": ["Pasta", "Eggs", "Bacon", "Pecorino Romano"],
    "steps": ["Faire bouillir l'eau salée", "Cuire les pâtes", "Préparer la sauce", "Mélanger"],
    "prepTime": 20,
    "difficulty": 2,
    "rating": 4.5,
    "authorId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### POST /recipes
**Description** : Créer une nouvelle recette (authentifié requis)

**Headers** : `Authorization: Bearer <token>`

**Body** :
```json
{
  "name": "Nouvelle Recette",
  "country": "France",
  "type": "Plat",
  "diet": "Normal",
  "ingredients": ["Ingrédient 1", "Ingrédient 2"],
  "steps": ["Étape 1", "Étape 2"],
  "prepTime": 30,
  "difficulty": 2
}
```

#### PUT /recipes/{id}
**Description** : Modifier une recette (propriétaire requis)

**Headers** : `Authorization: Bearer <token>`

**Body** : Même format que POST

#### DELETE /recipes/{id}
**Description** : Supprimer une recette (propriétaire requis)

**Headers** : `Authorization: Bearer <token>`

---

### ❤️ Favoris

#### GET /favorites
**Description** : Récupérer les favoris de l'utilisateur (authentifié requis)

**Headers** : `Authorization: Bearer <token>`

**Query Parameters** : `page`, `limit` (même format que /recipes)

**Réponse** :
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "name": "Pasta Carbonara",
      "country": "Italy",
      "type": "Plat",
      "diet": "Normal",
      "ingredients": ["Pasta", "Eggs", "Bacon", "Pecorino Romano"],
      "prepTime": 20,
      "difficulty": 2,
      "rating": 4.5,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 5,
    "pages": 1
  }
}
```

#### POST /favorites/{recipeId}
**Description** : Ajouter une recette aux favoris (authentifié requis)

**Headers** : `Authorization: Bearer <token>`

#### DELETE /favorites/{recipeId}
**Description** : Retirer une recette des favoris (authentifié requis)

**Headers** : `Authorization: Bearer <token>`

---

## 🚨 Codes d'erreur

### 400 - Bad Request
```json
{
  "success": false,
  "error": "Erreur de validation",
  "details": [
    {
      "field": "email",
      "message": "Email invalide"
    }
  ]
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "error": "Token invalide ou expiré"
}
```

### 403 - Forbidden
```json
{
  "success": false,
  "error": "Vous n'avez pas les permissions pour cette action"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "error": "Recette non trouvée"
}
```

### 500 - Internal Server Error
```json
{
  "success": false,
  "error": "Erreur interne du serveur"
}
```

---

## 🔍 Recherche avancée

La recherche textuelle utilise les index MongoDB et recherche dans :
- Nom de la recette (poids: 10)
- Pays (poids: 5)
- Ingrédients (poids: 3)
- Type (poids: 2)
- Régime (poids: 1)

**Exemples de recherche** :
- `q=pasta` : Recherche "pasta" dans tous les champs
- `country=Italy&type=Plat` : Filtrer par pays et type
- `difficulty=2&diet=Végétarien` : Filtrer par difficulté et régime

---

## 📊 Pagination

Toutes les routes list utilisent la pagination :
- `page` : Page actuelle (défaut: 1)
- `limit` : Éléments par page (défaut: 12, max: 50)
- `total` : Nombre total d'éléments
- `pages` : Nombre total de pages

---

## 🛡️ Sécurité

- **JWT Tokens** : Validité 24h
- **Password Hashing** : bcryptjs
- **Input Validation** : Validation stricte des entrées
- **Rate Limiting** : Protection contre abus
- **CORS** : Configuration sécurisée

---

## 📝 Notes de développement

- Tous les timestamps sont en UTC
- Les IDs sont des MongoDB ObjectId
- La recherche est insensible à la casse
- Les réponses sont toujours au format JSON
- Les erreurs sont loggées côté serveur
