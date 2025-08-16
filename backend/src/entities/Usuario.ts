import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany } from "typeorm";
import { Projeto } from "./Projeto";
import { Avaliacao } from "./Avaliacao";
import { Premio } from "./Premio";
import { IsNotEmpty, IsEmail, IsDateString, MinLength, Matches, IsOptional, IsString, IsEnum, ValidateIf } from "class-validator";

@Entity()
export class Usuario {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    @IsNotEmpty({ message: "Nome é obrigatório", groups: ["create", "update"] })
    @IsString({ message: "Nome deve ser uma string", groups: ["create", "update"] })
    nome!: string;

    @Column({ unique: true })
    @IsNotEmpty({ message: "Email é obrigatório", groups: ["create", "update"] })
    @IsEmail({}, { message: "Email inválido", groups: ["create", "update"] })
    email!: string;

    @Column({ unique: true })
    @IsNotEmpty({ message: "CPF é obrigatório", groups: ["create", "update"] })
    @Matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, { message: "CPF deve estar no formato 999.999.999-99", groups: ["create", "update"] })
    cpf!: string;

    @Column({ type: "date" })
    @IsNotEmpty({ message: "Data de nascimento é obrigatória", groups: ["create", "update"] })
    @IsDateString({}, { message: "Data de nascimento inválida", groups: ["create", "update"] })
    dataNascimento!: string;

    @Column()
    @IsNotEmpty({ message: "Telefone é obrigatório", groups: ["create", "update"] })
    @Matches(/^\(\d{2}\)\s\d{5}-\d{4}$/, { message: "Telefone deve estar no formato (99) 99999-9999", groups: ["create", "update"] })
    telefone!: string;

    @Column()
    @IsNotEmpty({ message: "País é obrigatório", groups: ["create", "update"] })
    @IsString({ message: "País deve ser uma string", groups: ["create", "update"] })
    pais!: string;

    @Column()
    @IsNotEmpty({ message: "Cidade é obrigatória", groups: ["create", "update"] })
    @IsString({ message: "Cidade deve ser uma string", groups: ["create", "update"] })
    cidade!: string;

    @Column()
    @IsNotEmpty({ message: "Estado é obrigatório", groups: ["create", "update"] })
    @IsString({ message: "Estado deve ser uma string", groups: ["create", "update"] })
    estado!: string;

    @Column({ type: "varchar", nullable: true })
    @IsOptional({ groups: ["create", "update"] })
    @IsString({ message: "Rua deve ser uma string", groups: ["create", "update"] })
    rua!: string | null;

    @Column({ type: "varchar", nullable: true })
    @IsOptional({ groups: ["create", "update"] })
    @IsString({ message: "Avenida deve ser uma string", groups: ["create", "update"] })
    avenida!: string | null;

    @Column({ type: "varchar", nullable: true })
    @IsOptional({ groups: ["create", "update"] })
    @IsString({ message: "Lote deve ser uma string", groups: ["create", "update"] })
    lote!: string | null;

    @Column({ type: "varchar", nullable: true })
    @IsOptional({ groups: ["create", "update"] })
    @IsString({ message: "Número deve ser uma string", groups: ["create", "update"] })
    numero!: string | null;

    @Column()
    @IsNotEmpty({ message: "Senha é obrigatória", groups: ["create"] })
    @MinLength(6, { message: "Senha deve ter pelo menos 6 caracteres", groups: ["create", "update"] })
    @IsOptional({ groups: ["update"] })
    senha!: string;

    @Column({ type: "enum", enum: ["autor", "avaliador", "admin"], default: "autor" })
    @IsNotEmpty({ message: "Tipo é obrigatório", groups: ["create", "update"] })
    @IsEnum(["autor", "avaliador", "admin"], { message: "Tipo deve ser 'autor', 'avaliador' ou 'admin'", groups: ["create", "update"] })
    tipo!: "autor" | "avaliador" | "admin";

    @Column({ type: "varchar", nullable: true })
    @IsOptional({ groups: ["create", "update"] })
    @ValidateIf(o => o.tipo === "avaliador", { groups: ["create", "update"] })
    @IsNotEmpty({ message: "Especialidade é obrigatória para avaliadores", groups: ["create", "update"] })
    @IsString({ message: "Especialidade deve ser uma string", groups: ["create", "update"] })
    especialidade!: string | null;

    @ManyToMany(() => Projeto, (projeto) => projeto.autores)
    projetos!: Projeto[];

    @OneToMany(() => Avaliacao, (avaliacao) => avaliacao.avaliador)
    avaliacoes!: Avaliacao[];

    @OneToMany(() => Premio, (premio) => premio.criadoPor)
    premiosCriados!: Premio[];
}