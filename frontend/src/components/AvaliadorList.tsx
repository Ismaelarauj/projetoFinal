import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faEdit, faTrash, faTimes, faFilter, faEnvelope, faIdCard, faPhone, faBriefcase, faStar } from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";
import { UsuarioCompleto } from "../types/types";
import UsuarioForm from "./UsuarioForm";

interface AvaliadorListProps {
    userType: string | null;
    onNavigate: (path: string) => void;
}

const AvaliadorList: React.FC<AvaliadorListProps> = ({ userType, onNavigate }) => {
    const [avaliadores, setAvaliadores] = useState<UsuarioCompleto[]>([]);
    const [selectedAvaliador, setSelectedAvaliador] = useState<UsuarioCompleto | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
    const [showForm, setShowForm] = useState<boolean>(false);
    const [formData, setFormData] = useState<UsuarioCompleto | null>(null);
    const [filtro, setFiltro] = useState<"todos" | "ativos" | "inativos">("todos");
    const [feedback, setFeedback] = useState<{ message: string; isSuccess: boolean } | null>(null);
    const [loading, setLoading] = useState(true);
    const currentUserId = parseInt(localStorage.getItem("userId") || "0");

    const fetchAvaliadores = async () => {
        try {
            const response = await axios.get("http://localhost:3001/avaliadores", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            if (response.data.message) {
                setFeedback({ message: response.data.message, isSuccess: false });
                setAvaliadores([]);
            } else {
                const avaliadoresData = response.data.map((a: any) => ({
                    id: a.id,
                    nome: a.nome,
                    email: a.email,
                    cpf: a.cpf,
                    telefone: a.telefone,
                    tipo: a.tipo,
                    especialidade: a.especialidade || null,
                    avaliacoes: a.avaliacoes || [],
                }));
                setAvaliadores(avaliadoresData);
                setFeedback(null);
            }
        } catch (error: any) {
            setFeedback({ message: error.response?.data?.message || "Erro ao carregar avaliadores.", isSuccess: false });
            console.error("Erro ao buscar avaliadores:", error);
            setAvaliadores([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAvaliadores();
    }, [filtro]);

    const avaliadoresFiltrados = avaliadores.filter((avaliador) => {
        if (filtro === "todos") return true;
        if (filtro === "ativos") return avaliador.avaliacoes && avaliador.avaliacoes.length > 0;
        if (filtro === "inativos") return !avaliador.avaliacoes || avaliador.avaliacoes.length === 0;
        return true;
    });

    const handleDelete = async (id: number) => {
        const avaliadorToDelete = avaliadores.find((a) => a.id === id);
        if (avaliadorToDelete && avaliadorToDelete.avaliacoes && avaliadorToDelete.avaliacoes.length > 0) {
            setFeedback({ message: "Não é possível excluir este avaliador, pois ele já avaliou um ou mais projetos.", isSuccess: false });
            setShowDeleteConfirm(null);
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            await axios.delete(`http://localhost:3001/usuarios/${id}`, { headers });
            setAvaliadores(avaliadores.filter((a) => a.id !== id));
            setSelectedAvaliador(null);
            setShowDeleteConfirm(null);
            setFeedback({ message: "Avaliador excluído com sucesso!", isSuccess: true });
        } catch (error: any) {
            setFeedback({ message: error.response?.data?.message || "Erro ao excluir avaliador.", isSuccess: false });
            console.error("Erro ao excluir avaliador:", error);
            setShowDeleteConfirm(null);
        }
    };

    const handleEdit = async (avaliador: UsuarioCompleto) => {
        try {
            const response = await axios.get(`http://localhost:3001/usuarios/${avaliador.id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            setFormData(response.data);
            setShowForm(true);
        } catch (error: any) {
            setFeedback({ message: "Erro ao carregar dados para edição.", isSuccess: false });
            console.error("Erro ao buscar dados para edição:", error);
            setFormData(null);
        }
    };

    const handleFormClose = () => {
        setShowForm(false);
        setFormData(null);
        fetchAvaliadores();
    };

    const handleFormSave = async (updatedUsuario: Partial<UsuarioCompleto>) => {
        try {
            const token = localStorage.getItem("token");
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            const cleanData = {
                id: updatedUsuario.id,
                nome: updatedUsuario.nome,
                email: updatedUsuario.email,
                cpf: updatedUsuario.cpf,
                telefone: updatedUsuario.telefone,
                tipo: updatedUsuario.tipo,
                especialidade: updatedUsuario.especialidade || null,
                senha: updatedUsuario.senha,
            };
            const filteredData = Object.fromEntries(
                Object.entries(cleanData).filter(([_, value]) => value !== undefined)
            );

            if (updatedUsuario.id === 0) {
                const response = await axios.post("http://localhost:3001/usuarios", filteredData, config);
                setAvaliadores([...avaliadores, response.data]);
                setFeedback({ message: "Avaliador criado com sucesso!", isSuccess: true });
            } else {
                const response = await axios.put(`http://localhost:3001/usuarios/${updatedUsuario.id}`, filteredData, config);
                setAvaliadores(avaliadores.map((a) => (a.id === updatedUsuario.id ? response.data : a)));
                setFeedback({ message: "Avaliador atualizado com sucesso!", isSuccess: true });
            }
            handleFormClose();
        } catch (error: any) {
            setFeedback({ message: error.response?.data?.message || "Erro ao salvar avaliador.", isSuccess: false });
            console.error("Erro ao salvar:", error);
            throw error;
        }
    };

    const handleToggleAvaliador = (avaliador: UsuarioCompleto) => {
        if (userType === "admin") {
            setSelectedAvaliador(selectedAvaliador?.id === avaliador.id ? null : avaliador);
        }
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
                    <h2 className="text-4xl font-bold font-sans mb-4 drop-shadow-md">Avaliadores do Innovate Hub</h2>
                    <p className="text-lg font-medium max-w-2xl mx-auto">Conheça os especialistas que revisam e impulsionam os projetos inovadores.</p>
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
                            value={filtro}
                            onChange={(e) => setFiltro(e.target.value as "todos" | "ativos" | "inativos")}
                            className="p-2 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14B8A6] transition bg-white text-[#1E3A8A]"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <option value="todos">Todos</option>
                            <option value="ativos">Ativos</option>
                            <option value="inativos">Inativos</option>
                        </motion.select>
                    </div>
                </div>
                {avaliadoresFiltrados.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {avaliadoresFiltrados.map((avaliador, index) => (
                            <motion.div
                                key={avaliador.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                                className={`bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border ${selectedAvaliador?.id === avaliador.id ? 'border-[#14B8A6]' : 'border-[#D1D5DB]'}`}
                                onClick={() => handleToggleAvaliador(avaliador)}
                            >
                                <div className="flex items-center mb-4">
                                    <FontAwesomeIcon icon={faUser} className="text-[#1E3A8A] text-2xl mr-3" />
                                    <h3 className="text-xl font-semibold text-[#1E3A8A] truncate max-w-full" title={avaliador.nome}>{avaliador.nome}</h3>
                                </div>
                                {selectedAvaliador?.id === avaliador.id && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        transition={{ duration: 0.3 }}
                                        className="mt-4"
                                    >
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <motion.div
                                                whileHover={{ scale: 1.02 }}
                                                className="flex items-center bg-gray-50 p-4 rounded-md border border-[#D1D5DB] shadow-sm hover:shadow-md transition w-full min-w-0"
                                            >
                                                <FontAwesomeIcon icon={faUser} className="text-[#1E3A8A] mr-3 flex-shrink-0" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium text-gray-600">Nome</p>
                                                    <p className="text-gray-800 truncate" title={avaliador.nome}>{avaliador.nome}</p>
                                                </div>
                                            </motion.div>
                                            <motion.div
                                                whileHover={{ scale: 1.02 }}
                                                className="flex items-center bg-gray-50 p-4 rounded-md border border-[#D1D5DB] shadow-sm hover:shadow-md transition w-full min-w-0"
                                            >
                                                <FontAwesomeIcon icon={faEnvelope} className="text-[#1E3A8A] mr-3 flex-shrink-0" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium text-gray-600">Email</p>
                                                    <p className="text-gray-800 truncate" title={avaliador.email}>{avaliador.email}</p>
                                                </div>
                                            </motion.div>
                                            <motion.div
                                                whileHover={{ scale: 1.02 }}
                                                className="flex items-center bg-gray-50 p-4 rounded-md border border-[#D1D5DB] shadow-sm hover:shadow-md transition w-full min-w-0"
                                            >
                                                <FontAwesomeIcon icon={faIdCard} className="text-[#1E3A8A] mr-3 flex-shrink-0" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium text-gray-600">CPF</p>
                                                    <p className="text-gray-800 truncate" title={avaliador.cpf}>{avaliador.cpf}</p>
                                                </div>
                                            </motion.div>
                                            <motion.div
                                                whileHover={{ scale: 1.02 }}
                                                className="flex items-center bg-gray-50 p-4 rounded-md border border-[#D1D5DB] shadow-sm hover:shadow-md transition w-full min-w-0"
                                            >
                                                <FontAwesomeIcon icon={faPhone} className="text-[#1E3A8A] mr-3 flex-shrink-0" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium text-gray-600">Telefone</p>
                                                    <p className="text-gray-800 truncate" title={avaliador.telefone}>{avaliador.telefone}</p>
                                                </div>
                                            </motion.div>
                                            <motion.div
                                                whileHover={{ scale: 1.02 }}
                                                className="flex items-center bg-gray-50 p-4 rounded-md border border-[#D1D5DB] shadow-sm hover:shadow-md transition w-full min-w-0"
                                            >
                                                <FontAwesomeIcon icon={faBriefcase} className="text-[#1E3A8A] mr-3 flex-shrink-0" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium text-gray-600">Especialidade</p>
                                                    <p className="text-gray-800 truncate" title={avaliador.especialidade || "Nenhuma"}>{avaliador.especialidade || "Nenhuma"}</p>
                                                </div>
                                            </motion.div>
                                            <motion.div
                                                whileHover={{ scale: 1.02 }}
                                                className="flex items-center bg-gray-50 p-4 rounded-md border border-[#D1D5DB] shadow-sm hover:shadow-md transition w-full min-w-0"
                                            >
                                                <FontAwesomeIcon icon={faStar} className="text-[#1E3A8A] mr-3 flex-shrink-0" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium text-gray-600">Avaliações</p>
                                                    <p className="text-gray-800">{avaliador.avaliacoes?.length || 0}</p>
                                                </div>
                                            </motion.div>
                                        </div>
                                        {userType === "admin" && (
                                            <div className="mt-4 flex justify-end space-x-2">
                                                <motion.button
                                                    onClick={(e) => { e.stopPropagation(); handleEdit(avaliador); }}
                                                    className="p-2 bg-[#1E3A8A] text-white rounded-lg hover:bg-[#14B8A6] transition-colors"
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    <FontAwesomeIcon icon={faEdit} />
                                                </motion.button>
                                                <motion.button
                                                    onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(avaliador.id); }}
                                                    className="p-2 bg-[#EF4444] text-white rounded-lg hover:bg-[#DC2626] transition-colors"
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </motion.button>
                                            </div>
                                        )}
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
                        Nenhum avaliador encontrado.
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
                                <p className="text-gray-600 mb-6">Tem certeza que deseja excluir este avaliador?</p>
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
                    {showForm && (
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
                                className="bg-white rounded-xl shadow-xl p-8 border border-[#D1D5DB] w-full max-w-4xl max-h-[80vh] overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h3 className="text-2xl font-bold text-[#1E3A8A] mb-6 text-center">Editar Avaliador</h3>
                                <UsuarioForm
                                    initialData={formData}
                                    onSave={handleFormSave}
                                    onCancel={handleFormClose}
                                    onCreate={formData?.id === 0 ? handleFormClose : undefined}
                                    isOpen={showForm}
                                    isAdmin={userType === "admin"}
                                    isUserEditing={!!formData && formData.id !== 0}
                                    currentUserId={currentUserId}
                                    onNavigate={onNavigate}
                                    userType={userType}
                                />
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>
        </div>
    );
};

export default AvaliadorList;