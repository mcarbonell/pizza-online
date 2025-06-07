
"use client";

import type { User, UserProfile } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth, googleProvider, db } from '@/lib/firebase'; // Import db
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile as updateFirebaseProfile, // Renamed to avoid conflict
  signInWithPopup, 
  sendPasswordResetEmail,
  type User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'; // Import Firestore functions
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null; // Add userProfile state
  isLoadingUserProfile: boolean; // Add loading state for profile
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isLoading: boolean;
  fetchUserProfile: (uid: string) => Promise<void>; // Function to fetch/refresh profile
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

// Helper function to create or update user profile in Firestore
const createUserProfileDocument = async (firebaseUser: FirebaseUser) => {
  if (!firebaseUser) return;

  const userRef = doc(db, 'users', firebaseUser.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    // Create new user profile document
    const { uid, email, displayName } = firebaseUser;
    const createdAt = serverTimestamp();
    try {
      await setDoc(userRef, {
        uid,
        email,
        displayName: displayName || '',
        createdAt,
        updatedAt: createdAt,
        defaultShippingAddress: null, // Initialize with no default address
      });
      console.log("User profile document created for new user:", uid);
    } catch (error) {
      console.error("Error creating user profile document:", error);
    }
  } else {
    // Optionally, update existing document if needed (e.g., displayName changed via Google)
    const existingData = userSnap.data() as UserProfile;
    if (existingData.displayName !== firebaseUser.displayName || existingData.email !== firebaseUser.email) {
      try {
        await setDoc(userRef, { 
          displayName: firebaseUser.displayName || existingData.displayName || '',
          email: firebaseUser.email || existingData.email,
          updatedAt: serverTimestamp() 
        }, { merge: true });
        console.log("User profile document updated for user:", firebaseUser.uid);
      } catch (error) {
        console.error("Error updating user profile document:", error);
      }
    }
  }
};


function AuthProviderInternal({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingUserProfile, setIsLoadingUserProfile] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const fetchUserProfile = async (uid: string) => {
    setIsLoadingUserProfile(true);
    try {
      const userRef = doc(db, "users", uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        setUserProfile(docSnap.data() as UserProfile);
      } else {
        // This case might happen if the document wasn't created for some reason
        // or if we want to create it on-demand if missing after login
        console.log("No user profile found in Firestore for UID:", uid);
        setUserProfile(null); 
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setUserProfile(null);
      toast({ title: "Error", description: "Could not fetch user profile.", variant: "destructive" });
    } finally {
      setIsLoadingUserProfile(false);
    }
  };


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const simpleUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
        };
        setUser(simpleUser);
        await createUserProfileDocument(firebaseUser); // Ensure profile exists
        await fetchUserProfile(firebaseUser.uid); // Fetch the profile data
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        await fetchUserProfile(userCredential.user.uid); // Fetch profile on login
      }
      const redirect = searchParams.get('redirect');
      router.push(redirect || '/profile');
      toast({ title: "Inicio de sesión exitoso", description: "¡Bienvenido de nuevo!" });
    } catch (error: any) {
      console.error("Error during login:", error);
      toast({ title: "Error al iniciar sesión", description: error.message || "Por favor, revisa tus credenciales.", variant: "destructive" });
      setUser(null);
      setUserProfile(null);
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
          await updateFirebaseProfile(userCredential.user, { displayName: name });
        }
        // createUserProfileDocument is called by onAuthStateChanged,
        // but we can call it here too to ensure it's done before redirect if needed,
        // or rely on the onAuthStateChanged listener.
        // For this flow, onAuthStateChanged should handle it.
      }
      // User and profile will be set by onAuthStateChanged
      const redirect = searchParams.get('redirect');
      router.push(redirect || '/profile');
      toast({ title: "Registro exitoso", description: "¡Bienvenido a PizzaPlace!" });
    } catch (error: any) {
      console.error("Error during signup:", error);
      toast({ title: "Error al registrarse", description: error.message || "No se pudo crear la cuenta.", variant: "destructive" });
      setUser(null);
      setUserProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // createUserProfileDocument and fetchUserProfile will be handled by onAuthStateChanged
      const redirect = searchParams.get('redirect');
      router.push(redirect || '/profile');
      toast({ title: "Inicio de sesión con Google exitoso", description: `¡Bienvenido, ${result.user.displayName || result.user.email}!` });
    } catch (error: any) {
      console.error("Error during Google login:", error);
      let errorMessage = "No se pudo iniciar sesión con Google.";
      // ... (error handling as before)
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
      setUserProfile(null);
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
      // User and profile will be set to null by onAuthStateChanged
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
        userProfile,
        isLoadingUserProfile,
        login,
        signup,
        logout,
        loginWithGoogle,
        resetPassword,
        isLoading,
        fetchUserProfile,
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

