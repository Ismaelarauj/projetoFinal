# Gerenciamento de Projetos

## Descrição
Este projeto é uma aplicação full-stack para gerenciamento de projetos científicos ou acadêmicos, abrangendo prêmios, autores, avaliadores, projetos e avaliações. O backend é desenvolvido em Node.js com TypeORM e MySQL, oferecendo uma API REST para gerenciar as entidades. O frontend é construído com React.js e Tailwind CSS, proporcionando uma interface intuitiva para criar, listar, atualizar e excluir dados. Regras de negócio, como a proibição de avaliadores avaliarem seus próprios projetos, foram implementadas para garantir a integridade dos dados.

## Tecnologias Utilizadas
- **Backend**: Node.js, TypeScript, Express, TypeORM, MySQL, class-validator, dotenv
- **Frontend**: React.js, TypeScript, React Router, Axios, Tailwind CSS
- **IDE**: IntelliJ IDEA (versão Ultimate recomendada para suporte a Node.js e React)
- **Banco de Dados**: MySQL
- **Gerenciamento de Pacotes**: npm
- **Controle de Versão**: Git (opcional)

## Estrutura do Projeto
```
gerenciamento-projetos/
├── backend/
│   ├── src/
│   │   ├── entities/         # Definições das entidades (Premio.ts, Autor.ts, etc.)
│   │   │   ├── Premio.ts
│   │   │   ├── Autor.ts
│   │   │   ├── Avaliador.ts
│   │   │   ├── Projeto.ts
│   │   │   ├── Avaliacao.ts
│   │   ├── repositories/     # Repositórios para operações CRUD e consultas
│   │   │   ├── PremioRepository.ts
│   │   │   ├── AutorRepository.ts
│   │   │   ├── AvaliadorRepository.ts
│   │   │   ├── ProjetoRepository.ts
│   │   │   ├── AvaliacaoRepository.ts
│   │   ├── data-source.ts    # Configuração do TypeORM e conexão com MySQL
│   │   ├── index.ts          # Ponto de entrada da API REST
│   ├── .env                  # Variáveis de ambiente (credenciais do MySQL)
│   ├── package.json          # Dependências e scripts do backend
│   ├── tsconfig.json         # Configuração do TypeScript para o backend
├── frontend/
│   ├── src/
│   │   ├── components/       # Componentes React para interface
│   │   │   ├── ProjetoList.tsx
│   │   │   ├── ProjetoForm.tsx
│   │   │   ├── AutorList.tsx
│   │   │   ├── AutorForm.tsx
│   │   │   ├── AvaliacaoForm.tsx
│   │   │   ├── AvaliadorForm.tsx
│   │   │   ├── PremioForm.tsx
│   │   ├── App.tsx           # Componente principal da aplicação
│   │   ├── index.tsx         # Ponto de entrada do React
│   │   ├── index.css         # Estilos com Tailwind CSS
│   ├── public/
│   │   ├── index.html        # HTML base da aplicação
│   ├── package.json          # Dependências e scripts do frontend
│   ├── tsconfig.json         # Configuração do TypeScript para o frontend
│   ├── tailwind.config.js    # Configuração do Tailwind CSS
├── README.md                 # Este arquivo
```

## Pré-requisitos
- **Node.js**: Versão 16 ou superior (verifique com `node --version`).
- **MySQL**: Versão 8.x recomendada (instale e configure manualmente).
- **npm**: Gerenciador de pacotes (instalado com Node.js).
- **IntelliJ IDEA**: Versão Ultimate recomendada (Community pode ser usada com limitações, mas requer configuração manual).
- **Git**: Opcional, para controle de versão.

## Instalação

### 1. Clonar o Repositório
```bash
git clone https://github.com/seu-usuario/gerenciamento-projetos.git
cd gerenciamento-projetos
```

### 2. Configurar o Banco de Dados
- Instale o MySQL e inicie o serviço:
    - **Linux (Ubuntu/Debian)**: `sudo apt install mysql-server && sudo service mysql start`
    - **macOS (com Homebrew)**: `brew install mysql && brew services start mysql`
    - **Windows**: Baixe e instale via site oficial, inicie o serviço no "Gerenciador de Serviços".
- Crie o banco de dados:
  ```bash
  mysql -u root -p
  CREATE DATABASE gerenciamento_projetos;
  EXIT;
  ```
- Configure as credenciais no arquivo `backend/.env`:
  ```
  DB_HOST=127.0.0.1
  DB_PORT=3306
  DB_USERNAME=root
  DB_PASSWORD=sua_senha
  DB_DATABASE=gerenciamento_projetos
  ```
- (Opcional) Ajuste permissões do usuário `root` se a conexão falhar:
  ```sql
  ALTER USER 'root'@'localhost' IDENTIFIED WITH 'mysql_native_password' BY 'sua_senha';
  GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost';
  FLUSH PRIVILEGES;
  ```
- Verifique a porta 3306:
    - Certifique-se de que o MySQL está escutando na porta 3306 (`netstat -tuln | grep 3306`).
    - Abra a porta no firewall se necessário:
        - **Linux**: `sudo ufw allow 3306`
        - **Windows**: Desative temporariamente o firewall para teste.

### 3. Instalar Dependências
- **Backend**:
  ```bash
  cd backend
  npm install
  ```
- **Frontend**:
  ```bash
  cd ../frontend
  npm install
  ```

### 4. Configurar no IntelliJ IDEA
- Abra o projeto: `File > Open` e selecione a pasta `gerenciamento-projetos`.
- Configure dois módulos:
    - **Backend**: Adicione como módulo Node.js (ou genérico se indisponível) e aponte para `backend/src/index.ts`.
        - Vá para `File > Settings > Languages & Frameworks > Node.js` e configure o interpretador Node.js.
    - **Frontend**: Adicione como módulo React (ou genérico) e aponte para `frontend/package.json`.
        - Ative suporte a TypeScript e React em `File > Settings > Languages & Frameworks > JavaScript`.
- Configure o MySQL no `Database` tool:
    - Host: `127.0.0.1`
    - Port: `3306`
    - User: `root`
    - Password: `sua_senha`
    - Database: `gerenciamento_projetos`
    - Teste a conexão com o botão "Test Connection".
- Crie configurações de execução:
    - **Backend**: `Run > Edit Configurations > Node.js` (ou Shell Script com `cd backend && npm start`).
    - **Frontend**: `Run > Edit Configurations > npm` com comando `start`.

## Execução

### 1. Iniciar o Backend
```bash
cd backend
npm start
```
O servidor rodará em `http://localhost:3000`. Verifique os logs para depuração (ative `logging: true` em `data-source.ts` se necessário).

### 2. Iniciar o Frontend
```bash
cd frontend
npm start
```
Acesse `http://localhost:3000` no navegador.

## Uso
- **Listar Projetos**: Página inicial com filtros (Todos, Não Avaliados, Avaliados, Vencedores).
- **Criar Projeto**: Formulário para adicionar projetos com múltiplos autores.
- **Gerenciar Autores**: Lista e formulário para criar/editar autores.
- **Gerenciar Avaliações**: Formulário para avaliar projetos (respeitando regras de negócio).
- **Gerenciar Avaliadores e Prêmios**: Formulários para criar novas entidades.
- **Testar API**: Use ferramentas como Postman para endpoints como `/projetos` ou `/avaliacoes`.

## Regras de Negócio Implementadas
- **Múltiplos Autores por Projeto**: Relacionamento muitos-para-muitos entre `Projeto` e `Autor`.
- **Avaliador Não Avalia Seu Próprio Projeto**: Verificado no endpoint `/avaliacoes`.
- **Projeto Avaliado Apenas Uma Vez por Avaliador**: Restrição no endpoint `/avaliacoes`.
- **Apenas Projetos Avaliados Podem Ser Vencedores**: Controlado pelo campo `avaliado` e consulta `findWinners`.

## Endpoints da API
- **Prêmios**:
    - `GET /premios` - Listar todos
    - `GET /premios/:id` - Buscar por ID
    - `POST /premios` - Criar
    - `PUT /premios/:id` - Atualizar
    - `DELETE /premios/:id` - Deletar
- **Autores**:
    - `GET /autores` - Listar todos com projetos
    - `GET /autores/:id` - Buscar por ID
    - `POST /autores` - Criar
    - `PUT /autores/:id` - Atualizar
    - `DELETE /autores/:id` - Deletar
- **Avaliadores**:
    - `GET /avaliadores` - Listar todos
    - `GET /avaliadores/:id` - Buscar por ID
    - `POST /avaliadores` - Criar
    - `PUT /avaliadores/:id` - Atualizar
    - `DELETE /avaliadores/:id` - Deletar
- **Projetos**:
    - `GET /projetos` - Listar todos
    - `GET /projetos/:id` - Buscar por ID
    - `GET /projetos/nao-avaliados` - Listar não avaliados
    - `GET /projetos/avaliados` - Listar avaliados
    - `GET /projetos/vencedores` - Listar vencedores
    - `POST /projetos` - Criar (com autores)
    - `PUT /projetos/:id` - Atualizar
    - `DELETE /projetos/:id` - Deletar
- **Avaliações**:
    - `GET /avaliacoes` - Listar todas
    - `GET /avaliacoes/:id` - Buscar por ID
    - `POST /avaliacoes` - Criar (com projeto e avaliador)
    - `PUT /avaliacoes/:id` - Atualizar
    - `DELETE /avaliacoes/:id` - Deletar

## Contribuição
1. Faça um fork do repositório.
2. Crie uma branch para sua feature: `git checkout -b feature/nova-funcionalidade`.
3. Commit suas mudanças: `git commit -m "Adiciona nova funcionalidade"`.
4. Envie para o repositório: `git push origin feature/nova-funcionalidade`.
5. Abra um Pull Request com uma descrição clara das alterações.

## Licença
Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes (caso aplicável, adicione um arquivo `LICENSE` se desejar).

## Notas Adicionais
- **Ambiente de Produção**: Desative `synchronize: true` em `backend/src/data-source.ts` e use migrações:
    - Gere migrações: `npx typeorm migration:generate -d src/data-source.ts src/migrations/InitialMigration`.
    - Execute migrações: `npx typeorm migration:run -d src/data-source.ts`.
- **Segurança**: Adicione autenticação com JWT para proteger endpoints sensíveis.
- **Validações**: Expanda as validações (ex.: formato de e-mail, nota entre 0 e 100).
- **Relatórios**: Considere adicionar endpoints com filtros por data ou autor (ex.: `/projetos?data=2025-07-09`).
- **Depuração**: Ative `logging: true` em `backend/src/data-source.ts` para logs detalhados e verifique erros de conexão com MySQL (ex.: porta 3306 bloqueada ou credenciais inválidas).
- **Suporte**: Para dúvidas, abra uma issue no repositório ou contate o mantenedor.

Atualizado em: 11:26 PM -03, Quarta-feira, 09 de Julho de 2025.

