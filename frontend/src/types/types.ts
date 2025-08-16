export interface UsuarioCompleto {
    id: number;
    nome: string;
    email: string;
    cpf: string;
    dataNascimento: string;
    telefone: string;
    pais: string;
    cidade: string;
    estado: string;
    rua: string | null;
    avenida: string | null;
    lote: string | null;
    numero: string | null;
    tipo: "autor" | "avaliador" | "admin";
    especialidade?: string | null;
    senha?: string;
    projetos: { id: number; titulo: string }[];
    avaliacoes: Avaliacao[];
}

export interface UsuarioFormProps {
    initialData?: UsuarioCompleto | null;
    onSave?: (usuario: Partial<UsuarioCompleto>) => Promise<void>;
    onCancel?: () => void;
    onCreate?: () => void;
    isUserEditing?: boolean;
    isOpen?: boolean;
    isAdmin?: boolean;
    currentUserId: number;
}

export interface Autor {
    id: number;
    nome: string;
    email?: string;
    projetos: { id: number; titulo: string }[];
}
export interface Avaliacao {
    id: number;
    projetoId: number;
    comentario?: string;
    nota?: number;
    // Adicione outros campos conforme necessário
}
