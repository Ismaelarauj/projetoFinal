import { Repository, In } from "typeorm";
import { AppDataSource } from "../data-source";
import { Projeto } from "../entities/Projeto";
import { Usuario } from "../entities/Usuario";

export class ProjetoRepository {
    private repository: Repository<Projeto>;

    constructor() {
        this.repository = AppDataSource.getRepository(Projeto);
    }

    async create(projeto: Projeto, autorIds: number[]): Promise<Projeto> {
        const savedProjeto = await this.repository.save(projeto);
        if (autorIds && autorIds.length > 0) {
            const autores = await AppDataSource.getRepository(Usuario).findBy({ id: In(autorIds), tipo: "autor" });
            savedProjeto.autores = autores;
            await this.repository.save(savedProjeto);
        }
        return savedProjeto;
    }

    async findAll(relations: string[] = []): Promise<Projeto[]> {
        const defaultRelations = relations.length > 0 ? relations : ["avaliacoes", "avaliacoes.avaliador", "autores", "premio"];
        const projetos = await this.repository.find({
            relations: defaultRelations,
        });
        console.log("Projetos carregados com relações:", projetos);
        return projetos;
    }

    async findNotEvaluated(): Promise<Projeto[]> {
        return await this.repository.find({
            where: { avaliado: false },
            relations: ["avaliacoes", "avaliacoes.avaliador", "autores", "premio"],
        });
    }

    async findEvaluated(): Promise<Projeto[]> {
        return await this.repository.find({
            where: { avaliado: true },
            relations: ["avaliacoes", "avaliacoes.avaliador", "autores", "premio"],
        });
    }

    async findWinners(): Promise<Projeto[]> {
        return await this.repository.find({
            where: { vencedor: true },
            relations: ["avaliacoes", "avaliacoes.avaliador", "autores", "premio"],
        });
    }

    async findById(id: number): Promise<Projeto | null> {
        return await this.repository.findOne({
            where: { id },
            relations: ["avaliacoes", "avaliacoes.avaliador", "autores", "premio"],
        });
    }

    async update(id: number, data: Partial<Projeto>, autorIds?: number[]): Promise<Projeto | null> {
        const projeto = await this.repository.findOne({ where: { id } });
        if (!projeto) return null;
        Object.assign(projeto, data);
        if (autorIds && autorIds.length > 0) {
            const autores = await AppDataSource.getRepository(Usuario).findBy({ id: In(autorIds), tipo: "autor" });
            projeto.autores = autores;
        }
        return await this.repository.save(projeto);
    }

    async delete(id: number): Promise<void> {
        await this.repository.delete(id);
    }
}