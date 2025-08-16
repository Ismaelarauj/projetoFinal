import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faTimes } from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";
import AvaliacaoForm from "./AvaliacaoForm";

interface Avaliacao {
    id: number;
    projeto: { id: number; titulo: string; avaliacoes?: { id: number; avaliadorId?: number }[] };
    nota: number;
    parecer: string;
    dataAvaliacao: string;
    avaliadorId?: number;
    avaliador?: { id: number };
}

const MinhasAvaliacoes: React.FC = () => {
    const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<{ message: string; isSuccess: boolean } | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [selectedAvaliacao, setSelectedAvaliacao] = useState<Avaliacao | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
    const userId = parseInt(localStorage.getItem("userId") || "0");
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchAvaliacoes = async () => {
            if (!userId || !token) {
                setError({ message: "Usuário não autenticado. Por favor, faça login.", isSuccess: false });
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(`http://localhost:3001/avaliacoes?avaliadorId=${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { relations: "projeto,projeto.avaliacoes,avaliador" }
                });
                console.log("Resposta da API completa:", response.data);
                if (Array.isArray(response.data) && response.data.length > 0) {
                    const filteredAvaliacoes = response.data.filter((avaliacao: Avaliacao) => {
                        const avaliadorId = avaliacao.avaliadorId || (avaliacao.avaliador?.id);
                        console.log(`Avaliação ID: ${avaliacao.id}, Avaliador ID: ${avaliadorId}, User ID: ${userId}`);
                        return avaliadorId === userId;
                    });
                    setAvaliacoes(filteredAvaliacoes);
                    if (filteredAvaliacoes.length === 0) {
                        console.log("Nenhuma avaliação encontrada para o usuário ID:", userId);
                    }
                } else {
                    setAvaliacoes([]);
                    console.log("Resposta da API vazia ou inválida:", response.data);
                }
                setError(null);
            } catch (error: any) {
                console.error("Erro ao carregar avaliações:", error.response?.data || error.message);
                setError({ message: error.response?.data?.message || "Erro ao carregar avaliações. Tente novamente mais tarde.", isSuccess: false });
            } finally {
                setLoading(false);
            }
        };
        fetchAvaliacoes();
    }, [userId, token]);

    const handleEdit = (avaliacao: Avaliacao) => {
        const avaliacaoCount = avaliacao.projeto.avaliacoes?.length || 0;
        if (avaliacaoCount >= 3) {
            setError({ message: "Não é possível editar esta avaliação, pois o projeto já possui 3 avaliações.", isSuccess: false });
            return;
        }
        setSelectedAvaliacao(avaliacao);
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        const avaliacaoToDelete = avaliacoes.find(a => a.id === id);
        if (!avaliacaoToDelete) return;

        const avaliacaoCount = avaliacaoToDelete.projeto.avaliacoes?.length || 0;
        if (avaliacaoCount >= 3) {
            setError({ message: "Não é possível excluir esta avaliação, pois o projeto já possui 3 avaliações.", isSuccess: false });
            setShowDeleteConfirm(null);
            return;
        }

        try {
            await axios.delete(`http://localhost:3001/avaliacoes/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setAvaliacoes(avaliacoes.filter((a) => a.id !== id));
            setError({ message: "Avaliação excluída com sucesso!", isSuccess: true });
            setShowDeleteConfirm(null);
        } catch (error: any) {
            console.error("Erro ao excluir avaliação:", error.response?.data || error.message);
            setError({ message: error.response?.data?.message || "Erro ao excluir avaliação. Tente novamente.", isSuccess: false });
            setShowDeleteConfirm(null);
        }
    };

    const handleFormClose = () => {
        setShowForm(false);
        setSelectedAvaliacao(null);
        const fetchAvaliacoes = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/avaliacoes?avaliadorId=${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { relations: "projeto,projeto.avaliacoes,avaliador" }
                });
                const filteredAvaliacoes = response.data.filter((a: Avaliacao) => a.avaliadorId === userId || a.avaliador?.id === userId);
                setAvaliacoes(filteredAvaliacoes);
            } catch (error) {
                console.error("Erro ao recarregar avaliações:", error);
            }
        };
        fetchAvaliacoes();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-[#1E3A8A] border-t-transparent rounded-full"
                />
            </div>
        );
    }

    if (error && avaliacoes.length === 0) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-center text-[#EF4444] text-lg font-semibold"
                >
                    {error.message}
                </motion.p>
            </div>
        );
    }

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
                    <h2 className="text-4xl font-bold font-sans mb-4 drop-shadow-md">Minhas Avaliações</h2>
                    <p className="text-lg font-medium max-w-2xl mx-auto">Gerencie as avaliações que você realizou no Innovate Hub.</p>
                </motion.div>
            </section>
            <section className="max-w-6xl mx-auto px-6 py-12">
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="mb-6 p-4 rounded-lg font-semibold relative flex items-center justify-between"
                            style={{
                                backgroundColor: error.isSuccess ? "#10B981" : "#EF4444",
                                color: "#FFFFFF",
                            }}
                        >
                            <div>{error.message}</div>
                            <button
                                onClick={() => setError(null)}
                                className="text-white hover:opacity-75 transition"
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
                {avaliacoes.length === 0 ? (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="text-center text-gray-700 text-lg"
                    >
                        Nenhuma avaliação encontrada.
                    </motion.p>
                ) : (
                    <ul className="space-y-4">
                        {avaliacoes.map((avaliacao, index) => (
                            <motion.li
                                key={avaliacao.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                                className="flex justify-between items-center bg-white p-4 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border border-[#D1D5DB]"
                            >
                                <span className="text-[#1E3A8A] font-medium">
                                    {avaliacao.projeto.titulo} - Nota: {avaliacao.nota} - Data: {new Date(avaliacao.dataAvaliacao).toLocaleDateString()}
                                </span>
                                <div className="flex space-x-2">
                                    <motion.button
                                        onClick={() => handleEdit(avaliacao)}
                                        className="text-[#1E3A8A] hover:text-[#14B8A6] transition"
                                        title="Editar avaliação"
                                        disabled={(avaliacao.projeto.avaliacoes?.length || 0) >= 3}
                                        whileHover={{ scale: (avaliacao.projeto.avaliacoes?.length || 0) >= 3 ? 1 : 1.1 }}
                                        whileTap={{ scale: (avaliacao.projeto.avaliacoes?.length || 0) >= 3 ? 1 : 0.9 }}
                                    >
                                        <FontAwesomeIcon icon={faEdit} />
                                    </motion.button>
                                    <motion.button
                                        onClick={() => setShowDeleteConfirm(avaliacao.id)}
                                        className="text-[#EF4444] hover:text-[#DC2626] transition"
                                        title="Excluir avaliação"
                                        disabled={(avaliacao.projeto.avaliacoes?.length || 0) >= 3}
                                        whileHover={{ scale: (avaliacao.projeto.avaliacoes?.length || 0) >= 3 ? 1 : 1.1 }}
                                        whileTap={{ scale: (avaliacao.projeto.avaliacoes?.length || 0) >= 3 ? 1 : 0.9 }}
                                    >
                                        <FontAwesomeIcon icon={faTrash} />
                                    </motion.button>
                                </div>
                            </motion.li>
                        ))}
                    </ul>
                )}
                <AnimatePresence>
                    {showDeleteConfirm !== null && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                            onClick={() => setShowDeleteConfirm(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h3 className="text-lg font-semibold text-[#1E3A8A] mb-4">Confirmar Exclusão</h3>
                                <p className="text-gray-600 mb-6">Tem certeza que deseja excluir esta avaliação?</p>
                                <div className="flex justify-end space-x-4">
                                    <motion.button
                                        onClick={() => setShowDeleteConfirm(null)}
                                        className="bg-[#D1D5DB] text-[#1E3A8A] px-4 py-2 rounded-lg hover:bg-[#9CA3AF] transition"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Cancelar
                                    </motion.button>
                                    <motion.button
                                        onClick={() => handleDelete(showDeleteConfirm)}
                                        className="bg-[#EF4444] text-white px-4 py-2 rounded-lg hover:bg-[#DC2626] transition"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Excluir
                                    </motion.button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <AnimatePresence>
                    {showForm && selectedAvaliacao && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                            onClick={handleFormClose}
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="bg-white rounded-xl shadow-xl p-8 border border-[#D1D5DB] w-full max-w-3xl max-h-[80vh] overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h3 className="text-2xl font-bold text-[#1E3A8A] mb-6 text-center">Editar Avaliação</h3>
                                <AvaliacaoForm
                                    avaliacao={selectedAvaliacao}
                                    onCreate={handleFormClose}
                                />
                                <div className="mt-6 flex justify-end space-x-4">
                                    <motion.button
                                        type="button"
                                        onClick={handleFormClose}
                                        className="bg-[#D1D5DB] text-[#1E3A8A] px-4 py-2 rounded-lg hover:bg-[#9CA3AF] transition"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Cancelar
                                    </motion.button>
                                    <motion.button
                                        type="submit"
                                        form="avaliacao-form"
                                        className="bg-[#1E3A8A] text-white px-4 py-2 rounded-lg hover:bg-[#14B8A6] transition"
                                        disabled={!selectedAvaliacao.projeto.titulo}
                                        whileHover={{ scale: !selectedAvaliacao.projeto.titulo ? 1 : 1.05 }}
                                        whileTap={{ scale: !selectedAvaliacao.projeto.titulo ? 1 : 0.95 }}
                                    >
                                        Salvar
                                    </motion.button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>
        </div>
    );
};

export default MinhasAvaliacoes;