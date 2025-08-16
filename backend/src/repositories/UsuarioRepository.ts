import { AppDataSource } from "../data-source";
import { Usuario } from "../entities/Usuario";

export class UsuarioRepository {
    private repository = AppDataSource.getRepository(Usuario);

    async create(usuario: Partial<Usuario>): Promise<Usuario> {
        const newUsuario = this.repository.create(usuario);
        return this.repository.save(newUsuario);
    }

    async update(id: number, usuario: Partial<Usuario>): Promise<Usuario | null> {
        const existingUsuario = await this.repository.findOneBy({ id });
        if (!existingUsuario) return null;

        // Atualiza apenas os campos escalares
        const updateData = {
            nome: usuario.nome,
            email: usuario.email,
            cpf: usuario.cpf,
            dataNascimento: usuario.dataNascimento,
            telefone: usuario.telefone,
            pais: usuario.pais,
            cidade: usuario.cidade,
            estado: usuario.estado,
            rua: usuario.rua,
            avenida: usuario.avenida,
            lote: usuario.lote,
            numero: usuario.numero,
            tipo: usuario.tipo,
            especialidade: usuario.especialidade,
            senha: usuario.senha,
        };

        Object.assign(existingUsuario, updateData);
        await this.repository.save(existingUsuario);

        // Recarrega a entidade completa com relações
        return this.repository.findOne({
            where: { id },
            relations: ["projetos", "avaliacoes"],
            select: [
                "id",
                "nome",
                "email",
                "cpf",
                "dataNascimento",
                "telefone",
                "pais",
                "cidade",
                "estado",
                "rua",
                "avenida",
                "lote",
                "numero",
                "tipo",
                "especialidade",
                "projetos",
                "avaliacoes",
            ],
        });
    }

    async delete(id: number): Promise<void> {
        await AppDataSource.createQueryBuilder()
            .delete()
            .from("projeto_autores_usuario")
            .where("usuarioId = :id", { id })
            .execute();

        await AppDataSource.createQueryBuilder()
            .delete()
            .from("projeto_autores")
            .where("usuarioId = :id", { id })
            .execute();

        await this.repository.delete(id);
    }

    async findById(id: number): Promise<Usuario | null> {
        return this.repository.findOne({
            where: { id },
            relations: ["projetos", "avaliacoes"],
            select: [
                "id",
                "nome",
                "email",
                "cpf",
                "dataNascimento",
                "telefone",
                "pais",
                "cidade",
                "estado",
                "rua",
                "avenida",
                "lote",
                "numero",
                "tipo",
                "especialidade",
                "projetos",
                "avaliacoes",
            ],
        });
    }

    async findAllByType(tipo: "autor" | "avaliador" | "admin"): Promise<Usuario[]> {
        return this.repository.find({
            where: { tipo },
            relations: ["projetos", "avaliacoes"],
        });
    }

    async findByEmail(email: string): Promise<Usuario | null> {
        return this.repository.findOneBy({ email });
    }

    async findByCpf(cpf: string): Promise<Usuario | null> {
        return this.repository.findOneBy({ cpf });
    }
}