"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, User, signOut } from "firebase/auth";
import { auth } from "@/db/firebase";
import { GoogleAuthProvider } from "firebase/auth";

interface AuthContextProps{
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signOutAcc: () => Promise<void>;
}

const AuthContext =  createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({children}: {children: React.ReactNode}) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        if(user){
            localStorage.setItem("user", JSON.stringify(user));
        } else {
            localStorage.removeItem("user");
        }

        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        setLoading(true);
        await signInWithPopup(auth, new GoogleAuthProvider());
        setLoading(false);
    }

    const signInWithEmail = async (email: string, password: string) => {
        setLoading(true);
        await signInWithEmailAndPassword(auth, email, password);
        setLoading(false);
    }

    const signOutAcc = async () => {
        setLoading(true);
        await signOut(auth);
        setLoading(false);
    }

    return (
        <AuthContext.Provider value={{user, loading, signInWithGoogle, signInWithEmail, signOutAcc}}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
      throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
  };
