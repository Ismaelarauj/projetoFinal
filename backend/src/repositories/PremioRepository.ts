import { AppDataSource } from "../data-source";
import { Premio } from "../entities/Premio";

export class PremioRepository {
    private repository = AppDataSource.getRepository(Premio);

    async create(premio: Partial<Premio>): Promise<Premio> {
        const newPremio = this.repository.create(premio);
        return this.repository.save(newPremio);
    }

    async update(id: number, premio: Partial<Premio>): Promise<Premio | null> {
        await this.repository.update(id, premio);
        return this.repository.findOneBy({ id });
    }

    async delete(id: number): Promise<void> {
        await this.repository.delete(id);
    }

    async findById(id: number): Promise<Premio | null> {
        return this.repository.findOneBy({ id });
    }

    async findAll(relations: string[] = []): Promise<Premio[]> {
        return this.repository.find({ relations });
    }
}