"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

type User = {
    firstName: string;
    email: string;
    // ajoute d'autres champs si besoin
};

type UserContextType = {
    user: User | null;
    refreshUser: () => Promise<void>;
    logout: () => Promise<void>;
    isLoading: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error("useUser must be used within a UserProvider");
    return context;
};

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const refreshUser = async () => {
        const res = await fetch("/api/users/me", {
            credentials: "include",
        });

        if (res.ok) {
            const data = await res.json();
            setUser(data.user ?? null);
        } else {
            setUser(null);
        }

        setIsLoading(false);
    };

    const logout = async () => {
        await fetch("/api/users/logout", {
            method: "POST",
            credentials: "include",
        });
        setUser(null);
        router.push("/admin/login");
    };

    useEffect(() => {
        refreshUser();
    }, []);

    return (
        <UserContext.Provider value={{ user, refreshUser, logout, isLoading }}>
            {children}
        </UserContext.Provider>
    );
};
