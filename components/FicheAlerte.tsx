import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { generateMockClients } from "@/lib/mockClients";

const html2pdfPromise =
    typeof window !== "undefined"
        ? import("html2pdf.js")
        : Promise.resolve(null);
const mockClients = generateMockClients();

export default function FicheAlerte() {
    const router = useRouter();
    const { id } = router.query;
    const pdfRef = useRef(null);

    const [clientIndex, setClientIndex] = useState(0);
    const [search, setSearch] = useState({
        nom: "",
        prenom: "",
        code: "",
        date: "",
        montant: "",
    });
    const [comment, setComment] = useState("");
    const [comments, setComments] = useState<
        Record<string, { date: string; text: string }[]>
    >({});

    useEffect(() => {
        const saved = localStorage.getItem("client_comments");
        if (saved) {
            try {
                setComments(JSON.parse(saved));
            } catch {
                setComments({});
            }
        }
    }, []);

    const filteredClients = mockClients.filter(
        (c) =>
            (!search.nom ||
                c.lastName.toLowerCase().includes(search.nom.toLowerCase())) &&
            (!search.prenom ||
                c.firstName
                    .toLowerCase()
                    .includes(search.prenom.toLowerCase())) &&
            (!search.code ||
                c.id.toLowerCase().includes(search.code.toLowerCase())) &&
            (!search.date || c.birthDate.includes(search.date)) &&
            (!search.montant || String(c.riskScore).includes(search.montant))
    );

    const client =
        filteredClients.find((c) => c.id === id) || filteredClients[0];
    const scoreData = client.scoreHistory;

    useEffect(() => {
        if (id && typeof id === "string") {
            const idx = filteredClients.findIndex((c) => c.id === id);
            if (idx !== -1) setClientIndex(idx);
        }
    }, [id, filteredClients]);

    const goToClient = (offset: number) => {
        const newIndex = clientIndex + offset;
        if (newIndex >= 0 && newIndex < filteredClients.length) {
            setClientIndex(newIndex);
            router.push(`/clients/${filteredClients[newIndex].id}`);
        }
    };

    const exportPDF = async () => {
        if (typeof window === "undefined") return;
        const html2pdf = (await html2pdfPromise)?.default;
        if (pdfRef.current && html2pdf) {
            html2pdf()
                .from(pdfRef.current)
                .set({
                    margin: 0.5,
                    filename: `${client.id}_fiche.pdf`,
                    html2canvas: { scale: 2 },
                })
                .save();
        }
    };

    const submitComment = (text?: string) => {
        const content = text ?? comment.trim();
        if (!content) return;
        const now = new Date().toISOString().split("T")[0];
        const updated = {
            ...comments,
            [client.id]: [
                { date: now, text: content },
                ...(comments[client.id] || []),
            ].slice(0, 5),
        };
        setComments({ ...updated });
        setComment("");
        localStorage.setItem("client_comments", JSON.stringify(updated));
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white px-4 md:px-16 py-6 md:py-10 font-sans">
            <header className="flex flex-col md:flex-row justify-between gap-6 mb-6">
                <div className="flex-1 space-y-1">
                    <h1 className="text-2xl font-bold">
                        Fiche Client – Scoring LCB/FT
                    </h1>
                    <p className="text-sm text-zinc-400">
                        ID: {client.id} — {client.firstName} {client.lastName} —{" "}
                        {client.birthDate}
                    </p>
                </div>
                <div className="flex gap-2 items-center">
                    <button
                        onClick={() => goToClient(-1)}
                        disabled={clientIndex <= 0}
                        className="bg-zinc-800 hover:bg-zinc-700 px-3 py-1 rounded disabled:opacity-30"
                    >
                        ←
                    </button>
                    <button
                        onClick={() => goToClient(1)}
                        disabled={clientIndex >= filteredClients.length - 1}
                        className="bg-zinc-800 hover:bg-zinc-700 px-3 py-1 rounded disabled:opacity-30"
                    >
                        →
                    </button>
                    <button
                        onClick={exportPDF}
                        className="bg-indigo-600 hover:bg-indigo-500 px-4 py-1 rounded text-sm"
                    >
                        PDF
                    </button>
                </div>
            </header>

            <section className="bg-zinc-900 p-4 rounded-lg mb-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-black">
                    <input
                        placeholder="Nom"
                        onChange={(e) =>
                            setSearch((s) => ({ ...s, nom: e.target.value }))
                        }
                        className="px-2 py-1 rounded"
                    />
                    <input
                        placeholder="Prénom"
                        onChange={(e) =>
                            setSearch((s) => ({ ...s, prenom: e.target.value }))
                        }
                        className="px-2 py-1 rounded"
                    />
                    <input
                        placeholder="Code"
                        onChange={(e) =>
                            setSearch((s) => ({ ...s, code: e.target.value }))
                        }
                        className="px-2 py-1 rounded"
                    />
                    <input
                        type="date"
                        onChange={(e) =>
                            setSearch((s) => ({ ...s, date: e.target.value }))
                        }
                        className="px-2 py-1 rounded"
                    />
                    <input
                        type="number"
                        placeholder="Score mini"
                        onChange={(e) =>
                            setSearch((s) => ({
                                ...s,
                                montant: e.target.value,
                            }))
                        }
                        className="px-2 py-1 rounded"
                    />
                </div>
            </section>

            <div ref={pdfRef} className="bg-zinc-900 p-6 rounded-lg space-y-6">
                <section>
                    <h2 className="text-sm font-semibold uppercase text-zinc-400 mb-2">
                        Scoring
                    </h2>
                    <div className="text-4xl font-bold text-green-400 mb-1">
                        {client.riskScore}{" "}
                        <span className="text-xl text-white">/100</span>
                    </div>
                    <ul className="text-sm text-zinc-300 space-y-1">
                        {client.scoringDetails?.map((item, i) => (
                            <li key={i} className="flex justify-between">
                                <span>{item.label}</span>
                                <span>
                                    {item.value >= 0 ? "+" : ""}
                                    {item.value}
                                </span>
                            </li>
                        ))}
                    </ul>
                </section>

                <section>
                    <h2 className="text-sm font-semibold uppercase text-zinc-400 mb-2">
                        Évolution Score
                    </h2>
                    <div className="h-56 bg-zinc-800 p-2 rounded">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={scoreData}>
                                <XAxis
                                    dataKey="date"
                                    stroke="#ccc"
                                    fontSize={12}
                                />
                                <YAxis
                                    domain={[60, 100]}
                                    stroke="#ccc"
                                    fontSize={12}
                                />
                                <Tooltip />
                                <Line
                                    type="monotone"
                                    dataKey="score"
                                    stroke="#38bdf8"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </section>

                <section>
                    <h2 className="text-sm font-semibold uppercase text-zinc-400 mb-2">
                        Historique
                    </h2>
                    <ul className="text-sm text-zinc-300 space-y-1">
                        {[
                            ...(client.alerts || []),
                            ...(comments[client.id] || []).map((c) => ({
                                date: c.date,
                                status: `📝 ${c.text}`,
                            })),
                        ].map((a, i) => (
                            <li key={i}>
                                {a.status.includes("📝")
                                    ? a.status
                                    : `⚠️ ${a.date} — ${a.status}`}
                            </li>
                        ))}
                    </ul>
                </section>

                <section>
                    <h2 className="text-sm font-semibold uppercase text-zinc-400 mb-2">
                        Commentaires analyste
                    </h2>
                    <p style={{ color: "#fff" }}>🧪 SECTION RENDUE 🧪</p>
                    <div className="flex gap-2 mb-2 border-2 border-red-500">
                        <button
                            onClick={() => submitComment("RAS")}
                            className="bg-green-600 hover:bg-green-500 px-3 py-1 rounded text-sm"
                        >
                            RAS
                        </button>
                        <button
                            onClick={() => submitComment("Alerte signalée")}
                            className="bg-red-600 hover:bg-red-500 px-3 py-1 rounded text-sm"
                        >
                            Alerte
                        </button>
                    </div>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Ajouter un commentaire..."
                        className="w-full bg-zinc-800 text-white p-2 rounded mb-2 text-sm"
                    />
                    <button
                        onClick={() => submitComment()}
                        className="bg-blue-600 hover:bg-blue-500 px-4 py-1 rounded text-sm"
                    >
                        Valider
                    </button>
                </section>
            </div>
        </div>
    );
}
