'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import RecipeCover from '@/components/RecipeCover';

interface Recipe {
  _id: string;
  name: string;
  country: string;
  type: string;
  prepTime: number;
  difficulty: number;
  image?: string;
  createdAt?: string;
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

function getDifficultyLabel(level: number) {
  if (level <= 2) return 'Facile';
  if (level <= 3) return 'Moyen';
  return 'Difficile';
}

function getDifficultyStars(level: number) {
  const safeLevel = Math.min(5, Math.max(1, Number(level) || 1));
  return '★'.repeat(safeLevel) + '☆'.repeat(5 - safeLevel);
}

function LoadingCard() {
  return (
    <div className="wood-card overflow-hidden animate-pulse">
      <div className="h-52 bg-orange-100" />
      <div className="space-y-4 p-5">
        <div className="h-7 w-2/3 rounded-full bg-orange-100" />
        <div className="h-4 w-1/2 rounded-full bg-orange-100" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-16 rounded-2xl bg-orange-100" />
          <div className="h-16 rounded-2xl bg-orange-100" />
        </div>
        <div className="flex gap-2">
          <div className="h-11 flex-1 rounded-full bg-orange-100" />
          <div className="h-11 flex-1 rounded-full bg-orange-100" />
          <div className="h-11 w-24 rounded-full bg-orange-100" />
        </div>
      </div>
    </div>
  );
}

export default function MyRecipesPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, token } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.push('/login?redirect=/my-recipes');
      return;
    }

    void fetchRecipes();
  }, [authLoading, isAuthenticated, router]);

  const totalTime = useMemo(
    () => recipes.reduce((sum, recipe) => sum + (Number(recipe.prepTime) || 0), 0),
    [recipes]
  );

  const fetchRecipes = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/recipes/my-recipes?limit=24', {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        cache: 'no-store',
      });

      const data: ApiResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Impossible de récupérer vos recettes.');
      }

      setRecipes(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des recettes.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (recipeId: string) => {
    const recipe = recipes.find((item) => item._id === recipeId);
    if (!recipe) return;

    const confirmed = window.confirm(`Supprimer « ${recipe.name} » ?`);
    if (!confirmed) return;

    try {
      setDeletingId(recipeId);
      setError(null);

      const response = await fetch(`/api/recipes/${recipeId}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Suppression impossible.');
      }

      setRecipes((prev) => prev.filter((item) => item._id !== recipeId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression.');
    } finally {
      setDeletingId(null);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div className="pb-16 pt-8">
      <div className="warm-container space-y-8">
        <section className="recipe-banner px-6 py-10 sm:px-10 lg:px-14">
          <div className="relative z-10 max-w-2xl text-white">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.35em] text-[#ffdcb6]">mes recettes</p>
            <h1 className="mb-4 text-4xl font-bold sm:text-5xl">Mes créations culinaires</h1>
            <p className="max-w-xl text-lg leading-8 text-[#fff0e2]">
              Retrouvez vos recettes, modifiez-les rapidement et gardez une vue claire sur tout ce que vous avez publié.
            </p>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="wood-card rounded-[2rem] p-6">
            <p className="section-title mb-2">Total</p>
            <p className="text-3xl font-bold text-orange-900">{recipes.length}</p>
            <p className="mt-1 text-sm text-orange-700">recette{recipes.length > 1 ? 's' : ''} créée{recipes.length > 1 ? 's' : ''}</p>
          </div>
          <div className="wood-card rounded-[2rem] p-6">
            <p className="section-title mb-2">Temps cumulé</p>
            <p className="text-3xl font-bold text-orange-900">{totalTime} min</p>
            <p className="mt-1 text-sm text-orange-700">sur l'ensemble de vos recettes</p>
          </div>
          <div className="wood-card rounded-[2rem] p-6">
            <p className="section-title mb-2">Action rapide</p>
            <Link
              href="/recipes/create"
              className="mt-2 inline-flex rounded-full bg-[#e87526] px-5 py-3 font-semibold text-white transition hover:bg-[#cf651c]"
            >
              + Créer une recette
            </Link>
          </div>
        </section>

        {error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">{error}</div>
        ) : null}

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <LoadingCard />
            <LoadingCard />
            <LoadingCard />
          </div>
        ) : recipes.length === 0 ? (
          <div className="wood-card rounded-[2rem] px-6 py-14 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 text-4xl">🍲</div>
            <h2 className="mb-2 text-3xl font-bold text-orange-900">Aucune recette pour le moment</h2>
            <p className="mx-auto mb-6 max-w-2xl text-orange-700">
              Commencez avec une première recette. Vos images seront mieux affichées et chaque bouton sera directement utilisable.
            </p>
            <Link
              href="/recipes/create"
              className="inline-flex rounded-full bg-[#e87526] px-6 py-3 font-semibold text-white transition hover:bg-[#cf651c]"
            >
              Créer ma première recette
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {recipes.map((recipe) => (
              <article key={recipe._id} className="group wood-card relative z-10 overflow-hidden rounded-[2rem]">
                <RecipeCover alt={recipe.name} src={recipe.image} className="h-56" />

                <div className="space-y-5 p-5">
                  <div>
                    <h2 className="text-2xl font-bold text-orange-950 line-clamp-2">{recipe.name}</h2>
                    <p className="mt-1 text-orange-700">{recipe.country} • {recipe.type}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-orange-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">Temps</p>
                      <p className="mt-2 text-lg font-bold text-orange-900">{recipe.prepTime} min</p>
                    </div>
                    <div className="rounded-2xl bg-orange-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">Niveau</p>
                      <p className="mt-2 text-lg font-bold text-orange-900">{getDifficultyLabel(recipe.difficulty)}</p>
                      <p className="mt-1 text-sm text-amber-600">{getDifficultyStars(recipe.difficulty)}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/recettes/${recipe._id}`}
                      className="flex-1 rounded-full border border-orange-200 bg-white px-4 py-3 text-center font-semibold text-orange-700 transition hover:border-orange-300 hover:bg-orange-50"
                    >
                      Voir
                    </Link>
                    <Link
                      href={`/recipes/${recipe._id}/edit`}
                      className="flex-1 rounded-full border border-orange-200 bg-white px-4 py-3 text-center font-semibold text-orange-700 transition hover:border-orange-300 hover:bg-orange-50"
                    >
                      Modifier
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(recipe._id)}
                      disabled={deletingId === recipe._id}
                      className="rounded-full border border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingId === recipe._id ? '...' : 'Supprimer'}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
