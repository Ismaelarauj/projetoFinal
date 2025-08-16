import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faTimes } from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";
import ProjetoForm from "./ProjetoForm";

interface Projeto {
    id: number;
    titulo: string;
    avaliado: boolean;
    autorPrincipalId: number;
    autores: { id: number; nome: string }[];
    areaTematica: string;
    resumo: string;
    premioId: number;
}

const MeusProjetos: React.FC = () => {
    const [projetos, setProjetos] = useState<Projeto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<{ message: string; isSuccess: boolean } | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Projeto | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
    const [showEditBlocked, setShowEditBlocked] = useState<number | null>(null);
    const userId = parseInt(localStorage.getItem("userId") || "0");
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchProjetos = async () => {
            if (!userId || !token) {
                setError({ message: "Usuário não autenticado. Por favor, faça login.", isSuccess: false });
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(`http://localhost:3001/projetos?autorId=${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const projetosData = Array.isArray(response.data)
                    ? response.data
                    : response.data.data || [];
                setProjetos(projetosData);
                setError(null);
            } catch (error: any) {
                console.error("Erro ao carregar projetos:", error.response?.data || error.message);
                setError({ message: error.response?.data?.message || "Erro ao carregar projetos. Tente novamente mais tarde.", isSuccess: false });
                setProjetos([]);
            } finally {
                setLoading(false);
            }
        };
        fetchProjetos();
    }, [userId, token]);

    const handleEdit = (projeto: Projeto) => {
        if (projeto.avaliado) {
            setShowEditBlocked(projeto.id);
        } else {
            setSelectedProject(projeto);
            setShowForm(true);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await axios.delete(`http://localhost:3001/projetos/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setProjetos(projetos.filter((p) => p.id !== id));
            setError({ message: "Projeto excluído com sucesso!", isSuccess: true });
            setShowDeleteConfirm(null);
        } catch (error: any) {
            console.error("Erro ao excluir projeto:", error.response?.data || error.message);
            setError({ message: error.response?.data?.message || "Erro ao excluir projeto. Tente novamente.", isSuccess: false });
            setShowDeleteConfirm(null);
        }
    };

    const handleFormClose = () => {
        setShowForm(false);
        setSelectedProject(null);
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

    if (error && !projetos.length) {
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
                    <h2 className="text-4xl font-bold font-sans mb-4 drop-shadow-md">Meus Projetos</h2>
                    <p className="text-lg font-medium max-w-2xl mx-auto">Gerencie os projetos que você criou no Innovate Hub.</p>
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
                {projetos.length === 0 ? (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="text-center text-gray-700 text-lg"
                    >
                        Nenhum projeto encontrado.
                    </motion.p>
                ) : (
                    <ul className="space-y-4">
                        {projetos.map((projeto, index) => (
                            <motion.li
                                key={projeto.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                                className="flex justify-between items-center bg-white p-4 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border border-[#D1D5DB]"
                            >
                                <span className="text-[#1E3A8A] font-medium">
                                    {projeto.titulo} - Situação: {projeto.avaliado ? "Avaliado" : "Não Avaliado"}
                                </span>
                                <div className="flex space-x-2">
                                    <motion.button
                                        onClick={() => handleEdit(projeto)}
                                        className="text-[#1E3A8A] hover:text-[#14B8A6] transition"
                                        title="Editar projeto"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <FontAwesomeIcon icon={faEdit} />
                                    </motion.button>
                                    <motion.button
                                        onClick={() => setShowDeleteConfirm(projeto.id)}
                                        className="text-[#EF4444] hover:text-[#DC2626] transition"
                                        title="Excluir projeto"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
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
                                <p className="text-gray-600 mb-6">Tem certeza que deseja excluir este projeto?</p>
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
                                <p className="text-gray-600 mb-6">Este projeto não pode ser editado pois já foi avaliado.</p>
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
                    {showForm && selectedProject && (
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
                                <h3 className="text-2xl font-bold text-[#1E3A8A] mb-6 text-center">Editar Projeto</h3>
                                <ProjetoForm
                                    project={selectedProject}
                                    onSave={handleFormClose}
                                    onCancel={handleFormClose}
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
                                        form="projeto-form"
                                        className="bg-[#1E3A8A] text-white px-4 py-2 rounded-lg hover:bg-[#14B8A6] transition"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
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

export default MeusProjetos;