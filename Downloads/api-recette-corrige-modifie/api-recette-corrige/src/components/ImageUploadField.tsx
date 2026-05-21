'use client';

// Composant réutilisable d'upload d'image - utilisé dans les formulaires de recettes
import Image from 'next/image';
import { useRef, useState } from 'react';
import { MAX_UPLOAD_SIZE, uploadOptimizedImage } from '@/lib/client-image';  // Helpers d'upload

// Props du composant
interface Props {
  value?: string;                      // URL actuelle de l'image
  onChange: (url: string) => void;    // Callback quand l'image change
  label?: string;                      // Libellé du champ
}

export default function ImageUploadField({ value, onChange, label = 'Image de la recette (optionnel)' }: Props) {
  // Référence vers l'input file (pour pouvoir le déclencher au clic du bouton)
  const inputRef = useRef<HTMLInputElement | null>(null);
  // État de chargement pendant l'upload
  const [uploading, setUploading] = useState(false);
  // Message d'erreur en cas d'échec d'upload
  const [error, setError] = useState<string | null>(null);

  // Gestionnaire d'événement appelé quand l'utilisateur sélectionne un fichier
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;  // Pas de fichier sélectionné

    setUploading(true);
    setError(null);

    try {
      // Optimise l'image (compression + conversion WebP) puis l'upload
      const imageUrl = await uploadOptimizedImage(file);
      // Notifie le parent avec l'URL retournée par le serveur
      onChange(imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du traitement de l’image.');
    } finally {
      setUploading(false);
      // Réinitialise l'input pour permettre de re-sélectionner le même fichier
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>

      {value ? (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div className="relative h-64 w-full bg-gray-100">
            <Image src={value} alt="Aperçu de la recette" fill className="object-cover" sizes="(max-width: 768px) 100vw, 768px" />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 p-4">
            <p className="text-sm text-gray-600">Image optimisée et prête à être enregistrée.</p>
            <button
              type="button"
              onClick={() => onChange('')}
              className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Retirer l’image
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-orange-200 bg-orange-50 px-6 py-10 text-center transition hover:border-orange-300 hover:bg-orange-100/60"
        >
          <span className="mb-3 text-4xl">🖼️</span>
          <span className="text-lg font-semibold text-gray-900">{uploading ? 'Optimisation en cours...' : 'Choisir une image'}</span>
          <span className="mt-2 text-sm text-gray-600">JPG, PNG ou WebP • {Math.round(MAX_UPLOAD_SIZE / (1024 * 1024))} Mo max • conversion WebP automatique</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
