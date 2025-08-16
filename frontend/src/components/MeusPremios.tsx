import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faTimes } from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";
import PremioForm from "./PremioForm";

interface CronogramaItem {
    dataInicio: string;
    descricao: string;
    dataFim: string;
}

interface Projeto {
    id: number;
    titulo: string;
    autores: { id: number; nome: string }[];
    premioId: number;
}

interface Premio {
    id?: number;
    nome: string;
    descricao: string;
    ano: number;
    cronograma: CronogramaItem[];
    criadoPorId?: number;
    criadoPor?: { id: number; nome: string };
    projetos: Projeto[];
}

const MeusPremios: React.FC = () => {
    const [premios, setPremios] = useState<Premio[]>([]);
    const [feedback, setFeedback] = useState<{ message: string; isSuccess: boolean } | null>(null);
    const [filter, setFilter] = useState<"todos" | "ativos" | "inativos">("todos");
    const [filteredPremios, setFilteredPremios] = useState<Premio[]>([]);
    const [expandedPremio, setExpandedPremio] = useState<number | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
    const [showEditBlocked, setShowEditBlocked] = useState<number | null>(null);
    const [showAllProjects, setShowAllProjects] = useState<{ premioId: number; visible: boolean } | null>(null);
    const [showEditModal, setShowEditModal] = useState<boolean>(false);
    const [selectedPremio, setSelectedPremio] = useState<Premio | null>(null);
    const [loading, setLoading] = useState(true);
    const userId = parseInt(localStorage.getItem("userId") || "0");

    useEffect(() => {
        const fetchPremios = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    setFeedback({ message: "Nenhum token de autenticação encontrado.", isSuccess: false });
                    return;
                }
                const response = await axios.get("http://localhost:3001/premios", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const allPremios = response.data.map((p: Premio) => ({
                    ...p,
                    projetos: p.projetos || [],
                }));
                console.log("Resposta da API (prêmios com projetos):", JSON.stringify(allPremios, null, 2));
                const meusPremios = allPremios.filter((p: Premio) => {
                    return (p.criadoPor && p.criadoPor.id === userId) || p.criadoPorId === userId;
                });
                console.log("Meus prêmios filtrados:", JSON.stringify(meusPremios, null, 2));
                if (meusPremios.length === 0) {
                    setFeedback({ message: "Nenhum prêmio encontrado para este usuário.", isSuccess: false });
                }
                setPremios(meusPremios);
            } catch (error: any) {
                const errorMsg = error.response?.data?.message || error.message || "Erro ao carregar seus prêmios.";
                setFeedback({ message: errorMsg, isSuccess: false });
                console.error("Erro ao buscar prêmios:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPremios();
    }, [userId]);

    useEffect(() => {
        const currentDate = new Date().toISOString();
        let filtered = [...premios];

        if (filter === "ativos") {
            filtered = premios.filter((p) =>
                p.cronograma.some(
                    (item) => new Date(item.dataInicio) <= new Date(currentDate) && new Date(item.dataFim) >= new Date(currentDate)
                )
            );
        } else if (filter === "inativos") {
            filtered = premios.filter((p) =>
                p.cronograma.every(
                    (item) => new Date(item.dataFim) < new Date(currentDate)
                )
            );
        }

        setFilteredPremios(filtered);
    }, [filter, premios]);

    const toggleExpandPremio = (premioId: number) => {
        setExpandedPremio(expandedPremio === premioId ? null : premioId);
    };

    const handleEdit = (premio: Premio) => {
        if (!premio.id) {
            setFeedback({ message: "Não é possível editar um prêmio sem ID.", isSuccess: false });
            return;
        }
        if (premio.projetos.length > 0) {
            setShowEditBlocked(premio.id);
            return;
        }
        setSelectedPremio(premio);
        setShowEditModal(true);
    };

    const handleDelete = async (premioId: number) => {
        const premio = premios.find((p) => p.id === premioId);
        if (!premio || !premio.id) {
            setFeedback({ message: "Prêmio inválido ou sem ID.", isSuccess: false });
            return;
        }
        if (premio.projetos.length > 0) {
            setFeedback({ message: "Não é possível excluir este prêmio, pois está associado a um ou mais projetos.", isSuccess: false });
            setShowDeleteConfirm(null);
            return;
        }
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setFeedback({ message: "Nenhum token de autenticação encontrado.", isSuccess: false });
                return;
            }
            await axios.delete(`http://localhost:3001/premios/${premioId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPremios(premios.filter((p) => p.id !== premioId));
            setShowDeleteConfirm(null);
            setExpandedPremio(null);
            setFeedback({ message: "Prêmio excluído com sucesso.", isSuccess: true });
        } catch (error) {
            setFeedback({ message: "Erro ao excluir o prêmio.", isSuccess: false });
            console.error("Erro ao excluir prêmio:", error);
            setShowDeleteConfirm(null);
        }
    };

    const handleRefresh = () => {
        setFeedback(null);
        setExpandedPremio(null);
        setShowAllProjects(null);
        window.location.reload();
    };

    const handleShowAllProjects = (premioId: number) => {
        setShowAllProjects({ premioId, visible: true });
    };

    const handleSaveEdit = async (editedPremio: Premio) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setFeedback({ message: "Nenhum token de autenticação encontrado.", isSuccess: false });
                return;
            }
            if (!editedPremio.id) {
                setFeedback({ message: "ID do prêmio é obrigatório para atualização.", isSuccess: false });
                return;
            }
            const validCronograma = editedPremio.cronograma.map((item) => ({
                ...item,
                dataInicio: new Date(item.dataInicio).toISOString(),
                dataFim: new Date(item.dataFim).toISOString(),
            }));
            const payload = {
                nome: editedPremio.nome.trim(),
                descricao: editedPremio.descricao.trim(),
                ano: editedPremio.ano,
                cronograma: validCronograma,
                criadoPorId: userId,
            };
            await axios.put(`http://localhost:3001/premios/${editedPremio.id}`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPremios(premios.map((p) => (p.id === editedPremio.id ? { ...editedPremio, id: p.id, criadoPorId: userId, projetos: p.projetos } : p)));
            setFeedback({ message: "Prêmio atualizado com sucesso!", isSuccess: true });
            setShowEditModal(false);
            setSelectedPremio(null);
        } catch (error: any) {
            setFeedback({ message: error.response?.data?.message || "Erro ao atualizar o prêmio.", isSuccess: false });
            console.error("Erro ao atualizar prêmio:", error);
        }
    };

    const handleCancelEdit = () => {
        setShowEditModal(false);
        setSelectedPremio(null);
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
                    <h2 className="text-4xl font-bold font-sans mb-4 drop-shadow-md">Meus Prêmios</h2>
                    <p className="text-lg font-medium max-w-2xl mx-auto">Gerencie os prêmios que você criou no Innovate Hub.</p>
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
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <label className="mr-2 text-lg font-medium text-gray-800">Filtrar por:</label>
                        <motion.select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value as "todos" | "ativos" | "inativos")}
                            className="p-2 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14B8A6] transition bg-white text-[#1E3A8A]"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <option value="todos">Todos</option>
                            <option value="ativos">Ativos</option>
                            <option value="inativos">Inativos</option>
                        </motion.select>
                    </div>
                    <motion.button
                        onClick={handleRefresh}
                        className="px-4 py-2 bg-[#1E3A8A] text-white rounded-lg hover:bg-[#14B8A6] transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Recarregar
                    </motion.button>
                </div>
                {filteredPremios.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPremios.map((p, index) => (
                            <motion.div
                                key={p.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                                className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border border-[#D1D5DB]"
                            >
                                <div className="space-y-4">
                                    <motion.div
                                        onClick={() => p.id && toggleExpandPremio(p.id)}
                                        className="cursor-pointer hover:bg-gray-50 p-2 rounded"
                                        whileHover={{ backgroundColor: "#F9FAFB" }}
                                    >
                                        <h3 className="text-xl font-semibold text-[#1E3A8A]">{p.nome}</h3>
                                    </motion.div>
                                    <motion.div
                                        onClick={() => p.id && toggleExpandPremio(p.id)}
                                        className="cursor-pointer hover:bg-gray-50 p-2 rounded"
                                        whileHover={{ backgroundColor: "#F9FAFB" }}
                                    >
                                        <p className="text-gray-700">Ano: {p.ano}</p>
                                    </motion.div>
                                    <motion.div
                                        onClick={() => p.id && toggleExpandPremio(p.id)}
                                        className="cursor-pointer hover:bg-gray-50 p-2 rounded"
                                        whileHover={{ backgroundColor: "#F9FAFB" }}
                                    >
                                        <p className="font-medium text-sm text-gray-600">Cronograma:</p>
                                        {p.cronograma.map((item, index) => (
                                            <p key={index} className="ml-2 text-sm text-gray-600">
                                                {item.descricao} ({new Date(item.dataInicio).toLocaleDateString()} -{" "}
                                                {new Date(item.dataFim).toLocaleDateString()})
                                            </p>
                                        ))}
                                    </motion.div>
                                </div>
                                {expandedPremio === p.id && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="mt-4 p-4 bg-gray-100 rounded-lg"
                                    >
                                        {p.projetos.length > 0 ? (
                                            <>
                                                <h4 className="text-lg font-semibold text-[#1E3A8A] mb-4">Projetos Associados:</h4>
                                                <div className="space-y-4">
                                                    {p.projetos.slice(0, 3).map((projeto) => (
                                                        <motion.div
                                                            key={projeto.id}
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            transition={{ duration: 0.3 }}
                                                            className="p-3 bg-white rounded-lg shadow-md border border-[#D1D5DB]"
                                                        >
                                                            <p className="font-medium text-[#1E3A8A]">{projeto.titulo}</p>
                                                            <p className="text-gray-600 text-sm">
                                                                Autores: {projeto.autores.map((a) => a.nome).join(", ")}
                                                            </p>
                                                        </motion.div>
                                                    ))}
                                                    {p.projetos.length > 3 && (
                                                        <motion.button
                                                            onClick={() => p.id && handleShowAllProjects(p.id)}
                                                            className="mt-2 text-[#1E3A8A] hover:underline"
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                        >
                                                            +{p.projetos.length - 3}
                                                        </motion.button>
                                                    )}
                                                </div>
                                            </>
                                        ) : (
                                            <p className="text-gray-600">Nenhum projeto associado.</p>
                                        )}
                                        <div className="mt-4 flex justify-end space-x-2">
                                            <motion.button
                                                onClick={() => handleEdit(p)}
                                                disabled={p.projetos.length > 0}
                                                className="p-2 bg-[#1E3A8A] text-white rounded-lg hover:bg-[#14B8A6] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                                whileHover={{ scale: p.projetos.length > 0 ? 1 : 1.05 }}
                                                whileTap={{ scale: p.projetos.length > 0 ? 1 : 0.95 }}
                                            >
                                                <FontAwesomeIcon icon={faEdit} />
                                            </motion.button>
                                            <motion.button
                                                onClick={() => p.id && setShowDeleteConfirm(p.id)}
                                                className="p-2 bg-[#EF4444] text-white rounded-lg hover:bg-[#DC2626] transition-colors"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="text-center text-gray-700 text-lg"
                    >
                        Nenhum prêmio encontrado.
                    </motion.p>
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
                                <p className="text-gray-600 mb-6">Tem certeza que deseja excluir este prêmio?</p>
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
                    {showEditBlocked !== null && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                            onClick={() => setShowEditBlocked(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h3 className="text-lg font-semibold text-[#1E3A8A] mb-4">Edição Não Permitida</h3>
                                <p className="text-gray-600 mb-6">Este prêmio não pode ser editado pois está associado a um ou mais projetos.</p>
                                <div className="flex justify-end">
                                    <motion.button
                                        onClick={() => setShowEditBlocked(null)}
                                        className="bg-[#D1D5DB] text-[#1E3A8A] px-4 py-2 rounded-lg hover:bg-[#9CA3AF] transition"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Fechar
                                    </motion.button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <AnimatePresence>
                    {showAllProjects?.visible && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                            onClick={() => setShowAllProjects(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="bg-white p-6 rounded-lg shadow-lg max-h-[80vh] overflow-y-auto max-w-3xl w-full"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-[#1E3A8A]">Todos os Projetos Associados</h3>
                                    <motion.button
                                        onClick={() => setShowAllProjects(null)}
                                        className="text-gray-500 hover:text-gray-700"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <FontAwesomeIcon icon={faTimes} />
                                    </motion.button>
                                </div>
                                <div className="space-y-4">
                                    {filteredPremios
                                        .find((p) => p.id === showAllProjects.premioId)
                                        ?.projetos.map((projeto) => (
                                            <motion.div
                                                key={projeto.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ duration: 0.3 }}
                                                className="p-3 bg-white rounded-lg shadow-md border border-[#D1D5DB]"
                                            >
                                                <p className="font-medium text-[#1E3A8A]">{projeto.titulo}</p>
                                                <p className="text-gray-600 text-sm">
                                                    Autores: {projeto.autores.map((a) => a.nome).join(", ")}
                                                </p>
                                            </motion.div>
                                        ))}
                                </div>
                                <div className="mt-4 flex justify-end">
                                    <motion.button
                                        onClick={() => setShowAllProjects(null)}
                                        className="bg-[#D1D5DB] text-[#1E3A8A] px-4 py-2 rounded-lg hover:bg-[#9CA3AF] transition"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Fechar
                                    </motion.button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <AnimatePresence>
                    {feedback?.message === "Não é possível excluir este prêmio, pois está associado a um ou mais projetos." && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                            onClick={() => setFeedback(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h3 className="text-lg font-semibold text-[#1E3A8A] mb-4">Exclusão Não Permitida</h3>
                                <p className="text-gray-600 mb-6">Este prêmio não pode ser excluído pois está associado a um ou mais projetos.</p>
                                <div className="flex justify-end">
                                    <motion.button
                                        onClick={() => setFeedback(null)}
                                        className="bg-[#D1D5DB] text-[#1E3A8A] px-4 py-2 rounded-lg hover:bg-[#9CA3AF] transition"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Fechar
                                    </motion.button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <AnimatePresence>
                    {showEditModal && selectedPremio && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                            onClick={() => {
                                setShowEditModal(false);
                                setSelectedPremio(null);
                            }}
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="bg-white rounded-xl shadow-xl p-8 border border-[#D1D5DB] w-full max-w-4xl max-h-[80vh] overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-2xl font-bold text-[#1E3A8A]">Editar Prêmio</h3>
                                    <motion.button
                                        onClick={() => {
                                            setShowEditModal(false);
                                            setSelectedPremio(null);
                                        }}
                                        className="text-gray-500 hover:text-gray-700"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <FontAwesomeIcon icon={faTimes} />
                                    </motion.button>
                                </div>
                                <PremioForm
                                    editMode={selectedPremio}
                                    onSave={handleSaveEdit}
                                    onCancel={handleCancelEdit}
                                />
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>
        </div>
    );
};

export default MeusPremios;