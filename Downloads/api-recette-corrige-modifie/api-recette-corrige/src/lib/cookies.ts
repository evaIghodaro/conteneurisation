// Fonction pour stocker le token JWT dans un cookie navigateur
// Le cookie est utilisé par le middleware pour vérifier l'authentification
export function setAuthCookie(token: string) {
  // Vérifie qu'on est côté client (document existe seulement dans le navigateur)
  if (typeof document === 'undefined') return;
  // Crée un cookie avec une durée de vie de 7 jours (60s * 60min * 24h * 7j)
  // samesite=lax : protection CSRF tout en autorisant les navigations standards
  document.cookie = `auth-token=${encodeURIComponent(token)}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
}

// Fonction pour supprimer le cookie d'authentification (déconnexion)
export function clearAuthCookie() {
  if (typeof document === 'undefined') return;
  // max-age=0 : expire immédiatement le cookie
  document.cookie = 'auth-token=; path=/; max-age=0; samesite=lax';
}
