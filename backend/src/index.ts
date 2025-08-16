import express, { Request, Response, NextFunction } from "express";
import { AppDataSource } from "./data-source";
import { PremioRepository } from "./repositories/PremioRepository";
import { UsuarioRepository } from "./repositories/UsuarioRepository";
import { ProjetoRepository } from "./repositories/ProjetoRepository";
import { AvaliacaoRepository } from "./repositories/AvaliacaoRepository";
import { validate } from "class-validator";
import { Premio } from "./entities/Premio";
import { Usuario } from "./entities/Usuario";
import { Projeto } from "./entities/Projeto";
import { Avaliacao } from "./entities/Avaliacao";
import cors from "cors";
import { In } from "typeorm";
import {DataBasePopulator} from "./DataBasePopulator";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import * as dotenv from "dotenv";

interface AuthenticatedRequest extends Request {
    user?: { id: number; email: string; tipo: string };
}

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const premioRepository = new PremioRepository();
const usuarioRepository = new UsuarioRepository();
const projetoRepository = new ProjetoRepository();
const avaliacaoRepository = new AvaliacaoRepository();

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secreta";

const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Token de autenticação ausente ou inválido" });
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string; tipo: string };
        req.user = { id: decoded.id, email: decoded.email, tipo: decoded.tipo };
        next();
    } catch (error) {
        return res.status(401).json({ message: "Token inválido ou expirado" });
    }
};

AppDataSource.initialize()
    .then(async () => {
        const adminInitializer = new DataBasePopulator();
        await adminInitializer.populateDatabase();
    })
    .catch((err) => {
        throw new Error(`Erro ao conectar ao banco de dados: ${(err as Error).message}`);
    });

const validateCronograma = (cronograma: any[]): string[] => {
    const errors: string[] = [];
    if (!Array.isArray(cronograma)) {
        errors.push("Cronograma deve ser um array");
        return errors;
    }
    cronograma.forEach((item, index) => {
        if (!item.dataInicio || !item.dataFim || !item.descricao) {
            errors.push(`Item ${index + 1} do cronograma está incompleto (falta data de início, data de fim ou descrição)`);
        }
        const startDate = new Date(item.dataInicio);
        const endDate = new Date(item.dataFim);
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            errors.push(`Data inválida no item ${index + 1} do cronograma`);
        }
    });
    return errors;
};

app.post("/premios", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    const { nome, descricao, cronograma, ano } = req.body;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: "Usuário não autenticado" });
    }

    if (!nome || !descricao || !ano) {
        return res.status(400).json(["Campos obrigatórios (nome, descricao, ano) ausentes"]);
    }

    const anoNum = parseInt(ano);
    if (isNaN(anoNum) || anoNum <= 0) {
        return res.status(400).json(["Ano deve ser um número válido e maior que 0"]);
    }

    const cronogramaErrors = validateCronograma(cronograma);
    if (cronogramaErrors.length > 0) {
        return res.status(400).json(cronogramaErrors);
    }

    const premio = new Premio();
    premio.nome = nome;
    premio.descricao = descricao;
    premio.cronograma = cronograma;
    premio.ano = anoNum;

    const usuario = await usuarioRepository.findById(userId);
    if (!usuario) {
        return res.status(404).json({ message: "Usuário não encontrado" });
    }
    premio.criadoPor = usuario;

    try {
        const savedPremio = await premioRepository.create(premio);
        console.log("Prêmio salvo com criadoPor:", JSON.stringify(savedPremio, null, 2));
        res.status(201).json(savedPremio);
    } catch (error) {
        res.status(500).json({ message: "Erro ao criar prêmio", details: (error as Error).message });
    }
});

app.get("/premios", async (req: Request, res: Response) => {
    try {
        const premios = await AppDataSource.getRepository(Premio).find({
            relations: ["criadoPor", "projetos", "projetos.autores"],
            select: {
                id: true,
                nome: true,
                descricao: true,
                cronograma: true,
                ano: true,
                criadoPor: {
                    id: true,
                    nome: true
                },
                projetos: {
                    id: true,
                    titulo: true,
                    autores: { id: true, nome: true },
                    premio: { id: true } // Substituímos premioId por premio.id
                }
            }
        });
        console.log("Prêmios com relações criadoPor e projetos:", JSON.stringify(premios, null, 2));
        res.json(premios);
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar prêmios", details: (error as Error).message });
    }
});

app.get("/premios/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "ID inválido" });
    const premio = await premioRepository.findById(id);
    if (!premio) return res.status(404).json({ message: "Prêmio não encontrado" });
    res.json(premio);
});

app.put("/premios/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "ID inválido" });

    const { nome, descricao, ano, cronograma, criadoPorId } = req.body;

    if (!nome || !descricao || !ano) {
        return res.status(400).json(["Campos obrigatórios (nome, descricao, ano) ausentes"]);
    }

    const anoNum = parseInt(ano);
    if (isNaN(anoNum) || anoNum <= 0) {
        return res.status(400).json(["Ano deve ser um número válido e maior que 0"]);
    }

    const cronogramaErrors = validateCronograma(cronograma);
    if (cronogramaErrors.length > 0) {
        return res.status(400).json(cronogramaErrors);
    }

    try {
        const existingPremio = await premioRepository.findById(id);
        if (!existingPremio) {
            return res.status(404).json({ message: "Prêmio não encontrado" });
        }

        existingPremio.nome = nome;
        existingPremio.descricao = descricao;
        existingPremio.ano = anoNum;
        existingPremio.cronograma = cronograma;

        if (criadoPorId !== undefined && criadoPorId !== null) {
            const usuario = await usuarioRepository.findById(criadoPorId);
            if (!usuario) {
                return res.status(404).json({ message: "Usuário associado a criadoPorId não encontrado" });
            }
            existingPremio.criadoPor = usuario;
            existingPremio.criadoPorId = criadoPorId;
        }

        const updatedPremio = await premioRepository.update(id, existingPremio);
        res.json(updatedPremio);
    } catch (error) {
        res.status(500).json({ message: "Erro ao atualizar o prêmio", details: (error as Error).message });
    }
});

app.delete("/premios/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "ID inválido" });
    const premio = await AppDataSource.getRepository(Premio).findOne({
        where: { id },
        relations: ["projetos"]
    });
    if (!premio) return res.status(404).json({ message: "Prêmio não encontrado" });
    if (premio.projetos && premio.projetos.length > 0) {
        return res.status(400).json({ message: "Não é possível excluir este prêmio, pois está associado a um ou mais projetos" });
    }
    await premioRepository.delete(id);
    res.status(204).send();
});

app.post("/usuarios", async (req: Request, res: Response) => {
    const { tipo, senha, ...usuarioData } = req.body;
    if (!tipo || !["autor", "avaliador"].includes(tipo)) {
        return res.status(400).json({ message: "Tipo deve ser 'autor' ou 'avaliador'" });
    }
    if (!senha || typeof senha !== "string" || senha.trim() === "") {
        return res.status(400).json({ message: "Senha é obrigatória e deve ser uma string não vazia" });
    }
    const usuario = new Usuario();
    Object.assign(usuario, usuarioData, { tipo, senha });
    const errors = await validate(usuario);
    if (errors.length > 0) {
        return res.status(400).json({ message: "Campos obrigatórios ausentes ou inválidos", details: errors });
    }
    try {
        const existingUsuario = await usuarioRepository.findByEmail(usuario.email);
        if (existingUsuario) {
            return res.status(400).json({ message: "Email já cadastrado" });
        }
        const existingCpf = await usuarioRepository.findByCpf(usuario.cpf);
        if (existingCpf) {
            return res.status(400).json({ message: "CPF já cadastrado" });
        }
        const salt = await bcrypt.genSalt(10);
        usuario.senha = await bcrypt.hash(senha, salt);
        const newUsuario = await usuarioRepository.create(usuario);
        res.status(201).json(newUsuario);
    } catch (error) {
        console.error("Erro ao criar usuário:", error);
        res.status(500).json({ message: "Erro ao criar usuário", details: (error as Error).message });
    }
});

app.get("/usuarios/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "ID inválido" });
    const usuario = await usuarioRepository.findById(id);
    if (!usuario) return res.status(404).json({ message: "Usuário não encontrado" });
    res.json(usuario);
});

app.get("/autores", async (req: Request, res: Response) => {
    const usuarios = await usuarioRepository.findAllByType("autor");
    if (!usuarios || usuarios.length === 0) {
        return res.status(200).json({ message: "Nenhum autor encontrado", data: [] });
    }
    const autores = usuarios.map((u) => ({
        id: u.id,
        nome: u.nome,
        email: u.email,
        projetos: u.projetos || []
    }));
    res.json(autores);
});

app.get("/avaliadores", async (req: Request, res: Response) => {
    const usuarios = await usuarioRepository.findAllByType("avaliador");
    if (!usuarios || usuarios.length === 0) {
        return res.status(200).json({ message: "Nenhum avaliador encontrado", data: [] });
    }
    res.json(usuarios);
});

app.get("/admins", async (req: Request, res: Response) => {
    const usuarios = await usuarioRepository.findAllByType("admin");
    if (!usuarios || usuarios.length === 0) {
        return res.status(200).json({ message: "Nenhum admin encontrado", data: [] });
    }
    res.json(usuarios);
});

app.put("/usuarios/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "ID inválido" });

    try {
        const usuario = await usuarioRepository.findById(id);
        if (!usuario) return res.status(404).json({ message: "Usuário não encontrado" });

        // Extrai apenas os campos permitidos do req.body
        const {
            nome,
            email,
            cpf,
            dataNascimento,
            telefone,
            pais,
            cidade,
            estado,
            rua,
            avenida,
            lote,
            numero,
            tipo,
            especialidade,
            senha
        } = req.body;

        // Cria um objeto com os campos fornecidos, convertendo undefined para null
        const updatedFields: Partial<Usuario> = {};
        if (nome !== undefined) updatedFields.nome = nome;
        if (email !== undefined) updatedFields.email = email;
        if (cpf !== undefined) updatedFields.cpf = cpf;
        if (dataNascimento !== undefined) updatedFields.dataNascimento = dataNascimento;
        if (telefone !== undefined) updatedFields.telefone = telefone;
        if (pais !== undefined) updatedFields.pais = pais;
        if (cidade !== undefined) updatedFields.cidade = cidade;
        if (estado !== undefined) updatedFields.estado = estado;
        if (rua !== undefined) updatedFields.rua = rua ?? null;
        if (avenida !== undefined) updatedFields.avenida = avenida ?? null;
        if (lote !== undefined) updatedFields.lote = lote ?? null;
        if (numero !== undefined) updatedFields.numero = numero ?? null;
        if (tipo !== undefined) updatedFields.tipo = tipo;
        if (especialidade !== undefined) updatedFields.especialidade = especialidade ?? null;
        if (senha !== undefined && senha !== "") {
            const salt = await bcrypt.genSalt(10);
            updatedFields.senha = await bcrypt.hash(senha, salt);
        }

        // Mescla os campos atualizados com o usuário existente
        Object.assign(usuario, updatedFields);

        // Define grupos de validação com base no tipo de usuário
        const validationGroups = ["update"];
        if (updatedFields.tipo === "avaliador" || usuario.tipo === "avaliador") {
            validationGroups.push("avaliador");
        }

        // Log para depuração
        console.log("Dados recebidos:", req.body);
        console.log("Campos atualizados:", updatedFields);

        // Valida apenas os campos fornecidos
        const errors = await validate(usuario, {
            groups: validationGroups,
            skipMissingProperties: true,
            forbidUnknownValues: true
        });
        if (errors.length > 0) {
            return res.status(400).json({
                message: "Campos obrigatórios ausentes ou inválidos",
                details: errors.map(e => ({
                    property: e.property,
                    constraints: e.constraints
                }))
            });
        }

        // Verifica duplicidade de email e CPF apenas se foram alterados
        if (email !== undefined && email !== usuario.email) {
            const existingEmail = await usuarioRepository.findByEmail(email);
            if (existingEmail && existingEmail.id !== id) {
                return res.status(400).json({ message: "Email já cadastrado por outro usuário" });
            }
        }
        if (cpf !== undefined && cpf !== usuario.cpf) {
            const existingCpf = await usuarioRepository.findByCpf(cpf);
            if (existingCpf && existingCpf.id !== id) {
                return res.status(400).json({ message: "CPF já cadastrado por outro usuário" });
            }
        }

        const updatedUsuario = await usuarioRepository.update(id, updatedFields);
        // Retorna apenas os campos atualizados, excluindo a senha
        const responseUsuario = { ...updatedUsuario };
        delete responseUsuario.senha;

        res.json(responseUsuario);
    } catch (error) {
        console.error("Erro ao atualizar usuário:", error);
        res.status(500).json({ message: "Erro ao atualizar usuário", details: (error as Error).message });
    }
});
app.delete("/usuarios/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "ID inválido" });
    await usuarioRepository.delete(id);
    res.status(204).send();
});

app.post("/login", async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Email e senha são obrigatórios" });
    }

    try {
        const usuario = await usuarioRepository.findByEmail(email);
        if (!usuario) {
            return res.status(401).json({ message: "Usuário não encontrado" });
        }

        const isMatch = await bcrypt.compare(password, usuario.senha);
        if (!isMatch) {
            return res.status(401).json({ message: "Senha incorreta" });
        }

        const token = jwt.sign({ id: usuario.id, email: usuario.email, tipo: usuario.tipo }, JWT_SECRET, { expiresIn: "1h" });
        res.status(200).json({ message: "Login bem-sucedido", token, tipo: usuario.tipo });
    } catch (error) {
        res.status(500).json({ message: "Erro interno no servidor", details: (error as Error).message });
    }
});

app.post("/projetos", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    const projetoData = {
        areaTematica: req.body.projeto.areaTematica,
        titulo: req.body.projeto.titulo,
        resumo: req.body.projeto.resumo,
        dataEnvio: new Date(),
        autorPrincipalId: req.user!.id,
    };

    const projeto = AppDataSource.getRepository(Projeto).create(projetoData);

    if (req.body.projeto.premioId) {
        const premio = await premioRepository.findById(req.body.projeto.premioId);
        if (!premio) {
            return res.status(400).json({ message: "Prêmio não encontrado" });
        }
        projeto.premio = premio;
    } else {
        return res.status(400).json({ message: "Prêmio é obrigatório" });
    }

    const autorIds = req.body.autorIds || [];
    if (!autorIds.includes(req.user!.id)) {
        autorIds.push(req.user!.id);
    }

    if (autorIds.length > 0) {
        projeto.autores = await AppDataSource.getRepository(Usuario).findBy({
            id: In(autorIds),
            tipo: "autor"
        });
        if (projeto.autores.length !== autorIds.length) {
            return res.status(400).json({ message: "Um ou mais autores não encontrados ou inválidos" });
        }
    } else {
        const autorPrincipal = await usuarioRepository.findById(req.user!.id);
        if (!autorPrincipal) {
            return res.status(404).json({ message: "Autor principal não encontrado" });
        }
        projeto.autores = [autorPrincipal];
    }

    try {
        const newProjeto = await projetoRepository.create(projeto, autorIds);
        res.status(201).json(newProjeto);
    } catch (error) {
        console.error("Erro ao criar projeto:", error);
        res.status(500).json({ message: "Erro ao criar projeto", details: (error as Error).message });
    }
});

app.get("/projetos/nao-avaliados", async (req: Request, res: Response) => {
    try {
        const projetos = await projetoRepository.findNotEvaluated();
        if (!projetos || projetos.length === 0) {
            return res.status(200).json({ message: "Nenhum projeto não avaliado encontrado", data: [] });
        }
        res.json(projetos);
    } catch (error) {
        res.status(500).json({ message: "Erro interno ao processar a solicitação", details: (error as Error).message });
    }
});

app.get("/projetos/avaliados", async (req: Request, res: Response) => {
    try {
        const projetos = await projetoRepository.findEvaluated();
        if (!projetos || projetos.length === 0) {
            return res.status(200).json({ message: "Nenhum projeto avaliado encontrado", data: [] });
        }
        res.json(projetos);
    } catch (error) {
        res.status(500).json({ message: "Erro interno ao processar a solicitação", details: (error as Error).message });
    }
});

app.get("/projetos/vencedores", async (req: Request, res: Response) => {
    try {
        const projetos = await projetoRepository.findWinners();
        if (!projetos || projetos.length === 0) {
            return res.status(200).json({ message: "Nenhum projeto vencedor encontrado", data: [] });
        }
        res.json(projetos);
    } catch (error) {
        res.status(500).json({ message: "Erro interno ao processar a solicitação", details: (error as Error).message });
    }
});

app.get("/projetos", async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const autorId = parseInt(req.query.autorId as string);
    const premioId = parseInt(req.query.premioId as string);
    const relations = (req.query.relations as string)?.split(",") || ["avaliacoes", "avaliacoes.avaliador", "autores", "premio"];

    if (!isNaN(premioId)) {
        try {
            const projetos = await AppDataSource.getRepository(Projeto).find({
                where: { premio: { id: premioId } },
                relations,
                select: {
                    id: true,
                    areaTematica: true,
                    titulo: true,
                    resumo: true,
                    dataEnvio: true,
                    avaliado: true,
                    vencedor: true,
                    autorPrincipalId: true,
                    premio: { id: true, nome: true, ano: true },
                    autores: { id: true, nome: true }
                }
            });
            if (!projetos || projetos.length === 0) {
                return res.status(200).json({ message: "Nenhum projeto encontrado para este prêmio", data: [] });
            }
            console.log(`Projetos encontrados para premioId ${premioId}:`, JSON.stringify(projetos, null, 2));
            res.json(projetos);
        } catch (error) {
            console.error("Erro ao buscar projetos por premioId:", error);
            res.status(500).json({ message: "Erro ao buscar projetos", details: (error as Error).message });
        }
        return;
    }

    if (!isNaN(autorId)) {
        return authenticateToken(req, res, async () => {
            try {
                const projetos = await AppDataSource.getRepository(Projeto).find({
                    where: [
                        { autorPrincipalId: autorId },
                        { autores: { id: autorId } },
                    ],
                    relations,
                });
                if (!projetos || projetos.length === 0) {
                    return res.status(200).json({ message: "Nenhum projeto encontrado", data: [] });
                }
                console.log(`Projetos encontrados para autorId ${autorId}:`, JSON.stringify(projetos, null, 2));
                res.json(projetos);
            } catch (error) {
                console.error("Erro ao buscar projetos:", error);
                res.status(500).json({ message: "Erro ao buscar projetos", details: (error as Error).message });
            }
        });
    }

    try {
        const projetos = await projetoRepository.findAll(relations);
        if (!projetos || projetos.length === 0) {
            return res.status(200).json({ message: "Nenhum projeto encontrado", data: [] });
        }
        console.log("Todos os projetos:", JSON.stringify(projetos, null, 2));
        res.json(projetos);
    } catch (error) {
        console.error("Erro ao buscar projetos:", error);
        res.status(500).json({ message: "Erro ao buscar projetos", details: (error as Error).message });
    }
});

app.get("/projetos/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "ID inválido" });
    const projeto = await projetoRepository.findById(id);
    if (!projeto) return res.status(404).json({ message: "Projeto não encontrado" });
    res.json(projeto);
});

app.put("/projetos/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "ID inválido" });

    const projeto = await projetoRepository.findById(id);
    if (!projeto) return res.status(404).json({ message: "Projeto não encontrado" });
    if (projeto.avaliado) return res.status(403).json({ message: "Não é possível editar um projeto já avaliado" });

    const { areaTematica, titulo, resumo } = req.body.projeto;
    const autorIds = req.body.autorIds || [];

    if (!areaTematica || !titulo || !resumo) {
        return res.status(400).json({ message: "Campos obrigatórios ausentes" });
    }

    projeto.areaTematica = areaTematica;
    projeto.titulo = titulo;
    projeto.resumo = resumo;

    if (req.body.projeto.premioId) {
        const premio = await premioRepository.findById(req.body.projeto.premioId);
        if (!premio) {
            return res.status(400).json({ message: "Prêmio não encontrado" });
        }
        projeto.premio = premio;
    }

    if (autorIds.length > 0) {
        projeto.autores = await AppDataSource.getRepository(Usuario).findBy({
            id: In(autorIds),
            tipo: "autor"
        });
        if (projeto.autores.length !== autorIds.length) {
            return res.status(400).json({ message: "Um ou mais autores não encontrados ou inválidos" });
        }
    }

    try {
        const updatedProjeto = await projetoRepository.update(id, projeto, autorIds);
        res.json(updatedProjeto);
    } catch (error) {
        res.status(500).json({ message: "Erro ao atualizar o projeto", details: (error as Error).message });
    }
});

app.delete("/projetos/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "ID inválido" });

    const projeto = await projetoRepository.findById(id);
    if (!projeto) return res.status(404).json({ message: "Projeto não encontrado" });

    // Verifica se há avaliações associadas
    const avaliacaoCount = await AppDataSource.getRepository(Avaliacao).count({ where: { projeto: { id } } });
    if (avaliacaoCount > 0) {
        return res.status(403).json({ message: "Não é possível excluir um projeto que possui avaliações associadas." });
    }

    try {
        await projetoRepository.delete(id);
        res.status(204).send();
    } catch (error) {
        console.error("Erro ao excluir projeto:", error);
        res.status(500).json({ message: "Erro ao excluir projeto", details: (error as Error).message });
    }
});

app.post("/avaliacoes", async (req: Request, res: Response) => {
    const { nota, parecer, dataAvaliacao, projetoId, avaliadorId } = req.body.avaliacao || {};

    if (!nota || !parecer || !dataAvaliacao || !projetoId || !avaliadorId) {
        return res.status(400).json({ message: "Campos obrigatórios ausentes (nota, parecer, dataAvaliacao, projetoId, avaliadorId)" });
    }

    const avaliacao = new Avaliacao();
    avaliacao.nota = nota;
    avaliacao.parecer = parecer;
    avaliacao.dataAvaliacao = new Date(dataAvaliacao); // Converter para Date

    const projeto = await AppDataSource.getRepository(Projeto).findOne({
        where: { id: projetoId },
        relations: ["autores"],
    });
    if (!projeto) return res.status(404).json({ message: "Projeto não encontrado" });
    avaliacao.projeto = projeto;

    const avaliador = await AppDataSource.getRepository(Usuario).findOne({
        where: { id: avaliadorId },
        select: ["id", "nome", "tipo"],
    });
    if (!avaliador || avaliador.tipo !== "avaliador") {
        return res.status(404).json({ message: "Avaliador não encontrado ou inválido" });
    }
    avaliacao.avaliador = avaliador;

    const isAutor = projeto.autores.some((autor) => autor.id === avaliador.id);
    if (isAutor) return res.status(400).json({ message: "Avaliador não pode avaliar seu próprio projeto" });

    const existingAvaliacao = await AppDataSource.getRepository(Avaliacao).findOneBy({
        projeto: { id: projetoId },
        avaliador: { id: avaliadorId },
    });
    if (existingAvaliacao) return res.status(400).json({ message: "Projeto já avaliado por este avaliador" });

    const errors = await validate(avaliacao);
    if (errors.length > 0) {
        return res.status(400).json({ message: "Erro de validação", details: errors });
    }

    try {
        const newAvaliacao = await avaliacaoRepository.create(avaliacao, projetoId, avaliadorId);
        const updatedProjeto = await AppDataSource.getRepository(Projeto).findOneOrFail({
            where: { id: projetoId },
            relations: ["avaliacoes", "avaliacoes.avaliador", "autores", "premio"],
        });
        if (!updatedProjeto.avaliado && (await AppDataSource.getRepository(Avaliacao).countBy({ projeto: { id: projetoId } })) >= 3) {
            await AppDataSource.createQueryBuilder()
                .update(Projeto)
                .set({ avaliado: true })
                .where("id = :id", { id: projetoId })
                .execute();
            updatedProjeto.avaliado = true;
        }
        res.status(201).json({ avaliacao: newAvaliacao, projeto: updatedProjeto });
    } catch (error) {
        res.status(400).json({ message: "Erro ao criar avaliação", details: (error as Error).message });
    }
});

app.get("/avaliacoes/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "ID inválido" });
    const avaliacao = await avaliacaoRepository.findById(id);
    if (!avaliacao) return res.status(404).json({ message: "Avaliação não encontrada" });
    res.json(avaliacao);
});

app.get("/avaliacoes", async (req: Request, res: Response) => {
    const avaliacoes = await avaliacaoRepository.findAll();
    if (!avaliacoes || avaliacoes.length === 0) {
        return res.status(200).json({ message: "Nenhuma avaliação encontrada", data: [] });
    }
    res.json(avaliacoes);
});

app.put("/avaliacoes/:id", async (req, res) => {
    const { id } = req.params;
    const { nota, parecer, dataAvaliacao, projetoId, avaliadorId } = req.body;

    console.log("Dados recebidos para atualização:", { id, nota, parecer, dataAvaliacao, projetoId, avaliadorId });
    try {
        const avaliacao = await AppDataSource.getRepository(Avaliacao).findOneOrFail({
            where: { id: parseInt(id) },
            relations: ["projeto", "avaliador"]
        });

        if (nota !== undefined) avaliacao.nota = nota;
        if (parecer !== undefined) {
            console.log("Atualizando parecer para:", parecer);
            avaliacao.parecer = parecer;
        }
        if (dataAvaliacao !== undefined) avaliacao.dataAvaliacao = new Date(dataAvaliacao);

        if (projetoId !== undefined) {
            const projeto = await AppDataSource.getRepository(Projeto).findOneBy({ id: projetoId });
            if (!projeto) throw new Error("Projeto não encontrado");
            avaliacao.projeto = projeto;
        }

        if (avaliadorId !== undefined) {
            const avaliador = await AppDataSource.getRepository(Usuario).findOneBy({ id: avaliadorId });
            if (!avaliador || avaliador.tipo !== "avaliador") throw new Error("Avaliador não encontrado ou inválido");
            avaliacao.avaliador = avaliador;
        }

        const updatedAvaliacao = await AppDataSource.getRepository(Avaliacao).save(avaliacao);
        res.json({ message: "Avaliação atualizada com sucesso.", avaliacao: updatedAvaliacao });
    } catch (error) {
        res.status(500).json({ message: "Erro ao atualizar avaliação.", details: (error as Error).message });
    }
});

app.delete("/avaliacoes/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "ID inválido" });
    await avaliacaoRepository.delete(id);
    res.status(204).send();
});

app.listen(3001, () => {
    console.log("Servidor rodando na porta 3001");
});