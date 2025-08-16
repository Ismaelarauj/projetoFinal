import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, OneToMany, JoinTable, ManyToOne } from "typeorm";
import { Usuario } from "./Usuario";
import { Premio } from "./Premio";
import { Avaliacao } from "./Avaliacao";
import { IsNotEmpty } from "class-validator";
import { projetoRelations } from "./relations";

@Entity()
export class Projeto {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    @IsNotEmpty({ message: "Área temática é obrigatória" })
    areaTematica!: string;

    @Column()
    @IsNotEmpty({ message: "Título é obrigatório" })
    titulo!: string;

    @Column()
    @IsNotEmpty({ message: "Resumo é obrigatório" })
    resumo!: string;

    @Column()
    @IsNotEmpty({ message: "Data de envio é obrigatória" })
    dataEnvio!: Date;

    @Column({ default: false })
    avaliado!: boolean;

    @Column({ default: false })
    vencedor!: boolean;

    @Column({ nullable: false })
    @IsNotEmpty({ message: "Autor principal é obrigatório" })
    autorPrincipalId!: number; // Novo campo para identificar o autor principal

    @ManyToOne(() => Premio, (premio) => premio.projetos)
    premio!: Premio;

    @ManyToMany(() => Usuario, (usuario) => usuario.projetos, { eager: true })
    @JoinTable({
        name: "projeto_autores",
        joinColumn: { name: "projetoId", referencedColumnName: "id" },
        inverseJoinColumn: { name: "usuarioId", referencedColumnName: "id" }
    })
    autores!: Usuario[];

    @OneToMany(projetoRelations.avaliacoes, (avaliacao) => avaliacao.projeto)
    avaliacoes!: Avaliacao[];
}