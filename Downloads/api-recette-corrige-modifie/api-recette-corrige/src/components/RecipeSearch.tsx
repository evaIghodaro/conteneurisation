'use client';

// Composant principal de recherche/affichage des recettes
// Utilisé sur la page /recettes - gère la recherche, les filtres et la pagination
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';  // Hook d'authentification

// Type d'une recette telle que retournée par l'API
interface Recipe {
  id?: string;
  _id?: string;          // ID MongoDB
  name: string;          // Nom de la recette
  country: string;       // Pays d'origine
  ingredients: string[];
  prepTime: number;      // Temps en minutes
  difficulty: string;    // Niveau 1-5
  type?: string;         // Entrée/Plat/Dessert
  diet?: string;         // Normal/Végétarien/etc.
  rating?: number;
  authorId?: string;     // ID de l'utilisateur créateur
  createdAt?: string;
  updatedAt?: string;
  image?: string;        // URL de l'image
}

// Format de la réponse API (recettes paginées)
interface ApiResponse {
  success: boolean;
  data?: Recipe[];
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Convertit le niveau numérique de difficulté en libellé lisible avec couleur
function getDifficultyLabel(value: string | number) {
  const level = Number(value);
  if (level <= 2) return { label: 'Facile', color: 'text-[#2d7a53]' };       // Vert
  if (level <= 3) return { label: 'Moyen', color: 'text-[#b97222]' };        // Orange
  return { label: 'Difficile', color: 'text-[#b14c2f]' };                    // Rouge
}

export default function RecipeSearch() {
  const { isAuthenticated } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countries, setCountries] = useState<string[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const toggleFavorite = async (recipeId: string) => {
    if (!isAuthenticated) {
      setError('⚠️ Vous devez être connecté pour ajouter des favoris. <a href="/login" class="text-orange-600 underline hover:no-underline">Connectez-vous ici</a>');
      return;
    }

    if (!recipeId) {
      setError('ID de recette invalide');
      return;
    }

    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch(`/api/favorites/${recipeId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recipeId }),
      });

      const data = await response.json();
      if (data.success) {
        // Succès silencieux ou message positif
      } else {
        setError(data.error || "Erreur lors de l'ajout aux favoris");
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      setError("Erreur lors de l'ajout aux favoris");
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  useEffect(() => {
    if (Array.isArray(recipes) && recipes.length > 0) {
      const uniqueCountries = [...new Set(recipes.map((r) => r.country))].sort();
      setCountries(uniqueCountries);
    }
  }, [recipes]);

  useEffect(() => {
    if (!Array.isArray(recipes)) {
      setFilteredRecipes([]);
      return;
    }

    const filtered = recipes.filter((recipe) => {
      const matchesSearch =
        searchQuery === '' ||
        recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.ingredients.some((ing) => ing.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCountry = countryFilter === '' || recipe.country === countryFilter;
      const matchesDifficulty = difficultyFilter === '' || recipe.difficulty === difficultyFilter;
      const matchesType = typeFilter === '' || recipe.type === typeFilter;

      return matchesSearch && matchesCountry && matchesDifficulty && matchesType;
    });

    setFilteredRecipes(filtered);
  }, [searchQuery, countryFilter, difficultyFilter, typeFilter, recipes]);

  async function fetchRecipes(page: number = 1) {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      });

      if (searchQuery) params.append('q', searchQuery);
      if (countryFilter) params.append('country', countryFilter);
      if (difficultyFilter) params.append('difficulty', difficultyFilter);
      if (typeFilter) params.append('type', typeFilter);

      const response = await fetch(`/api/recipes?${params}`);
      const data: ApiResponse = await response.json();

      if (data.success && data.data) {
        setRecipes(data.data);
        setPagination(data.pagination || pagination);
      } else {
        setError(data.error || 'Erreur lors de la récupération des recettes');
        setRecipes([]);
      }
    } catch (err) {
      console.error('Error fetching recipes:', err);
      setError('Erreur de connexion au serveur');
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  }

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
    fetchRecipes(newPage);
  };

  const handleReset = () => {
    setSearchQuery('');
    setCountryFilter('');
    setDifficultyFilter('');
    setTypeFilter('');
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchRecipes(1);
  };

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchRecipes(1);
  };

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-3xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 px-5 py-4 text-orange-800 shadow-sm">
          {error}
        </div>
      )}

      <section className="wood-card p-6 sm:p-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="section-title mb-3">Recherche</p>
            <h2 className="text-3xl font-bold text-[#2f241f] sm:text-4xl">Trouvez la recette qui vous inspire</h2>
            <p className="mt-3 max-w-2xl text-[1.03rem] leading-7 text-[#6f6259]">
              Filtrez par nom, pays, type de plat ou difficulté dans une interface plus lisible et plus proche de l&apos;univers culinaire.
            </p>
          </div>
          <div className="rounded-full bg-gradient-to-r from-orange-100 to-amber-100 px-5 py-3 text-orange-700">
            {loading
              ? 'Chargement...'
              : `${pagination.total} recette${pagination.total > 1 ? 's' : ''} trouvée${pagination.total > 1 ? 's' : ''}`}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-[#5d5149]">Recherche</span>
            <input
              type="text"
              placeholder="Nom, pays, ingrédient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 px-4 py-3 text-orange-900 outline-none transition focus:border-orange-400 focus:shadow-lg"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-[#5d5149]">Pays</span>
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="w-full rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 px-4 py-3 text-orange-900 outline-none transition focus:border-orange-400 focus:shadow-lg"
            >
              <option value="">Tous les pays</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-[#5d5149]">Difficulté</span>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="w-full rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 px-4 py-3 text-orange-900 outline-none transition focus:border-orange-400 focus:shadow-lg"
            >
              <option value="">Tous les niveaux</option>
              <option value="1">Très facile</option>
              <option value="2">Facile</option>
              <option value="3">Moyen</option>
              <option value="4">Difficile</option>
              <option value="5">Très difficile</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-[#5d5149]">Type de plat</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 px-4 py-3 text-orange-900 outline-none transition focus:border-orange-400 focus:shadow-lg"
            >
              <option value="">Tous les types</option>
              <option value="Entrée">Entrée</option>
              <option value="Plat">Plat principal</option>
              <option value="Dessert">Dessert</option>
            </select>
          </label>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={handleSearch}
            disabled={loading}
            className="rounded-full bg-[#2f241f] px-6 py-3 font-semibold text-white transition hover:bg-[#201814] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Recherche...' : 'Rechercher'}
          </button>
          <button
            onClick={handleReset}
            className="rounded-full border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 px-6 py-3 font-semibold text-orange-700 transition hover:from-orange-100 hover:to-amber-100"
          >
            Réinitialiser
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="wood-card overflow-hidden animate-pulse">
              <div className="h-44 bg-gradient-to-br from-orange-100 to-amber-100" />
              <div className="space-y-3 p-5">
                <div className="h-6 rounded bg-gradient-to-r from-orange-100 to-amber-100" />
                <div className="h-4 w-1/2 rounded bg-gradient-to-r from-orange-50 to-amber-50" />
                <div className="h-4 rounded bg-[#f1e5d8]" />
                <div className="h-4 rounded bg-[#f1e5d8]" />
              </div>
            </div>
          ))
        ) : filteredRecipes.length > 0 ? (
          filteredRecipes.map((recipe) => {
            const recipeId = recipe._id || recipe.id;
            const difficulty = getDifficultyLabel(recipe.difficulty);

            return (
              <article key={recipeId} className="wood-card overflow-hidden">
                <div className="relative h-56 bg-gradient-to-br from-orange-100 to-amber-100">
                  <Image
                    src={recipe.image || '/card-food.svg'}
                    alt={recipe.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
                  <div className="relative z-10 flex h-full items-start justify-between p-5">
                    <span className="soft-pill px-4 py-2 text-sm font-semibold text-white">
                      {recipe.country}
                    </span>
                    {recipe.type && (
                      <span className="soft-pill px-4 py-2 text-sm font-semibold text-white">
                        {recipe.type}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-2xl font-bold text-[#2f241f]">{recipe.name}</h3>
                  <p className="mt-2 text-[1rem] leading-7 text-[#6f6259]">
                    {recipe.ingredients.slice(0, 3).join(', ')}
                    {recipe.ingredients.length > 3 && `... +${recipe.ingredients.length - 3}`}
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-3 rounded-[1.25rem] bg-gradient-to-r from-orange-50 to-amber-50 p-4 text-sm text-orange-700">
                    <div>
                      <p className="mb-1 uppercase tracking-[0.18em] text-orange-600">Temps</p>
                      <p className="text-lg font-semibold text-[#2f241f]">{recipe.prepTime} min</p>
                    </div>
                    <div>
                      <p className="mb-1 uppercase tracking-[0.18em] text-orange-600">Difficulté</p>
                      <p className={`text-lg font-semibold ${difficulty.color}`}>{difficulty.label}</p>
                    </div>
                  </div>

                  {recipe.rating ? (
                    <div className="mt-4 flex items-center gap-2 text-orange-600">
                      <span>⭐</span>
                      <span className="font-medium">{recipe.rating.toFixed(1)}</span>
                    </div>
                  ) : null}

                  <div className="mt-5 flex gap-3">
                    <Link
                      href={`/recettes/${recipeId}`}
                      className="flex-1 rounded-full bg-[#e87526] px-5 py-3 text-center font-semibold text-white transition hover:bg-[#cf651c]"
                    >
                      Voir la recette
                    </Link>
                    <button
                      onClick={() => toggleFavorite(recipeId || '')}
                      className="rounded-full border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 px-4 py-3 text-orange-600 transition hover:from-orange-100 hover:to-amber-100"
                    >
                      ❤
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <div className="col-span-full bg-gradient-to-br from-orange-50 to-amber-50 px-6 py-14 text-center text-orange-700 shadow-lg">
            {error ? 'Erreur lors du chargement.' : 'Aucune recette ne correspond à votre recherche.'}
          </div>
        )}
      </section>

      {pagination.pages > 1 && !loading && (
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="rounded-full border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 px-5 py-3 text-orange-700 transition hover:from-orange-100 hover:to-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Précédent
          </button>
          <span className="rounded-full bg-gradient-to-r from-orange-100 to-amber-100 px-5 py-3 text-orange-700">
            Page {pagination.page} sur {pagination.pages}
          </span>
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
            className="rounded-full border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 px-5 py-3 text-orange-700 transition hover:from-orange-100 hover:to-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
}
