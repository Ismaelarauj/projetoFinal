import { Usuario } from "./entities/Usuario";
import { UsuarioRepository } from "./repositories/UsuarioRepository";
import * as bcrypt from "bcryptjs";
import cpfGenerator from "gerador-validador-cpf";

export class AdminInitializer {
    private usuarioRepository: UsuarioRepository;

    constructor() {
        this.usuarioRepository = new UsuarioRepository();
    }

    async initializeAdmin(): Promise<void> {
        const adminEmail = "admin@innovatehub.com";
        const adminExists = await this.usuarioRepository.findByEmail(adminEmail);
        if (!adminExists) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash("admin123", salt);
            const admin = new Usuario();
            admin.email = adminEmail;
            admin.senha = hashedPassword;
            admin.tipo = "admin";
            admin.nome = "Admin Innovate";
            // Preenchendo todos os campos obrigatórios
            admin.cpf = cpfGenerator.generate({ format: false }); // Gera CPF formatado (ex.: "123.456.789-00")
            admin.dataNascimento = "1990-01-01"; // Data fictícia no formato YYYY-MM-DD
            admin.telefone = "(11) 98765-4321"; // Telefone fictício no formato (99) 99999-9999
            admin.pais = "Brasil";
            admin.cidade = "São Paulo";
            admin.estado = "SP";
            // Campos opcionais (nullable: true), podem ser deixados como undefined ou preenchidos
            admin.rua = "Rua Exemplo";
            admin.avenida = "Avenida Exemplo";
            admin.lote = "123";
            admin.numero = "10";

            await this.usuarioRepository.create(admin);
            console.log("Usuário admin criado com sucesso.");
        } else {
            console.log("Usuário admin já existe.");
        }
    }
}