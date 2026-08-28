import * as React from "react";
import { supabase } from "./supabase";
import type { User } from "@supabase/supabase-js";

export interface UserProfile {
  id: string;
  email: string;
  role: "buyer" | "supplier";
  full_name: string;
  company_name?: string;
  onboarding_completed: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<UserProfile | null>;
  setSessionData: (user: User | null, profile: UserProfile | null) => void;
}

const AuthContext = React.createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => null,
  setSessionData: () => {},
});

const LOCAL_STORAGE_KEY = "texora_auth_session";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [loading, setLoading] = React.useState(true);

  const fetchProfile = React.useCallback(async (userObj: User): Promise<UserProfile> => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userObj.id)
        .maybeSingle();

      if (!error && data) {
        const mapped = data as UserProfile;
        setProfile(mapped);
        return mapped;
      }
    } catch (err) {
      console.warn("Failed to load profile from database:", err);
    }

    // Fallback profile if table query fails or row does not exist
    const fallbackProfile: UserProfile = {
      id: userObj.id,
      email: userObj.email || "",
      role: (userObj.user_metadata?.role || "buyer").toLowerCase() as "buyer" | "supplier",
      full_name: userObj.user_metadata?.full_name || userObj.email?.split("@")[0] || "User",
      company_name: userObj.user_metadata?.company_name || "",
      onboarding_completed: false,
    };
    setProfile(fallbackProfile);
    return fallbackProfile;
  }, []);

  const setSessionData = React.useCallback((u: User | null, p: UserProfile | null) => {
    setUser(u);
    setProfile(p);
    if (u && p) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ user: u, profile: p }));
      } catch (e) {
        console.warn("Failed to persist session to localStorage:", e);
      }
    } else {
      try {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      } catch (e) {
        console.warn("Failed to clear session from localStorage:", e);
      }
    }
  }, []);

  const refreshProfile = React.useCallback(async () => {
    if (!user) return null;
    const p = await fetchProfile(user);
    setSessionData(user, p);
    return p;
  }, [user, fetchProfile, setSessionData]);

  React.useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      // 1. Try Supabase session
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (session?.user && !error) {
          if (isMounted) {
            setUser(session.user);
            const p = await fetchProfile(session.user);
            if (isMounted) setSessionData(session.user, p);
          }
          return;
        }
      } catch (err) {
        console.warn("Supabase initial session lookup skipped:", err);
      }

      // No valid Supabase session found — clear state
      if (isMounted) {
        setUser(null);
        setProfile(null);
      }
    }

    initAuth().finally(() => {
      if (isMounted) setLoading(false);
    });

    // Listen for Supabase auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        if (session?.user) {
          setUser(session.user);
          const p = await fetchProfile(session.user);
          if (isMounted) setSessionData(session.user, p);
        } else if (event === "SIGNED_OUT") {
          setSessionData(null, null);
        }
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile, setSessionData]);

  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("Supabase sign out warning:", err);
    } finally {
      setSessionData(null, null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, refreshProfile, setSessionData }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return React.useContext(AuthContext);
}


