import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ProjetoList.css";
import { FaPlus } from "react-icons/fa";

interface Projeto {
    id: number;
    areaTematica: string;
    titulo: string;
    resumo: string;
    dataEnvio: string;
    avaliado: boolean;
    vencedor: boolean;
    autores: { id: number; nome: string }[];
    avaliacoes?: { id: number; nota: number | string | null; parecer: string; dataAvaliacao: string; avaliador?: { id: number; nome: string } }[];
}

const ProjetoList: React.FC = () => {
    const [projetos, setProjetos] = useState<Projeto[]>([]);
    const [filtro, setFiltro] = useState<"todos" | "nao-avaliados" | "avaliados" | "vencedores">("todos");
    const [expanded, setExpanded] = useState<number[]>([]);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [refresh, setRefresh] = useState(0);

    useEffect(() => {
        const fetchProjetos = async () => {
            const baseUrl = "http://localhost:3001";
            const url = `${baseUrl}/projetos`;
            try {
                const response = await axios.get(url, { params: { relations: "avaliacoes,avaliacoes.avaliador,autores" } });
                if (response.data.message) {
                    setProjetos([]);
                    setFeedback("Erro: Não foi possível carregar os projetos.");
                } else {
                    const data = Array.isArray(response.data) ? response.data : [];
                    console.log("Dados recebidos (brutos):", data);
                    data.forEach((projeto: Projeto) => {
                        console.log(`Projeto ID ${projeto.id} - Avaliações:`, projeto.avaliacoes);
                    });
                    setProjetos(data);
                    setFeedback(null);
                }
            } catch (error: any) {
                const errorMsg = error.response?.data?.message || error.message || "Erro desconhecido";
                if (errorMsg.includes("ID inválido")) {
                    setProjetos([]);
                    setFeedback("Erro: ID inválido detectado.");
                } else {
                    setProjetos([]);
                    setFeedback(`Erro ao buscar projetos: ${errorMsg}`);
                }
            }
        };
        fetchProjetos();
    }, [filtro, refresh]);

    const projetosFiltrados = projetos
        .filter((projeto) => {
            if (filtro === "todos") return true;
            if (filtro === "nao-avaliados") return !projeto.avaliado;
            if (filtro === "avaliados") return projeto.avaliado;
            if (filtro === "vencedores") return projeto.avaliacoes && projeto.avaliacoes.length > 0;
            return false;
        })
        .map((projeto) => {
            const total = projeto.avaliacoes?.reduce((sum, a) => {
                const notaNum = typeof a.nota === "string" ? parseFloat(a.nota) : (typeof a.nota === "number" ? a.nota : 0);
                console.log(`Processando avaliação para projeto ${projeto.id}: nota=${notaNum}`, a);
                return sum + (notaNum || 0);
            }, 0) || 0;
            return {
                ...projeto,
                totalNotas: Number(total),
                ano: new Date(projeto.dataEnvio).getFullYear(),
            };
        })
        .sort((a, b) => b.totalNotas - a.totalNotas)
        .slice(0, filtro === "vencedores" ? 3 : projetos.length);

    const toggleExpand = (id: number) => {
        setExpanded((prev) => (prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]));
    };

    const handleRefresh = () => {
        setRefresh(prev => prev + 1);
    };

    return (
        <div className="App min-h-screen bg-innovate-gray">
            <section className="bg-hero-pattern bg-cover bg-center py-20 text-center text-innovate-dark flex justify-center">
                <div className="text-center">
                    <h2 className="text-4xl font-display mb-4">Explore os Projetos do Innovate Hub</h2>
                    <p className="text-lg max-w-2xl mx-auto" style={{ textAlign: 'center' }}>Descubra as inovações que estão moldando o futuro.</p>
                </div>
            </section>
            <section className="max-w-6xl mx-auto px-6 py-12">
                <h3 className="text-2xl font-display text-innovate-blue mb-6 text-center">Lista de Projetos</h3>
                {feedback && (
                    <div className="mb-4 p-4 rounded-lg text-center font-semibold" style={{ backgroundColor: "#f8d7da", color: "#721c24" }}>
                        {feedback}
                    </div>
                )}
                <div className="mb-6">
                    <select
                        className="p-3 border border-innovate-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-innovate-accent transition"
                        onChange={(e) => setFiltro(e.target.value as any)}
                        value={filtro}
                    >
                        <option value="todos">Todos</option>
                        <option value="nao-avaliados">Não Avaliados</option>
                        <option value="avaliados">Avaliados</option>
                        <option value="vencedores">Vencedores</option>
                    </select>
                    <button
                        onClick={handleRefresh}
                        className="ml-4 p-2 bg-innovate-blue text-white rounded-lg hover:bg-innovate-accent transition"
                    >
                        Recarregar
                    </button>
                </div>
                <div className="grid grid-cols-1 gap-6">
                    {projetosFiltrados.map((projeto, index) => {
                        const isExpanded = expanded.includes(projeto.id);
                        const avaliacaoCount = projeto.avaliacoes?.length ?? 0;
                        const avaliadores = projeto.avaliacoes?.flatMap(a => a.avaliador?.nome || []).filter(Boolean).join(", ") || "Nenhum";

                        let medalImage = "";
                        if (filtro === "vencedores" && index < 3) {
                            if (index === 0) medalImage = "/medals/gold.png";
                            if (index === 1) medalImage = "/medals/silver.png";
                            if (index === 2) medalImage = "/medals/bronze.png";
                        }

                        return (
                            <div key={projeto.id} className="bg-white rounded-xl shadow-md p-4 border border-innovate-gray">
                                <div className="flex items-center justify-between mb-4">
                                    {medalImage && (
                                        <img
                                            src={medalImage}
                                            alt={`${index + 1}º lugar`}
                                            className="w-12 h-12 mr-4"
                                        />
                                    )}
                                    {filtro === "vencedores" && (
                                        <button
                                            onClick={() => toggleExpand(projeto.id)}
                                            className="text-innovate-blue hover:text-innovate-accent transition"
                                        >
                                            <FaPlus />
                                        </button>
                                    )}
                                </div>
                                <div className="table-container flex flex-row gap-4" style={{ display: 'flex', flexWrap: 'nowrap' }}>
                                    <table className="planilha w-1/2">
                                        <thead>
                                        <tr className="bg-innovate-blue text-white">
                                            <th className="border border-gray-300 p-2">Dados do Projeto</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        <tr>
                                            <td className="border border-gray-300 p-2 font-semibold">Título</td>
                                        </tr>
                                        <tr>
                                            <td className="border border-gray-300 p-2">{projeto.titulo}</td>
                                        </tr>
                                        <tr>
                                            <td className="border border-gray-300 p-2 font-semibold">Área Temática</td>
                                        </tr>
                                        <tr>
                                            <td className="border border-gray-300 p-2">{projeto.areaTematica}</td>
                                        </tr>
                                        <tr>
                                            <td className="border border-gray-300 p-2 font-semibold">Resumo</td>
                                        </tr>
                                        <tr>
                                            <td className="border border-gray-300 p-2">{projeto.resumo}</td>
                                        </tr>
                                        <tr>
                                            <td className="border border-gray-300 p-2 font-semibold">Data de Envio</td>
                                        </tr>
                                        <tr>
                                            <td className="border border-gray-300 p-2">{new Date(projeto.dataEnvio).toLocaleDateString()}</td>
                                        </tr>
                                        <tr>
                                            <td className="border border-gray-300 p-2 font-semibold">Status</td>
                                        </tr>
                                        <tr>
                                            <td className="border border-gray-300 p-2">{projeto.avaliado ? "Avaliado" : "Não Avaliado"}</td>
                                        </tr>
                                        <tr>
                                            <td className="border border-gray-300 p-2 font-semibold">Autores</td>
                                        </tr>
                                        <tr>
                                            <td className="border border-gray-300 p-2">{projeto.autores.map((autor) => autor.nome).join(", ")}</td>
                                        </tr>
                                        <tr>
                                            <td className="border border-gray-300 p-2 font-semibold">Total de Notas</td>
                                        </tr>
                                        <tr>
                                            <td className="border border-gray-300 p-2">{typeof projeto.totalNotas === "number" ? projeto.totalNotas.toFixed(1) : "0.0"}</td>
                                        </tr>
                                        <tr>
                                            <td className="border border-gray-300 p-2 font-semibold">Avaliador(es)</td>
                                        </tr>
                                        <tr>
                                            <td className="border border-gray-300 p-2">{avaliadores}</td>
                                        </tr>
                                        </tbody>
                                    </table>

                                    {(filtro !== "vencedores" || (filtro === "vencedores" && isExpanded)) && avaliacaoCount > 0 && (
                                        <table className="planilha w-1/2">
                                            <thead>
                                            <tr className="bg-innovate-blue text-white">
                                                <th className="border border-gray-300 p-2">Dados das Avaliações</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {projeto.avaliacoes?.map((avaliacao, index) => (
                                                <tr key={avaliacao.id}>
                                                    <td className="border border-gray-300 p-2">
                                                        <div>
                                                            <p className="font-semibold">Avaliação {index + 1}:</p>
                                                            <p>Nota: {avaliacao.nota !== null && typeof avaliacao.nota !== "undefined" ? parseFloat(String(avaliacao.nota)).toFixed(1) : "0.0"}</p>
                                                            <p>Parecer: {avaliacao.parecer || "Sem parecer"}</p>
                                                            <p>Data: {new Date(avaliacao.dataAvaliacao).toLocaleDateString()}</p>
                                                            <p>Avaliador: {avaliacao.avaliador?.nome || "Desconhecido"}</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )) || <tr><td className="border border-gray-300 p-2">Ainda não foi avaliado</td></tr>}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                                {isExpanded && filtro === "vencedores" && (
                                    <div className="table-container flex flex-row gap-4" style={{ display: 'flex', flexWrap: 'nowrap' }}>
                                        {/* Tabela de Avaliações já exibida no bloco acima quando expandido */}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
};

export default ProjetoList;