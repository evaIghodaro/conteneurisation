'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  favorites: string[];
  createdAt?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, token, user, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '' });

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push('/login?redirect=/profile');
      return;
    }
    void fetchProfile();
  }, [authLoading, isAuthenticated, router]);

  const memberSince = useMemo(() => {
    const rawDate = profile?.createdAt || user?.createdAt;
    if (!rawDate) return '—';
    return new Date(rawDate).toLocaleDateString('fr-FR');
  }, [profile?.createdAt, user?.createdAt]);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/users/profile', {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        cache: 'no-store',
      });
      const data = await response.json();

      if (!response.ok || !data.success || !data.data) {
        throw new Error(data.error || 'Impossible de charger le profil.');
      }

      setProfile(data.data);
      setFormData({
        firstName: data.data.firstName || '',
        lastName: data.data.lastName || '',
        email: data.data.email || '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement du profil.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Mise à jour impossible.');
      }

      setProfile((prev) => prev ? { ...prev, ...formData } : prev);
      localStorage.setItem('auth-user', JSON.stringify({ ...(user || {}), ...formData }));
      setEditing(false);
      setSuccess('Profil mis à jour avec succès.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-orange-500" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="rounded-3xl border border-orange-200 bg-orange-50 px-6 py-5 text-orange-800">Profil non trouvé</div>
      </div>
    );
  }

  return (
    <div className="pb-16 pt-8">
      <div className="warm-container space-y-8">
        <section className="relative rounded-2xl overflow-hidden px-6 py-10 sm:px-10 lg:px-14">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "url('/images/profile-banner.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 max-w-2xl text-white">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.35em] text-[#ffdcb6]">mon profil</p>
            <h1 className="mb-4 text-4xl font-bold sm:text-5xl">Mon espace personnel</h1>
            <p className="max-w-xl text-lg leading-8 text-[#fff0e2]">
              Gérez vos informations, gardez un accès rapide à vos favoris et retrouvez vos recettes sans maquette figée.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-5xl">
          <div className="wood-card rounded-[2rem] p-6 sm:p-8">
            <div className="mb-8 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
              <div>
                <p className="section-title mb-2">Compte</p>
                <h2 className="text-3xl font-bold text-orange-950">Informations personnelles</h2>
                <p className="mt-2 text-orange-700">Votre espace est maintenant relié à l'API profil.</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
                <button
                  type="button"
                  onClick={() => {
                    setEditing((prev) => !prev);
                    setError(null);
                    setSuccess(null);
                  }}
                  className="rounded-full border border-orange-200 bg-white px-5 py-3 font-semibold text-orange-700 transition hover:bg-orange-50"
                >
                  {editing ? 'Annuler' : 'Modifier mes infos'}
                </button>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-full border border-red-200 bg-red-50 px-5 py-3 font-semibold text-red-700 transition hover:bg-red-100"
                >
                  Déconnexion
                </button>
              </div>
            </div>

            {error ? <div className="mb-5 rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">{error}</div> : null}
            {success ? <div className="mb-5 rounded-3xl border border-green-200 bg-green-50 px-5 py-4 text-green-700">{success}</div> : null}

            {editing ? (
              <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-orange-700">Prénom</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                    className="w-full rounded-2xl border border-orange-200 bg-white px-4 py-3 text-orange-950 outline-none transition focus:border-orange-400"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-orange-700">Nom</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                    className="w-full rounded-2xl border border-orange-200 bg-white px-4 py-3 text-orange-950 outline-none transition focus:border-orange-400"
                    required
                  />
                </div>
                <div className="lg:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-orange-700">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full rounded-2xl border border-orange-200 bg-white px-4 py-3 text-orange-950 outline-none transition focus:border-orange-400"
                    required
                  />
                </div>
                <div className="lg:col-span-2 flex flex-wrap gap-3">
                  <button type="submit" disabled={saving} className="rounded-full bg-[#e87526] px-6 py-3 font-semibold text-white transition hover:bg-[#cf651c] disabled:opacity-60">
                    {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                  </button>
                  <button type="button" onClick={() => setEditing(false)} className="rounded-full border border-orange-200 bg-white px-6 py-3 font-semibold text-orange-700">
                    Annuler
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-[1.75rem] bg-orange-50 p-6">
                  <p className="text-sm font-semibold text-orange-600">Prénom</p>
                  <p className="mt-3 text-2xl font-bold text-orange-950">{profile.firstName}</p>
                </div>
                <div className="rounded-[1.75rem] bg-orange-50 p-6">
                  <p className="text-sm font-semibold text-orange-600">Nom</p>
                  <p className="mt-3 text-2xl font-bold text-orange-950">{profile.lastName}</p>
                </div>
                <div className="rounded-[1.75rem] bg-orange-50 p-6 md:col-span-2">
                  <p className="text-sm font-semibold text-orange-600">Email</p>
                  <p className="mt-3 break-all text-2xl font-bold text-orange-950">{profile.email}</p>
                </div>
                <div className="rounded-[1.75rem] bg-orange-50 p-6">
                  <p className="text-sm font-semibold text-orange-600">Membre depuis</p>
                  <p className="mt-3 text-2xl font-bold text-orange-950">{memberSince}</p>
                </div>
                <div className="rounded-[1.75rem] bg-orange-50 p-6">
                  <p className="text-sm font-semibold text-orange-600">Favoris</p>
                  <p className="mt-3 text-2xl font-bold text-orange-950">{profile.favorites?.length || 0}</p>
                </div>
                <div className="rounded-[1.75rem] bg-orange-50 p-6 md:col-span-2">
                  <p className="text-sm font-semibold text-orange-600">Raccourcis</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link href="/favorites" className="rounded-full border border-orange-200 bg-white px-5 py-3 font-semibold text-orange-700 transition hover:bg-orange-100">
                      Voir mes favoris
                    </Link>
                    <Link href="/my-recipes" className="rounded-full border border-orange-200 bg-white px-5 py-3 font-semibold text-orange-700 transition hover:bg-orange-100">
                      Mes recettes
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
