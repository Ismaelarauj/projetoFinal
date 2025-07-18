import React, { useEffect, useState } from "react";
import axios from "axios";

interface Autor {
    id: number;
    nome: string;
    projetos: { id: number; titulo: string }[];
}

const AutorList: React.FC = () => {
    const [autores, setAutores] = useState<Autor[]>([]);

    const fetchAutores = async () => {
        try {
            const response = await axios.get("http://localhost:3001/autores");
            if (response.data.message) {
                console.log(response.data.message);
                setAutores([]);
            } else {
                setAutores(response.data);
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || "Erro desconhecido";
            console.error("Erro ao buscar autores:", errorMessage);
            setAutores([]);
        }
    };

    useEffect(() => {
        fetchAutores();
    }, []);

    return (
        <div className="min-h-screen bg-innovate-gray">
            <section className="bg-hero-pattern bg-cover bg-center py-20 text-center text-innovate-dark">
                <h2 className="text-4xl font-display mb-4">Explore os Autores do Innovate Hub</h2>
                <p className="text-lg max-w-2xl mx-auto">Conheça os criadores por trás dos projetos inovadores.</p>
            </section>
            <section className="max-w-6xl mx-auto px-6 py-12">
                <h3 className="text-2xl font-display text-innovate-blue mb-6 text-center">Lista de Autores</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {autores.map((autor) => (
                        <div key={autor.id} className="bg-white rounded-xl shadow-md p-6 border border-innovate-gray hover:shadow-lg transition">
                            <h3 className="text-xl font-semibold text-innovate-dark">{autor.nome}</h3>
                            <p className="text-gray-600">Projetos: {autor.projetos.map((projeto) => projeto.titulo).join(", ") || "Nenhum"}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default AutorList;