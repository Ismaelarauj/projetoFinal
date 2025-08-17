import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from "typeorm";
import { Projeto } from "./Projeto";
import { Usuario } from "./Usuario";

@Entity()
export class Premio {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    nome!: string;

    @Column()
    descricao!: string;

    @Column("json")
    cronograma!: { dataInicio: string; descricao: string; dataFim: string }[];

    @Column()
    ano!: number;

    @Column({ nullable: true })
    criadoPorId!: number;

    @ManyToOne(() => Usuario, (usuario) => usuario.premiosCriados)
    @JoinColumn({ name: "criadoPorId" }) // Mapeia a coluna para a relação
    criadoPor!: Usuario;

    @OneToMany(() => Projeto, (projeto) => projeto.premio)
    projetos!: Projeto[];
}