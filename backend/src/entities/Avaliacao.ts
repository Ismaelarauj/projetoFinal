import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Projeto } from "./Projeto";
import { Usuario } from "./Usuario";
import { IsNotEmpty, IsNumber, Min, Max } from "class-validator";

@Entity()
export class Avaliacao {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column("decimal", { precision: 4, scale: 1 })
    @IsNotEmpty({ message: "A nota é obrigatória" })
    @IsNumber({}, { message: "A nota deve ser um número" })
    @Min(0, { message: "A nota mínima é 0" })
    @Max(10, { message: "A nota máxima é 10" })
    nota!: number;

    @Column()
    @IsNotEmpty({ message: "O parecer é obrigatório" })
    parecer!: string;

    @Column()
    @IsNotEmpty({ message: "A data da avaliação é obrigatória" })
    dataAvaliacao!: Date;

    @ManyToOne(() => Projeto, (projeto) => projeto.avaliacoes)
    projeto!: Projeto;

    @ManyToOne(() => Usuario, (usuario) => usuario.avaliacoes)
    avaliador!: Usuario;

    get avaliadorId(): number {
        return this.avaliador.id;
    }
}