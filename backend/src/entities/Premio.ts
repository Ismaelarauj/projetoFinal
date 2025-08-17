import {Entity, PrimaryGeneratedColumn, Column, OneToMany} from "typeorm";
import {Projeto} from "./Projeto";

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
    @OneToMany(() => Projeto, projeto => projeto.premio)
    projetos!: Projeto[];
}