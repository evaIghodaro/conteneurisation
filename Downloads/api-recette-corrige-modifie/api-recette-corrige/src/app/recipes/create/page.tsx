'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ImageUploadField from '@/components/ImageUploadField';

interface RecipeFormData {
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

export default function RecipeFormPage() {
  const router = useRouter();
  const { isAuthenticated, user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<RecipeFormData>(initialData);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isAuthenticated) router.push('/login?redirect=/recipes/create');
  }, [isAuthenticated, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'prepTime' || name === 'difficulty' ? Number(value) : value,
    }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const updateArrayField = (field: 'ingredients' | 'steps', index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((entry, i) => (i === index ? value : entry)),
    }));
  };

  const addArrayField = (field: 'ingredients' | 'steps') => {
    setFormData((prev) => ({ ...prev, [field]: [...prev[field], ''] }));
  };

  const removeArrayField = (field: 'ingredients' | 'steps', index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].length > 1 ? prev[field].filter((_, i) => i !== index) : prev[field],
    }));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) errors.name = 'Le nom doit contenir au moins 2 caractères.';
    if (!formData.country.trim() || formData.country.trim().length < 2) errors.country = 'Le pays est requis.';
    if (formData.ingredients.filter((ing) => ing.trim()).length === 0) errors.ingredients = 'Ajoute au moins un ingrédient.';
    if (formData.prepTime <= 0) errors.prepTime = 'Le temps doit être supérieur à 0.';
    if (formData.difficulty < 1 || formData.difficulty > 5) errors.difficulty = 'La difficulté doit être entre 1 et 5.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          ...formData,
          ingredients: formData.ingredients.map((ing) => ing.trim()).filter(Boolean),
          steps: formData.steps.map((step) => step.trim()).filter(Boolean),
          authorId: user?.id,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Erreur lors de la création');
      router.push(`/recettes/${data.data._id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center"><div className="h-12 w-12 animate-spin rounded-full border-b-2 border-orange-500" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">Créer une nouvelle recette</h1>
          <p className="text-gray-600">Partagez un plat du monde avec une image optimisée et un formulaire plus robuste.</p>
        </div>

        {error ? <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div> : null}

        <form onSubmit={handleSubmit} className="space-y-8 rounded-3xl bg-white p-8 shadow-lg">
          <ImageUploadField value={formData.image} onChange={(url) => setFormData((prev) => ({ ...prev, image: url }))} />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Nom de la recette *</label>
              <input name="name" value={formData.name} onChange={handleChange} className="w-full rounded-xl border border-gray-300 px-4 py-3" placeholder="Ex : Couscous royal" />
              {fieldErrors.name ? <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p> : null}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Pays *</label>
              <input name="country" value={formData.country} onChange={handleChange} className="w-full rounded-xl border border-gray-300 px-4 py-3" placeholder="Ex : Maroc" />
              {fieldErrors.country ? <p className="mt-1 text-sm text-red-600">{fieldErrors.country}</p> : null}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Type</label>
              <select name="type" value={formData.type} onChange={handleChange} className="w-full rounded-xl border border-gray-300 px-4 py-3">
                <option value="Entrée">Entrée</option>
                <option value="Plat">Plat</option>
                <option value="Dessert">Dessert</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Régime</label>
              <select name="diet" value={formData.diet} onChange={handleChange} className="w-full rounded-xl border border-gray-300 px-4 py-3">
                <option value="Normal">Normal</option>
                <option value="Végétarien">Végétarien</option>
                <option value="Végan">Végan</option>
                <option value="Halal">Halal</option>
                <option value="Casher">Casher</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Temps de préparation *</label>
              <input type="number" min="1" name="prepTime" value={formData.prepTime} onChange={handleChange} className="w-full rounded-xl border border-gray-300 px-4 py-3" />
              {fieldErrors.prepTime ? <p className="mt-1 text-sm text-red-600">{fieldErrors.prepTime}</p> : null}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Difficulté *</label>
              <select name="difficulty" value={formData.difficulty} onChange={handleChange} className="w-full rounded-xl border border-gray-300 px-4 py-3">
                <option value={1}>1 - Très facile</option>
                <option value={2}>2 - Facile</option>
                <option value={3}>3 - Moyen</option>
                <option value={4}>4 - Difficile</option>
                <option value={5}>5 - Très difficile</option>
              </select>
              {fieldErrors.difficulty ? <p className="mt-1 text-sm text-red-600">{fieldErrors.difficulty}</p> : null}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Ingrédients *</label>
            <div className="space-y-3">
              {formData.ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-2">
                  <input value={ingredient} onChange={(e) => updateArrayField('ingredients', index, e.target.value)} className="flex-1 rounded-xl border border-gray-300 px-4 py-3" placeholder={`Ingrédient ${index + 1}`} />
                  {formData.ingredients.length > 1 ? <button type="button" onClick={() => removeArrayField('ingredients', index)} className="rounded-xl bg-red-50 px-4 py-3 text-red-600">Supprimer</button> : null}
                </div>
              ))}
            </div>
            {fieldErrors.ingredients ? <p className="mt-1 text-sm text-red-600">{fieldErrors.ingredients}</p> : null}
            <button type="button" onClick={() => addArrayField('ingredients')} className="mt-3 rounded-full bg-orange-50 px-4 py-2 font-medium text-orange-700">+ Ajouter un ingrédient</button>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Étapes</label>
            <div className="space-y-3">
              {formData.steps.map((step, index) => (
                <div key={index} className="flex gap-2">
                  <textarea value={step} onChange={(e) => updateArrayField('steps', index, e.target.value)} rows={2} className="flex-1 rounded-xl border border-gray-300 px-4 py-3" placeholder={`Étape ${index + 1}`} />
                  {formData.steps.length > 1 ? <button type="button" onClick={() => removeArrayField('steps', index)} className="rounded-xl bg-red-50 px-4 py-3 text-red-600">Supprimer</button> : null}
                </div>
              ))}
            </div>
            <button type="button" onClick={() => addArrayField('steps')} className="mt-3 rounded-full bg-orange-50 px-4 py-2 font-medium text-orange-700">+ Ajouter une étape</button>
          </div>

          <div className="flex gap-4">
            <button type="submit" disabled={loading} className="flex-1 rounded-full bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-60">
              {loading ? 'Création...' : 'Créer la recette'}
            </button>
            <button type="button" onClick={() => router.push('/recettes')} className="rounded-full bg-gray-100 px-6 py-3 font-semibold text-gray-700">Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
}
