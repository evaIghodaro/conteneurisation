import { ID } from "react-native-appwrite";
import { createContext, useContext, useEffect, useState } from "react";
import { account, databases, DATABASE_ID, COLLECTIONS } from "../lib/appwrite";
import { toast } from "../lib/toast";

const UserContext = createContext();

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  async function login(email, password) {
    try {
      await account.deleteSession({ sessionId: "current" });
    } catch (_) {
      // No active session, that's fine
    }
    await account.createEmailPasswordSession({ email, password });
    const current = await account.get();
    setUser(current);
    
    // Get user profile with role
    try {
      const profile = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        current.$id
      );
      setUserProfile(profile);
    } catch (error) {
      // Create profile if doesn't exist
      const newProfile = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        current.$id,
        {
          email: current.email,
          name: current.name,
          role: "client" // Default role
        }
      );
      setUserProfile(newProfile);
    }
    
    toast("Welcome back!");
  }

  async function logout() {
    await account.deleteSession({ sessionId: "current" });
    setUser(null);
    setUserProfile(null);
    toast("Logged out");
  }

  async function register(email, password, name, role = "client") {
    const userAccount = await account.create({ 
      userId: ID.unique(), 
      email, 
      password,
      name 
    });
    
    // Create user profile
    await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.USERS,
      userAccount.$id,
      {
        email: userAccount.email,
        name: userAccount.name,
        role: role
      }
    );
    
    await login(email, password);
    toast("Account created");
  }

  async function updateUserProfile(updates) {
    const updated = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.USERS,
      user.$id,
      updates
    );
    setUserProfile(updated);
    return updated;
  }

  useEffect(() => {
    account
      .get()
      .then(async (currentUser) => {
        setUser(currentUser);
        try {
          const profile = await databases.getDocument(
            DATABASE_ID,
            COLLECTIONS.USERS,
            currentUser.$id
          );
          setUserProfile(profile);
        } catch (error) {
          console.log("Profile not found");
        }
      })
      .catch(() => {
        setUser(null);
        setUserProfile(null);
      })
      .finally(() => setIsLoaded(true));
  }, []);

  return (
    <UserContext.Provider value={{ 
      current: user, 
      profile: userProfile,
      isLoaded, 
      login, 
      logout, 
      register,
      updateUserProfile
    }}>
      {children}
    </UserContext.Provider>
  );
}
