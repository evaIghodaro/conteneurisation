'use client';

// Import des hooks React pour la gestion d'état et effets
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
// Import des fonctions utilitaires pour la gestion des cookies
import { clearAuthCookie, setAuthCookie } from '@/lib/cookies';

// Interface définissant la structure d'un utilisateur
interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  bio?: string;
  createdAt?: string;
  lastLogin?: string;
}

// Interface définissant le type du contexte d'authentification
interface AuthContextType {
  user: User | null;              // Utilisateur connecté ou null
  token: string | null;           // Token JWT ou null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>; // Fonction de connexion
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>; // Fonction d'inscription
  logout: () => void;             // Fonction de déconnexion
  loading: boolean;              // État de chargement
  isAuthenticated: boolean;       // Utilisateur authentifié ou non
}

// Interface définissant les données d'inscription
interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// Création du contexte React pour l'authentification
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider du contexte d'authentification - enveloppe l'application pour fournir l'état d'auth
export function AuthProvider({ children }: { children: ReactNode }) {
  // États pour gérer l'utilisateur, le token et le chargement
  const [user, setUser] = useState<User | null>(null);      // Utilisateur connecté
  const [token, setToken] = useState<string | null>(null);  // Token JWT
  const [loading, setLoading] = useState(true);            // État de chargement initial

  // Effet qui s'exécute au chargement de l'application
  // Vérifie si un utilisateur est déjà connecté via localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('auth-token');   // Récupère le token stocké
    const storedUser = localStorage.getItem('auth-user');     // Récupère les données utilisateur

    // Si token et utilisateur existent, restaure la session
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);           // Parse les données utilisateur
        setToken(storedToken);                               // Restore le token
        setUser(parsedUser);                                 // Restore l'utilisateur
        setAuthCookie(storedToken);                           // Configure le cookie HTTP-only
      } catch (error) {
        // En cas d'erreur de parsing, nettoie le localStorage
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('auth-token');
        localStorage.removeItem('auth-user');
      }
    }
    setLoading(false);  // Indique que le chargement initial est terminé
  }, []);  // [] = s'exécute une seule fois au montage

  // Fonction de connexion - envoie les identifiants à l'API
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Appel à l'API de connexion
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),  // Envoie email et mot de passe
      });

      const data = await response.json();

      // Si la connexion réussit
      if (data.success && data.data) {
        const { user: userData, token: userToken } = data.data;
        
        // Met à jour l'état
        setUser(userData);
        setToken(userToken);
        
        // Stocke dans localStorage pour la persistance
        localStorage.setItem('auth-token', userToken);
        localStorage.setItem('auth-user', JSON.stringify(userData));
        setAuthCookie(userToken);  // Configure le cookie HTTP-only
        
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Erreur lors de la connexion' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Erreur de connexion au serveur' };
    }
  };

  // Fonction d'inscription - crée un nouvel utilisateur
  const register = async (userData: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      // Appel à l'API d'inscription
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),  // Envoie toutes les données d'inscription
      });

      const data = await response.json();

      // Si l'inscription réussit
      if (data.success && data.data) {
        const { user: newUser, token: userToken } = data.data;
        
        // Met à jour l'état avec le nouvel utilisateur
        setUser(newUser);
        setToken(userToken);
        
        // Stocke dans localStorage pour la persistance
        localStorage.setItem('auth-token', userToken);
        localStorage.setItem('auth-user', JSON.stringify(newUser));
        setAuthCookie(userToken);
        
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Erreur lors de l\'inscription' };
      }
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error: 'Erreur de connexion au serveur' };
    }
  };

  // Fonction de déconnexion - nettoie l'état et le stockage
  const logout = () => {
    setUser(null);                              // Réinitialise l'utilisateur
    setToken(null);                            // Réinitialise le token
    localStorage.removeItem('auth-token');     // Supprime le token du localStorage
    localStorage.removeItem('auth-user');      // Supprime l'utilisateur du localStorage
    clearAuthCookie();                         // Supprime le cookie HTTP-only
  };

  // Valeur du contexte fournie à tous les composants enfants
  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user && !!token,  // true si utilisateur ET token existent
  };

  // Fournit le contexte à tous les composants enfants
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook personnalisé pour utiliser le contexte d'authentification
// Permet d'accéder facilement à l'état d'auth dans n'importe quel composant
export function useAuth() {
  const context = useContext(AuthContext);
  // Vérifie que le hook est utilisé dans un AuthProvider
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
