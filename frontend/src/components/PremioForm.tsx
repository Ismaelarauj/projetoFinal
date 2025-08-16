import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash, faTimes } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { motion } from "framer-motion";

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
    projetos?: Projeto[];
}

interface PremioFormProps {
    editMode?: Premio | null;
    onSave: (premio: Omit<Premio, "projetos"> & { projetos: Projeto[] }) => Promise<void>;
    onCancel: () => void;
    onCreate?: () => void;
}

const PremioForm: React.FC<PremioFormProps> = ({ editMode, onSave, onCancel, onCreate }) => {
    const [premio, setPremio] = useState<Premio>(
        editMode || {
            nome: "",
            descricao: "",
            ano: new Date().getFullYear(),
            cronograma: [{ dataInicio: "", descricao: "", dataFim: "" }],
            projetos: [],
        }
    );
    const [errors, setErrors] = useState<string[]>([]);

    useEffect(() => {
        if (editMode) {
            setPremio({
                ...editMode,
                cronograma: editMode.cronograma.map((item) => ({
                    ...item,
                    dataInicio: item.dataInicio.split("T")[0],
                    dataFim: item.dataFim.split("T")[0],
                })),
                projetos: editMode.projetos || [],
            });
        }
    }, [editMode]);

    const handleAddCronograma = () => {
        setPremio({
            ...premio,
            cronograma: [...premio.cronograma, { dataInicio: "", descricao: "", dataFim: "" }],
        });
    };

    const handleRemoveCronograma = (index: number) => {
        setPremio({
            ...premio,
            cronograma: premio.cronograma.filter((_, i) => i !== index),
        });
    };

    const handleCronogramaChange = (index: number, field: keyof CronogramaItem, value: string) => {
        const updatedCronograma = [...premio.cronograma];
        updatedCronograma[index] = { ...updatedCronograma[index], [field]: value };
        setPremio({ ...premio, cronograma: updatedCronograma });
    };

    const validateForm = (): string[] => {
        const newErrors: string[] = [];
        if (!premio.nome.trim()) newErrors.push("O nome do prêmio é obrigatório.");
        if (!premio.descricao.trim()) newErrors.push("A descrição do prêmio é obrigatória.");
        if (!premio.ano || premio.ano <= 0) newErrors.push("O ano deve ser um número válido e maior que 0.");
        premio.cronograma.forEach((item, index) => {
            if (!item.dataInicio) newErrors.push(`Data de início do item ${index + 1} do cronograma é obrigatória.`);
            if (!item.descricao.trim()) newErrors.push(`Descrição do item ${index + 1} do cronograma é obrigatória.`);
            if (!item.dataFim) newErrors.push(`Data de fim do item ${index + 1} do cronograma é obrigatória.`);
            if (item.dataInicio && item.dataFim) {
                const startDate = new Date(item.dataInicio);
                const endDate = new Date(item.dataFim);
                if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                    newErrors.push(`Datas inválidas no item ${index + 1} do cronograma.`);
                } else if (startDate > endDate) {
                    newErrors.push(`A data de início do item ${index + 1} deve ser anterior à data de fim.`);
                }
            }
        });
        return newErrors;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const validationErrors = validateForm();
        if (validationErrors.length > 0) {
            setErrors(validationErrors);
            return;
        }
        try {
            if (!editMode) {
                const token = localStorage.getItem("token");
                if (!token) {
                    setErrors(["Nenhum token de autenticação encontrado."]);
                    return;
                }
                const userId = parseInt(localStorage.getItem("userId") || "0");
                const payload = {
                    nome: premio.nome.trim(),
                    descricao: premio.descricao.trim(),
                    ano: premio.ano,
                    cronograma: premio.cronograma.map((item) => ({
                        ...item,
                        dataInicio: new Date(item.dataInicio).toISOString(),
                        dataFim: new Date(item.dataFim).toISOString(),
                    })),
                    criadoPorId: userId,
                };
                await axios.post("http://localhost:3001/premios", payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setErrors(["Prêmio criado com sucesso!"]);
                if (onCreate) {
                    onCreate();
                }
            } else {
                await onSave({ ...premio, projetos: premio.projetos || [] });
                setErrors(["Prêmio atualizado com sucesso!"]);
            }
            setPremio({
                nome: "",
                descricao: "",
                ano: new Date().getFullYear(),
                cronograma: [{ dataInicio: "", descricao: "", dataFim: "" }],
                projetos: [],
            });
        } catch (error) {
            setErrors(["Erro ao salvar o prêmio. Tente novamente."]);
        }
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
                            {editMode ? "Editar Prêmio" : "Criar um Novo Prêmio"}
                        </h3>
                        <p className="text-lg font-medium max-w-2xl mx-auto">
                            {editMode ? "Atualize os detalhes do prêmio para continuar promovendo a inovação." : "Crie um novo prêmio para reconhecer projetos científicos de excelência."}
                        </p>
                    </motion.div>
                </section>
                {errors.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mb-6 p-4 rounded-lg font-semibold relative flex items-center justify-between"
                        style={{
                            backgroundColor: errors[0].includes("sucesso") ? "#D4EDDA" : "#F8D7DA",
                            color: errors[0].includes("sucesso") ? "#155724" : "#721c24",
                        }}
                    >
                        <div>
                            {errors.map((error, index) => (
                                <p key={index}>{error}</p>
                            ))}
                        </div>
                        <button
                            onClick={() => setErrors([])}
                            className="text-current hover:opacity-75 transition"
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </motion.div>
                )}
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-[#1E3A8A] mb-2">Nome do Prêmio</label>
                        <motion.input
                            type="text"
                            className="w-full p-3 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14B8A6] transition bg-white text-[#1E3A8A]"
                            value={premio.nome}
                            onChange={(e) => setPremio({ ...premio, nome: e.target.value })}
                            required
                            whileHover={{ scale: 1.02 }}
                            whileFocus={{ scale: 1.02 }}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-[#1E3A8A] mb-2">Ano</label>
                        <motion.input
                            type="number"
                            className="w-full p-3 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14B8A6] transition bg-white text-[#1E3A8A]"
                            value={premio.ano}
                            onChange={(e) => setPremio({ ...premio, ano: parseInt(e.target.value) })}
                            required
                            whileHover={{ scale: 1.02 }}
                            whileFocus={{ scale: 1.02 }}
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-[#1E3A8A] mb-2">Descrição</label>
                        <motion.textarea
                            className="w-full p-3 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14B8A6] transition bg-white text-[#1E3A8A]"
                            value={premio.descricao}
                            onChange={(e) => setPremio({ ...premio, descricao: e.target.value })}
                            required
                            whileHover={{ scale: 1.02 }}
                            whileFocus={{ scale: 1.02 }}
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-[#1E3A8A] mb-2">Cronograma</label>
                        {premio.cronograma.map((item, index) => (
                            <motion.div
                                key={index}
                                className="mb-4 p-4 border border-[#D1D5DB] rounded-lg bg-[#F9FAFB] hover:shadow-md transition"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                            >
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[#1E3A8A]">Data de Início</label>
                                        <motion.input
                                            type="date"
                                            className="w-full p-3 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14B8A6] transition bg-white text-[#1E3A8A]"
                                            value={item.dataInicio}
                                            onChange={(e) => handleCronogramaChange(index, "dataInicio", e.target.value)}
                                            required
                                            whileHover={{ scale: 1.02 }}
                                            whileFocus={{ scale: 1.02 }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[#1E3A8A]">Descrição</label>
                                        <motion.input
                                            type="text"
                                            className="w-full p-3 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14B8A6] transition bg-white text-[#1E3A8A]"
                                            value={item.descricao}
                                            onChange={(e) => handleCronogramaChange(index, "descricao", e.target.value)}
                                            required
                                            whileHover={{ scale: 1.02 }}
                                            whileFocus={{ scale: 1.02 }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[#1E3A8A]">Data de Fim</label>
                                        <motion.input
                                            type="date"
                                            className="w-full p-3 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14B8A6] transition bg-white text-[#1E3A8A]"
                                            value={item.dataFim}
                                            onChange={(e) => handleCronogramaChange(index, "dataFim", e.target.value)}
                                            required
                                            whileHover={{ scale: 1.02 }}
                                            whileFocus={{ scale: 1.02 }}
                                        />
                                    </div>
                                </div>
                                {premio.cronograma.length > 1 && (
                                    <motion.button
                                        type="button"
                                        onClick={() => handleRemoveCronograma(index)}
                                        className="mt-2 text-red-500 hover:text-red-700 transition"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <FontAwesomeIcon icon={faTrash} /> Remover
                                    </motion.button>
                                )}
                            </motion.div>
                        ))}
                        <motion.button
                            type="button"
                            onClick={handleAddCronograma}
                            className="mt-2 text-[#1E3A8A] hover:text-[#14B8A6] transition"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <FontAwesomeIcon icon={faPlus} /> Adicionar Item ao Cronograma
                        </motion.button>
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
                            disabled={errors.length > 0}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {editMode ? "Atualizar Prêmio" : "Criar Prêmio"}
                        </motion.button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default PremioForm;