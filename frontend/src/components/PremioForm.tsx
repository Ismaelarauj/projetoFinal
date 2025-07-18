import React, { useState, useEffect } from "react";
import axios from "axios";

interface CronogramaItem {
    dataInicio: string;
    descricao: string;
    dataFim: string;
}

const PremioForm: React.FC<{ onCreate?: () => void }> = ({ onCreate }) => {
    const [premio, setPremio] = useState({ nome: "", descricao: "", cronograma: [] as CronogramaItem[], ano: "" });
    const [premiosCadastrados, setPremiosCadastrados] = useState<{ id: number; nome: string; ano: number }[]>([]);
    const [feedback, setFeedback] = useState<string | null>(null);

    useEffect(() => {
        const fetchPremios = async () => {
            try {
                const response = await axios.get("http://localhost:3001/premios");
                setPremiosCadastrados(response.data.map((p: any) => ({ id: p.id, nome: p.nome, ano: p.ano })));
            } catch (error) {
                setFeedback("Erro ao carregar prêmios cadastrados.");
            }
        };
        fetchPremios();
    }, []);

    const handleAddCronograma = () => {
        setPremio(prev => ({
            ...prev,
            cronograma: [...prev.cronograma, { dataInicio: "", descricao: "", dataFim: "" }]
        }));
    };

    const handleRemoveCronograma = (index: number) => {
        setPremio(prev => ({
            ...prev,
            cronograma: prev.cronograma.filter((_, i) => i !== index)
        }));
    };

    const handleCronogramaChange = (index: number, field: keyof CronogramaItem, value: string) => {
        setPremio(prev => ({
            ...prev,
            cronograma: prev.cronograma.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            )
        }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setPremio(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const anoNum = parseInt(premio.ano);
        if (!premio.nome.trim() || !premio.descricao.trim() || premio.cronograma.length === 0 || isNaN(anoNum) || anoNum <= 0) {
            setFeedback("Todos os campos são obrigatórios, incluindo pelo menos um cronograma, e ano deve ser válido");
            return;
        }

        try {
            const validCronograma = premio.cronograma.map(item => {
                if (!item.dataInicio || !item.dataFim || !item.descricao.trim()) {
                    throw new Error("Todas as partes do cronograma (data de início, descrição e data de fim) são obrigatórias.");
                }
                return {
                    ...item,
                    dataInicio: new Date(item.dataInicio).toISOString(),
                    dataFim: new Date(item.dataFim).toISOString()
                };
            });

            const payload = {
                nome: premio.nome.trim(),
                descricao: premio.descricao.trim(),
                cronograma: validCronograma,
                ano: anoNum
            };

            const response = await axios.post("http://localhost:3001/premios", payload);
            setFeedback("Prêmio criado com sucesso!");
            setPremio({ nome: "", descricao: "", cronograma: [], ano: "" });
            if (onCreate) onCreate();
            const updatedPremios = await axios.get("http://localhost:3001/premios");
            setPremiosCadastrados(updatedPremios.data.map((p: any) => ({ id: p.id, nome: p.nome, ano: p.ano })));
        } catch (error: any) {
            setFeedback(error.response?.data?.message || "Erro ao criar prêmio");
        }
    };

    return (
        <div className="min-h-screen bg-innovate-gray">
            <section className="bg-hero-pattern bg-cover bg-center py-20 text-center text-innovate-dark">
                <h2 className="text-4xl font-display mb-4">Crie um Novo Prêmio</h2>
                <p className="text-lg max-w-2xl mx-auto">Reconheça a excelência nos projetos do Innovate Hub.</p>
            </section>
            <section className="max-w-6xl mx-auto px-6 py-12">
                <div className="bg-white rounded-xl shadow-xl p-8 border border-innovate-gray">
                    <h3 className="text-2xl font-display text-innovate-blue mb-6 text-center">Novo Prêmio</h3>
                    {feedback && (
                        <div className="mb-4 p-4 rounded-lg text-center font-semibold" style={{ backgroundColor: feedback.includes("Erro") ? "#f8d7da" : "#d4edda", color: feedback.includes("Erro") ? "#721c24" : "#155724" }}>
                            {feedback}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-innovate-dark mb-2">Nome</label>
                            <input
                                type="text"
                                name="nome"
                                className="w-full p-3 border border-innovate-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-innovate-accent transition"
                                value={premio.nome}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-innovate-dark mb-2">Descrição</label>
                            <textarea
                                name="descricao"
                                className="w-full p-3 border border-innovate-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-innovate-accent transition"
                                value={premio.descricao}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-innovate-dark mb-2">Cronograma</label>
                            {premio.cronograma.map((item, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-innovate-dark mb-2">Data de Início</label>
                                        <input
                                            type="date"
                                            className="w-full p-3 border border-innovate-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-innovate-accent transition"
                                            value={item.dataInicio}
                                            onChange={(e) => handleCronogramaChange(index, "dataInicio", e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-innovate-dark mb-2">Descrição</label>
                                        <input
                                            type="text"
                                            className="w-full p-3 border border-innovate-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-innovate-accent transition"
                                            value={item.descricao}
                                            onChange={(e) => handleCronogramaChange(index, "descricao", e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-innovate-dark mb-2">Data de Fim</label>
                                        <input
                                            type="date"
                                            className="w-full p-3 border border-innovate-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-innovate-accent transition"
                                            value={item.dataFim}
                                            onChange={(e) => handleCronogramaChange(index, "dataFim", e.target.value)}
                                            required
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        className="md:col-span-3 mt-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg transition duration-300"
                                        onClick={() => handleRemoveCronograma(index)}
                                    >
                                        Remover
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                className="w-full bg-innovate-blue hover:bg-innovate-accent text-white font-semibold py-2 rounded-lg transition duration-300"
                                onClick={handleAddCronograma}
                            >
                                Adicionar Cronograma
                            </button>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-innovate-dark mb-2">Ano</label>
                            <input
                                type="number"
                                name="ano"
                                className="w-full p-3 border border-innovate-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-innovate-accent transition"
                                value={premio.ano}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="md:col-span-2">
                            <button
                                type="submit"
                                className="w-full bg-innovate-blue hover:bg-innovate-accent text-white font-semibold py-3 rounded-lg transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                disabled={!premio.nome.trim() || !premio.descricao.trim() || premio.cronograma.length === 0 || !premio.ano.trim() || parseInt(premio.ano) <= 0}
                            >
                                Criar Prêmio
                            </button>
                        </div>
                    </form>
                    <div className="mt-8">
                        <h4 className="text-xl font-display text-innovate-blue mb-4">Prêmios Cadastrados</h4>
                        <ul className="list-disc pl-5">
                            {premiosCadastrados.map((p) => (
                                <li key={p.id} className="text-innovate-dark">{p.nome} (Ano: {p.ano})</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default PremioForm;