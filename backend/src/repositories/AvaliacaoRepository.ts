import { AppDataSource } from "../data-source";
import { Avaliacao } from "../entities/Avaliacao";
import { Projeto } from "../entities/Projeto";
import { Usuario } from "../entities/Usuario";

export class AvaliacaoRepository {
    private repository = AppDataSource.getRepository(Avaliacao);

    async create(avaliacao: Partial<Avaliacao>, projetoId: number, avaliadorId: number): Promise<Avaliacao> {
        if (typeof avaliacao.nota !== "number" || isNaN(avaliacao.nota) || avaliacao.nota < 0 || avaliacao.nota > 10) {
            throw new Error("Nota inválida. Deve ser um número entre 0 e 10.");
        }

        const newAvaliacao = this.repository.create({
            ...avaliacao,
            dataAvaliacao: new Date(avaliacao.dataAvaliacao || new Date()),
            nota: Number(avaliacao.nota),
        });

        const projeto = await AppDataSource.getRepository(Projeto).findOneBy({ id: projetoId });
        if (!projeto) {
            throw new Error("Projeto não encontrado para o ID fornecido");
        }
        newAvaliacao.projeto = projeto;

        const avaliador = await AppDataSource.getRepository(Usuario).findOneBy({ id: avaliadorId });
        if (!avaliador || avaliador.tipo !== "avaliador") {
            throw new Error("Avaliador não encontrado ou inválido para o ID fornecido");
        }
        newAvaliacao.avaliador = avaliador;

        try {
            const savedAvaliacao = await this.repository.save(newAvaliacao);
            console.log("Avaliação salva com nota:", savedAvaliacao.nota);

            const avaliacaoCount = await AppDataSource.getRepository(Avaliacao).countBy({ projeto: { id: projetoId } });
            if (avaliacaoCount >= 3 && !projeto.avaliado) {
                await AppDataSource.createQueryBuilder()
                    .update(Projeto)
                    .set({ avaliado: true })
                    .where("id = :id", { id: projetoId })
                    .execute();
            }

            return savedAvaliacao;
        } catch (error) {
            throw new Error(`Erro ao salvar avaliação: ${(error as Error).message}`);
        }
    }

    async update(id: number, avaliacao: Partial<Avaliacao>): Promise<Avaliacao | null> {
        const result = await this.repository.update(id, avaliacao);
        if (result.affected === 0) return null;
        return this.repository.findOneBy({ id });
    }

    async delete(id: number): Promise<void> {
        const result = await this.repository.delete(id);
        if (result.affected === 0) {
            throw new Error("Avaliação não encontrada para exclusão");
        }
    }

    async findById(id: number): Promise<Avaliacao | null> {
        return this.repository.findOne({ where: { id }, relations: ["projeto", "avaliador"] });
    }

    async findAll(): Promise<Avaliacao[]> {
        return this.repository.find({ relations: ["projeto", "avaliador"] });
    }
}