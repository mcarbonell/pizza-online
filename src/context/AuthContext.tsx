
"use client";

import type { User, UserProfile, UpdateUserProfileFormValues, ShippingAddressDetails, SimulatedPaymentMethod } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, type ReactNode, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth, googleProvider, db } from '@/lib/firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile as updateFirebaseProfile, 
  signInWithPopup, 
  sendPasswordResetEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword as firebaseUpdatePassword,
  sendEmailVerification,
  type User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore'; 
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null; 
  isLoadingUserProfile: boolean; 
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserPassword: (currentPassword: string, newPassword: string) => Promise<void>;
  updateUserProfileDetails: (data: UpdateUserProfileFormValues) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  isLoading: boolean;
  fetchUserProfile: (uid: string) => Promise<void>; 
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

const createUserProfileDocument = async (firebaseUser: FirebaseUser) => {
  if (!firebaseUser) return;

  const userRef = doc(db, 'users', firebaseUser.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const { uid, email, displayName, emailVerified } = firebaseUser;
    const createdAt = serverTimestamp();
    try {
      await setDoc(userRef, {
        uid,
        email,
        displayName: displayName || '',
        emailVerified,
        role: 'user', // Default role for new users
        createdAt,
        updatedAt: createdAt,
        defaultShippingAddress: null,
        defaultPaymentMethod: null,
      });
      console.log("User profile document created for new user:", uid);
    } catch (error) {
      console.error("Error creating user profile document:", error);
    }
  } else {
    const existingData = userSnap.data() as UserProfile;
    const updates: Partial<UserProfile> = { updatedAt: serverTimestamp() };
    let needsUpdate = false;

    if (firebaseUser.displayName && existingData.displayName !== firebaseUser.displayName) {
        updates.displayName = firebaseUser.displayName;
        needsUpdate = true;
    }
    if (firebaseUser.email && existingData.email !== firebaseUser.email) {
        updates.email = firebaseUser.email;
        needsUpdate = true;
    }
    if (existingData.emailVerified !== firebaseUser.emailVerified) {
        updates.emailVerified = firebaseUser.emailVerified;
        needsUpdate = true;
    }
    if (!existingData.role) { // If role doesn't exist, set to 'user'
        updates.role = 'user';
        needsUpdate = true;
    }


    if (needsUpdate) {
      try {
        await updateDoc(userRef, updates);
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

  const fetchUserProfileCb = useCallback(async (uid: string) => {
    setIsLoadingUserProfile(true);
    try {
      const userRef = doc(db, "users", uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        setUserProfile(docSnap.data() as UserProfile);
      } else {
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
  }, [toast]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      setIsLoading(true);
      if (firebaseUser) {
        const simpleUser: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          providerData: firebaseUser.providerData.map(pd => ({ providerId: pd.providerId })),
          emailVerified: firebaseUser.emailVerified,
        };
        setUser(simpleUser);
        await createUserProfileDocument(firebaseUser); 
        await fetchUserProfileCb(firebaseUser.uid); 
      } else {
        setUser(null);
        setUserProfile(null);
        setIsLoadingUserProfile(false);
      }
      setIsLoading(false); 
    });
    return () => unsubscribe();
  }, [fetchUserProfileCb]);

  const loginCb = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // User profile will be fetched by onAuthStateChanged
      const redirect = searchParams.get('redirect');
      router.push(redirect || '/profile');
      toast({ title: "Inicio de sesión exitoso", description: "¡Bienvenido de nuevo!" });
    } catch (error: any) {
      console.error("Error during login:", error);
      toast({ title: "Error al iniciar sesión", description: error.message || "Por favor, revisa tus credenciales.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [router, searchParams, toast]);

  const signupCb = useCallback(async (email: string, password: string, name?: string) => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
          if (name) {
            await updateFirebaseProfile(userCredential.user, { displayName: name });
          }
          // createUserProfileDocument will be called by onAuthStateChanged
          await sendEmailVerification(userCredential.user);
          toast({ title: "Verifica tu correo", description: "Se ha enviado un correo de verificación a tu dirección. Por favor, revisa tu bandeja de entrada." });
      }
      // User profile will be fetched by onAuthStateChanged
      const redirect = searchParams.get('redirect');
      router.push(redirect || '/profile');
      toast({ title: "Registro exitoso", description: "¡Bienvenido a PizzaPlace!" });
    } catch (error: any) {
      console.error("Error during signup:", error);
      toast({ title: "Error al registrarse", description: error.message || "No se pudo crear la cuenta.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [router, searchParams, toast]);

  const loginWithGoogleCb = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // User profile will be fetched/created by onAuthStateChanged
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
    } finally {
      setIsLoading(false);
    }
  }, [router, searchParams, toast]);

  const logoutCb = useCallback(async () => {
    setIsLoading(true);
    try {
      await signOut(auth);
      // setUser and setUserProfile will be set to null by onAuthStateChanged
      router.push('/');
      toast({ title: "Cierre de sesión exitoso", description: "Has cerrado sesión correctamente." });
    } catch (error: any) {
      console.error("Error during logout:", error);
      toast({ title: "Error al cerrar sesión", description: error.message || "No se pudo cerrar la sesión.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [router, toast]);

  const resetPasswordCb = useCallback(async (email: string) => {
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
  }, [router, toast]);

  const updateUserPasswordCb = useCallback(async (currentPassword: string, newPassword: string) => {
    setIsLoading(true);
    const firebaseUser = auth.currentUser;
    if (!firebaseUser || !firebaseUser.email) {
      toast({ title: "Error", description: "Usuario no encontrado o sin email.", variant: "destructive" });
      setIsLoading(false);
      throw new Error("User not found or email missing");
    }

    try {
      const credential = EmailAuthProvider.credential(firebaseUser.email, currentPassword);
      await reauthenticateWithCredential(firebaseUser, credential);
      await firebaseUpdatePassword(firebaseUser, newPassword);
      toast({ title: "Contraseña actualizada", description: "Tu contraseña ha sido cambiada exitosamente." });
    } catch (error: any)
    {
      console.error("Error updating password:", error);
      let errorMessage = "No se pudo actualizar la contraseña.";
      if (error.code === 'auth/wrong-password') {
        errorMessage = "La contraseña actual es incorrecta.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "La nueva contraseña es demasiado débil.";
      }
      toast({ title: "Error al actualizar contraseña", description: errorMessage, variant: "destructive" });
      throw error; 
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const updateUserProfileDetailsCb = useCallback(async (data: UpdateUserProfileFormValues) => {
    setIsLoading(true);
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      toast({ title: "Error", description: "Debes estar autenticado.", variant: "destructive" });
      setIsLoading(false);
      throw new Error("User not authenticated");
    }

    try {
      if (data.displayName !== firebaseUser.displayName) {
        await updateFirebaseProfile(firebaseUser, { displayName: data.displayName });
      }

      const userRef = doc(db, "users", firebaseUser.uid);
      const updates: Partial<UserProfile> = {
        displayName: data.displayName,
        updatedAt: serverTimestamp(),
      };

      if (data.shippingName && data.shippingEmail && data.shippingAddress && data.shippingCity && data.shippingPostalCode) {
        const newShippingAddress: ShippingAddressDetails = {
          name: data.shippingName,
          email: data.shippingEmail,
          address: data.shippingAddress,
          city: data.shippingCity,
          postalCode: data.shippingPostalCode,
          phone: data.shippingPhone || '',
        };
        updates.defaultShippingAddress = newShippingAddress;
      } else {
         updates.defaultShippingAddress = null;
      }
      
      if (data.paymentLast4Digits && data.paymentExpiryDate) {
        const newPaymentMethod: SimulatedPaymentMethod = {
            last4Digits: data.paymentLast4Digits.slice(-4),
            expiryDate: data.paymentExpiryDate,
        };
        updates.defaultPaymentMethod = newPaymentMethod;
      } else {
        updates.defaultPaymentMethod = null;
      }

      await updateDoc(userRef, updates);
      await fetchUserProfileCb(firebaseUser.uid); 

      toast({ title: "Perfil Actualizado", description: "Tu información ha sido actualizada correctamente." });
    } catch (error: any) {
      console.error("Error updating user profile details:", error);
      toast({ title: "Error al Actualizar Perfil", description: error.message || "No se pudo actualizar tu información.", variant: "destructive" });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [fetchUserProfileCb, toast]);

  const resendVerificationEmailCb = useCallback(async () => {
    setIsLoading(true);
    const firebaseUser = auth.currentUser;
    if (firebaseUser && !firebaseUser.emailVerified) {
      try {
        await sendEmailVerification(firebaseUser);
        toast({
          title: "Correo de verificación reenviado",
          description: "Por favor, revisa tu bandeja de entrada.",
        });
      } catch (error: any) {
        console.error("Error resending verification email:", error);
        toast({
          title: "Error",
          description: "No se pudo reenviar el correo de verificación. Inténtalo más tarde.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    } else if (firebaseUser && firebaseUser.emailVerified) {
       toast({
          title: "Correo ya verificado",
          description: "Tu correo electrónico ya ha sido verificado.",
        });
       setIsLoading(false);
    } else {
      toast({ title: "Error", description: "Usuario no encontrado.", variant: "destructive" });
      setIsLoading(false);
    }
  }, [toast]);

  const contextValue = useMemo(() => ({
    user,
    userProfile,
    isLoadingUserProfile,
    isLoading,
    login: loginCb,
    signup: signupCb,
    logout: logoutCb,
    loginWithGoogle: loginWithGoogleCb,
    resetPassword: resetPasswordCb,
    updateUserPassword: updateUserPasswordCb,
    updateUserProfileDetails: updateUserProfileDetailsCb,
    resendVerificationEmail: resendVerificationEmailCb,
    fetchUserProfile: fetchUserProfileCb,
  }), [
    user, userProfile, isLoadingUserProfile, isLoading,
    loginCb, signupCb, logoutCb, loginWithGoogleCb, resetPasswordCb,
    updateUserPasswordCb, updateUserProfileDetailsCb, resendVerificationEmailCb, fetchUserProfileCb
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  return <AuthProviderInternal>{children}</AuthProviderInternal>;
};
