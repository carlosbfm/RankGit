# RankGit 🚀
### Leaderboard e Rede Social de Commits do GitHub

O **RankGit** é uma plataforma moderna, gamificada e competitiva para acompanhamento de contribuições e commits no GitHub, construída com **Spring Boot 3 (Java 21)**, **Angular 21** e **PostgreSQL**.

---

## 📋 Como Rodar o Projeto

Você pode rodar o RankGit de duas maneiras:
1. **Opção 1 (Recomendada — Mais Fácil)**: Usando **Docker Compose** (não precisa instalar Java, Maven nem Node.js na sua máquina).
2. **Opção 2 (Manual Tradicional)**: Instalando e rodando Java 21, Maven e Node.js localmente.

---

## 🐳 Opção 1: Rodando com Docker Compose (Sem instalar Java nem Angular)

Tudo o que você precisa é ter o [Docker](https://www.docker.com/) e o Docker Compose instalados.

### 1. Criar o arquivo `.env`
Na raiz do projeto, copie o modelo e preencha suas variáveis se desejar:
```bash
cp .env.example .env
```

### 2. Subir todo o ambiente com um único comando
Na raiz do repositório, execute:
```bash
docker compose up -d
```

O Docker fará o download e build automático de tudo:
* 🐘 **PostgreSQL 16**: Rodando na porta `5432` com volume persistente e schema inicial carregado.
* ☕ **Backend (Spring Boot 3 + Java 21)**: Rodando na porta `8080`.
* 🅰️ **Frontend (Angular + Nginx)**: Rodando na porta `4200`.

### 3. Acessar a aplicação
* Abra no seu navegador: **`http://localhost:4200`**
* Para parar os containers:
```bash
docker compose down
```

---

## ⚡ Opção 2: Rodando Manualmente Passo a Passo

### Pré-requisitos
* **Java 21 JDK**
* **Apache Maven 3.9+**
* **Node.js 20+** e **npm 10+**
* **PostgreSQL 14+** local

### 1. Configurar o Arquivo de Variáveis de Ambiente (`.env`)
Na raiz do projeto, crie o seu arquivo `.env`:
```bash
cp .env.example .env
```

### 2. Configurar o Banco de Dados PostgreSQL
Crie a base de dados `rankgit` e carregue o schema inicial:
```bash
psql -U postgres -c "CREATE DATABASE rankgit;"
psql -U postgres -d rankgit -f database.sql
```

### 3. Iniciar o Backend (Spring Boot 3)
```bash
cd backend
mvn clean spring-boot:run
```
Disponível em: `http://localhost:8080`.

### 4. Iniciar o Frontend (Angular 21)
```bash
cd frontend
npm install
npm start
```
Disponível em: `http://localhost:4200`.

---

## 🧭 Funcionalidades da Aplicação

### 1. 🏆 Ranking Geral (`/ranking`)
* **Pódio Oficial (Top 3)** com medalhas de Ouro, Prata e Bronze.
* Cards dos desenvolvedores monitorados com total de commits, sequência ativa (*streak*) e score.
* Acesso direto ao perfil no GitHub e atalho para a página de detalhes completos.

### 2. 📊 Tabela de Commits (`/commits`)
* Histórico flexível de contribuições filtrável por períodos (*Hoje, Esta Semana, Este Mês, Este Ano, Geral ou Intervalo Customizado*).
* Busca em tempo real por nome ou `@username`.
* **Paginação integrada no Backend e Frontend** (seletor de 5, 10, 25, 50 itens por página).
* Mini gráfico de atividade dos últimos 7 dias (*sparklines*).
* Botão de detalhes do desenvolvedor posicionado ao lado do atalho do GitHub.

### 3. 📡 Feed Social de Commits (`/feed`)
* Linha do tempo em tempo real com os commits subidos pelos desenvolvedores rastreados no GitHub.
* **Detecção automática de Conventional Commits**: tags coloridas para `feat`, `fix`, `refactor`, `docs`, `chore`, `style`, `test`.
* **Reações em Tempo Real**: usuários podem interagir com 🔥 (*Sensacional*), 🚀 (*Foguete*), ❤️ (*Curtir*), 💻 (*Codou muito*) e 👏 (*Parabéns*).
* Filtros dinâmicos por desenvolvedor e busca por mensagem de commit ou repositório.
* Botão de sincronização sob demanda com a API do GitHub.

### 4. 👤 Detalhes do Desenvolvedor (`/dev/:username`)
* Informações completas extraídas do GitHub:
  * Nome, avatar e bio.
  * 📅 **Data de criação do perfil no GitHub** (com tempo de estrada na plataforma).
  * 📍 Localização, 🏢 empresa, 🔗 blog/portfólio, 🐦 Twitter/X e ✉️ e-mail público.
  * Contadores de repositórios públicos, seguidores e seguindo.
* Métricas competitivas no ecossistema RankGit (posição geral, score, streak, badges desbloqueadas).
* **Repositórios públicos recentes** com estrelas ⭐, forks 🍴 e linguagem predominante.
* **Timeline dos últimos commits** com hashes SHA e links diretos para o GitHub.

### 5. ⭐ Como Funciona o Score (`/score`)
Página explicativa dedicada com a fórmula matemática oficial:
$$\text{Score} = (\text{Commits no Período} \times 10) + (\text{Sequência Ativa} \times 25)$$
* Divisão por faixas competitivas (*Bronze, Prata, Ouro, Platina, Diamante, Grandmaster*).
* Catálogo de todas as insígnias desbloqueáveis.

### 6. 🛡️ Painel Administrativo (`/admin`)
*(Acesso restrito para contas com permissão `ROLE_ADMIN`)*
* **Rastreamento de Desenvolvedores**:
  * Adicionar novos desenvolvedores colando a URL do perfil do GitHub ou o `@username`.
  * Sincronização em lote com a API do GitHub.
  * Listagem paginada e exclusão de rastreamento.
* **Gestão de Usuários e Aprovações**:
  * Visualização de contas com badges de status (🟢 *Liberado* / 🟡 *Pendente*).
  * Aprovação e revogação de acessos com 1 clique.
  * Cadastro manual de novos usuários e alteração de senhas/roles.
  * Paginação de contas no backend e frontend.

---

## 📱 Responsividade (Mobile & Tablet)
* **Navbar Inteligente**:
  * Em telas desktop/tablet ampla, exibe menu horizontal com indicadores de rota ativa.
  * Em smartphones e tablets menores (< 860px), ativa automaticamente o **Menu Hambúrguer** com gaveta deslizante completa.
* **Tabelas com Scroll Horizontal Suave**:
  * As tabelas administrativas e de commits possuem wrappers responsivos (`overflow-x: auto`), garantindo que não quebrem em telas estreitas.
* **Pódio e Cards Flexíveis**:
  * Em telas pequenas, o pódio empilha os líderes verticalmente e as grades de métricas adaptam-se para 1 ou 2 colunas.
* **Feed Social Otimizado**:
  * Os cards de postagem, balões de commits e barras de reações adaptam-se proporcionalmente ao toque em telas sensíveis.

---

## 🔐 Configuração do GitHub OAuth App (Opcional)
Para habilitar o botão **"Continuar com o GitHub"**:
1. Acesse: **[GitHub -> Settings -> Developer settings -> OAuth Apps -> New OAuth App](https://github.com/settings/applications/new)**
2. Preencha os campos:
   * **Application name**: `RankGit`
   * **Homepage URL**: `http://localhost:4200`
   * **Authorization callback URL**: `http://localhost:8080/login/oauth2/code/github`
3. Copie o **Client ID** e gere o **Client Secret**, adicionando-os ao seu `.env`.

---

## 🛡️ Segurança e Proteção de Dados Sensíveis
* O arquivo `.gitignore` bloqueia arquivos de ambiente (`.env`), certificados, builds (`target/`, `node_modules/`, `dist/`), logs e pastas de IDEs.
* Senhas de usuários locais são criptografadas com **BCrypt**.
* Sessões autenticadas utilizam tokens **JWT (HMAC-SHA256)** com tempo de expiração configurável.
* Nenhuma informação ou identidade de administrador é exposta publicamente na documentação ou nas telas de login.
