import React, { useState, useEffect, Dispatch, SetStateAction } from "react";
import { useNavigate, useLocation, Link, Routes, Route } from "react-router-dom";
import ProjetoList from "./components/ProjetoList";
import ProjetoForm from "./components/ProjetoForm";
import AutorList from "./components/AutorList";
import UsuarioForm from "./components/UsuarioForm";
import AvaliacaoForm from "./components/AvaliacaoForm";
import PremioForm from "./components/PremioForm";
import Login from "./components/Login";
import Sidebar from "./components/Sidebar";
import MeusProjetos from "./components/MeusProjetos";
import MinhasAvaliacoes from "./components/MinhasAvaliacoes";
import MeusDados from "./components/MeusDados";
import AvaliadorList from "./components/AvaliadorList";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { UsuarioCompleto } from "./types/types";
import PremioList from "./components/PremioList";
import MeusPremios from "./components/MeusPremios";

interface JwtPayload {
    id: number;
    email: string;
    tipo: string;
    iat: number;
    exp: number;
}

interface AppContentProps {
    setShowUserForm: (show: boolean) => void;
    handleUserSave: (usuario: Partial<UsuarioCompleto>) => Promise<void>; // Alterado para Partial<UsuarioCompleto>
    handleCancel: () => void;
    handleRefresh: () => void;
    userType: string | null;
    setUserType: Dispatch<SetStateAction<string | null>>;
    navigate: (path: string) => void;
    isAuthenticated: boolean;
    setIsAuthenticated: Dispatch<SetStateAction<boolean>>;
}

const AppContent: React.FC<AppContentProps> = ({
                                                   setShowUserForm,
                                                   handleUserSave,
                                                   handleCancel,
                                                   handleRefresh,
                                                   userType,
                                                   setUserType,
                                                   navigate,
                                                   isAuthenticated,
                                                   setIsAuthenticated,
                                               }) => {
    const [refresh, setRefresh] = useState(0);
    const [currentUser, setCurrentUser] = useState<UsuarioCompleto | null>(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const [isMinimized, setIsMinimized] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const token = localStorage.getItem("token");
        const type = localStorage.getItem("userType");
        let userId = localStorage.getItem("userId");
        console.log("Inicializando fetch - token:", token, "userId inicial:", userId);

        if (token && !userId) {
            try {
                const decoded = jwtDecode<JwtPayload>(token);
                userId = decoded.id.toString();
                if (userId) localStorage.setItem("userId", userId);
                console.log("userId extraído do token:", userId);
            } catch (error) {
                console.error("Erro ao decodificar token:", error);
            }
        }

        if (type !== null) setUserType(type);

        const fetchCurrentUser = async () => {
            setLoadingUser(true);
            if (token && userId) {
                try {
                    const response = await axios.get(`http://localhost:3001/usuarios/${userId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                        timeout: 5000,
                    });
                    setCurrentUser(response.data);
                    console.log("Usuário carregado:", response.data);
                } catch (error: any) {
                    console.error("Erro ao buscar usuário logado:", error.code, error.response?.status, error.response?.data || error.message);
                    setCurrentUser(null);
                }
            } else {
                console.log("Token ou userId ausentes após tentativa de extração:", { token, userId });
                setCurrentUser(null);
            }
            setLoadingUser(false);
        };

        fetchCurrentUser();
    }, [setUserType]);

    useEffect(() => {
        if (location.pathname === "/meus-dados" && isAuthenticated) {
            const token = localStorage.getItem("token");
            let userId = localStorage.getItem("userId");
            console.log("Recarregando usuário - pathname:", location.pathname, "token:", token, "userId inicial:", userId);

            if (token && !userId) {
                try {
                    const decoded = jwtDecode<JwtPayload>(token);
                    userId = decoded.id.toString();
                    if (userId) localStorage.setItem("userId", userId);
                    console.log("userId extraído do token na recarga:", userId);
                } catch (error) {
                    console.error("Erro ao decodificar token na recarga:", error);
                }
            }

            if (token && userId) {
                setLoadingUser(true);
                axios
                    .get(`http://localhost:3001/usuarios/${userId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                        timeout: 5000,
                    })
                    .then((response) => {
                        setCurrentUser(response.data);
                        console.log("Usuário recarregado:", response.data);
                    })
                    .catch((error: any) => {
                        console.error("Erro ao recarregar usuário:", error.code, error.response?.status, error.response?.data || error.message);
                        setCurrentUser(null);
                    })
                    .finally(() => {
                        setLoadingUser(false);
                    });
            } else {
                console.log("Token ou userId ausentes na recarga após tentativa de extração:", { token, userId });
                setCurrentUser(null);
                setLoadingUser(false);
            }
        }
    }, [location.pathname, isAuthenticated]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userType");
        localStorage.removeItem("userId");
        setIsAuthenticated(false);
        setUserType(null);
        setCurrentUser(null);
        navigate("/login");
    };

    const openUserForm = (initialData: UsuarioCompleto | null = null) => {
        setShowUserForm(true);
    };

    const toggleMinimize = (minimized: boolean) => {
        setIsMinimized(minimized);
    };

    if (loadingUser && location.pathname === "/meus-dados") {
        return <div className="p-6">Carregando dados do usuário...</div>;
    }

    const currentUserId = currentUser?.id || parseInt(localStorage.getItem("userId") || "0");

    const handlePremioSave = async (premio: any) => {
        // Função vazia para criação, pois o POST é tratado diretamente em PremioForm
    };

    const handlePremioCancel = () => {
        navigate("/");
    };

    const handleProjectSave = (projectData: any) => {
        console.log("Projeto salvo (lógica temporária)", projectData);
        if (currentUser) {
            const updatedUser: UsuarioCompleto = {
                ...currentUser,
                projetos: currentUser.projetos || [],
                tipo: currentUser.tipo || "autor",
            };
            handleUserSave(updatedUser);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 h-screen flex flex-col">
            {isAuthenticated && (
                <div className="fixed z-40">
                    <Sidebar
                        userType={userType}
                        isAuthenticated={isAuthenticated}
                        handleLogout={handleLogout}
                        handleRefresh={handleRefresh}
                        openUserForm={openUserForm}
                        isMinimized={isMinimized}
                        toggleMinimize={toggleMinimize}
                    />
                </div>
            )}
            <div className={`flex-1 flex flex-col z-10 transition-all duration-300 ${isAuthenticated ? (isMinimized ? "ml-[64px]" : "ml-[256px]") : ""}`}>
                {!isAuthenticated && (
                    <header className="bg-blue-900 text-white p-6 shadow-lg w-full">
                        <div className="max-w-7xl mx-auto flex justify-between items-center">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                                    <span className="text-xl font-semibold text-white">IH</span>
                                </div>
                                <h1 className="text-2xl font-semibold">Innovate Hub</h1>
                            </div>
                            <nav>
                                <ul className="flex space-x-4">
                                    <li><Link to="/" className="text-white hover:text-blue-200 transition">Projetos</Link></li>
                                    <li><Link to="/autores" className="text-white hover:text-blue-200 transition">Autores</Link></li>
                                    <li><Link to="/login" className="text-white hover:text-blue-200 transition">Login</Link></li>
                                </ul>
                            </nav>
                        </div>
                    </header>
                )}
                <main className="flex-1 overflow-auto w-full h-full">
                    <Routes>
                        <Route path="/" element={<ProjetoList key={refresh} />} />
                        <Route
                            path="/novo-projeto"
                            element={
                                <ProjetoForm
                                    project={undefined}
                                    onSave={handleProjectSave}
                                    onCancel={handleCancel}
                                    onCreate={handleRefresh}
                                />
                            }
                        />
                        <Route
                            path="/autores"
                            element={<AutorList userType={userType} onNavigate={navigate} />}
                        />
                        <Route
                            path="/avaliadores"
                            element={<AvaliadorList userType={userType} onNavigate={navigate} />}
                        />
                        <Route
                            path="/novo-usuario"
                            element={
                                <UsuarioForm
                                    initialData={null}
                                    onSave={handleUserSave}
                                    onCancel={handleCancel}
                                    onCreate={handleRefresh}
                                    onNavigate={navigate}
                                    isAdmin={userType === "admin"}
                                    isOpen={true}
                                    currentUserId={currentUserId}
                                    userType={userType}
                                />
                            }
                        />
                        <Route path="/nova-avaliacao" element={<AvaliacaoForm onCreate={handleRefresh} />} />
                        <Route
                            path="/novo-premio"
                            element={<PremioForm onCreate={handleRefresh} onSave={handlePremioSave} onCancel={handlePremioCancel} />}
                        />
                        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} setUserType={setUserType} />} />
                        <Route
                            path="/meus-dados"
                            element={<MeusDados currentUser={currentUser} onSave={handleUserSave} onCancel={handleCancel} userType={userType} navigate={navigate} />}
                        />
                        <Route path="/meus-projetos" element={<MeusProjetos />} />
                        <Route path="/minhas-avaliacoes" element={<MinhasAvaliacoes />} />
                        <Route path="/projetos-publicos" element={<ProjetoList key={refresh} />} />
                        <Route path="/usuarios" element={<AutorList key={refresh} userType={userType} onNavigate={navigate} />} />
                        <Route path="/premios" element={<PremioList />} />
                        <Route path="/meus-premios" element={<MeusPremios />} />
                    </Routes>
                </main>
                <footer className="bg-blue-900 text-white p-4 mt-auto w-full">
                    <div className="max-w-7xl mx-auto text-center">
                        <p>© 2025 Innovate Hub. Todos os direitos reservados.</p>
                        <div className="mt-2 space-x-4">
                            <a href="#" className="hover:text-blue-200">Privacidade</a>
                            <a href="#" className="hover:text-blue-200">Termos</a>
                            <a href="#" className="hover:text-blue-200">Contato</a>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

const App: React.FC = () => {
    const [showUserForm, setShowUserForm] = useState(false);
    const [userType, setUserType] = useState<string | null>(localStorage.getItem("userType"));
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));
    const navigate = useNavigate();
    console.log("App renderizado - isAuthenticated:", isAuthenticated);

    const handleUserSave = async (usuario: Partial<UsuarioCompleto>) => { // Alterado para Partial<UsuarioCompleto>
        const token = localStorage.getItem("token");
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

        try {
            // Verifica se o ID está presente para atualizações
            if (!usuario.id && usuario.id !== 0) {
                throw new Error("ID do usuário é obrigatório.");
            }

            // Cria um objeto com apenas os campos fornecidos
            const cleanData = {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                cpf: usuario.cpf,
                dataNascimento: usuario.dataNascimento,
                telefone: usuario.telefone,
                pais: usuario.pais,
                cidade: usuario.cidade,
                estado: usuario.estado,
                rua: usuario.rua || null,
                avenida: usuario.avenida || null,
                lote: usuario.lote || null,
                numero: usuario.numero || null,
                tipo: usuario.tipo,
                especialidade: usuario.especialidade || null,
                senha: usuario.senha,
            };

            // Remove campos undefined para evitar sobrescrever valores no backend
            const filteredData = Object.fromEntries(
                Object.entries(cleanData).filter(([_, value]) => value !== undefined)
            );

            if (usuario.id === 0) {
                // Criação de novo usuário
                const response = await axios.post("http://localhost:3001/usuarios", filteredData, config);
                console.log("Usuário criado:", response.data);
            } else {
                // Atualização de usuário existente
                const response = await axios.put(`http://localhost:3001/usuarios/${usuario.id}`, filteredData, config);
                console.log("Usuário atualizado:", response.data);
            }
            setShowUserForm(false);
        } catch (error: any) {
            console.error("Erro ao salvar usuário:", error.message);
            throw error;
        }
    };

    const handleCancel = () => {
        setShowUserForm(false);
        console.log("Cancelado");
        if (!isAuthenticated) {
            navigate("/login");
        } else {
            navigate("/");
        }
    };

    const handleRefresh = () => {
        setShowUserForm(false);
    };

    return (
        <AppContent
            setShowUserForm={setShowUserForm}
            handleUserSave={handleUserSave}
            handleCancel={handleCancel}
            handleRefresh={handleRefresh}
            userType={userType}
            setUserType={setUserType}
            navigate={navigate}
            isAuthenticated={isAuthenticated}
            setIsAuthenticated={setIsAuthenticated}
        />
    );
};

export default App;