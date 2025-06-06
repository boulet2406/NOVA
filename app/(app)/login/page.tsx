"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { useUser } from "@/context/UserContext";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { user, refreshUser, isLoading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && user) {
            router.replace("/");
        }
    }, [router, user, isLoading]);

    if (isLoading || user) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const res = await fetch("/api/users/login", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        if (res.ok) {
            await refreshUser();
            router.push("/");
        } else {
            alert("Échec de la connexion");
        }
    };

    return (
        <div
            className="flex items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/bg-login.jpg')" }}
        >
            <div className="w-80 p-8 bg-white/90 backdrop-blur-sm rounded-xl shadow-md space-y-6">
                <h1
                    className="
            text-center
            text-6xl
            font-extrabold
            bg-clip-text text-transparent
            bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500
          "
                >
                    NOVA
                </h1>

                <p className="text-center text-xs text-gray-500 uppercase tracking-wide">
                    Next-Gen Operational Viewpoint for Anomalies
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="block text-sm text-gray-600">
                            Utilisateur
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Identifiant"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none text-gray-900 focus:ring-2 focus:ring-indigo-400 transition"
                        />
                    </div>

                    <div className="space-y-1 relative">
                        <label className="block text-sm text-gray-600">
                            Mot de passe
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none text-gray-900 focus:ring-2 focus:ring-indigo-400 transition pr-10"
                        />
                        <Lock
                            className="absolute right-3 top-9 text-gray-400"
                            size={18}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded transition"
                    >
                        Se connecter
                    </button>

                    {/* Faux bouton SSO */}
                    <button
                        type="button"
                        onClick={() => alert("SSO non connecté (demo)")}
                        className="w-full py-2 border border-gray-300 hover:border-gray-400 text-gray-700 rounded transition"
                    >
                        Connexion SSO
                    </button>
                </form>
            </div>
        </div>
    );
}
