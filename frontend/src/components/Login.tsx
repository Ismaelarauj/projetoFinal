import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface LoginProps {
    setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
    setUserType: React.Dispatch<React.SetStateAction<string | null>>;
}

const Login: React.FC<LoginProps> = ({ setIsAuthenticated, setUserType }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleLogin = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!email.trim() || !password.trim()) {
            setFeedback("Por favor, preencha email e senha.");
            return;
        }

        try {
            const response = await axios.post("http://localhost:3001/login", { email, password });
            setFeedback(`Login bem-sucedido como ${response.data.tipo}! Redirecionando...`);
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("userType", response.data.tipo);
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1440 320\'%3E%3Cpath fill=\'%23090e1a\' fill-opacity=\'0.3\' d=\'M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,106.7C960,85,1056,107,1152,117.3C1248,128,1344,128,1392,128L1440,128V320H1392C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320H0Z\'/%3E%3C/svg%3E')] bg-repeat-x bg-bottom"></div>
            <div className="relative z-10 w-full max-w-md">
    <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.2)] p-8 border border-gray-200/50 transform transition-all duration-500 hover:shadow-[0_15px_40px_rgba(0,0,0,0.3)]">
    <div className="text-center mb-10">
    <h1 className="text-4xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
        Innovate Hub
    </h1>
    <p className="text-gray-600 text-lg">Entre para desbloquear sua inovação</p>
    </div>
    <div className="space-y-6">
    <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
        <input
    type="email"
    className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 bg-gray-50/50 placeholder-gray-400"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    placeholder="seu@email.com"
        />
        </div>
        <div className="relative">
    <label className="block text-sm font-semibold text-gray-700 mb-2">Senha</label>
        <input
    type={showPassword ? "text" : "password"}
    className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 bg-gray-50/50 placeholder-gray-400 pr-12"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    placeholder="••••••••••••"
    />
    <button
        type="button"
    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-indigo-600 transition-all duration-200"
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
        <div className="text-center p-3 rounded-xl" style={{ backgroundColor: feedback.includes("bem-sucedido") ? "#d4edda" : "#f8d7da", color: feedback.includes("bem-sucedido") ? "#155724" : "#721c24", animation: "fadeIn 0.5s" }}>
        <p className="text-sm font-medium">{feedback}</p>
            </div>
    )}
    <button
        onClick={handleLogin}
    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold text-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all duration-300 transform hover:scale-105 active:scale-100"
        >
        Entrar
        </button>
        <div className="text-center">
    <p className="text-gray-600 text-sm">Ainda não tem uma conta?{" "}
        <button
        onClick={handleRegisterRedirect}
    className="text-indigo-600 hover:text-purple-600 font-medium transition-all duration-200 underline-offset-2 hover:underline"
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