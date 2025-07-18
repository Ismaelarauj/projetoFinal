import { AppDataSource } from "../data-source";
import { Usuario } from "../entities/Usuario";

export class UsuarioRepository {
    private repository = AppDataSource.getRepository(Usuario);

    async create(usuario: Partial<Usuario>): Promise<Usuario> {
        const newUsuario = this.repository.create(usuario);
        return this.repository.save(newUsuario);
    }

    async update(id: number, usuario: Partial<Usuario>): Promise<Usuario | null> {
        await this.repository.update(id, usuario);
        return this.repository.findOneBy({ id });
    }

    async delete(id: number): Promise<void> {
        await this.repository.delete(id);
    }

    async findById(id: number): Promise<Usuario | null> {
        return this.repository.findOne({
            where: { id },
            relations: ["projetos", "avaliacoes"]
        });
    }

    async findAllByType(tipo: "autor" | "avaliador"): Promise<Usuario[]> {
        return this.repository.find({
            where: { tipo },
            relations: ["projetos", "avaliacoes"]
        });
    }
}