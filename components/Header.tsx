"use client";

import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
import React, {
    useState,
    useEffect,
    useRef,
    ReactNode,
    useMemo,
    useCallback,
} from "react";
import { useTheme } from "next-themes";
import { generateMockClients } from "@/lib/mockClients";
import { useUser } from "@/context/UserContext";
import {
    LogOut,
    Home,
    Users,
    AlertTriangle,
    FileText,
    Shield,
    Activity,
    Settings,
    Sun,
    Moon,
} from "lucide-react";

interface NestedItem {
    label: string;
    href: string;
}
interface SubmenuItem {
    label: string;
    href: string;
    nested?: NestedItem[];
}
interface NavItemConfig {
    label: string;
    href: string;
    icon: ReactNode;
    submenu?: SubmenuItem[];
}

const useThemeSwitcher = () => {
    const [mode, setMode] = useState("");
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        setMode(theme ?? "dark");
    }, [theme]);

    return [mode, setTheme];
};

export const Header: React.FC = () => {
    const themeSwitcher = useThemeSwitcher();
    const { user, logout } = useUser();
    const pathName = usePathname();

    const theme = themeSwitcher[0];
    const setTheme = themeSwitcher[1] as React.Dispatch<
        React.SetStateAction<string>
    >;

    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const [openNested, setOpenNested] = useState<string | null>(null);

    const menuCloseTimer = useRef<NodeJS.Timeout | null>(null);
    const nestedCloseTimer = useRef<NodeJS.Timeout | null>(null);

    // Fallback pour Scoring
    const searchParams = useSearchParams();
    const fallbackClientId = useMemo(() => generateMockClients(1)[0].id, []);
    const id = searchParams.get("id");
    const currentClientId = Array.isArray(id) ? id[0] : id || fallbackClientId;

    const nestedLcbft: NestedItem[] = [
        { label: "Accueil", href: "/" },
        { label: "Clients", href: "/clients" },
        { label: "Scoring", href: `/clients/${currentClientId}` },
    ];

    const navItems: NavItemConfig[] = [
        {
            label: "Audit",
            href: "/audit",
            icon: <AlertTriangle className="inline-block mr-1" />,
            submenu: [
                { label: "Plan d'audit", href: "/audit/plan" },
                { label: "Audit", href: "/audit" },
                { label: "Constats", href: "/audit/constats" },
                { label: "Recommandation", href: "/audit/recommandation" },
            ],
        },
        {
            label: "Risks",
            href: "/risks",
            icon: <Home className="inline-block mr-1" />,
            submenu: [
                { label: "ERM", href: "/risks/erm" },
                {
                    label: "Internal Controls",
                    href: "/controls",
                    nested: [
                        { label: "Campagnes", href: "/campaigns" },
                        { label: "Controls", href: "/controls" },
                    ],
                },
            ],
        },
        {
            label: "Compliance",
            href: "/compliance",
            icon: <Shield className="inline-block mr-1" />,
            submenu: [
                {
                    label: "LCBFT",
                    href: "/compliance/lcbft",
                    nested: nestedLcbft,
                },
                { label: "Policies", href: "/compliance/policies" },
            ],
        },
        {
            label: "Security",
            href: "/security",
            icon: <FileText className="inline-block mr-1" />,
            submenu: [
                { label: "Incidents", href: "/security/incidents" },
                { label: "Settings", href: "/security/settings" },
            ],
        },
        {
            label: "Actions",
            href: "/actions",
            icon: <Activity className="inline-block mr-1" />,
        },
        {
            label: "Administration",
            href: "/admin",
            icon: <Settings className="inline-block mr-1" />,
        },
    ];

    const toggleTheme = () => {
        if (theme == "light") {
            setTheme("dark");
        } else {
            setTheme("light");
        }
    };

    // Handlers pour ouvrir/fermer avec délai
    const onMenuEnter = useCallback((label: string) => {
        if (menuCloseTimer.current) clearTimeout(menuCloseTimer.current);
        setOpenMenu(label);
    }, []);

    const onMenuLeave = useCallback(() => {
        menuCloseTimer.current = setTimeout(() => {
            setOpenMenu(null);
            setOpenNested(null);
        }, 200);
    }, []);

    const onSubEnter = useCallback((href: string) => {
        if (nestedCloseTimer.current) clearTimeout(nestedCloseTimer.current);
        setOpenNested(href);
    }, []);

    const onSubLeave = useCallback(() => {
        nestedCloseTimer.current = setTimeout(() => {
            setOpenNested(null);
        }, 200);
    }, []);

    if (!user) return null;

    return (
        <header className="bg-white dark:bg-zinc-900 text-black dark:text-white px-6 py-4 flex items-center justify-between shadow">
            <div className="flex items-center gap-6">
                <Link
                    href="/"
                    className="flex items-center px-3 py-1 rounded hover:text-blue-600"
                >
                    <Home className="h-6 w-6 text-blue-400" />
                    <span className="ml-2 text-xl font-bold">NOVA</span>
                </Link>

                <nav className="flex gap-4 relative">
                    {navItems.map((item) => (
                        <div
                            key={item.label}
                            className="relative"
                            onMouseEnter={() => onMenuEnter(item.label)}
                            onMouseLeave={onMenuLeave}
                        >
                            <Link
                                href={item.href}
                                className={`px-3 py-1 rounded ${
                                    pathName.startsWith(item.href)
                                        ? "text-blue-400"
                                        : "hover:text-blue-600"
                                }`}
                            >
                                {item.icon}
                                {item.label}
                            </Link>

                            {item.submenu && openMenu === item.label && (
                                <ul
                                    className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-zinc-800 shadow rounded z-30"
                                    onMouseEnter={() => {
                                        if (menuCloseTimer.current)
                                            clearTimeout(
                                                menuCloseTimer.current
                                            );
                                    }}
                                    onMouseLeave={onMenuLeave}
                                >
                                    {item.submenu.map((sub) => (
                                        <li
                                            key={sub.href}
                                            className="relative"
                                            onMouseEnter={() =>
                                                sub.nested
                                                    ? onSubEnter(sub.href)
                                                    : undefined
                                            }
                                            onMouseLeave={
                                                sub.nested
                                                    ? onSubLeave
                                                    : undefined
                                            }
                                        >
                                            <Link
                                                href={sub.href}
                                                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-700"
                                            >
                                                {sub.label}
                                            </Link>

                                            {sub.nested &&
                                                openNested === sub.href && (
                                                    <ul
                                                        className="absolute top-0 left-full ml-1 w-40 bg-white dark:bg-zinc-800 shadow rounded z-40"
                                                        onMouseEnter={() => {
                                                            if (
                                                                nestedCloseTimer.current
                                                            )
                                                                clearTimeout(
                                                                    nestedCloseTimer.current
                                                                );
                                                        }}
                                                        onMouseLeave={
                                                            onSubLeave
                                                        }
                                                    >
                                                        {sub.nested.map((n) => (
                                                            <li key={n.href}>
                                                                <Link
                                                                    href={
                                                                        n.href
                                                                    }
                                                                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-700"
                                                                >
                                                                    {n.label}
                                                                </Link>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </nav>
            </div>

            <div className="flex items-center gap-4">
                <button
                    suppressHydrationWarning
                    onClick={toggleTheme}
                    aria-label="Toggle theme"
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-zinc-700"
                >
                    {theme === "dark" ? (
                        <Sun className="w-5 h-5 text-yellow-400" />
                    ) : (
                        <Moon className="w-5 h-5 text-indigo-600" />
                    )}
                </button>
                {user?.firstName && (
                    <span className="flex items-center gap-1 bg-gray-200 dark:bg-zinc-700 text-gray-800 dark:text-white px-3 py-1 rounded">
                        <Users size={16} />
                        {user.firstName}
                    </span>
                )}
                <button
                    onClick={logout}
                    className="flex items-center gap-1 bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded"
                >
                    <LogOut size={16} /> Déconnexion
                </button>
            </div>
        </header>
    );
};

export default Header;
