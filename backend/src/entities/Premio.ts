import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from "typeorm";
import { Projeto } from "./Projeto";
import { Usuario } from "./Usuario";
import { IsNotEmpty, IsString, IsInt, IsArray, ValidateNested, IsDateString } from "class-validator";
import { Type } from "class-transformer";

class CronogramaItem {
    @IsNotEmpty({ message: "Data de início é obrigatória" })
    @IsDateString({}, { message: "Data de início deve ser uma string de data válida" })
    dataInicio!: string;

    @IsNotEmpty({ message: "Data de fim é obrigatória" })
    @IsDateString({}, { message: "Data de fim deve ser uma string de data válida" })
    dataFim!: string;

    @IsNotEmpty({ message: "Descrição é obrigatória" })
    @IsString({ message: "Descrição deve ser uma string" })
    descricao!: string;
}

@Entity()
export class Premio {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    @IsNotEmpty({ message: "Nome é obrigatório" })
    @IsString({ message: "Nome deve ser uma string" })
    nome!: string;

    @Column()
    @IsNotEmpty({ message: "Descrição é obrigatória" })
    @IsString({ message: "Descrição deve ser uma string" })
    descricao!: string;

    @Column("json")
    @IsNotEmpty({ message: "Cronograma é obrigatório" })
    @IsArray({ message: "Cronograma deve ser um array" })
    @ValidateNested({ each: true })
    @Type(() => CronogramaItem)
    cronograma!: CronogramaItem[];

    @Column()
    @IsNotEmpty({ message: "Ano é obrigatório" })
    @IsInt({ message: "Ano deve ser um número inteiro" })
    ano!: number;

    @Column({ nullable: true })
    @IsInt({ message: "CriadoPorId deve ser um número inteiro" })
    criadoPorId!: number;

    @ManyToOne(() => Usuario, (usuario) => usuario.premiosCriados)
    @JoinColumn({ name: "criadoPorId" })
    criadoPor!: Usuario;

    @OneToMany(() => Projeto, (projeto) => projeto.premio)
    projetos!: Projeto[];
}