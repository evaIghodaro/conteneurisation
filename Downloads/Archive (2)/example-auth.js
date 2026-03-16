import { account } from "./lib/appwrite";
import { useEffect, useState } from "react";

export function useAuth() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initSession = async () => {
      try {
        // Create anonymous session
        await account.createAnonymousSession();
        
        // Get current session
        const currentSession = await account.get();
        setSession(currentSession);
      } catch (error) {
        console.error("Auth error:", error);
      } finally {
        setLoading(false);
      }
    };

    initSession();
  }, []);

  return { session, loading };
}

// Usage in a component:
// const { session, loading } = useAuth();
