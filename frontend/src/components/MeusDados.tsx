import React from "react";
import UsuarioForm from "./UsuarioForm";
import { UsuarioCompleto } from "../types/types";
import { useNavigate } from "react-router-dom";

interface MeusDadosProps {
    currentUser: UsuarioCompleto | null;
    onSave: (usuario: Partial<UsuarioCompleto>) => Promise<void>; // Alterado para Partial<UsuarioCompleto>
    onCancel: () => void;
    userType: string | null;
    navigate: (path: string) => void;
}

const MeusDados: React.FC<MeusDadosProps> = ({ currentUser, onSave, onCancel, userType, navigate }) => {
    const currentUserId = currentUser?.id || parseInt(localStorage.getItem("userId") || "0");

    return (
        <div>
            {currentUser ? (
                <UsuarioForm
                    initialData={currentUser}
                    onSave={onSave}
                    onCancel={onCancel}
                    onNavigate={navigate}
                    isOpen={true}
                    isAdmin={false}
                    isUserEditing={true}
                    currentUserId={currentUserId}
                    userType={userType}
                />
            ) : (
                <div>Carregando...</div>
            )}
        </div>
    );
};

export default MeusDados;