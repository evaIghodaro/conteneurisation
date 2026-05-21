'use client';

// Composant RecipeCover - affiche l'image d'une recette avec fallback et effet hover
import Image from 'next/image';  // Composant Image optimisé de Next.js

// Props acceptées par le composant
interface RecipeCoverProps {
  src?: string;       // URL de l'image (optionnel)
  alt: string;        // Texte alternatif (obligatoire pour l'accessibilité)
  priority?: boolean; // Priorité de chargement (true pour les images au-dessus de la ligne de flottaison)
  sizes?: string;     // Tailles responsive de l'image
  className?: string; // Classes CSS additionnelles
}

export default function RecipeCover({
  src,
  alt,
  priority = false,
  sizes = '(max-width: 768px) 100vw, 33vw',
  className = '',
}: RecipeCoverProps) {
  // Si pas d'image fournie, utilise une image par défaut
  const imageSrc = src?.trim() ? src : '/card-food.svg';

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-orange-100 via-amber-50 to-orange-200 ${className}`}>
      <Image
        src={imageSrc}
        alt={alt}
        fill                                  // Remplit le conteneur parent
        priority={priority}                   // Précharge si prioritaire
        unoptimized={imageSrc.startsWith('/uploads/')}  // Désactive l'optim Next pour les uploads utilisateurs
        sizes={sizes}
        className="object-cover transition duration-500 group-hover:scale-[1.03]"  // Zoom au survol
      />
      {/* Dégradé sombre en bas pour améliorer la lisibilité du texte */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />
    </div>
  );
}
