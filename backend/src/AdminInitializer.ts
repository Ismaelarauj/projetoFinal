import { AppDataSource } from "./data-source";
import { Usuario } from "./entities/Usuario";
import { Premio } from "./entities/Premio";
import { Projeto } from "./entities/Projeto";
import { Avaliacao } from "./entities/Avaliacao";
import * as bcrypt from "bcryptjs";
import cpfGenerator from "gerador-validador-cpf";
import { validate } from "class-validator";
import { UsuarioRepository } from "./repositories/UsuarioRepository";
import { PremioRepository } from "./repositories/PremioRepository";
import { ProjetoRepository } from "./repositories/ProjetoRepository";
import { AvaliacaoRepository } from "./repositories/AvaliacaoRepository";

export class AdminInitializer {
    private usuarioRepository: UsuarioRepository;
    private premioRepository: PremioRepository;
    private projetoRepository: ProjetoRepository;
    private avaliacaoRepository: AvaliacaoRepository;

    constructor() {
        this.usuarioRepository = new UsuarioRepository();
        this.premioRepository = new PremioRepository();
        this.projetoRepository = new ProjetoRepository();
        this.avaliacaoRepository = new AvaliacaoRepository();
    }

    async populateDatabase(): Promise<void> {
        try {
            console.log("Iniciando população do banco de dados...");

            // 1. Criar Admin (ou obter se já existir)
            const admin = await this.createAdminUser();
            if (!admin) {
                throw new Error("Falha ao criar/obter usuário admin");
            }
            console.log("Admin configurado:", admin.email);

            // 2. Criar outros usuários de exemplo
            const usuarios = await this.createSampleUsers();
            const autores = usuarios.filter(u => u.tipo === "autor");
            const avaliadores = usuarios.filter(u => u.tipo === "avaliador");

            // 3. Criar prêmios
            const premios = await this.createSamplePremios(admin.id);

            // 4. Criar projetos
            const projetos = await this.createSampleProjects(premios, autores);

            // 5. Criar avaliações
            await this.createSampleEvaluations(projetos, avaliadores);

            console.log("Banco de dados populado com sucesso!");
        } catch (error) {
            console.error("Erro durante a população do banco:", error);
            throw error;
        }
    }

    private async createAdminUser(): Promise<Usuario> {
        const adminEmail = "admin@innovatehub.com";

        try {
            // Verifica se o admin já existe
            let admin = await this.usuarioRepository.findByEmail(adminEmail);

            if (admin) {
                console.log("Admin já existe no banco de dados");
                return admin;
            }

            // Cria novo admin
            console.log("Criando novo usuário admin...");
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash("admin123", salt);

            admin = new Usuario();
            admin.email = adminEmail;
            admin.senha = hashedPassword;
            admin.tipo = "admin";
            admin.nome = "Admin Innovate";
            admin.cpf = cpfGenerator.generate({ format: true });
            admin.dataNascimento = "1990-01-01";
            admin.telefone = "(11) 98765-4321";
            admin.pais = "Brasil";
            admin.cidade = "São Paulo";
            admin.estado = "SP";
            admin.rua = "Rua Exemplo";
            admin.avenida = "Avenida Exemplo";
            admin.lote = "123";
            admin.numero = "10";

            // Valida os dados antes de salvar
            const errors = await validate(admin);
            if (errors.length > 0) {
                console.error("Erros de validação:", errors);
                throw new Error("Dados do admin inválidos");
            }

            // Salva no banco
            admin = await this.usuarioRepository.create(admin);
            console.log("Novo admin criado com sucesso");
            return admin;

        } catch (error) {
            console.error("Erro ao criar admin:", error);
            throw error;
        }
    }

    private async createSampleUsers(): Promise<Usuario[]> {
        const usersData = [
            {
                nome: "João Silva",
                email: "joao.silva@email.com",
                cpf: cpfGenerator.generate({ format: true }),
                dataNascimento: "1995-03-15",
                telefone: "(11) 91234-5678",
                pais: "Brasil",
                cidade: "São Paulo",
                estado: "SP",
                rua: "Rua A",
                avenida: "Avenida B",
                lote: "10",
                numero: "100",
                senha: await bcrypt.hash("senha123", 10),
                tipo: "autor" as const,
                especialidade: "Engeharia"
            },
            {
                nome: "Maria Oliveira",
                email: "maria.oliveira@email.com",
                cpf: cpfGenerator.generate({ format: true }),
                dataNascimento: "1990-07-22",
                telefone: "(21) 99876-5432",
                pais: "Brasil",
                cidade: "Rio de Janeiro",
                estado: "RJ",
                rua: "Rua C",
                avenida: "Avenida D",
                lote: "20",
                numero: "200",
                senha: await bcrypt.hash("senha123", 10),
                tipo: "autor" as const,
                especialidade: "Tecnologia"

            },
            {
                nome: "Carlos Santos",
                email: "carlos.santos@email.com",
                cpf: cpfGenerator.generate({ format: true }),
                dataNascimento: "1985-11-10",
                telefone: "(31) 98765-4321",
                pais: "Brasil",
                cidade: "Belo Horizonte",
                estado: "MG",
                rua: "Rua E",
                avenida: "Avenida F",
                lote: "30",
                numero: "300",
                senha: await bcrypt.hash("senha123", 10),
                tipo: "avaliador" as const,
                especialidade: "Ciência da Computação",
            },
            {
                nome: "Ana Costa",
                email: "ana.costa@email.com",
                cpf: cpfGenerator.generate({ format: true }),
                dataNascimento: "1988-04-05",
                telefone: "(41) 97654-3210",
                pais: "Brasil",
                cidade: "Curitiba",
                estado: "PR",
                rua: "Rua G",
                avenida: "Avenida H",
                lote: "40",
                numero: "400",
                senha: await bcrypt.hash("senha123", 10),
                tipo: "avaliador" as const,
                especialidade: "Engenharia",
            },
            {
                nome: "Ana Carolina Silva",
                email: "ana.silva@tecnologia.com",
                tipo: "autor" as const,
                senha: await bcrypt.hash("Autor@2023!", 10),
                especialidade: "Computação voltada para Física Química",
                cpf: cpfGenerator.generate({ format: true }),
                dataNascimento: "1990-03-15",
                telefone: "(21) 99876-5432",
                pais: "Brasil",
                cidade: "Rio de Janeiro",
                estado: "RJ",
                rua: "Rua Cláudio",
                avenida: "Avenida H",
                lote: "4056",
            },
            {
                nome: "Dr. Carlos Eduardo Mendes",
                email: "carlos.mendes@engenharia.com",
                tipo: "avaliador" as const,
                senha: await bcrypt.hash("Avaliador#2023", 10),
                especialidade: "Engenharia de Materiais",
                cpf: cpfGenerator.generate({ format: true }),
                dataNascimento: "1975-07-22",
                telefone: "(11) 98765-1234",
                pais: "Brasil",
                cidade: "São Paulo",
                estado: "SP",
            },
            {
                nome: "Mariana Lopes Ferreira",
                email: "mariana.ferreira@sustentabilidade.org",
                tipo: "avaliador" as const,
                senha: await bcrypt.hash("Sustent@2023",10),
                especialidade: "Sustentabilidade Ambiental",
                cpf: cpfGenerator.generate({ format: true }),
                dataNascimento: "1988-11-30",
                telefone: "(31) 97654-3210",
                pais: "Brasil",
                cidade: "Belo Horizonte",
                estado: "MG",
            },
            {
                nome: "João Pedro Almeida",
                email: "joao.almeida@startups.com",
                tipo: "autor" as const,
                senha: await bcrypt.hash("Startup@2023",10),
                especialidade: null,
                cpf: cpfGenerator.generate({ format: true }),
                dataNascimento: "1995-05-10",
                telefone: "(41) 96543-2109",
                pais: "Brasil",
                cidade: "Curitiba",
                estado: "PR",
                formacao: "Administração - UFPR",
                ocupacao: "Empreendedor"
            }
        ];

        const users: Usuario[] = [];

        for (const userData of usersData) {
            let user = await this.usuarioRepository.findByEmail(userData.email);

            if (!user) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(userData.senha, salt);

                user = new Usuario();
                user.nome = userData.nome;
                user.email = userData.email;
                user.tipo = userData.tipo;
                user.senha = userData.senha;
                user.cpf = userData.cpf;
                user.dataNascimento = userData.dataNascimento;
                user.telefone = userData.telefone;
                user.pais = userData.pais;
                user.cidade = userData.cidade;
                user.estado = userData.estado;
                user.especialidade = userData.especialidade;

                user = await this.usuarioRepository.create(user);
                console.log(`Usuário ${user.nome} criado`);
            } else {
                console.log(`Usuário ${user.nome} já existe`);
            }

            users.push(user);
        }

        return users;
    }

    private async createSamplePremios(adminId: number): Promise<Premio[]> {
        const premiosData = [
            {
                nome: "Prêmio Inovação Tecnológica 2025",
                descricao: "Premiação para projetos inovadores na área de tecnologia",
                cronograma: [
                    { dataInicio: "2025-01-10", dataFim: "2025-03-30", descricao: "Período de inscrições" },
                    { dataInicio: "2025-04-01", dataFim: "2025-05-15", descricao: "Avaliação preliminar" },
                ],
                ano: 2023
            },
            {
                nome: "Prêmio Sustentabilidade 2025",
                descricao: "Premiação para projetos com impacto ambiental positivo",
                cronograma: [
                    { dataInicio: "2025-02-10", dataFim: "2025-04-30", descricao: "Período de inscrições" },
                    { dataInicio: "2025-05-01", dataFim: "2025-06-30", descricao: "Avaliação preliminar" },
                ],
                ano: 2023
            },
            {
                nome: "Prêmio Nacional de Inovação Tecnológica 2025",
                descricao: "Reconhecimento a projetos que avançam a transformação digital e a inovação tecnológica no Brasil, com foco em soluções escaláveis e de alto impacto.",
                cronograma: [
                    { dataInicio: "2025-05-16", dataFim: "2025-06-30", descricao: "Avaliação final" },
                    { dataInicio: "2025-07-15", dataFim: "2025-07-15", descricao: "Cerimônia de premiação" }
                ],
                ano: 2025,
            },
            {
                nome: "Prêmio EcoFuturo 2025",
                descricao: "Iniciativa para premiar projetos que promovam a sustentabilidade ambiental e o uso responsável de recursos naturais, com impacto social mensurável.",
                cronograma: [
                    { dataInicio: "2025-06-16", dataFim: "2025-07-30", descricao: "Avaliação final" },
                    { dataInicio: "2025-08-10", dataFim: "2025-08-10", descricao: "Evento de premiação" }
                ],
                ano: 2025,
            }
        ];

        const premios: Premio[] = [];

        for (const premioData of premiosData) {
            const premio = new Premio();
            premio.nome = premioData.nome;
            premio.descricao = premioData.descricao;
            premio.cronograma = premioData.cronograma;
            premio.ano = premioData.ano;
            premio.criadoPorId = adminId;

            const createdPremio = await this.premioRepository.create(premio);
            premios.push(createdPremio);
            console.log(`Prêmio ${createdPremio.nome} criado`);
        }

        return premios;
    }

    private async createSampleProjects(premios: Premio[], autores: Usuario[]): Promise<Projeto[]> {
        if (autores.length < 1) throw new Error("Nenhum autor disponível");
        if (premios.length < 1) throw new Error("Nenhum prêmio disponível");

        const projetosData = [
            {
                titulo: "Sistema de Gestão Inteligente",
                areaTematica: "Tecnologia",
                resumo: "Sistema de IA para automação de processos empresariais",
                premio: premios[0],
                autorPrincipalId: autores[0].id
            },
            {
                titulo: "Energia Solar Acessível",
                areaTematica: "Sustentabilidade",
                resumo: "Tecnologia para baratear painéis solares",
                premio: premios[1],
                autorPrincipalId: autores[0].id
            },
            {
                titulo: "Plataforma de Gestão Inteligente com IA",
                areaTematica: "Inteligência Artificial",
                resumo: "Desenvolvimento de uma plataforma baseada em inteligência artificial para otimização de processos logísticos em indústrias, reduzindo custos em até 20% e emissões de CO2 em 15%.",
                premio: premios[2],
                autorPrincipalId: autores[0].id,
            },
            {
                titulo: "Sistema de Energia Solar de Baixo Custo",
                areaTematica: "Energia Renovável",
                resumo: "Solução inovadora para produção de painéis solares com materiais reciclados, reduzindo o custo de produção em 30% e viabilizando energia limpa para comunidades de baixa renda.",
                premio: premios[3],
                autorPrincipalId: autores[3].id,
            }
        ];

        const projetos: Projeto[] = [];

        for (const projetoData of projetosData) {
            const projeto = new Projeto();
            projeto.titulo = projetoData.titulo;
            projeto.areaTematica = projetoData.areaTematica;
            projeto.resumo = projetoData.resumo;
            projeto.premio = projetoData.premio;
            projeto.autorPrincipalId = projetoData.autorPrincipalId;
            projeto.dataEnvio = new Date();

            const createdProjeto = await this.projetoRepository.create(projeto, [projetoData.autorPrincipalId]);
            projetos.push(createdProjeto);
            console.log(`Projeto ${createdProjeto.titulo} criado`);
        }

        return projetos;
    }

    private async createSampleEvaluations(projetos: Projeto[], avaliadores: Usuario[]): Promise<void> {
        if (avaliadores.length < 2) throw new Error("Pelo menos 2 avaliadores são necessários");

        const avaliacoesData = [
            {
                projeto: projetos[0],
                avaliador: avaliadores[0],
                nota: 8.5,
                parecer: "Projeto inovador com bom potencial de mercado"
            },
            {
                projeto: projetos[0],
                avaliador: avaliadores[1],
                nota: 7.0,
                parecer: "Boa ideia, mas precisa de mais desenvolvimento"
            },
            {
                projeto: projetos[1],
                avaliador: avaliadores[0],
                nota: 9.0,
                parecer: "Excelente solução para um problema real"
            },
            {
                projeto: projetos[1],
                avaliador: avaliadores[1],
                nota: 8.0,
                parecer: "Projeto bem estruturado com impacto social positivo"
            }
        ];

        for (const avaliacaoData of avaliacoesData) {
            const avaliacao = new Avaliacao();
            avaliacao.nota = avaliacaoData.nota;
            avaliacao.parecer = avaliacaoData.parecer;
            avaliacao.dataAvaliacao = new Date();

            await this.avaliacaoRepository.create(
                avaliacao,
                avaliacaoData.projeto.id,
                avaliacaoData.avaliador.id
            );

            console.log(`Avaliação criada para projeto ${avaliacaoData.projeto.titulo} por ${avaliacaoData.avaliador.nome}`);
        }
    }
}
