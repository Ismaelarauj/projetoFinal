import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTimes} from "@fortawesome/free-solid-svg-icons";

interface CronogramaItem {
    dataInicio: string;
    descricao: string;
    dataFim: string;
}

interface Premio {
    id: number;
    nome: string;
    ano: number;
    cronograma: CronogramaItem[];
}

const PremioList: React.FC = () => {
    const [premios, setPremios] = useState<Premio[]>([]);
    const [filteredPremios, setFilteredPremios] = useState<Premio[]>([]);
    const [feedback, setFeedback] = useState<{ message: string; isSuccess: boolean } | null>(null);
    const [filter, setFilter] = useState<"todos" | "ativos" | "inativos">("todos");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPremios = async () => {
            try {
                const response = await axios.get("http://localhost:3001/premios");
                console.log("Dados retornados do backend:", response.data);
                setPremios(response.data);
                setFeedback(null);
            } catch (error) {
                setFeedback({ message: "Erro ao carregar prêmios cadastrados.", isSuccess: false });
                console.error("Erro ao buscar prêmios:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPremios();
    }, []);

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
                    <h2 className="text-4xl font-bold font-sans mb-4 drop-shadow-md">Explore os Prêmios do Innovate Hub</h2>
                    <p className="text-lg font-medium max-w-2xl mx-auto">Conheça os prêmios que celebram a excelência e a inovação.</p>
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
                                <h3 className="text-xl font-semibold text-[#1E3A8A] mb-2">{p.nome}</h3>
                                <p className="text-gray-700 mb-2">Ano: {p.ano}</p>
                                <div className="text-sm text-gray-600">
                                    <p className="font-medium">Cronograma:</p>
                                    {p.cronograma.map((item, index) => (
                                        <p key={index} className="ml-2">
                                            {item.descricao} ({new Date(item.dataInicio).toLocaleDateString()} - {new Date(item.dataFim).toLocaleDateString()})
                                        </p>
                                    ))}
                                </div>
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
            </section>
        </div>
    );
};

export default PremioList;