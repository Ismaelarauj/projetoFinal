import { DataSource } from "typeorm";
import { Premio } from "./entities/Premio";
import { Usuario } from "./entities/Usuario";
import { Projeto } from "./entities/Projeto";
import { Avaliacao } from "./entities/Avaliacao";
import * as dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "3306"),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    synchronize: true, // Use migrações em produção
    logging: true, // Ativado para depuração
    entities: [Premio, Usuario, Projeto, Avaliacao],
    migrations: [],
    subscribers: [],
});