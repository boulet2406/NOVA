// pages/controls.tsx
"use client";

import React, { useState, useMemo } from "react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    CartesianGrid,
} from "recharts";
import {
    FileText,
    ChartPie,
    TrendingUp,
    TrendingDown,
    ChevronDown,
} from "lucide-react";

interface CampaignData {
    name: string;
    appliedFormalized: number;
    partialFormalized: number;
    notApplicable: number;
    failing: number;
    empty: number;
    none: number;
}

const allCampaigns: CampaignData[] = [
    {
        name: "Campagne A – 2025",
        appliedFormalized: 80,
        partialFormalized: 10,
        notApplicable: 5,
        failing: 3,
        empty: 1,
        none: 1,
    },
    {
        name: "Campagne B – 2025",
        appliedFormalized: 70,
        partialFormalized: 20,
        notApplicable: 2,
        failing: 5,
        empty: 2,
        none: 1,
    },
    {
        name: "Campagne C – 2024",
        appliedFormalized: 85,
        partialFormalized: 8,
        notApplicable: 4,
        failing: 2,
        empty: 1,
        none: 0,
    },
    {
        name: "Campagne D – 2023",
        appliedFormalized: 90,
        partialFormalized: 5,
        notApplicable: 3,
        failing: 1,
        empty: 1,
        none: 0,
    },
    // … ajoutez vos données réelles
];

const COLORS = {
    appliedFormalized: "#22c55e",
    partialFormalized: "#4ade80",
    notApplicable: "#6b7280",
    failing: "#f59e0b",
    empty: "#fde047",
    none: "#dc2626",
};
type ColorKey = keyof typeof COLORS;
type DataItem = Record<ColorKey, number>;

export default function ControlsPage() {
    // filtre par année
    const years = useMemo(() => {
        return Array.from(
            new Set(allCampaigns.map((c) => c.name.split("–")[1].trim()))
        ).sort();
    }, []);

    const [year, setYear] = useState(years[years.length - 1]);

    // données pour l'année sélectionnée
    const data = useMemo(
        () => allCampaigns.filter((c) => c.name.includes(year)),
        [year]
    );

    // Totaux par statut pour PieChart
    const pieData = useMemo(() => {
        const totals = Object.keys(COLORS).reduce((acc, key) => {
            acc[key] = 0;
            return acc;
        }, {} as Record<string, number>);
        (data as DataItem[]).forEach((c) => {
            (Object.keys(COLORS) as ColorKey[]).forEach((key) => {
                totals[key] += c[key];
            });
        });

        return Object.entries(totals).map(([name, value]) => ({ name, value }));
    }, [data]);

    // Trend line: moyenne appliedFormalized par année
    const lineData = useMemo(() => {
        return years.map((y) => {
            const items = allCampaigns.filter((c) => c.name.includes(y));
            const avg =
                items.reduce((sum, c) => sum + c.appliedFormalized, 0) /
                items.length;
            return { year: y, avg: Math.round(avg) };
        });
    }, [years]);

    // Trend area: somme failing par année
    const areaData = useMemo(() => {
        return years.map((y) => {
            const sum = allCampaigns
                .filter((c) => c.name.includes(y))
                .reduce((s, c) => s + c.failing, 0);
            return { year: y, sum };
        });
    }, [years]);

    // KPI
    const flat = (data as DataItem[]).flatMap((c) =>
        (Object.keys(COLORS) as ColorKey[]).map((key) => c[key])
    );
    const avgKPI = Math.round(flat.reduce((a, b) => a + b, 0) / flat.length);
    const mn = Math.min(...flat);
    const mx = Math.max(...flat);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-gray-100">
            <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
                {/* KPI */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {[
                        {
                            title: "Moyenne",
                            value: `${avgKPI}%`,
                            icon: <TrendingUp className="text-green-500" />,
                        },
                        {
                            title: "Minimum",
                            value: `${mn}%`,
                            icon: <TrendingDown className="text-orange-500" />,
                        },
                        {
                            title: "Maximum",
                            value: `${mx}%`,
                            icon: <TrendingUp className="text-blue-500" />,
                        },
                    ].map((kpi) => (
                        <div
                            key={kpi.title}
                            className="bg-white dark:bg-zinc-800 p-4 rounded-2xl shadow-lg transform hover:scale-105 transition"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                {kpi.icon}
                                <h3 className="text-sm font-medium">
                                    {kpi.title}
                                </h3>
                            </div>
                            <p className="text-3xl font-bold">{kpi.value}</p>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <FileText className="text-indigo-500" /> Auto-évaluation{" "}
                        {year}
                    </h2>
                    <div className="relative inline-block">
                        <select
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            className="appearance-none bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 px-4 py-2 rounded-lg pr-8 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            {years.map((y) => (
                                <option key={y} value={y}>
                                    {y}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                </div>

                {/* Graphiques */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* 1) BarChart */}
                    <div
                        className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-lg overflow-auto"
                        style={{ maxHeight: 400 }}
                    >
                        <ResponsiveContainer
                            width="100%"
                            height={data.length * 60}
                        >
                            <BarChart
                                layout="vertical"
                                data={data}
                                margin={{
                                    top: 8,
                                    right: 20,
                                    left: 180,
                                    bottom: 8,
                                }}
                                barCategoryGap="20%"
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    opacity={0.2}
                                />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    width={180}
                                    tick={{ fontSize: 14 }}
                                />
                                <Tooltip formatter={(v: number) => `${v}%`} />
                                <Legend
                                    verticalAlign="top"
                                    wrapperStyle={{ paddingBottom: 8 }}
                                />
                                {Object.entries(COLORS).map(([key, color]) => (
                                    <Bar
                                        key={key}
                                        dataKey={key}
                                        stackId="a"
                                        fill={color}
                                        radius={[4, 4, 4, 4]}
                                    />
                                ))}
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* 2) PieChart */}
                    <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-lg">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <ChartPie className="text-purple-500" /> Répartition
                            globale
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    label={({ name, percent }) =>
                                        `${name} ${(percent * 100).toFixed(0)}%`
                                    }
                                >
                                    {pieData.map((_, idx) => {
                                        const color = (
                                            Object.values(COLORS) as string[]
                                        )[idx];
                                        return <Cell key={idx} fill={color} />;
                                    })}
                                </Pie>
                                <Tooltip formatter={(v: number) => `${v}%`} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* 3) LineChart */}
                    <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-lg">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <TrendingUp className="text-blue-500" /> Tendance
                            Moyenne
                        </h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart
                                data={lineData}
                                margin={{
                                    top: 5,
                                    right: 20,
                                    left: 20,
                                    bottom: 5,
                                }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    opacity={0.2}
                                />
                                <XAxis dataKey="year" />
                                <YAxis domain={[0, 100]} />
                                <Tooltip formatter={(v: number) => `${v}%`} />
                                <Line
                                    type="monotone"
                                    dataKey="avg"
                                    stroke="#2563EB"
                                    strokeWidth={3}
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* 4) AreaChart */}
                    <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-lg">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <TrendingDown className="text-yellow-500" /> Échecs
                            par année
                        </h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart
                                data={areaData}
                                margin={{
                                    top: 5,
                                    right: 20,
                                    left: 20,
                                    bottom: 5,
                                }}
                            >
                                <defs>
                                    <linearGradient
                                        id="grad"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor="#f59e0b"
                                            stopOpacity={0.8}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor="#f59e0b"
                                            stopOpacity={0.2}
                                        />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    opacity={0.2}
                                />
                                <XAxis dataKey="year" />
                                <YAxis allowDecimals={false} />
                                <Tooltip formatter={(v: number) => v} />
                                <Area
                                    type="monotone"
                                    dataKey="sum"
                                    stroke="#f59e0b"
                                    fill="url(#grad)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </main>
        </div>
    );
}
