import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faTimes } from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import { UsuarioCompleto, UsuarioFormProps } from "../types/types";

const UsuarioForm: React.FC<
    UsuarioFormProps & { onNavigate: (path: string) => void; userType: string | null }
> = ({
         initialData,
         onSave,
         onCancel,
         onCreate,
         onNavigate,
         isUserEditing = false,
         isOpen = false,
         isAdmin = false,
         currentUserId,
         userType,
     }) => {
    const [usuario, setUsuario] = useState<UsuarioCompleto>(initialData || {
        id: 0,
        nome: "",
        email: "",
        cpf: "",
        dataNascimento: "",
        telefone: "",
        pais: "",
        cidade: "",
        estado: "",
        rua: null,
        avenida: null,
        lote: null,
        numero: null,
        tipo: "autor",
        especialidade: null,
        senha: "",
        projetos: [],
        avaliacoes: [],
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [feedback, setFeedback] = useState<{ message: string; isSuccess: boolean; details?: string[] } | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (initialData) {
            setUsuario({
                ...initialData,
                senha: "", // Reset senha para edição, pois não deve ser enviada a menos que alterada
            });
        }
    }, [initialData]);

    const formatCPF = (value: string) => {
        value = value.replace(/\D/g, "");
        if (value.length <= 11) {
            value = value.replace(/(\d{3})(\d)/, "$1.$2");
            value = value.replace(/(\d{3})(\d)/, "$1.$2");
            value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
        }
        return value.slice(0, 14);
    };

    const formatTelefone = (value: string) => {
        value = value.replace(/\D/g, "");
        if (value.length <= 11) {
            value = value.replace(/^(\d{2})(\d)/, "($1) $2");
            value = value.replace(/(\d{5})(\d{1,4})/, "$1-$2");
        }
        return value.slice(0, 15);
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        const requiredFields = {
            nome: usuario.nome.trim(),
            email: usuario.email.trim(),
            cpf: usuario.cpf.trim(),
            dataNascimento: usuario.dataNascimento.trim(),
            telefone: usuario.telefone.trim(),
            pais: usuario.pais.trim(),
            cidade: usuario.cidade.trim(),
            estado: usuario.estado.trim(),
        };

        if (!requiredFields.nome) newErrors.nome = "Nome é obrigatório";
        if (!requiredFields.email) newErrors.email = "Email é obrigatório";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(requiredFields.email)) newErrors.email = "Email inválido";
        if (!requiredFields.cpf) newErrors.cpf = "CPF é obrigatório";
        else if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(requiredFields.cpf)) newErrors.cpf = "CPF deve estar no formato 999.999.999-99";
        if (!requiredFields.dataNascimento) newErrors.dataNascimento = "Data de nascimento é obrigatória";
        else if (isNaN(new Date(requiredFields.dataNascimento).getTime())) newErrors.dataNascimento = "Data de nascimento inválida";
        if (!requiredFields.telefone) newErrors.telefone = "Telefone é obrigatório";
        else if (!/^\(\d{2}\)\s\d{5}-\d{4}$/.test(requiredFields.telefone)) newErrors.telefone = "Telefone deve estar no formato (99) 99999-9999";
        if (!requiredFields.pais) newErrors.pais = "País é obrigatório";
        if (!requiredFields.cidade) newErrors.cidade = "Cidade é obrigatória";
        if (!requiredFields.estado) newErrors.estado = "Estado é obrigatório";
        if (usuario.tipo === "avaliador" && !usuario.especialidade?.trim()) {
            newErrors.especialidade = "Especialidade é obrigatória para avaliadores";
        }
        if (!initialData && (!usuario.senha || usuario.senha.trim() === "")) {
            newErrors.senha = "Senha é obrigatória para novos usuários";
        }
        if (usuario.senha?.trim() && usuario.senha.length < 6) {
            newErrors.senha = "Senha deve ter pelo menos 6 caracteres";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setUsuario((prev) => {
            const newUsuario = { ...prev, [name]: value };
            if (name === "cpf") newUsuario.cpf = formatCPF(value);
            if (name === "telefone") newUsuario.telefone = formatTelefone(value);
            validateForm();
            return newUsuario;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const updatedFields: Partial<UsuarioCompleto> = {};
            if (initialData && !usuario.id) {
                setFeedback({ message: "ID do usuário é obrigatório para atualização.", isSuccess: false });
                return;
            }
            updatedFields.id = usuario.id;

            if (usuario.nome !== initialData?.nome) updatedFields.nome = usuario.nome.trim();
            if (usuario.email !== initialData?.email) updatedFields.email = usuario.email.trim();
            if (usuario.cpf !== initialData?.cpf) updatedFields.cpf = usuario.cpf.trim();
            if (usuario.dataNascimento !== initialData?.dataNascimento) updatedFields.dataNascimento = usuario.dataNascimento;
            if (usuario.telefone !== initialData?.telefone) updatedFields.telefone = usuario.telefone.trim();
            if (usuario.pais !== initialData?.pais) updatedFields.pais = usuario.pais.trim();
            if (usuario.cidade !== initialData?.cidade) updatedFields.cidade = usuario.cidade.trim();
            if (usuario.estado !== initialData?.estado) updatedFields.estado = usuario.estado.trim();
            if (usuario.rua !== initialData?.rua) updatedFields.rua = usuario.rua?.trim() || null;
            if (usuario.avenida !== initialData?.avenida) updatedFields.avenida = usuario.avenida?.trim() || null;
            if (usuario.lote !== initialData?.lote) updatedFields.lote = usuario.lote?.trim() || null;
            if (usuario.numero !== initialData?.numero) updatedFields.numero = usuario.numero?.trim() || null;
            if (usuario.tipo !== initialData?.tipo) updatedFields.tipo = usuario.tipo;
            if (usuario.especialidade !== initialData?.especialidade) updatedFields.especialidade = usuario.especialidade?.trim() || null;
            if (usuario.senha?.trim()) {
                updatedFields.senha = usuario.senha;
            }

            if (Object.keys(updatedFields).length === 1 && updatedFields.id) {
                handleFormClose();
                return;
            }

            if (onSave) await onSave(updatedFields);
            setFeedback({ message: "Usuário atualizado com sucesso!", isSuccess: true });
            if (onCancel) onCancel();

            const redirectPath = window.location.pathname;
            onNavigate(redirectPath);
        } catch (error: any) {
            console.error("Erro ao salvar usuário:", error.response?.data || error.message);
            const errorMessage = error.response?.data?.message || "Falha ao salvar usuário.";
            const errorDetails = error.response?.data?.details || [];
            setFeedback({
                message: errorMessage,
                isSuccess: false,
                details: Array.isArray(errorDetails)
                    ? errorDetails.map((d) => (d.constraints ? Object.values(d.constraints)[0] : d))
                    : [errorDetails.toString()],
            });
        }
    };

    const handleFormClose = () => {
        setUsuario(
            initialData || {
                id: 0,
                nome: "",
                email: "",
                cpf: "",
                dataNascimento: "",
                telefone: "",
                pais: "",
                cidade: "",
                estado: "",
                rua: null,
                avenida: null,
                lote: null,
                numero: null,
                tipo: "autor",
                especialidade: null,
                senha: "",
                projetos: [],
                avaliacoes: [],
            }
        );
        setErrors({});
        setFeedback(null);
        if (onCancel) onCancel();
    };

    const showPasswordField = !initialData || (isUserEditing && currentUserId === usuario.id && currentUserId !== undefined);
    const isPasswordDisabled = !!(isAdmin && initialData && currentUserId !== initialData.id);

    const isDisabled = (field: keyof UsuarioCompleto) => {
        if (field === "cpf" && initialData) return true;
        if (field === "senha" && isPasswordDisabled) return true;
        return !!initialData && !isAdmin && !isUserEditing;
    };

    if (!isOpen) return null;

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
                        <h2 className="text-4xl font-bold font-sans mb-4 drop-shadow-md">
                            {initialData ? "Editar Colaborador" : "Novo Colaborador"}
                        </h2>
                        <p className="text-lg font-medium max-w-2xl mx-auto">
                            {initialData ? "Atualize as informações do colaborador para continuar inovando." : "Crie um novo colaborador para contribuir com projetos científicos."}
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
                            backgroundColor: feedback.isSuccess ? "#D4EDDA" : "#F8D7DA",
                            color: feedback.isSuccess ? "#155724" : "#721c24",
                        }}
                    >
                        <div>
                            {feedback.message}
                            {feedback.details && feedback.details.length > 0 && (
                                <ul className="list-disc list-inside mt-2">
                                    {feedback.details.map((detail, index) => (
                                        <li key={index} className="text-sm">{detail}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <button
                            onClick={() => setFeedback(null)}
                            className="text-current hover:opacity-75 transition"
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </motion.div>
                )}
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-[#1E3A8A] mb-2">Tipo de Usuário</label>
                            <motion.select
                                name="tipo"
                                className="w-full p-3 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14B8A6] transition bg-white text-[#1E3A8A]"
                                value={usuario.tipo}
                                onChange={handleChange}
                                onClick={(e) => e.stopPropagation()}
                                disabled={isDisabled("tipo")}
                                whileHover={{ scale: 1.02 }}
                            >
                                <option value="autor">Autor</option>
                                <option value="avaliador">Avaliador</option>
                                {userType === "admin" && <option value="admin">Admin</option>}
                            </motion.select>
                            {errors.tipo && <span className="text-red-500 text-sm mt-1 block">{errors.tipo}</span>}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-[#1E3A8A] mb-2">Nome</label>
                            <motion.input
                                name="nome"
                                type="text"
                                className="w-full p-3 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14B8A6] transition bg-white text-[#1E3A8A]"
                                value={usuario.nome}
                                onChange={handleChange}
                                onClick={(e) => e.stopPropagation()}
                                disabled={isDisabled("nome")}
                                required
                                whileHover={{ scale: 1.02 }}
                            />
                            {errors.nome && <span className="text-red-500 text-sm mt-1 block">{errors.nome}</span>}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-[#1E3A8A] mb-2">Email</label>
                            <motion.input
                                name="email"
                                type="email"
                                className="w-full p-3 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14B8A6] transition bg-white text-[#1E3A8A]"
                                value={usuario.email}
                                onChange={handleChange}
                                onClick={(e) => e.stopPropagation()}
                                disabled={isDisabled("email")}
                                required
                                whileHover={{ scale: 1.02 }}
                            />
                            {errors.email && <span className="text-red-500 text-sm mt-1 block">{errors.email}</span>}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-[#1E3A8A] mb-2">CPF</label>
                            <motion.input
                                name="cpf"
                                type="text"
                                className="w-full p-3 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14B8A6] transition bg-white text-[#1E3A8A]"
                                value={usuario.cpf}
                                onChange={(e) => setUsuario((prev) => ({ ...prev, cpf: formatCPF(e.target.value) }))}
                                onClick={(e) => e.stopPropagation()}
                                disabled={isDisabled("cpf")}
                                required
                                whileHover={{ scale: 1.02 }}
                            />
                            {errors.cpf && <span className="text-red-500 text-sm mt-1 block">{errors.cpf}</span>}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-[#1E3A8A] mb-2">Data de Nascimento</label>
                            <motion.input
                                name="dataNascimento"
                                type="date"
                                className="w-full p-3 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14B8A6] transition bg-white text-[#1E3A8A]"
                                value={usuario.dataNascimento}
                                onChange={handleChange}
                                onClick={(e) => e.stopPropagation()}
                                disabled={isDisabled("dataNascimento")}
                                required
                                whileHover={{ scale: 1.02 }}
                            />
                            {errors.dataNascimento && <span className="text-red-500 text-sm mt-1 block">{errors.dataNascimento}</span>}
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-[#1E3A8A] mb-2">Telefone</label>
                            <motion.input
                                name="telefone"
                                type="tel"
                                className="w-full p-3 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14B8A6] transition bg-white text-[#1E3A8A]"
                                value={usuario.telefone}
                                onChange={(e) => setUsuario((prev) => ({ ...prev, telefone: formatTelefone(e.target.value) }))}
                                onClick={(e) => e.stopPropagation()}
                                disabled={isDisabled("telefone")}
                                required
                                whileHover={{ scale: 1.02 }}
                            />
                            {errors.telefone && <span className="text-red-500 text-sm mt-1 block">{errors.telefone}</span>}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-[#1E3A8A] mb-2">País</label>
                            <motion.input
                                name="pais"
                                type="text"
                                className="w-full p-3 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14B8A6] transition bg-white text-[#1E3A8A]"
                                value={usuario.pais}
                                onChange={handleChange}
                                onClick={(e) => e.stopPropagation()}
                                disabled={isDisabled("pais")}
                                required
                                whileHover={{ scale: 1.02 }}
                            />
                            {errors.pais && <span className="text-red-500 text-sm mt-1 block">{errors.pais}</span>}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-[#1E3A8A] mb-2">Cidade</label>
                            <motion.input
                                name="cidade"
                                type="text"
                                className="w-full p-3 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14B8A6] transition bg-white text-[#1E3A8A]"
                                value={usuario.cidade}
                                onChange={handleChange}
                                onClick={(e) => e.stopPropagation()}
                                disabled={isDisabled("cidade")}
                                required
                                whileHover={{ scale: 1.02 }}
                            />
                            {errors.cidade && <span className="text-red-500 text-sm mt-1 block">{errors.cidade}</span>}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-[#1E3A8A] mb-2">Estado</label>
                            <motion.input
                                name="estado"
                                type="text"
                                className="w-full p-3 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14B8A6] transition bg-white text-[#1E3A8A]"
                                value={usuario.estado}
                                onChange={handleChange}
                                onClick={(e) => e.stopPropagation()}
                                disabled={isDisabled("estado")}
                                required
                                whileHover={{ scale: 1.02 }}
                            />
                            {errors.estado && <span className="text-red-500 text-sm mt-1 block">{errors.estado}</span>}
                        </div>
                        {showPasswordField && (
                            <div className="relative">
                                <label className="block text-sm font-semibold text-[#1E3A8A] mb-2">
                                    {initialData ? "Nova Senha (opcional)" : "Senha"}
                                </label>
                                <motion.input
                                    name="senha"
                                    type={showPassword ? "text" : "password"}
                                    className="w-full p-3 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14B8A6] transition bg-white text-[#1E3A8A] pr-10"
                                    value={usuario.senha || ""}
                                    onChange={(e) => setUsuario((prev) => ({ ...prev, senha: e.target.value }))}
                                    onClick={(e) => e.stopPropagation()}
                                    placeholder={initialData ? "Deixe em branco para manter a senha atual" : "Digite a senha"}
                                    disabled={isDisabled("senha")}
                                    required={!initialData}
                                    whileHover={{ scale: 1.02 }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#1E3A8A] hover:text-[#14B8A6] transition"
                                    disabled={!usuario.senha || !!isPasswordDisabled}
                                >
                                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                                </button>
                                {errors.senha && <span className="text-red-500 text-sm mt-1 block">{errors.senha}</span>}
                            </div>
                        )}
                    </div>
                    <div className="md:col-span-2 space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-[#1E3A8A] mb-2">Rua</label>
                            <motion.input
                                name="rua"
                                type="text"
                                className="w-full p-3 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14B8A6] transition bg-white text-[#1E3A8A]"
                                value={usuario.rua || ""}
                                onChange={handleChange}
                                onClick={(e) => e.stopPropagation()}
                                disabled={isDisabled("rua")}
                                whileHover={{ scale: 1.02 }}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-[#1E3A8A] mb-2">Avenida</label>
                            <motion.input
                                name="avenida"
                                type="text"
                                className="w-full p-3 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14B8A6] transition bg-white text-[#1E3A8A]"
                                value={usuario.avenida || ""}
                                onChange={handleChange}
                                onClick={(e) => e.stopPropagation()}
                                disabled={isDisabled("avenida")}
                                whileHover={{ scale: 1.02 }}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-[#1E3A8A] mb-2">Lote</label>
                            <motion.input
                                name="lote"
                                type="text"
                                className="w-full p-3 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14B8A6] transition bg-white text-[#1E3A8A]"
                                value={usuario.lote || ""}
                                onChange={handleChange}
                                onClick={(e) => e.stopPropagation()}
                                disabled={isDisabled("lote")}
                                whileHover={{ scale: 1.02 }}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-[#1E3A8A] mb-2">Número</label>
                            <motion.input
                                name="numero"
                                type="text"
                                className="w-full p-3 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14B8A6] transition bg-white text-[#1E3A8A]"
                                value={usuario.numero || ""}
                                onChange={handleChange}
                                onClick={(e) => e.stopPropagation()}
                                disabled={isDisabled("numero")}
                                whileHover={{ scale: 1.02 }}
                            />
                        </div>
                        {usuario.tipo === "avaliador" && (
                            <div>
                                <label className="block text-sm font-semibold text-[#1E3A8A] mb-2">Especialidade</label>
                                <motion.input
                                    name="especialidade"
                                    type="text"
                                    className="w-full p-3 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14B8A6] transition bg-white text-[#1E3A8A]"
                                    value={usuario.especialidade || ""}
                                    onChange={handleChange}
                                    onClick={(e) => e.stopPropagation()}
                                    disabled={isDisabled("especialidade")}
                                    whileHover={{ scale: 1.02 }}
                                />
                                {errors.especialidade && <span className="text-red-500 text-sm mt-1 block">{errors.especialidade}</span>}
                            </div>
                        )}
                        <div className="flex justify-end space-x-4 mt-6">
                            {onCancel && (
                                <motion.button
                                    type="button"
                                    onClick={() => {
                                        handleFormClose();
                                        onNavigate(window.location.pathname || "/");
                                    }}
                                    className="bg-[#D1D5DB] hover:bg-[#9CA3AF] text-[#1E3A8A] font-semibold py-2 px-6 rounded-lg transition"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Cancelar
                                </motion.button>
                            )}
                            {onSave && (
                                <motion.button
                                    type="submit"
                                    className="bg-[#1E3A8A] hover:bg-[#14B8A6] text-white font-semibold py-2 px-6 rounded-lg transition"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Salvar
                                </motion.button>
                            )}
                        </div>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default UsuarioForm;