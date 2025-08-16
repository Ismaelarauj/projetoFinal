import { Repository, In, SelectQueryBuilder } from "typeorm";
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
            savedProjeto.autores = await AppDataSource.getRepository(Usuario).findBy({ id: In(autorIds), tipo: "autor" });
            await this.repository.save(savedProjeto);
        }
        return savedProjeto;
    }

    async findAll(relations: string[] = []): Promise<Projeto[]> {
        let query: SelectQueryBuilder<Projeto> = this.repository.createQueryBuilder("projeto");

        // Normaliza e valida relações
        const validRelations = relations.length > 0 ? relations.map(r => r.trim()).filter(r => r) : ["avaliacoes", "autores", "premio"];

        // Conjunto para rastrear relações já adicionadas
        const joinedRelations = new Set<string>();

        // Adiciona relações diretas
        validRelations.forEach(relation => {
            if (!relation.includes(".")) {
                if (!joinedRelations.has(relation)) {
                    query.leftJoinAndSelect(`projeto.${relation}`, relation);
                    joinedRelations.add(relation);
                }
            }
        });

        // Adiciona relações aninhadas
        validRelations.filter(r => r.includes(".")).forEach(relation => {
            const [parent, child] = relation.split(".");
            if (!joinedRelations.has(parent)) {
                query.leftJoinAndSelect(`projeto.${parent}`, parent);
                joinedRelations.add(parent);
            }
            const nestedAlias = `${parent}_${child}`;
            query.leftJoinAndSelect(`${parent}.${child}`, nestedAlias);
            joinedRelations.add(relation);
        });

        try {
            const projetos = await query.getMany();
            return projetos;
        } catch (error) {
            throw error;
        }
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
            projeto.autores = await AppDataSource.getRepository(Usuario).findBy({ id: In(autorIds), tipo: "autor" });
        }
        return await this.repository.save(projeto);
    }

    async delete(id: number): Promise<void> {
        await this.repository.delete(id);
    }
}