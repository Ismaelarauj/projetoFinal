import { DataSource } from "typeorm";
import * as dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST || "localhost", // Fallback para desenvolvimento
    port: parseInt(process.env.DB_PORT || "3306"), // Fallback já presente
    username: process.env.DB_USERNAME || "root", // Fallback para desenvolvimento
    password: process.env.DB_PASSWORD || "Aces1234*", // Fallback para desenvolvimento
    database: process.env.DB_DATABASE || "gerenciamento_projetos", // Fallback para desenvolvimento
    synchronize: true, // Use migrações em produção (defina como false em produção)
    logging: true, // Ativado para depuração
    entities: ["src/entities/*.ts"], // Caminho dinâmico para entidades
    migrations: ["src/migration/*.ts"], // Caminho para migrações (ajuste se necessário)
    subscribers: [], // Adicione subscribers se houver
});