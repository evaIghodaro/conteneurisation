// Interface définissant la structure d'une recette côté client
export interface RecipeData {
  name: string;
  country: string;
  type: 'Entrée' | 'Plat' | 'Dessert';
  diet?: 'Normal' | 'Végétarien' | 'Végan' | 'Halal' | 'Casher';
  ingredients: string[];
  steps?: string[];
  prepTime: number;
  difficulty: number;
  image?: string;
  authorId?: string;
}

// Paramètres de pagination pour les listes
export interface PaginationParams {
  page: number;   // Numéro de page (commence à 1)
  limit: number;  // Nombre d'éléments par page
}

// Format standard des réponses API du projet
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Valide les données d'une recette avant insertion en base
// Retourne un objet avec isValid (boolean) et errors (liste des erreurs)
export function validateRecipe(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
    errors.push('Le nom de la recette est requis et doit contenir au moins 2 caractères');
  }

  if (!data.country || typeof data.country !== 'string' || data.country.trim().length < 2) {
    errors.push('Le pays est requis et doit contenir au moins 2 caractères');
  }

  if (!data.type || !['Entrée', 'Plat', 'Dessert'].includes(data.type)) {
    errors.push('Le type doit être l\'un des suivants: Entrée, Plat, Dessert');
  }

  if (data.diet && !['Normal', 'Végétarien', 'Végan', 'Halal', 'Casher'].includes(data.diet)) {
    errors.push('Le régime doit être l\'un des suivants: Normal, Végétarien, Végan, Halal, Casher');
  }

  if (!data.ingredients || !Array.isArray(data.ingredients) || data.ingredients.length === 0) {
    errors.push('Les ingrédients sont requis et doivent être un tableau non vide');
  } else {
    data.ingredients.forEach((ing: any, index: number) => {
      if (!ing || typeof ing !== 'string' || ing.trim().length < 1) {
        errors.push(`L'ingrédient ${index + 1} est invalide`);
      }
    });
  }

  if (data.steps && Array.isArray(data.steps)) {
    data.steps.forEach((step: any, index: number) => {
      if (!step || typeof step !== 'string' || step.trim().length < 1) {
        errors.push(`L'étape ${index + 1} est invalide`);
      }
    });
  }

  if (!data.prepTime || typeof data.prepTime !== 'number' || data.prepTime <= 0) {
    errors.push('Le temps de préparation est requis et doit être un nombre positif');
  }

  if (!data.difficulty || typeof data.difficulty !== 'number' || data.difficulty < 1 || data.difficulty > 5) {
    errors.push('La difficulté est requise et doit être un nombre entre 1 et 5');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Extrait et valide les paramètres de pagination depuis l'URL (?page=2&limit=20)
// Garantit page >= 1 et 1 <= limit <= 50 (limite max pour éviter la surcharge)
export function getPaginationParams(searchParams: URLSearchParams): PaginationParams {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')));
  
  return { page, limit };
}

// Crée une réponse standardisée avec pagination
// Calcule automatiquement le nombre total de pages
export function createPaginationResponse<T>(
  data: T[],
  total: number,
  pagination: PaginationParams
): ApiResponse<T[]> {
  return {
    success: true,
    data,
    pagination: {
      ...pagination,
      total,
      pages: Math.ceil(total / pagination.limit)
    }
  };
}
