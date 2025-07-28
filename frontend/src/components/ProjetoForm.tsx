import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";

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

const ProjetoForm: React.FC<{ onCreate?: () => void }> = ({ onCreate }) => {
    const [projeto, setProjeto] = useState({ areaTematica: "", titulo: "", resumo: "", premioId: 0 });
    const [autorIds, setAutorIds] = useState<number[]>([]);
    const [autores, setAutores] = useState<AutorOption[]>([]);
    const [premios, setPremios] = useState<Premio[]>([]);
    const [dataEnvio, setDataEnvio] = useState(new Date().toISOString().split("T")[0]);
    const [feedback, setFeedback] = useState<string | null>(null);

    useEffect(() => {
        const fetchAutores = async () => {
            try {
                const response = await axios.get("http://localhost:3001/autores");
                const autorOptions = response.data.map((autor: { id: number; nome: string }) => ({
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
                setPremios(response.data);
                setFeedback(null);
            } catch (error) {
                setFeedback("Erro ao buscar prêmios. Tente novamente mais tarde.");
            }
        };
        fetchAutores();
        fetchPremios();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!projeto.areaTematica.trim() || !projeto.titulo.trim() || !projeto.resumo.trim() || !projeto.premioId) {
            setFeedback("Todos os campos são obrigatórios.");
            return;
        }
        try {
            await axios.post("http://localhost:3001/projetos", {
                projeto: { ...projeto },
                autorIds,
            });
            setFeedback("Projeto criado com sucesso!");
            setProjeto({ areaTematica: "", titulo: "", resumo: "", premioId: 0 });
            setAutorIds([]);
            setDataEnvio(new Date().toISOString().split("T")[0]);
            if (onCreate) onCreate();
        } catch (error: any) {
            setFeedback(error.response?.data?.message || "Erro ao criar projeto");
        }
    };

    const handleAutorChange = (selectedOptions: any) => {
        const selectedIds = selectedOptions ? selectedOptions.map((option: AutorOption) => option.value) : [];
        setAutorIds(selectedIds);
    };

    return (
        <div className="min-h-screen bg-innovate-gray">
            <section className="bg-hero-pattern bg-cover bg-center py-20 text-center text-innovate-dark flex justify-center">
                <div className="text-center">
                    <h2 className="text-4xl font-display mb-4">Crie um Novo Projeto</h2>
                    <p className="text-lg max-w-2xl mx-auto" style={{ textAlign: 'center' }}>Transforme suas ideias em realidade com o Innovate Hub.</p>
                </div>
            </section>
            <section className="max-w-6xl mx-auto px-6 py-12">
                <div className="bg-white rounded-xl shadow-xl p-8 border border-innovate-gray">
                    <h3 className="text-2xl font-display text-innovate-blue mb-6 text-center">Novo Projeto</h3>
                    {feedback && (
                        <div className="mb-4 p-4 rounded-lg text-center font-semibold" style={{ backgroundColor: feedback.includes("sucesso") ? "#d4edda" : "#f8d7da", color: feedback.includes("sucesso") ? "#155724" : "#721c24" }}>
                            {feedback}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-innovate-dark mb-2">Área Temática</label>
                            <input
                                type="text"
                                className="w-full p-3 border border-innovate-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-innovate-accent transition"
                                value={projeto.areaTematica}
                                onChange={(e) => setProjeto({ ...projeto, areaTematica: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-innovate-dark mb-2">Título</label>
                            <input
                                type="text"
                                className="w-full p-3 border border-innovate-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-innovate-accent transition"
                                value={projeto.titulo}
                                onChange={(e) => setProjeto({ ...projeto, titulo: e.target.value })}
                                required
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-innovate-dark mb-2">Resumo</label>
                            <textarea
                                className="w-full p-3 border border-innovate-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-innovate-accent transition"
                                value={projeto.resumo}
                                onChange={(e) => setProjeto({ ...projeto, resumo: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-innovate-dark mb-2">Prêmio</label>
                            <select
                                className="w-full p-3 border border-innovate-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-innovate-accent transition"
                                value={projeto.premioId}
                                onChange={(e) => setProjeto({ ...projeto, premioId: parseInt(e.target.value) })}
                                required
                            >
                                <option value={0}>Selecione um prêmio</option>
                                {premios.map((premio) => (
                                    <option key={premio.id} value={premio.id}>{premio.nome} (Ano: {premio.ano})</option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-innovate-dark mb-2">Autores</label>
                            <Select
                                isMulti
                                options={autores}
                                value={autores.filter((autor) => autorIds.includes(autor.value))}
                                onChange={handleAutorChange}
                                className="w-full border border-innovate-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-innovate-accent transition"
                                classNamePrefix="select"
                                placeholder="Selecione os autores..."
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-innovate-dark mb-2">Data de Envio</label>
                            <input
                                type="text"
                                className="w-full p-3 border border-innovate-gray rounded-lg bg-gray-100 cursor-not-allowed"
                                value={dataEnvio}
                                readOnly
                            />
                        </div>
                        <div className="md:col-span-2">
                            <button
                                type="submit"
                                className="w-full bg-innovate-blue hover:bg-innovate-accent text-white font-semibold py-3 rounded-lg transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                disabled={!projeto.areaTematica.trim() || !projeto.titulo.trim() || !projeto.resumo.trim() || !projeto.premioId || autorIds.length === 0}
                            >
                                Criar Projeto
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </div>
    );
};

export default ProjetoForm;