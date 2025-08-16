import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import { jwtDecode } from "jwt-decode";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { UsuarioCompleto } from "../types/types";

interface CronogramaItem {
    dataInicio: string;
    descricao: string;
    dataFim: string;
}

interface Premio {
    id: number;
    nome: string;
    descricao: string;
    cronograma: CronogramaItem[];
    ano: number;
}

interface AutorOption {
    value: number;
    label: string;
}

interface Projeto {
    id: number;
    areaTematica: string;
    titulo: string;
    resumo: string;
    premioId: number;
    autorPrincipalId: number;
    autores: { id: number; nome: string }[];
}

interface ProjetoFormProps {
    project?: Projeto;
    onSave: (usuario: UsuarioCompleto) => void;
    onCancel: () => void;
    onCreate?: () => void;
    userType?: string | null;
    currentUser?: UsuarioCompleto | null;
}

const ProjetoForm: React.FC<ProjetoFormProps> = ({ project, onSave, onCancel, onCreate, userType = "autor", currentUser = null }) => {
    const [projeto, setProjeto] = useState({
        areaTematica: project?.areaTematica || "",
        titulo: project?.titulo || "",
        resumo: project?.resumo || "",
        premioId: project?.premioId || 0,
    });
    const [autorIds, setAutorIds] = useState<number[]>(project?.autores.map(a => a.id) || []);
    const [autores, setAutores] = useState<AutorOption[]>([]);
    const [premios, setPremios] = useState<Premio[]>([]);
    const [dataEnvio, setDataEnvio] = useState(new Date().toISOString().split("T")[0]);
    const [feedback, setFeedback] = useState<string | null>(null);
    const currentUserId = parseInt(localStorage.getItem("userId") || "0");

    useEffect(() => {
        const fetchAutores = async () => {
            try {
                const response = await axios.get("http://localhost:3001/autores");
                const autorOptions = response.data
                    .filter((autor: { id: number; nome: string }) => autor.id !== currentUserId)
                    .map((autor: { id: number; nome: string }) => ({
                        value: autor.id,
                        label: autor.nome,
                    }));
                setAutores(autorOptions);
                setFeedback(null);
            } catch (error) {
                setFeedback("Erro ao buscar autores. Tente novamente mais tarde.");
            }
        };

        const fetchPremios = async () => {
            try {
                const response = await axios.get("http://localhost:3001/premios");
                const currentDate = new Date();
                const activePremios = response.data.filter((premio: Premio) =>
                    premio.cronograma.some((item: CronogramaItem) => {
                        const startDate = new Date(item.dataInicio);
                        const endDate = new Date(item.dataFim);
                        return startDate <= currentDate && currentDate <= endDate;
                    })
                );
                setPremios(activePremios);
                setFeedback(null);
            } catch (error) {
                setFeedback("Erro ao buscar prêmios. Tente novamente mais tarde.");
            }
        };

        fetchAutores();
        fetchPremios();
    }, [currentUserId]);

    useEffect(() => {
        if (project) {
            setProjeto({
                areaTematica: project.areaTematica,
                titulo: project.titulo,
                resumo: project.resumo,
                premioId: project.premioId,
            });
            setAutorIds(project.autores.map(a => a.id));
        }
    }, [project]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!projeto.areaTematica.trim() || !projeto.titulo.trim() || !projeto.resumo.trim() || !projeto.premioId) {
            setFeedback("Todos os campos são obrigatórios.");
            return;
        }
        try {
            const finalAutorIds = currentUserId && !autorIds.includes(currentUserId) ? [...autorIds, currentUserId] : autorIds;

            if (project) {
                await axios.put(
                    `http://localhost:3001/projetos/${project.id}`,
                    {
                        projeto: { ...projeto },
                        autorIds: finalAutorIds,
                    },
                    { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
                );
            } else {
                await axios.post(
                    "http://localhost:3001/projetos",
                    {
                        projeto: { ...projeto, dataEnvio: new Date() },
                        autorIds: finalAutorIds,
                    },
                    { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
                );
            }
            setFeedback("Projeto salvo com sucesso!");

            if (currentUser) {
                const updatedUser: UsuarioCompleto = {
                    ...currentUser,
                    tipo: userType as "autor" | "avaliador" | "admin",
                    projetos: currentUser.projetos || [],
                };
                onSave(updatedUser);
            }
            if (onCreate) onCreate();
        } catch (error: any) {
            setFeedback(error.response?.data?.message || "Erro ao salvar projeto");
        }
    };

    const handleAutorChange = (selectedOptions: any) => {
        const selectedIds = selectedOptions ? selectedOptions.map((option: AutorOption) => option.value) : [];
        setAutorIds(selectedIds);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-4xl max-h-[85vh] overflow-y-auto"
            >
                <section className="bg-hero-pattern bg-cover bg-center py-12 text-center text-white relative">
                    <div className="absolute inset-0 bg-black bg-opacity-50"></div>
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="relative max-w-3xl mx-auto"
                    >
                        <h3 className="text-3xl font-bold font-sans mb-4 drop-shadow-md">
                            {project ? "Editar Projeto" : "Criar um Novo Projeto"}
                        </h3>
                        <p className="text-lg font-medium max-w-2xl mx-auto">
                            {project ? "Atualize os detalhes do seu projeto científico." : "Crie um novo projeto para compartilhar sua inovação científica."}
                        </p>
                    </motion.div>
                </section>
                {feedback && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mb-6 p-4 rounded-lg font-semibold relative flex items-center justify-between"
                        style={{
                            backgroundColor: feedback.includes("sucesso") ? "#D4EDDA" : "#F8D7DA",
                            color: feedback.includes("sucesso") ? "#155724" : "#721c24",
                        }}
                    >
                        <div>{feedback}</div>
                        <button
                            onClick={() => setFeedback(null)}
                            className="text-current hover:opacity-75 transition"
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </motion.div>
                )}
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-[#1E3A8A] mb-2">Área Temática</label>
                        <motion.input
                            type="text"
                            className="w-full p-3 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14B8A6] transition bg-white text-[#1E3A8A]"
                            value={projeto.areaTematica}
                            onChange={(e) => setProjeto({ ...projeto, areaTematica: e.target.value })}
                            required
                            whileHover={{ scale: 1.02 }}
                            whileFocus={{ scale: 1.02 }}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-[#1E3A8A] mb-2">Título</label>
                        <motion.input
                            type="text"
                            className="w-full p-3 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14B8A6] transition bg-white text-[#1E3A8A]"
                            value={projeto.titulo}
                            onChange={(e) => setProjeto({ ...projeto, titulo: e.target.value })}
                            required
                            whileHover={{ scale: 1.02 }}
                            whileFocus={{ scale: 1.02 }}
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-[#1E3A8A] mb-2">Resumo</label>
                        <motion.textarea
                            className="w-full p-3 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14B8A6] transition bg-white text-[#1E3A8A]"
                            value={projeto.resumo}
                            onChange={(e) => setProjeto({ ...projeto, resumo: e.target.value })}
                            required
                            whileHover={{ scale: 1.02 }}
                            whileFocus={{ scale: 1.02 }}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-[#1E3A8A] mb-2">Prêmio</label>
                        <motion.select
                            className="w-full p-3 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14B8A6] transition bg-white text-[#1E3A8A]"
                            value={projeto.premioId}
                            onChange={(e) => setProjeto({ ...projeto, premioId: parseInt(e.target.value) })}
                            required
                            whileHover={{ scale: 1.02 }}
                            whileFocus={{ scale: 1.02 }}
                        >
                            <option value={0}>Selecione um prêmio</option>
                            {premios.map((premio) => (
                                <option key={premio.id} value={premio.id}>
                                    {premio.nome} (Ano: {premio.ano})
                                </option>
                            ))}
                        </motion.select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-[#1E3A8A] mb-2">Autores Adicionais</label>
                        <Select
                            isMulti
                            options={autores}
                            value={autores.filter((autor) => autorIds.includes(autor.value))}
                            onChange={handleAutorChange}
                            className="w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14B8A6] transition bg-white text-[#1E3A8A]"
                            classNamePrefix="select"
                            placeholder="Selecione os autores adicionais..."
                            styles={{
                                control: (base) => ({
                                    ...base,
                                    borderColor: '#D1D5DB',
                                    backgroundColor: '#F9FAFB',
                                    padding: '0.5rem',
                                    borderRadius: '0.5rem',
                                    '&:hover': {
                                        borderColor: '#14B8A6',
                                        boxShadow: '0 0 0 2px rgba(20, 184, 166, 0.2)',
                                    },
                                }),
                                menu: (base) => ({
                                    ...base,
                                    backgroundColor: '#F9FAFB',
                                    borderRadius: '0.5rem',
                                    marginTop: '0.25rem',
                                }),
                                option: (base, { isFocused, isSelected }) => ({
                                    ...base,
                                    backgroundColor: isSelected ? '#14B8A6' : isFocused ? '#E6F4F1' : '#F9FAFB',
                                    color: isSelected ? '#FFFFFF' : '#1E3A8A',
                                    padding: '0.75rem',
                                    '&:hover': {
                                        backgroundColor: '#E6F4F1',
                                    },
                                }),
                            }}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-[#1E3A8A] mb-2">Data de Envio</label>
                        <motion.input
                            type="text"
                            className="w-full p-3 border border-[#D1D5DB] rounded-lg bg-[#E5E7EB] cursor-not-allowed text-[#1E3A8A]"
                            value={dataEnvio}
                            readOnly
                            whileHover={{ scale: 1.02 }}
                        />
                    </div>
                    <div className="md:col-span-2 flex justify-end space-x-4">
                        <motion.button
                            type="button"
                            onClick={onCancel}
                            className="bg-[#D1D5DB] hover:bg-[#9CA3AF] text-[#1E3A8A] font-semibold py-2 px-6 rounded-lg transition"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Cancelar
                        </motion.button>
                        <motion.button
                            type="submit"
                            className="bg-[#1E3A8A] hover:bg-[#14B8A6] text-white font-semibold py-2 px-6 rounded-lg transition"
                            disabled={!projeto.areaTematica.trim() || !projeto.titulo.trim() || !projeto.resumo.trim() || !projeto.premioId}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Salvar
                        </motion.button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default ProjetoForm;