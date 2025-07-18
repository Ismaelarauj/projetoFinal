import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany } from "typeorm";
import { Projeto } from "./Projeto";
import { Avaliacao } from "./Avaliacao";
import { IsNotEmpty, IsEmail, IsDateString, MinLength, Matches } from "class-validator";

@Entity()
export class Usuario {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    @IsNotEmpty({ message: "Nome é obrigatório" })
    nome!: string;

    @Column({ unique: true })
    @IsNotEmpty({ message: "Email é obrigatório" })
    @IsEmail({}, { message: "Email inválido" })
    email!: string;

    @Column()
    @IsNotEmpty({ message: "CPF é obrigatório" })
    @Matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, { message: "CPF deve estar no formato 999.999.999-99" })
    cpf!: string;

    @Column({ type: "date" })
    @IsNotEmpty({ message: "Data de nascimento é obrigatória" })
    @IsDateString({}, { message: "Data de nascimento inválida" })
    dataNascimento!: string;

    @Column()
    @IsNotEmpty({ message: "Telefone é obrigatório" })
    @Matches(/^\(\d{2}\)\s\d{5}-\d{4}$/, { message: "Telefone deve estar no formato (99) 99999-9999" })
    telefone!: string;

    @Column()
    @IsNotEmpty({ message: "País é obrigatório" })
    pais!: string;

    @Column()
    @IsNotEmpty({ message: "Cidade é obrigatória" })
    cidade!: string;

    @Column()
    @IsNotEmpty({ message: "Estado é obrigatório" })
    estado!: string;

    @Column({ nullable: true })
    rua!: string;

    @Column({ nullable: true })
    avenida!: string;

    @Column({ nullable: true })
    lote!: string;

    @Column({ nullable: true })
    numero!: string;

    @Column()
    @IsNotEmpty({ message: "Senha é obrigatória" })
    @MinLength(6, { message: "Senha deve ter pelo menos 6 caracteres" })
    senha!: string;

    @Column({
        type: "enum",
        enum: ["autor", "avaliador"],
        default: "autor"
    })
    tipo!: "autor" | "avaliador";

    @ManyToMany(() => Projeto, (projeto) => projeto.autores)
    projetos!: Projeto[];

    @OneToMany(() => Avaliacao, (avaliacao) => avaliacao.avaliador)
    avaliacoes!: Avaliacao[];
}