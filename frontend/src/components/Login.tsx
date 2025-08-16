import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

interface LoginProps {
    setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
    setUserType: React.Dispatch<React.SetStateAction<string | null>>;
}

interface JwtPayload {
    id: number;
    email: string;
    tipo: string;
    iat: number;
    exp: number;
}

const Login: React.FC<LoginProps> = ({ setIsAuthenticated, setUserType }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [animationStep, setAnimationStep] = useState(0); // 0: IH, 1: Separando, 2: Completo
    const navigate = useNavigate();

    useEffect(() => {
        // Controle da animação em etapas
        const steps = [
            () => setTimeout(() => setAnimationStep(1), 100), // Mostra IH e separa
            () => setTimeout(() => setAnimationStep(2), 700), // Completa letra por letra
        ];
        steps.forEach((step, index) => step());
    }, []);

    const handleLogin = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!email.trim() || !password.trim()) {
            setFeedback("Por favor, preencha email e senha.");
            return;
        }

        try {
            const response = await axios.post("http://localhost:3001/login", { email, password });
            setFeedback(`Login bem-sucedido como ${response.data.tipo}! Redirecionando...`);
            const token = response.data.token;
            localStorage.setItem("token", token);
            localStorage.setItem("userType", response.data.tipo);

            const decoded = jwtDecode<JwtPayload>(token);
            const userId = decoded.id.toString();
            if (userId) localStorage.setItem("userId", userId);

            setIsAuthenticated(true);
            setUserType(response.data.tipo);
            setTimeout(() => navigate("/"), 1500);
        } catch (error: any) {
            setFeedback(error.response?.data?.message || "Erro no login. Verifique suas credenciais.");
        }
    };

    const handleRegisterRedirect = () => {
        navigate("/novo-usuario");
    };

    const letters = "nnovate".split(""); // Letras para "nnovate"
    const endLetters = "ub".split(""); // Letras para "ub"

    return (
        <div className="h-full w-full bg-gradient-to-br from-blue-900 via-blue-700 to-gray-800 flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(163,228,215,0.1)_0%,_rgba(30,58,138,0)_70%)] z-0"></div>
            <div className="relative z-10 w-full h-full flex items-center justify-center">
                <div className="bg-white bg-opacity-90 rounded-xl shadow-2xl p-8 max-w-md w-full transform transition-all duration-500 animate-slide-up">
                    <div className="text-center mb-6">
                        <h1 className="text-3xl font-semibold text-gray-800 mb-2 relative overflow-hidden">
                            {animationStep === 0 && (
                                <span className="inline-block animate-pulse-slow">IH</span>
                            )}
                            {animationStep >= 1 && (
                                <span className="inline-flex items-center space-x-0 transition-all duration-500">
                                    <span className={animationStep === 1 ? "animate-separate-i" : "translate-x-0"}>I</span>
                                    {animationStep === 2 && letters.map((letter, index) => (
                                        <span key={index} className="inline-block animate-letter-expand" style={{ animationDelay: `${index * 100}ms` }}>
                                            {letter}
                                        </span>
                                    ))}
                                    <span className={animationStep === 1 ? "animate-separate-h" : "translate-x-0"}>H</span>
                                    {animationStep === 2 && endLetters.map((letter, index) => (
                                        <span key={index} className="inline-block animate-letter-expand" style={{ animationDelay: `${(letters.length + index) * 100}ms` }}>
                                            {letter}
                                        </span>
                                    ))}
                                </span>
                            )}
                        </h1>
                        <p className="text-gray-600">Plataforma de Avaliação de Projetos</p>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="seu@email.com"
                            />
                        </div>
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-400 pr-10"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••••••"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 transition-all duration-200"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18M5.45 5.11l.708.707" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        {feedback && (
                            <div className={`text-center p-2 rounded-lg ${feedback.includes("bem-sucedido") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"} animate-fade-in`}>
                                <p className="text-sm">{feedback}</p>
                            </div>
                        )}
                        <button
                            onClick={handleLogin}
                            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 animate-pulse-slow"
                        >
                            Entrar
                        </button>
                        <div className="text-center">
                            <p className="text-gray-600 text-sm">Ainda não tem uma conta?{" "}
                                <button
                                    onClick={handleRegisterRedirect}
                                    className="text-blue-600 hover:text-blue-800 font-medium transition-all duration-200"
                                >
                                    Cadastre-se agora
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;