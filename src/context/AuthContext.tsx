
"use client";

import type { User } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth, googleProvider } from '@/lib/firebase'; // Import Firebase auth instance and googleProvider
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile,
  signInWithPopup, 
  sendPasswordResetEmail, // Import sendPasswordResetEmail
  type User as FirebaseUser
} from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>; // Added resetPassword
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

function AuthProviderInternal({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
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
      const redirect = searchParams.get('redirect');
      router.push(redirect || '/profile');
      toast({ title: "Inicio de sesión exitoso", description: "¡Bienvenido de nuevo!" });
    } catch (error: any) {
      console.error("Error during login:", error);
      toast({ title: "Error al iniciar sesión", description: error.message || "Por favor, revisa tus credenciales.", variant: "destructive" });
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name?: string) => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        if (name) {
          await updateProfile(userCredential.user, { displayName: name });
        }
      }
      const redirect = searchParams.get('redirect');
      router.push(redirect || '/profile');
      toast({ title: "Registro exitoso", description: "¡Bienvenido a PizzaPlace!" });
    } catch (error: any)
{
      console.error("Error during signup:", error);
      toast({ title: "Error al registrarse", description: error.message || "No se pudo crear la cuenta.", variant: "destructive" });
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const redirect = searchParams.get('redirect');
      router.push(redirect || '/profile');
      toast({ title: "Inicio de sesión con Google exitoso", description: `¡Bienvenido, ${result.user.displayName || result.user.email}!` });
    } catch (error: any) {
      console.error("Error during Google login:", error);
      let errorMessage = "No se pudo iniciar sesión con Google.";
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "El proceso de inicio de sesión con Google fue cancelado.";
        toast({ title: "Proceso cancelado", description: errorMessage, variant: "default" });
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = "Ya existe una cuenta con este correo electrónico pero con un método de inicio de sesión diferente. Intenta iniciar sesión con el método original.";
        toast({ title: "Conflicto de cuenta", description: errorMessage, variant: "destructive" });
      } else {
        errorMessage = error.message || errorMessage;
        toast({ title: "Error al iniciar sesión con Google", description: errorMessage, variant: "destructive" });
      }
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: "Correo enviado",
        description: "Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña.",
      });
      router.push('/login');
    } catch (error: any) {
      console.error("Error sending password reset email:", error);
      toast({
        title: "Error al enviar correo",
        description: error.message || "No se pudo enviar el correo de restablecimiento.",
        variant: "destructive",
      });
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
        loginWithGoogle,
        resetPassword, // Added
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  return (
    <React.Suspense fallback={<div className="flex h-screen w-screen items-center justify-center"><p>Cargando autenticación...</p></div>}>
      <AuthProviderInternal>{children}</AuthProviderInternal>
    </React.Suspense>
  );
};
