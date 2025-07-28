import React, { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";

const AvaliacaoForm: React.FC<{ onCreate?: () => void }> = ({ onCreate }) => {
    const [avaliacao, setAvaliacao] = useState({ nota: null as number | null, parecer: "" });
    const [projetoId, setProjetoId] = useState<number | null>(null);
    const [avaliadorId, setAvaliadorId] = useState<number | null>(null);
    const [projetos, setProjetos] = useState<{ id: number; titulo: string; avaliacoes?: { id: number }[] }[]>([]);
    const [avaliadores, setAvaliadores] = useState<{ id: number; nome: string }[]>([]);
    const [feedback, setFeedback] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const projetosResponse = await axios.get("http://localhost:3001/projetos", { params: { relations: "avaliacoes,avaliacoes.avaliador" } });
                setProjetos(projetosResponse.data);
                setFeedback(null);
            } catch (error) {
                setFeedback("Erro ao buscar projetos. Tente novamente mais tarde.");
            }
            try {
                const avaliadoresResponse = await axios.get("http://localhost:3001/avaliadores");
                setAvaliadores(avaliadoresResponse.data);
                setFeedback(null);
            } catch (error) {
                setFeedback("Erro ao buscar avaliadores. Tente novamente mais tarde.");
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!projetoId || !avaliadorId) {
            setFeedback("Selecione um projeto e um avaliador.");
            return;
        }
        if (avaliacao.nota === null || isNaN(avaliacao.nota)) {
            setFeedback("Por favor, insira uma nota válida entre 0 e 10.");
            return;
        }
        if (avaliacao.nota < 0 || avaliacao.nota > 10) {
            setFeedback("A nota deve estar entre 0 e 10.");
            return;
        }
        if (!avaliacao.parecer.trim()) {
            setFeedback("O parecer não pode estar vazio.");
            return;
        }
        try {
            const currentDate = new Date().toISOString();
            const payload = {
                avaliacao: {
                    nota: avaliacao.nota,
                    parecer: avaliacao.parecer,
                    dataAvaliacao: currentDate,
                },
                projetoId,
                avaliadorId,
            };
            const response = await axios.post("http://localhost:3001/avaliacoes", payload);
            setFeedback("Avaliação criada com sucesso!");
            setAvaliacao({ nota: null, parecer: "" });
            setProjetoId(null);
            setAvaliadorId(null);
            if (onCreate) onCreate();
        } catch (error) {
            const axiosError = error as AxiosError;
            let errorMessage = "Erro desconhecido ao criar avaliação";
            if (axiosError.response?.data && typeof axiosError.response.data === 'object' && 'message' in axiosError.response.data) {
                errorMessage = (axiosError.response.data as { message?: string }).message || errorMessage;
            }
            setFeedback(errorMessage);
        }
    };

    const handleNotaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value === "" ? null : parseFloat(e.target.value);
        setAvaliacao({ ...avaliacao, nota: value });
    };

    const handleParecerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setAvaliacao({ ...avaliacao, parecer: e.target.value });
    };

    const availableProjetos = projetos.filter(projeto => {
        const avaliacaoCount = projeto.avaliacoes?.length || 0;
        return avaliacaoCount < 3;
    });

    return (
        <div className="min-h-screen bg-innovate-gray">
            <section className="bg-hero-pattern bg-cover bg-center py-20 text-center text-innovate-dark flex justify-center">
                <div className="text-center">
                    <h2 className="text-4xl font-display mb-4">Registre uma Nova Avaliação</h2>
                    <p className="text-lg max-w-2xl mx-auto" style={{ textAlign: 'center' }}>Avalie projetos com precisão e contribua para o sucesso do Innovate Hub.</p>
                </div>
            </section>
            <section className="max-w-6xl mx-auto px-6 py-12">
                <div className="bg-white rounded-xl shadow-xl p-8 border border-innovate-gray">
                    <h3 className="text-2xl font-display text-innovate-blue mb-6 text-center">Nova Avaliação</h3>
                    {feedback && (
                        <div className="mb-4 p-4 rounded-lg text-center font-semibold" style={{ backgroundColor: feedback.includes("sucesso") ? "#d4edda" : "#f8d7da", color: feedback.includes("sucesso") ? "#155724" : "#721c24" }}>
                            {feedback}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-innovate-dark mb-2">Projeto</label>
                            <select
                                className="w-full p-3 border border-innovate-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-innovate-accent transition"
                                onChange={(e) => setProjetoId(parseInt(e.target.value))}
                                value={projetoId || ""}
                                required
                            >
                                <option value="">Selecione um projeto</option>
                                {availableProjetos.map((projeto) => (
                                    <option key={projeto.id} value={projeto.id}>{projeto.titulo}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-innovate-dark mb-2">Avaliador</label>
                            <select
                                className="w-full p-3 border border-innovate-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-innovate-accent transition"
                                onChange={(e) => setAvaliadorId(parseInt(e.target.value))}
                                value={avaliadorId || ""}
                                required
                            >
                                <option value="">Selecione um avaliador</option>
                                {avaliadores.map((avaliador) => (
                                    <option key={avaliador.id} value={avaliador.id}>{avaliador.nome}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-innovate-dark mb-2">Nota</label>
                            <input
                                type="number"
                                step="0.1"
                                className="w-full p-3 border border-innovate-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-innovate-accent transition"
                                value={avaliacao.nota !== null ? avaliacao.nota : ""}
                                onChange={handleNotaChange}
                                placeholder="0.0 a 10.0"
                                required
                                min="0"
                                max="10"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-innovate-dark mb-2">Parecer</label>
                            <textarea
                                className="w-full p-3 border border-innovate-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-innovate-accent transition"
                                value={avaliacao.parecer}
                                onChange={handleParecerChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-innovate-dark mb-2">Data da Avaliação</label>
                            <input
                                type="text"
                                className="w-full p-3 border border-innovate-gray rounded-lg bg-gray-100 cursor-not-allowed"
                                value={new Date().toLocaleDateString()}
                                readOnly
                            />
                        </div>
                        <div className="md:col-span-2">
                            <button
                                type="submit"
                                className="w-full bg-innovate-blue hover:bg-innovate-accent text-white font-semibold py-3 rounded-lg transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                disabled={!projetoId || !avaliadorId}
                            >
                                Criar Avaliação
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </div>
    );
};

export default AvaliacaoForm;