'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import RecipeCover from '@/components/RecipeCover';

interface Recipe {
  _id: string;
  name: string;
  country: string;
  type: string;
  diet: string;
  ingredients: string[];
  steps: string[];
  prepTime: number;
  difficulty: number;
  rating?: number;
  image?: string;
  authorId?: string;
  createdAt?: string;
}

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token, user, isAuthenticated } = useAuth();
  const id = params.id as string;

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<'favorite' | 'delete' | null>(null);

  useEffect(() => {
    if (!id) return;
    void fetchRecipe();
  }, [id]);

  const canManage = useMemo(() => {
    if (!recipe?.authorId || !user?.id) return false;
    return String(recipe.authorId) === String(user.id);
  }, [recipe?.authorId, user?.id]);

  const difficultyText = useMemo(() => {
    const level = Number(recipe?.difficulty) || 1;
    if (level <= 2) return 'Facile';
    if (level <= 3) return 'Moyen';
    return 'Difficile';
  }, [recipe?.difficulty]);

  const fetchRecipe = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/recipes/${id}`, { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok || !data.success || !data.data) {
        throw new Error(data.error || 'Recette introuvable.');
      }
      setRecipe(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement de la recette.');
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/recettes/${id}`);
      return;
    }

    try {
      setBusy('favorite');
      setError(null);

      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ recipeId: id }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Impossible d’ajouter cette recette aux favoris.');
      }

      window.alert('Recette ajoutée aux favoris.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l’ajout aux favoris.');
    } finally {
      setBusy(null);
    }
  };

  const deleteRecipe = async () => {
    if (!recipe) return;
    const confirmed = window.confirm(`Supprimer « ${recipe.name} » ?`);
    if (!confirmed) return;

    try {
      setBusy('delete');
      setError(null);

      const response = await fetch(`/api/recipes/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Suppression impossible.');
      }

      router.push('/my-recipes');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression.');
      setBusy(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-orange-500" />
      </div>
    );
  }

  if (error && !recipe) {
    return <div className="flex min-h-screen items-center justify-center px-4 text-center text-red-700">{error}</div>;
  }

  if (!recipe) {
    return <div className="flex min-h-screen items-center justify-center px-4">Recette non trouvée</div>;
  }

  return (
    <div className="pb-16 pt-8">
      <div className="warm-container space-y-8">
        <Link href="/recettes" className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-5 py-3 font-semibold text-orange-700 transition hover:bg-orange-50">
          ← Retour aux recettes
        </Link>

        {error ? <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">{error}</div> : null}

        <article className="wood-card overflow-hidden rounded-[2rem]">
          <RecipeCover alt={recipe.name} src={recipe.image} className="h-[320px] sm:h-[400px]" priority sizes="100vw" />

          <div className="relative z-10 space-y-8 p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="section-title mb-3">{recipe.country} • {recipe.type}</p>
                <h1 className="text-4xl font-bold text-orange-950 sm:text-5xl">{recipe.name}</h1>
                <p className="mt-4 max-w-2xl text-lg text-orange-800">
                  Une fiche recette plus propre, avec de vraies actions et une image mieux gérée.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 lg:justify-end">
                <button type="button" onClick={addToFavorites} disabled={busy === 'favorite'} className="rounded-full border border-orange-200 bg-white px-5 py-3 font-semibold text-orange-700 transition hover:bg-orange-50 disabled:opacity-60">
                  {busy === 'favorite' ? 'Ajout...' : 'Ajouter aux favoris'}
                </button>
                {canManage ? (
                  <>
                    <Link href={`/recipes/${id}/edit`} className="rounded-full border border-orange-200 bg-white px-5 py-3 font-semibold text-orange-700 transition hover:bg-orange-50">
                      Modifier
                    </Link>
                    <button type="button" onClick={deleteRecipe} disabled={busy === 'delete'} className="rounded-full border border-red-200 bg-red-50 px-5 py-3 font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-60">
                      {busy === 'delete' ? 'Suppression...' : 'Supprimer'}
                    </button>
                  </>
                ) : null}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[1.75rem] bg-orange-50 p-5">
                <p className="text-sm font-semibold text-orange-600">Temps</p>
                <p className="mt-2 text-2xl font-bold text-orange-950">{recipe.prepTime} min</p>
              </div>
              <div className="rounded-[1.75rem] bg-orange-50 p-5">
                <p className="text-sm font-semibold text-orange-600">Difficulté</p>
                <p className="mt-2 text-2xl font-bold text-orange-950">{difficultyText}</p>
              </div>
              <div className="rounded-[1.75rem] bg-orange-50 p-5">
                <p className="text-sm font-semibold text-orange-600">Régime</p>
                <p className="mt-2 text-2xl font-bold text-orange-950">{recipe.diet || 'Normal'}</p>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
              <section>
                <h2 className="mb-4 text-2xl font-bold text-orange-950">Ingrédients</h2>
                <div className="rounded-[1.75rem] bg-orange-50 p-6">
                  <ul className="space-y-3 text-orange-900">
                    {recipe.ingredients.map((ingredient, index) => (
                      <li key={`${ingredient}-${index}`} className="flex items-start gap-3">
                        <span className="mt-1 text-orange-500">●</span>
                        <span>{ingredient}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-bold text-orange-950">Préparation</h2>
                <div className="rounded-[1.75rem] bg-orange-50 p-6">
                  {recipe.steps?.length ? (
                    <ol className="space-y-4 text-orange-900">
                      {recipe.steps.map((step, index) => (
                        <li key={`${step}-${index}`} className="flex gap-4">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e87526] font-bold text-white">{index + 1}</span>
                          <span className="pt-1">{step}</span>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-orange-700">Aucune étape détaillée n'a encore été ajoutée.</p>
                  )}
                </div>
              </section>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
