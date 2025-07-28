import React, { useState } from "react";
import axios from "axios";

const UsuarioForm: React.FC<{ onCreate?: () => void }> = ({ onCreate }) => {
    const [usuario, setUsuario] = useState({
        nome: "",
        email: "",
        cpf: "",
        dataNascimento: "",
        telefone: "",
        pais: "",
        cidade: "",
        estado: "",
        rua: "",
        avenida: "",
        lote: "",
        numero: "",
        senha: "",
        tipo: "autor" as "autor" | "avaliador",
        especialidade: ""
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [feedback, setFeedback] = useState<string | null>(null);

    const calculateAge = (birthDate: string) => {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age > 0 ? age : 0;
    };

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
            senha: usuario.senha.trim()
        };

        if (!requiredFields.nome) newErrors.nome = "Nome é obrigatório";
        if (!requiredFields.email) newErrors.email = "Email é obrigatório";
        if (!requiredFields.cpf) newErrors.cpf = "CPF é obrigatório";
        if (!requiredFields.dataNascimento) newErrors.dataNascimento = "Data de nascimento é obrigatória";
        if (!requiredFields.telefone) newErrors.telefone = "Telefone é obrigatório";
        if (!requiredFields.pais) newErrors.pais = "País é obrigatório";
        if (!requiredFields.cidade) newErrors.cidade = "Cidade é obrigatória";
        if (!requiredFields.estado) newErrors.estado = "Estado é obrigatório";
        if (!requiredFields.senha) newErrors.senha = "Senha é obrigatória";
        else if (usuario.senha.length < 6) newErrors.senha = "Senha deve ter pelo menos 6 caracteres";

        if (usuario.tipo === "avaliador" && !usuario.especialidade.trim()) {
            newErrors.especialidade = "Especialidade é obrigatória para avaliadores";
        }

        const age = calculateAge(usuario.dataNascimento);
        if (age < 18 && requiredFields.dataNascimento) newErrors.dataNascimento = "O usuário deve ter pelo menos 18 anos";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setUsuario(prev => {
            const newUsuario = { ...prev, [name]: value };
            validateForm();
            return newUsuario;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        const payload = { ...usuario, idade: calculateAge(usuario.dataNascimento) };
        try {
            await axios.post("http://localhost:3001/usuarios", payload);
            setFeedback(`${usuario.tipo === "autor" ? "Autor" : "Avaliador"} criado com sucesso!`);
            setUsuario({ nome: "", email: "", cpf: "", dataNascimento: "", telefone: "", pais: "", cidade: "", estado: "", rua: "", avenida: "", lote: "", numero: "", senha: "", tipo: "autor", especialidade: "" });
            setErrors({});
            if (onCreate) onCreate();
        } catch (error: any) {
            setFeedback(error.response?.data?.message || `Erro ao criar ${usuario.tipo}`);
        }
    };

    return (
        <div className="min-h-screen bg-innovate-gray">
            <section className="bg-hero-pattern bg-cover bg-center py-20 text-center text-innovate-dark flex justify-center">
                <div className="text-center">
                    <h2 className="text-4xl font-display mb-4">Registre-se para Criar e Gerenciar Projetos</h2>
                    <p className="text-lg max-w-2xl mx-auto" style={{ textAlign: 'center' }}>Junte-se ao Innovate Hub e impulsione suas ideias com ferramentas de ponta para geração de projetos inovadores.</p>
                </div>
            </section>
            <section className="max-w-6xl mx-auto px-6 py-12">
                <div className="bg-white rounded-xl shadow-xl p-8 border border-innovate-gray">
                    <h3 className="text-2xl font-display text-innovate-blue mb-6 text-center">Cadastro de Colaborador</h3>
                    {feedback && (
                        <div className="mb-4 p-4 rounded-lg text-center font-semibold" style={{ backgroundColor: feedback.includes("Erro") ? "#f8d7da" : "#d4edda", color: feedback.includes("Erro") ? "#721c24" : "#155724" }}>
                            {feedback}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-innovate-dark mb-2">Tipo de Usuário</label>
                                <select
                                    name="tipo"
                                    className="w-full p-3 border border-innovate-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-innovate-accent transition"
                                    value={usuario.tipo}
                                    onChange={handleChange}
                                >
                                    <option value="autor">Autor</option>
                                    <option value="avaliador">Avaliador</option>
                                </select>
                                {errors.tipo && <span className="text-red-500 text-sm mt-1 block">{errors.tipo}</span>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-innovate-dark mb-2">Nome</label>
                                <input
                                    name="nome"
                                    type="text"
                                    className="w-full p-3 border border-innovate-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-innovate-accent transition"
                                    value={usuario.nome}
                                    onChange={handleChange}
                                />
                                {errors.nome && <span className="text-red-500 text-sm mt-1 block">{errors.nome}</span>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-innovate-dark mb-2">Email</label>
                                <input
                                    name="email"
                                    type="email"
                                    className="w-full p-3 border border-innovate-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-innovate-accent transition"
                                    value={usuario.email}
                                    onChange={handleChange}
                                />
                                {errors.email && <span className="text-red-500 text-sm mt-1 block">{errors.email}</span>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-innovate-dark mb-2">CPF</label>
                                <input
                                    name="cpf"
                                    type="text"
                                    className="w-full p-3 border border-innovate-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-innovate-accent transition"
                                    value={usuario.cpf}
                                    onChange={(e) => setUsuario(prev => ({ ...prev, cpf: formatCPF(e.target.value) }))}
                                />
                                {errors.cpf && <span className="text-red-500 text-sm mt-1 block">{errors.cpf}</span>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-innovate-dark mb-2">Data de Nascimento</label>
                                <input
                                    name="dataNascimento"
                                    type="date"
                                    className="w-full p-3 border border-innovate-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-innovate-accent transition"
                                    value={usuario.dataNascimento}
                                    onChange={handleChange}
                                />
                                {errors.dataNascimento && <span className="text-red-500 text-sm mt-1 block">{errors.dataNascimento}</span>}
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-innovate-dark mb-2">Telefone</label>
                                <input
                                    name="telefone"
                                    type="tel"
                                    className="w-full p-3 border border-innovate-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-innovate-accent transition"
                                    value={usuario.telefone}
                                    onChange={(e) => setUsuario(prev => ({ ...prev, telefone: formatTelefone(e.target.value) }))}
                                />
                                {errors.telefone && <span className="text-red-500 text-sm mt-1 block">{errors.telefone}</span>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-innovate-dark mb-2">País</label>
                                <input
                                    name="pais"
                                    type="text"
                                    className="w-full p-3 border border-innovate-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-innovate-accent transition"
                                    value={usuario.pais}
                                    onChange={handleChange}
                                />
                                {errors.pais && <span className="text-red-500 text-sm mt-1 block">{errors.pais}</span>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-innovate-dark mb-2">Cidade</label>
                                <input
                                    name="cidade"
                                    type="text"
                                    className="w-full p-3 border border-innovate-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-innovate-accent transition"
                                    value={usuario.cidade}
                                    onChange={handleChange}
                                />
                                {errors.cidade && <span className="text-red-500 text-sm mt-1 block">{errors.cidade}</span>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-innovate-dark mb-2">Estado</label>
                                <input
                                    name="estado"
                                    type="text"
                                    className="w-full p-3 border border-innovate-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-innovate-accent transition"
                                    value={usuario.estado}
                                    onChange={handleChange}
                                />
                                {errors.estado && <span className="text-red-500 text-sm mt-1 block">{errors.estado}</span>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-innovate-dark mb-2">Senha</label>
                                <input
                                    name="senha"
                                    type="password"
                                    className="w-full p-3 border border-innovate-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-innovate-accent transition"
                                    value={usuario.senha}
                                    onChange={handleChange}
                                />
                                {errors.senha && <span className="text-red-500 text-sm mt-1 block">{errors.senha}</span>}
                            </div>
                        </div>
                        <div className="md:col-span-2 space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-innovate-dark mb-2">Rua</label>
                                <input
                                    name="rua"
                                    type="text"
                                    className="w-full p-3 border border-innovate-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-innovate-accent transition"
                                    value={usuario.rua}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-innovate-dark mb-2">Avenida</label>
                                <input
                                    name="avenida"
                                    type="text"
                                    className="w-full p-3 border border-innovate-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-innovate-accent transition"
                                    value={usuario.avenida}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-innovate-dark mb-2">Lote</label>
                                <input
                                    name="lote"
                                    type="text"
                                    className="w-full p-3 border border-innovate-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-innovate-accent transition"
                                    value={usuario.lote}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-innovate-dark mb-2">Número</label>
                                <input
                                    name="numero"
                                    type="text"
                                    className="w-full p-3 border border-innovate-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-innovate-accent transition"
                                    value={usuario.numero}
                                    onChange={handleChange}
                                />
                            </div>
                            {usuario.tipo === "avaliador" && (
                                <div>
                                    <label className="block text-sm font-semibold text-innovate-dark mb-2">Especialidade</label>
                                    <input
                                        name="especialidade"
                                        type="text"
                                        className="w-full p-3 border border-innovate-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-innovate-accent transition"
                                        value={usuario.especialidade}
                                        onChange={handleChange}
                                    />
                                    {errors.especialidade && <span className="text-red-500 text-sm mt-1 block">{errors.especialidade}</span>}
                                </div>
                            )}
                            <button
                                type="submit"
                                className="w-full bg-innovate-blue hover:bg-innovate-accent text-white font-semibold py-3 rounded-lg transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                disabled={Object.keys(errors).length > 0}
                            >
                                Criar Colaborador
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </div>
    );
};

export default UsuarioForm;