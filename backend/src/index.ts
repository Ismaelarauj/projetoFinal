import express, { Request, Response } from "express";
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

const app = express();
app.use(express.json());
app.use(cors());

const premioRepository = new PremioRepository();
const usuarioRepository = new UsuarioRepository();
const projetoRepository = new ProjetoRepository();
const avaliacaoRepository = new AvaliacaoRepository();

// Inicializar conexão com o banco
AppDataSource.initialize()
    .then(() => {})
    .catch((err) => {
        throw new Error(`Erro ao conectar ao banco de dados: ${(err as Error).message}`);
    });

// Função de validação personalizada para cronograma
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

// Endpoints: Prêmios
app.post("/premios", async (req: Request, res: Response) => {
    const { nome, descricao, cronograma, ano } = req.body;

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

    try {
        const newPremio = await premioRepository.create(premio);
        res.status(201).json(newPremio);
    } catch (error) {
        res.status(500).json({ message: "Erro ao criar prêmio", details: (error as Error).message });
    }
});

app.get("/premios", async (req: Request, res: Response) => {
    const currentDate = new Date().toISOString();
    const premios = await premioRepository.findAll();
    const activePremios = premios.filter(premio =>
        premio.cronograma.some(item =>
            new Date(item.dataInicio) <= new Date(currentDate) &&
            new Date(item.dataFim) >= new Date(currentDate)
        )
    );
    res.json(activePremios);
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
    const premio = await premioRepository.update(id, req.body);
    if (!premio) return res.status(404).json({ message: "Prêmio não encontrado" });
    res.json(premio);
});

app.delete("/premios/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "ID inválido" });
    await premioRepository.delete(id);
    res.status(204).send();
});

// Endpoints: Usuários
app.post("/usuarios", async (req: Request, res: Response) => {
    const usuario = new Usuario();
    Object.assign(usuario, req.body);
    const errors = await validate(usuario);
    if (errors.length > 0) {
        return res.status(400).json({ message: "Campos obrigatórios ausentes ou inválidos", details: errors });
    }
    try {
        const newUsuario = await usuarioRepository.create(req.body);
        res.status(201).json(newUsuario);
    } catch (error) {
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
    res.json(usuarios);
});

app.get("/avaliadores", async (req: Request, res: Response) => {
    const usuarios = await usuarioRepository.findAllByType("avaliador");
    if (!usuarios || usuarios.length === 0) {
        return res.status(200).json({ message: "Nenhum avaliador encontrado", data: [] });
    }
    res.json(usuarios);
});

app.put("/usuarios/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "ID inválido" });
    const usuario = await usuarioRepository.update(id, req.body);
    if (!usuario) return res.status(404).json({ message: "Usuário não encontrado" });
    res.json(usuario);
});

app.delete("/usuarios/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "ID inválido" });
    await usuarioRepository.delete(id);
    res.status(204).send();
});

// Endpoints: Projetos
app.post("/projetos", async (req: Request, res: Response) => {
    const projetoData = {
        areaTematica: req.body.projeto.areaTematica,
        titulo: req.body.projeto.titulo,
        resumo: req.body.projeto.resumo,
        dataEnvio: new Date(),
        premioId: req.body.projeto.premioId
    };

    const projeto = AppDataSource.getRepository(Projeto).create(projetoData);

    if (projetoData.premioId) {
        const premio = await premioRepository.findById(projetoData.premioId);
        if (!premio) {
            return res.status(400).json({ message: "Prêmio não encontrado" });
        }
        projeto.premio = premio;
    } else {
        return res.status(400).json({ message: "Prêmio é obrigatório" });
    }

    const autorIds = req.body.autorIds || [];
    if (autorIds.length > 0) {
        const autores = await AppDataSource.getRepository(Usuario).findBy({ id: In(autorIds), tipo: "autor" });
        if (autores.length !== autorIds.length) {
            return res.status(400).json({ message: "Um ou mais autores não encontrados ou inválidos" });
        }
        projeto.autores = autores;
    }

    try {
        const newProjeto = await projetoRepository.create(projeto, autorIds);
        res.status(201).json(newProjeto);
    } catch (error) {
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

app.get("/projetos", async (req: Request, res: Response) => {
    const relations = (req.query.relations as string)?.split(",") || [];
    try {
        const projetos = await projetoRepository.findAll(relations.length > 0 ? relations : ["avaliacoes", "avaliacoes.avaliador", "autores", "premio"]);
        if (!projetos || projetos.length === 0) {
            return res.status(200).json({ message: "Nenhum projeto encontrado", data: [] });
        }
        res.json(projetos);
    } catch (error) {
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

app.put("/projetos/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "ID inválido" });
    const projeto = await projetoRepository.update(id, req.body.projeto, req.body.autorIds);
    if (!projeto) return res.status(404).json({ message: "Projeto não encontrado" });
    res.json(projeto);
});

app.delete("/projetos/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "ID inválido" });
    await projetoRepository.delete(id);
    res.status(204).send();
});

// Endpoints: Avaliações
app.post("/avaliacoes", async (req: Request, res: Response) => {
    const avaliacao = new Avaliacao();
    Object.assign(avaliacao, req.body.avaliacao);
    const errors = await validate(avaliacao);
    if (errors.length > 0) {
        return res.status(400).json({ message: "Erro de validação", details: errors });
    }

    const projeto = await AppDataSource.getRepository(Projeto).findOne({
        where: { id: req.body.projetoId },
        relations: ["autores"],
    });
    if (!projeto) return res.status(404).json({ message: "Projeto não encontrado" });

    const avaliador = await AppDataSource.getRepository(Usuario).findOne({
        where: { id: req.body.avaliadorId },
        select: ["id", "nome", "tipo"]
    });
    if (!avaliador || avaliador.tipo !== "avaliador") {
        return res.status(404).json({ message: "Avaliador não encontrado ou inválido" });
    }

    const isAutor = projeto.autores.some((autor) => autor.id === avaliador.id);
    if (isAutor) return res.status(400).json({ message: "Avaliador não pode avaliar seu próprio projeto" });

    const existingAvaliacao = await AppDataSource.getRepository(Avaliacao).findOneBy({
        projeto: { id: req.body.projetoId },
        avaliador: { id: req.body.avaliadorId },
    });
    if (existingAvaliacao) return res.status(400).json({ message: "Projeto já avaliado por este avaliador" });

    try {
        const newAvaliacao = await avaliacaoRepository.create(req.body.avaliacao, req.body.projetoId, req.body.avaliadorId);
        const updatedProjeto = await AppDataSource.getRepository(Projeto).findOneOrFail({
            where: { id: req.body.projetoId },
            relations: ["avaliacoes", "avaliacoes.avaliador", "autores", "premio"],
        });
        if (!updatedProjeto.avaliado && (await AppDataSource.getRepository(Avaliacao).countBy({ projeto: { id: req.body.projetoId } })) >= 3) {
            await AppDataSource.createQueryBuilder()
                .update(Projeto)
                .set({ avaliado: true })
                .where("id = :id", { id: req.body.projetoId })
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

app.put("/avaliacoes/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "ID inválido" });
    const avaliacao = await avaliacaoRepository.update(id, req.body);
    if (!avaliacao) return res.status(404).json({ message: "Avaliação não encontrada" });
    res.json(avaliacao);
});

app.delete("/avaliacoes/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "ID inválido" });
    await avaliacaoRepository.delete(id);
    res.status(204).send();
});

app.listen(3001, () => {});