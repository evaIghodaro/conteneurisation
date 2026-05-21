'use client';

// Composant Header (barre de navigation) - affiché en haut de toutes les pages
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';  // Hook pour accéder à l'état d'authentification

export default function Header() {
  // État du menu mobile (ouvert/fermé)
  const [isOpen, setIsOpen] = useState(false);
  // Message d'erreur affiché quand un utilisateur non connecté tente d'accéder aux favoris
  const [error, setError] = useState<string | null>(null);
  // Récupère l'état d'authentification depuis le contexte global
  const { user, isAuthenticated, logout, loading } = useAuth();

  // Ferme le menu mobile (utilisé après un clic sur un lien)
  const closeMenu = () => setIsOpen(false);

  // Intercepte le clic sur "Favoris" pour bloquer les utilisateurs non connectés
  const handleFavoritesClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();  // Annule la navigation
      setError('⚠️ Vous devez être connecté pour accéder à vos favoris. <a href="/login" class="text-orange-600 underline hover:no-underline">Connectez-vous ici</a>');
      // Le message disparaît automatiquement après 5 secondes
      setTimeout(() => setError(null), 5000);
    }
  };

  return (
    <>
      {error && (
        <div className="fixed top-20 left-0 right-0 z-50 bg-orange-100 border border-orange-300 text-orange-800 px-4 py-3 text-center">
          <div dangerouslySetInnerHTML={{ __html: error }} />
          <button 
            onClick={() => setError(null)} 
            className="ml-4 text-orange-600 hover:text-orange-800"
          >
            ✕
          </button>
        </div>
      )}
      <header className="sticky top-0 z-50 border-b border-[rgba(93,63,41,0.1)] bg-[rgba(255,251,245,0.92)] backdrop-blur-md">
      <nav className="warm-container flex items-center justify-between gap-3 py-4">
        <Link href="/" className="flex min-w-0 items-center gap-3 text-[#d86116]">
          <span className="text-3xl">🌍</span>
          <span className="hidden truncate text-2xl font-bold sm:inline lg:text-[1.95rem]">Recettes du Monde</span>
        </Link>

        <div className="hidden lg:flex items-center gap-6 xl:gap-8 text-[1.02rem] text-[#3c2f28]">
          <Link href="/" className="hover:text-[#d86116] transition-colors">Accueil</Link>
          <Link href="/recettes" className="hover:text-[#d86116] transition-colors">Recettes</Link>
          {isAuthenticated && (
            <>
              <Link href="/favorites" onClick={handleFavoritesClick} className="hover:text-[#d86116] transition-colors">Favoris</Link>
              <Link href="/my-recipes" className="hover:text-[#d86116] transition-colors">Mes recettes</Link>
              <Link href="/profile" className="hover:text-[#d86116] transition-colors">Profil</Link>
            </>
          )}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link
                href="/recipes/create"
                className="rounded-full bg-[#e87526] px-5 py-2.5 text-white shadow-sm transition hover:bg-[#cf651c]"
              >
                + Ajouter
              </Link>
              <div className="rounded-full border border-[rgba(93,63,41,0.12)] bg-white px-4 py-2 text-[#4a3d35]">
                {user?.firstName || 'Utilisateur'}
              </div>
              <button
                onClick={logout}
                className="text-[#5f5249] transition hover:text-[#d86116]"
              >
                Déconnexion
              </button>
            </>
          ) : (
            !loading && (
              <>
                <Link href="/login" className="text-[#4a3d35] transition hover:text-[#d86116]">Connexion</Link>
                <Link
                  href="/register"
                  className="rounded-full bg-[#e87526] px-5 py-2.5 text-white shadow-sm transition hover:bg-[#cf651c]"
                >
                  S'inscrire
                </Link>
              </>
            )
          )}
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-full border border-[rgba(93,63,41,0.14)] p-2 text-[#4a3d35] lg:hidden"
          aria-label="Ouvrir le menu"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </nav>

      {isOpen && (
        <div className="border-t border-[rgba(93,63,41,0.08)] bg-[#fffaf4] lg:hidden">
          <div className="warm-container flex flex-col gap-2 py-4 text-[#3c2f28]">
            <Link href="/" onClick={closeMenu} className="rounded-2xl px-4 py-3 hover:bg-[#f7ecdf]">Accueil</Link>
            <Link href="/recettes" onClick={closeMenu} className="rounded-2xl px-4 py-3 hover:bg-[#f7ecdf]">Recettes</Link>
            {isAuthenticated ? (
              <>
                <Link href="/favorites" onClick={handleFavoritesClick} className="rounded-2xl px-4 py-3 hover:bg-[#f7ecdf]">Favoris</Link>
                <Link href="/my-recipes" onClick={closeMenu} className="rounded-2xl px-4 py-3 hover:bg-[#f7ecdf]">Mes recettes</Link>
                <Link href="/profile" onClick={closeMenu} className="rounded-2xl px-4 py-3 hover:bg-[#f7ecdf]">Profil</Link>
                <Link href="/recipes/create" onClick={closeMenu} className="rounded-2xl bg-[#e87526] px-4 py-3 text-center text-white">+ Ajouter</Link>
                <button onClick={() => { logout(); closeMenu(); }} className="rounded-2xl px-4 py-3 text-left hover:bg-[#f7ecdf]">Déconnexion</button>
              </>
            ) : (
              !loading && (
                <>
                  <Link href="/login" onClick={closeMenu} className="rounded-2xl px-4 py-3 hover:bg-[#f7ecdf]">Connexion</Link>
                  <Link href="/register" onClick={closeMenu} className="rounded-2xl bg-[#e87526] px-4 py-3 text-center text-white">S'inscrire</Link>
                </>
              )
            )}
          </div>
        </div>
      )}
    </header>
    </>
  );
}
