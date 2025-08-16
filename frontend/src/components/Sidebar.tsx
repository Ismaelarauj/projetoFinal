import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUser,
    faTrophy,
    faDiagramProject,
    faPenToSquare,
    faUserPlus,
    faRightFromBracket,
    faPenNib,
    faCheckCircle,
    faUserShield,
    faList,
    faPlus,
    faAward,
    faClipboardList, // Novo ícone para Avaliações
    faEye // Novo ícone para Minhas Avaliações
} from "@fortawesome/free-solid-svg-icons";

interface SidebarProps {
    userType: string | null;
    isAuthenticated: boolean;
    handleLogout: () => void;
    handleRefresh: () => void;
    openUserForm: (initialData?: any) => void;
    isMinimized: boolean;
    toggleMinimize: (minimized: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ userType, isAuthenticated, handleLogout, handleRefresh, openUserForm, isMinimized, toggleMinimize }) => {
    const [expandedSection, setExpandedSection] = useState<string | null>(null);

    if (!isAuthenticated) return null;

    const toggleExpand = (section: string | null) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    return (
        <div
            className={`h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-6 shadow-2xl transition-all duration-300 ${
                isMinimized ? "w-16" : "w-64"
            }`}
        >
            <div className="mb-8 flex items-center">
                <div
                    onClick={() => toggleMinimize(!isMinimized)}
                    className="w-12 h-12 bg-innovate-accent rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
                >
                    <span className="text-xl font-display text-white">IH</span>
                </div>
                {!isMinimized && (
                    <h2 className="text-2xl font-display text-innovate-blue ml-3">Innovate Hub</h2>
                )}
            </div>
            {userType === "admin" && (
                <>
                    <div className="mb-4">
                        <button
                            onClick={() => { toggleExpand("users"); toggleMinimize(false); }}
                            className="w-full flex items-center p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors duration-200 shadow-md"
                        >
                            <FontAwesomeIcon icon={faUser} className="text-innovate-accent mr-3" />
                            {!isMinimized && expandedSection === "users" && <span className="text-white font-sans">Usuários</span>}
                        </button>
                        {!isMinimized && expandedSection === "users" && (
                            <ul className="pl-6 mt-2 space-y-2">
                                <li>
                                    <Link
                                        to="/autores"
                                        className="flex items-center p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors duration-200"
                                    >
                                        <FontAwesomeIcon icon={faPenNib} className="text-innovate-accent mr-3" />
                                        <span className="text-white font-sans">Ver Autores</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/avaliadores"
                                        className="flex items-center p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors duration-200"
                                    >
                                        <FontAwesomeIcon icon={faCheckCircle} className="text-innovate-accent mr-3" />
                                        <span className="text-white font-sans">Ver Avaliadores</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/admins"
                                        className="flex items-center p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors duration-200"
                                    >
                                        <FontAwesomeIcon icon={faUserShield} className="text-innovate-accent mr-3" />
                                        <span className="text-white font-sans">Ver Admin</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/novo-usuario"
                                        className="flex items-center p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors duration-200"
                                        onClick={handleRefresh}
                                    >
                                        <FontAwesomeIcon icon={faUserPlus} className="text-innovate-accent mr-3" />
                                        <span className="text-white font-sans">Criar Usuário</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/meus-dados"
                                        className="flex items-center p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors duration-200"
                                    >
                                        <FontAwesomeIcon icon={faPenToSquare} className="text-innovate-accent mr-3" />
                                        <span className="text-white font-sans">Meus Dados</span>
                                    </Link>
                                </li>
                            </ul>
                        )}
                    </div>
                    <div className="mb-4">
                        <button
                            onClick={() => { toggleExpand("premios"); toggleMinimize(false); }}
                            className="w-full flex items-center p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors duration-200 shadow-md"
                        >
                            <FontAwesomeIcon icon={faTrophy} className="text-innovate-accent mr-3" />
                            {!isMinimized && expandedSection === "premios" && <span className="text-white font-sans">Prêmios</span>}
                        </button>
                        {!isMinimized && expandedSection === "premios" && (
                            <ul className="pl-6 mt-2 space-y-2">
                                <li>
                                    <Link
                                        to="/premios"
                                        className="flex items-center p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors duration-200"
                                    >
                                        <FontAwesomeIcon icon={faList} className="text-innovate-accent mr-3" />
                                        <span className="text-white font-sans">Ver Todos</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/novo-premio"
                                        className="flex items-center p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors duration-200"
                                        onClick={handleRefresh}
                                    >
                                        <FontAwesomeIcon icon={faPlus} className="text-innovate-accent mr-3" />
                                        <span className="text-white font-sans">Criar Prêmio</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/meus-premios"
                                        className="flex items-center p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors duration-200"
                                    >
                                        <FontAwesomeIcon icon={faAward} className="text-innovate-accent mr-3" />
                                        <span className="text-white font-sans">Meus Prêmios</span>
                                    </Link>
                                </li>
                            </ul>
                        )}
                    </div>
                    <div className="mb-4">
                        <button
                            onClick={() => { toggleExpand("projetos"); toggleMinimize(false); }}
                            className="w-full flex items-center p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors duration-200 shadow-md"
                        >
                            <FontAwesomeIcon icon={faDiagramProject} className="text-innovate-accent mr-3" />
                            {!isMinimized && expandedSection === "projetos" && <span className="text-white font-sans">Projetos</span>}
                        </button>
                        {!isMinimized && expandedSection === "projetos" && (
                            <ul className="pl-6 mt-2 space-y-2">
                                <li>
                                    <Link
                                        to="/projetos-publicos"
                                        className="flex items-center p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors duration-200"
                                    >
                                        <FontAwesomeIcon icon={faList} className="text-innovate-accent mr-3" />
                                        <span className="text-white font-sans">Ver Todos</span>
                                    </Link>
                                </li>
                            </ul>
                        )}
                    </div>
                </>
            )}
            {(userType === "autor" || userType === "avaliador") && (
                <>
                    <div className="mb-4">
                        <button
                            onClick={() => { toggleExpand("meus-dados"); toggleMinimize(false); }}
                            className="w-full flex items-center p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors duration-200 shadow-md"
                        >
                            <FontAwesomeIcon icon={faPenToSquare} className="text-innovate-accent mr-3" />
                            {!isMinimized && expandedSection === "meus-dados" && <span className="text-white font-sans">Meus Dados</span>}
                        </button>
                        {!isMinimized && expandedSection === "meus-dados" && (
                            <ul className="pl-6 mt-2 space-y-2">
                                <li>
                                    <Link
                                        to="/meus-dados"
                                        className="flex items-center p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors duration-200"
                                    >
                                        <FontAwesomeIcon icon={faPenToSquare} className="text-innovate-accent mr-3" />
                                        <span className="text-white font-sans">Editar</span>
                                    </Link>
                                </li>
                            </ul>
                        )}
                    </div>
                    {userType === "autor" && (
                        <div className="mb-4">
                            <button
                                onClick={() => { toggleExpand("projetos"); toggleMinimize(false); }}
                                className="w-full flex items-center p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors duration-200 shadow-md"
                            >
                                <FontAwesomeIcon icon={faDiagramProject} className="text-innovate-accent mr-3" />
                                {!isMinimized && expandedSection === "projetos" && <span className="text-white font-sans">Projetos</span>}
                            </button>
                            {!isMinimized && expandedSection === "projetos" && (
                                <ul className="pl-6 mt-2 space-y-2">
                                    <li>
                                        <Link
                                            to="/meus-projetos"
                                            className="flex items-center p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors duration-200"
                                        >
                                            <FontAwesomeIcon icon={faDiagramProject} className="text-innovate-accent mr-3" />
                                            <span className="text-white font-sans">Meus Projetos</span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="/novo-projeto"
                                            className="flex items-center p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors duration-200"
                                            onClick={handleRefresh}
                                        >
                                            <FontAwesomeIcon icon={faPlus} className="text-innovate-accent mr-3" />
                                            <span className="text-white font-sans">Criar Projeto</span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="/projetos-publicos"
                                            className="flex items-center p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors duration-200"
                                        >
                                            <FontAwesomeIcon icon={faList} className="text-innovate-accent mr-3" />
                                            <span className="text-white font-sans">Ver Todos</span>
                                        </Link>
                                    </li>
                                </ul>
                            )}
                        </div>
                    )}
                    {userType === "avaliador" && (
                        <>
                            <div className="mb-4">
                                <button
                                    onClick={() => { toggleExpand("projetos"); toggleMinimize(false); }}
                                    className="w-full flex items-center p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors duration-200 shadow-md"
                                >
                                    <FontAwesomeIcon icon={faDiagramProject} className="text-innovate-accent mr-3" />
                                    {!isMinimized && expandedSection === "projetos" && <span className="text-white font-sans">Projetos</span>}
                                </button>
                                {!isMinimized && expandedSection === "projetos" && (
                                    <ul className="pl-6 mt-2 space-y-2">
                                        <li>
                                            <Link
                                                to="/projetos-publicos"
                                                className="flex items-center p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors duration-200"
                                            >
                                                <FontAwesomeIcon icon={faList} className="text-innovate-accent mr-3" />
                                                <span className="text-white font-sans">Ver Todos</span>
                                            </Link>
                                        </li>
                                    </ul>
                                )}
                            </div>
                            <div className="mb-4">
                                <button
                                    onClick={() => { toggleExpand("avaliacoes"); toggleMinimize(false); }}
                                    className="w-full flex items-center p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors duration-200 shadow-md"
                                >
                                    <FontAwesomeIcon icon={faClipboardList} className="text-innovate-accent mr-3" />
                                    {!isMinimized && expandedSection === "avaliacoes" && <span className="text-white font-sans">Avaliações</span>}
                                </button>
                                {!isMinimized && expandedSection === "avaliacoes" && (
                                    <ul className="pl-6 mt-2 space-y-2">
                                        <li>
                                            <Link
                                                to="/minhas-avaliacoes"
                                                className="flex items-center p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors duration-200"
                                            >
                                                <FontAwesomeIcon icon={faEye} className="text-innovate-accent mr-3" />
                                                <span className="text-white font-sans">Minhas Avaliações</span>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                to="/nova-avaliacao"
                                                className="flex items-center p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors duration-200"
                                                onClick={handleRefresh}
                                            >
                                                <FontAwesomeIcon icon={faCheckCircle} className="text-innovate-accent mr-3" />
                                                <span className="text-white font-sans">Criar Avaliação</span>
                                            </Link>
                                        </li>
                                    </ul>
                                )}
                            </div>
                        </>
                    )}
                </>
            )}
            <div className="mt-auto">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors duration-200 shadow-md text-red-400"
                >
                    <FontAwesomeIcon icon={faRightFromBracket} className="mr-3" />
                    {!isMinimized && <span className="text-red-400 font-sans">Logout</span>}
                </button>
            </div>
        </div>
    );
};

export default Sidebar;