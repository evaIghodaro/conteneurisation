'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import ImageUploadField from '@/components/ImageUploadField';
import { useAuth } from '@/context/AuthContext';

interface RecipeFormData {
  _id?: string;
  name: string;
  country: string;
  type: 'Entrée' | 'Plat' | 'Dessert';
  diet: 'Normal' | 'Végétarien' | 'Végan' | 'Halal' | 'Casher';
  ingredients: string[];
  steps: string[];
  prepTime: number;
  difficulty: number;
  image: string;
}

const initialData: RecipeFormData = {
  name: '',
  country: '',
  type: 'Plat',
  diet: 'Normal',
  ingredients: [''],
  steps: [''],
  prepTime: 30,
  difficulty: 2,
  image: '',
};

export default function EditRecipePage() {
  const router = useRouter();
  const params = useParams();
  const { token } = useAuth();
  const id = params.id as string;
  const [recipe, setRecipe] = useState<RecipeFormData>(initialData);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) fetchRecipe();
  }, [id]);

  async function fetchRecipe() {
    try {
      setFetching(true);
      setError('');
      const res = await fetch(`/api/recipes/${id}`);
      const data = await res.json();
      if (!res.ok || !data.success || !data.data) throw new Error(data.error || 'Recette non trouvée');

      const record = data.data;
      setRecipe({
        _id: record._id,
        name: record.name ?? '',
        country: record.country ?? '',
        type: record.type ?? 'Plat',
        diet: record.diet ?? 'Normal',
        ingredients: Array.isArray(record.ingredients) && record.ingredients.length ? record.ingredients : [''],
        steps: Array.isArray(record.steps) && record.steps.length ? record.steps : [''],
        prepTime: Number(record.prepTime) || 30,
        difficulty: Number(record.difficulty) || 2,
        image: record.image ?? '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement de la recette');
    } finally {
      setFetching(false);
    }
  }

  const updateArrayField = (field: 'ingredients' | 'steps', index: number, value: string) => {
    setRecipe((prev) => ({ ...prev, [field]: prev[field].map((entry, i) => (i === index ? value : entry)) }));
  };

  const addArrayField = (field: 'ingredients' | 'steps') => setRecipe((prev) => ({ ...prev, [field]: [...prev[field], ''] }));
  const removeArrayField = (field: 'ingredients' | 'steps', index: number) => setRecipe((prev) => ({ ...prev, [field]: prev[field].length > 1 ? prev[field].filter((_, i) => i !== index) : prev[field] }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/recipes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          ...recipe,
          ingredients: recipe.ingredients.map((v) => v.trim()).filter(Boolean),
          steps: recipe.steps.map((v) => v.trim()).filter(Boolean),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Erreur lors de la sauvegarde');
      router.push(`/recettes/${data.data._id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  }

  if (fetching) return <div className="min-h-screen flex items-center justify-center"><div className="h-12 w-12 animate-spin rounded-full border-b-2 border-orange-500" /></div>;

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <Link href="/my-recipes" className="mb-4 inline-flex items-center text-orange-600 hover:underline font-medium">← Retour à mes recettes</Link>
          <h1 className="text-4xl font-bold text-gray-900">✏️ Modifier la recette</h1>
          <p className="mt-2 text-gray-600">Les données de la recette sont maintenant correctement préchargées et l’image est optimisée avant l’envoi.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 rounded-3xl bg-white p-8 shadow-lg">
          {error ? <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div> : null}

          <ImageUploadField value={recipe.image} onChange={(url) => setRecipe((prev) => ({ ...prev, image: url }))} />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Nom de la recette *</label>
              <input value={recipe.name} onChange={(e) => setRecipe((prev) => ({ ...prev, name: e.target.value }))} className="w-full rounded-xl border border-gray-300 px-4 py-3" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Pays *</label>
              <input value={recipe.country} onChange={(e) => setRecipe((prev) => ({ ...prev, country: e.target.value }))} className="w-full rounded-xl border border-gray-300 px-4 py-3" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Type</label>
              <select value={recipe.type} onChange={(e) => setRecipe((prev) => ({ ...prev, type: e.target.value as RecipeFormData['type'] }))} className="w-full rounded-xl border border-gray-300 px-4 py-3">
                <option value="Entrée">Entrée</option>
                <option value="Plat">Plat</option>
                <option value="Dessert">Dessert</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Régime</label>
              <select value={recipe.diet} onChange={(e) => setRecipe((prev) => ({ ...prev, diet: e.target.value as RecipeFormData['diet'] }))} className="w-full rounded-xl border border-gray-300 px-4 py-3">
                <option value="Normal">Normal</option>
                <option value="Végétarien">Végétarien</option>
                <option value="Végan">Végan</option>
                <option value="Halal">Halal</option>
                <option value="Casher">Casher</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Temps de préparation *</label>
              <input type="number" min="1" value={recipe.prepTime} onChange={(e) => setRecipe((prev) => ({ ...prev, prepTime: Number(e.target.value) }))} className="w-full rounded-xl border border-gray-300 px-4 py-3" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Difficulté *</label>
              <select value={recipe.difficulty} onChange={(e) => setRecipe((prev) => ({ ...prev, difficulty: Number(e.target.value) }))} className="w-full rounded-xl border border-gray-300 px-4 py-3">
                <option value={1}>1 - Très facile</option>
                <option value={2}>2 - Facile</option>
                <option value={3}>3 - Moyen</option>
                <option value={4}>4 - Difficile</option>
                <option value={5}>5 - Très difficile</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Ingrédients *</label>
            <div className="space-y-3">
              {recipe.ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-2">
                  <input value={ingredient} onChange={(e) => updateArrayField('ingredients', index, e.target.value)} className="flex-1 rounded-xl border border-gray-300 px-4 py-3" />
                  {recipe.ingredients.length > 1 ? <button type="button" onClick={() => removeArrayField('ingredients', index)} className="rounded-xl bg-red-50 px-4 py-3 text-red-600">Supprimer</button> : null}
                </div>
              ))}
            </div>
            <button type="button" onClick={() => addArrayField('ingredients')} className="mt-3 rounded-full bg-orange-50 px-4 py-2 font-medium text-orange-700">+ Ajouter un ingrédient</button>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Étapes</label>
            <div className="space-y-3">
              {recipe.steps.map((step, index) => (
                <div key={index} className="flex gap-2">
                  <textarea value={step} rows={2} onChange={(e) => updateArrayField('steps', index, e.target.value)} className="flex-1 rounded-xl border border-gray-300 px-4 py-3" />
                  {recipe.steps.length > 1 ? <button type="button" onClick={() => removeArrayField('steps', index)} className="rounded-xl bg-red-50 px-4 py-3 text-red-600">Supprimer</button> : null}
                </div>
              ))}
            </div>
            <button type="button" onClick={() => addArrayField('steps')} className="mt-3 rounded-full bg-orange-50 px-4 py-2 font-medium text-orange-700">+ Ajouter une étape</button>
          </div>

          <button type="submit" disabled={loading} className="w-full rounded-full bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-60">
            {loading ? 'Sauvegarde...' : 'Mettre à jour la recette'}
          </button>
        </form>
      </div>
    </main>
  );
}
