'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import RecipeCover from '@/components/RecipeCover';

interface Recipe {
  _id: string;
  name: string;
  country: string;
  type: string;
  diet: string;
  ingredients: string[];
  prepTime: number;
  difficulty: number;
  rating: number;
  createdAt: string;
  image?: string;
}

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

export default function FavoritesPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, token } = useAuth();
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 0 });

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login?redirect=/favorites');
        return;
      }
      void fetchFavorites();
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchFavorites = async (page: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/favorites?page=${page}&limit=${pagination.limit}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      const data: ApiResponse = await response.json();

      if (data.success && data.data) {
        setFavorites(data.data);
        setPagination(data.pagination || pagination);
      } else {
        setError(data.error || 'Erreur lors de la récupération des favoris');
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
    void fetchFavorites(newPage);
  };

  const removeFavorite = async (recipeId: string) => {
    if (!confirm('Retirer cette recette des favoris ?')) return;

    try {
      const response = await fetch(`/api/favorites/${recipeId}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      const data = await response.json();

      if (data.success) {
        setFavorites((prev) => prev.filter((recipe) => recipe._id !== recipeId));
        setPagination((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
      } else {
        setError(data.error || 'Erreur lors du retrait des favoris');
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
      setError('Erreur lors du retrait des favoris');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="pb-16 pt-8">
      <div className="warm-container space-y-8">
        <section className="recipe-banner px-6 py-10 sm:px-10 lg:px-14">
          <div className="relative z-10 max-w-2xl text-white">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.35em] text-[#ffdcb6]">mes favoris</p>
            <h1 className="mb-4 text-4xl font-bold sm:text-5xl">Mes recettes préférées</h1>
            <p className="max-w-xl text-lg leading-8 text-[#fff0e2]">
              Une grille plus propre, des visuels plus stables et des actions qui répondent vraiment.
            </p>
          </div>
        </section>

        {error && <div className="rounded-3xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 px-5 py-4 text-orange-800 shadow-sm">{error}</div>}

        {favorites.length > 0 ? (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {favorites.map((recipe) => (
                <article key={recipe._id} className="group wood-card overflow-hidden rounded-[2rem]">
                  <RecipeCover src={recipe.image} alt={recipe.name} className="h-56" />
                  <div className="p-6">
                    <h2 className="mb-2 text-2xl font-bold text-orange-900">{recipe.name}</h2>
                    <p className="mb-4 text-orange-700">{recipe.country} • {recipe.type}</p>

                    <div className="grid grid-cols-2 gap-3 rounded-[1.25rem] bg-gradient-to-r from-orange-50 to-amber-50 p-4 text-sm text-orange-700">
                      <div>
                        <p className="mb-1 uppercase tracking-[0.18em] text-orange-600">Temps</p>
                        <p className="font-semibold">{recipe.prepTime} min</p>
                      </div>
                      <div>
                        <p className="mb-1 uppercase tracking-[0.18em] text-orange-600">Difficulté</p>
                        <p className="font-semibold">{recipe.difficulty <= 2 ? 'Facile' : recipe.difficulty <= 3 ? 'Moyen' : 'Difficile'}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-3">
                      <Link href={`/recettes/${recipe._id}`} className="flex-1 rounded-full border border-orange-200 bg-white px-4 py-3 text-center font-semibold text-orange-700 transition hover:bg-orange-50">
                        Voir
                      </Link>
                      <button onClick={() => removeFavorite(recipe._id)} className="rounded-full border border-orange-200 bg-white px-4 py-3 text-orange-600 transition hover:bg-orange-50">
                        Retirer
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {pagination.pages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <button onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page === 1} className="rounded-full border border-orange-200 bg-white px-5 py-3 text-orange-700 transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50">
                  Précédent
                </button>
                <span className="rounded-full bg-gradient-to-r from-orange-100 to-amber-100 px-5 py-3 text-orange-700">Page {pagination.page} sur {pagination.pages}</span>
                <button onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page === pagination.pages} className="rounded-full border border-orange-200 bg-white px-5 py-3 text-orange-700 transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50">
                  Suivant
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="col-span-full rounded-[2rem] bg-gradient-to-br from-orange-50 to-amber-50 px-6 py-14 text-center text-orange-700 shadow-lg">
            <div className="mb-4 text-6xl">💔</div>
            <h2 className="mb-2 text-2xl font-bold text-orange-900">Vous n'avez pas encore de favoris</h2>
            <p className="mb-6 text-orange-700">Explorez les recettes et ajoutez vos préférées à vos favoris.</p>
            <Link href="/recettes" className="rounded-full border border-orange-200 bg-white px-6 py-3 font-semibold text-orange-700 transition hover:bg-orange-50">
              Explorer les recettes
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
