import React, { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";

interface Avaliacao {
    id?: number;
    projeto: { id: number; titulo: string };
    projetoId?: number;
    nota: number;
    parecer: string;
    dataAvaliacao: string;
    avaliadorId?: number;
    avaliador?: { id: number; nome?: string; tipo?: string };
}

interface AvaliacaoFormProps {
    avaliacao?: Avaliacao;
    onCreate?: () => void;
    onCancel?: () => void;
}

const AvaliacaoForm: React.FC<AvaliacaoFormProps> = ({ avaliacao, onCreate, onCancel }) => {
    const [avaliacaoData, setAvaliacaoData] = useState<{ nota: number | null; parecer: string }>({
        nota: avaliacao?.nota || null,
        parecer: avaliacao?.parecer || "",
    });
    const [projetoId, setProjetoId] = useState<number | null>(avaliacao?.projeto?.id || null);
    const [projetos, setProjetos] = useState<{ id: number; titulo: string; avaliacoes?: { id: number; avaliadorId?: number }[] }[]>([]);
    const [feedback, setFeedback] = useState<{ message: string; isSuccess: boolean } | null>(null);
    const avaliadorId = parseInt(localStorage.getItem("userId") || "0");
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const projetosResponse = await axios.get("http://localhost:3001/projetos", {
                    params: { relations: "avaliacoes,avaliacoes.avaliador" },
                    headers: { Authorization: `Bearer ${token}` },
                });
                setProjetos(projetosResponse.data);
                setFeedback(null);
            } catch (error) {
                setFeedback({ message: "Erro ao buscar projetos. Tente novamente mais tarde.", isSuccess: false });
            }
        };
        fetchData();
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!avaliacao?.id && !projetoId) {
            setFeedback({ message: "Selecione um projeto.", isSuccess: false });
            return;
        }
        if (avaliacaoData.nota === null) {
            setFeedback({ message: "Por favor, insira uma nota válida entre 0 e 10.", isSuccess: false });
            return;
        }
        if (avaliacaoData.nota < 0 || avaliacaoData.nota > 10) {
            setFeedback({ message: "A nota deve estar entre 0 e 10.", isSuccess: false });
            return;
        }
        if (!avaliacaoData.parecer.trim()) {
            setFeedback({ message: "O parecer não pode estar vazio.", isSuccess: false });
            return;
        }

        const projetoSelecionado = projetos.find(p => p.id === projetoId);
        if (!avaliacao?.id && projetoSelecionado) {
            const avaliacoesDoAvaliador = projetoSelecionado.avaliacoes?.filter(av => av.avaliadorId === avaliadorId) || [];
            if (avaliacoesDoAvaliador.length > 0) {
                setFeedback({ message: "Você já avaliou este projeto.", isSuccess: false });
                return;
            }
            if ((projetoSelecionado.avaliacoes?.length || 0) >= 3) {
                setFeedback({ message: "Este projeto já atingiu o limite de 3 avaliações.", isSuccess: false });
                return;
            }
        }

        try {
            const payload: Partial<Avaliacao> = {
                nota: Number(avaliacaoData.nota),
                parecer: avaliacaoData.parecer.trim(),
                dataAvaliacao: new Date().toISOString(),
            };

            if (!avaliacao?.id) {
                payload.projetoId = projetoId || 0;
                payload.avaliadorId = avaliadorId || 0;
                if (avaliadorId) payload.avaliador = { id: avaliadorId };
            }

            let response;
            if (avaliacao?.id) {
                response = await axios.put(`http://localhost:3001/avaliacoes/${avaliacao.id}`, payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } else {
                response = await axios.post("http://localhost:3001/avaliacoes", { avaliacao: payload }, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }

            setAvaliacaoData({ nota: null, parecer: "" });
            setProjetoId(null);
            setFeedback({ message: "Avaliação salva com sucesso.", isSuccess: true });
            if (onCreate) onCreate();
        } catch (error) {
            const axiosError = error as AxiosError;
            let errorMessage = "Erro desconhecido ao criar/atualizar avaliação";
            if (axiosError.response?.data) {
                if (typeof axiosError.response.data === 'object' && 'message' in axiosError.response.data) {
                    errorMessage = (axiosError.response.data as { message?: string }).message || errorMessage;
                    if ('details' in axiosError.response.data && Array.isArray((axiosError.response.data as any).details)) {
                        errorMessage += `: ${JSON.stringify((axiosError.response.data as any).details)}`;
                    }
                } else {
                    errorMessage = JSON.stringify(axiosError.response.data);
                }
            } else {
                errorMessage = axiosError.message;
            }
            setFeedback({ message: errorMessage, isSuccess: false });
            console.error("Erro na requisição:", axiosError.response?.data || error);
        }
    };

    const handleNotaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value === "" ? null : parseFloat(e.target.value);
        setAvaliacaoData({ ...avaliacaoData, nota: value });
    };

    const handleParecerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setAvaliacaoData({ ...avaliacaoData, parecer: e.target.value });
    };

    const availableProjetos = projetos.filter(projeto => {
        if (avaliacao?.id) return true;
        const avaliacoesDoAvaliador = projeto.avaliacoes?.filter(av => av.avaliadorId === avaliadorId) || [];
        return avaliacoesDoAvaliador.length === 0 && (projeto.avaliacoes?.length || 0) < 3;
    });

    return (
        <div className="min-h-screen bg-gray-100 font-sans">
            <section className="bg-hero-pattern bg-cover bg-center py-20 text-center text-white relative">
                <div className="absolute inset-0 bg-black bg-opacity-50"></div>
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="relative max-w-3xl mx-auto"
                >
                    <h2 className="text-4xl font-bold font-sans mb-4 drop-shadow-md">
                        {avaliacao?.id ? "Editar Avaliação" : "Nova Avaliação"}
                    </h2>
                    <p className="text-lg font-medium max-w-2xl mx-auto">
                        {avaliacao?.id ? "Edite os detalhes da sua avaliação no Innovate Hub." : "Crie uma nova avaliação para um projeto no Innovate Hub."}
                    </p>
                </motion.div>
            </section>
            <section className="max-w-6xl mx-auto px-6 py-12">
                <AnimatePresence>
                    {feedback && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="mb-6 p-4 rounded-lg font-semibold relative flex items-center justify-between"
                            style={{
                                backgroundColor: feedback.isSuccess ? "#10B981" : "#EF4444",
                                color: "#FFFFFF",
                            }}
                        >
                            <div>{feedback.message}</div>
                            <button
                                onClick={() => setFeedback(null)}
                                className="text-white hover:opacity-75 transition"
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-[#1E3A8A] mb-2">Projeto</label>
                        <select
                            className="w-full p-3 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14B8A6] transition"
                            onChange={(e) => setProjetoId(parseInt(e.target.value))}
                            value={projetoId || ""}
                            required={!avaliacao?.id}
                            disabled={!!avaliacao?.id}
                        >
                            <option value="">Selecione um projeto</option>
                            {availableProjetos.map((projeto) => (
                                <option key={projeto.id} value={projeto.id}>{projeto.titulo}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-[#1E3A8A] mb-2">Nota</label>
                        <input
                            type="number"
                            step="0.1"
                            className="w-full p-3 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14B8A6] transition"
                            value={avaliacaoData.nota !== null ? avaliacaoData.nota : ""}
                            onChange={handleNotaChange}
                            placeholder="0.0 a 10.0"
                            required
                            min="0"
                            max="10"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-[#1E3A8A] mb-2">Parecer</label>
                        <textarea
                            className="w-full p-3 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14B8A6] transition"
                            value={avaliacaoData.parecer}
                            onChange={handleParecerChange}
                            required
                            rows={4}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-[#1E3A8A] mb-2">Data da Avaliação</label>
                        <input
                            type="text"
                            className="w-full p-3 border border-[#D1D5DB] rounded-lg bg-gray-100 cursor-not-allowed"
                            value={new Date().toLocaleDateString()}
                            readOnly
                        />
                    </div>
                    <div className="md:col-span-2 flex justify-end space-x-4">
                        {avaliacao?.id && onCancel && (
                            <motion.button
                                type="button"
                                onClick={onCancel}
                                className="px-4 py-2 bg-[#D1D5DB] text-[#1E3A8A] rounded-lg hover:bg-[#9CA3AF] transition"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Cancelar
                            </motion.button>
                        )}
                        <motion.button
                            type="submit"
                            className="px-4 py-2 bg-[#1E3A8A] text-white rounded-lg hover:bg-[#14B8A6] transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Salvar
                        </motion.button>
                    </div>
                </form>
            </section>
        </div>
    );
};

export default AvaliacaoForm;