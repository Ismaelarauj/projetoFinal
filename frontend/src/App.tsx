import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import ProjetoList from "./components/ProjetoList";
import ProjetoForm from "./components/ProjetoForm";
import AutorList from "./components/AutorList";
import UsuarioForm from "./components/UsuarioForm";
import AvaliacaoForm from "./components/AvaliacaoForm";
import PremioForm from "./components/PremioForm";
import axios from "axios";

const App: React.FC = () => {
  const [refresh, setRefresh] = useState(0);

  const handleRefresh = () => setRefresh((prev) => prev + 1);

  return (
      <Router>
        <div className="min-h-screen bg-innovate-gray">
          <header className="bg-innovate-blue text-white p-6 shadow-lg">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-innovate-accent rounded-full flex items-center justify-center">
                  <span className="text-xl font-display">IH</span>
                </div>
                <h1 className="text-2xl font-display">Innovate Hub</h1>
              </div>
              <nav className="space-x-6">
                <ul className="flex space-x-4">
                  <li><Link to="/" className="text-white hover:text-innovate-accent transition">Projetos</Link></li>
                  <li><Link to="/novo-projeto" className="text-white hover:text-innovate-accent transition">Novo Projeto</Link></li>
                  <li><Link to="/autores" className="text-white hover:text-innovate-accent transition">Autores</Link></li>
                  <li><Link to="/novo-usuario" className="text-white hover:text-innovate-accent transition">Novo Usuário</Link></li>
                  <li><Link to="/nova-avaliacao" className="text-white hover:text-innovate-accent transition">Nova Avaliação</Link></li>
                  <li><Link to="/novo-premio" className="text-white hover:text-innovate-accent transition">Novo Prêmio</Link></li>
                </ul>
              </nav>
            </div>
          </header>
          <Routes>
            <Route path="/" element={<ProjetoList key={refresh} />} />
            <Route path="/novo-projeto" element={<ProjetoForm onCreate={handleRefresh} />} />
            <Route path="/autores" element={<AutorList key={refresh} />} />
            <Route path="/novo-usuario" element={<UsuarioForm onCreate={handleRefresh} />} />
            <Route path="/nova-avaliacao" element={<AvaliacaoForm onCreate={handleRefresh} />} />
            <Route path="/novo-premio" element={<PremioForm onCreate={handleRefresh} />} />
          </Routes>
          <footer className="bg-innovate-blue text-white p-6 mt-12">
            <div className="max-w-7xl mx-auto text-center">
              <p>© 2025 Innovate Hub. Todos os direitos reservados.</p>
              <div className="mt-2 space-x-4">
                <a href="#" className="hover:text-innovate-accent">Privacidade</a>
                <a href="#" className="hover:text-innovate-accent">Termos</a>
                <a href="#" className="hover:text-innovate-accent">Contato</a>
              </div>
            </div>
          </footer>
        </div>
      </Router>
  );
};

export default App;