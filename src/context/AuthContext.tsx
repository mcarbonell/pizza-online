
"use client";

import type { User } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; // Import useSearchParams
import { auth } from '@/lib/firebase'; // Import Firebase auth instance
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile,
  type User as FirebaseUser
} from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// This component needs to be a Client Component to use useSearchParams
function AuthProviderInternal({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams(); // Get searchParams here
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle setting the user state
      const redirect = searchParams.get('redirect'); // Read redirect from searchParams
      router.push(redirect || '/profile');
      toast({ title: "Inicio de sesión exitoso", description: "¡Bienvenido de nuevo!" });
    } catch (error: any) {
      console.error("Error during login:", error);
      toast({ title: "Error al iniciar sesión", description: error.message || "Por favor, revisa tus credenciales.", variant: "destructive" });
      setUser(null); // Explicitly set user to null on error
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name?: string) => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      let updatedUser: User | null = null;
      if (userCredential.user) {
        if (name) {
          await updateProfile(userCredential.user, { displayName: name });
          updatedUser = {
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            displayName: name,
          };
        } else {
           updatedUser = {
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            displayName: null,
          };
        }
        // setUser(updatedUser); // This will be handled by onAuthStateChanged, but can set for immediate UI update.
      }
      // onAuthStateChanged will also run, but this provides immediate feedback for redirection
      const redirect = searchParams.get('redirect'); // Check for redirect after signup too
      router.push(redirect || '/profile');
      toast({ title: "Registro exitoso", description: "¡Bienvenido a PizzaPlace!" });
    } catch (error: any) {
      console.error("Error during signup:", error);
      toast({ title: "Error al registrarse", description: error.message || "No se pudo crear la cuenta.", variant: "destructive" });
      setUser(null); // Explicitly set user to null on error
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await signOut(auth);
      router.push('/login');
      toast({ title: "Sesión cerrada", description: "Has cerrado sesión correctamente." });
    } catch (error: any) {
      console.error("Error during logout:", error);
      toast({ title: "Error al cerrar sesión", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Wrap AuthProviderInternal with React.Suspense because useSearchParams()
  // suspends during initial render in the App Router.
  return (
    <React.Suspense fallback={<div>Cargando autenticación...</div>}>
      <AuthProviderInternal>{children}</AuthProviderInternal>
    </React.Suspense>
  );
};
