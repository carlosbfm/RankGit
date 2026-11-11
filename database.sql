-- =============================================================================
-- RankGit - Script de Criação do Banco de Dados PostgreSQL
-- =============================================================================

-- Criação do banco de dados (se necessário, execute separadamente):
-- CREATE DATABASE rankgit;
-- \c rankgit;

-- 1. Tabela de Usuários do Sistema (Autenticação Local e GitHub OAuth / Aprovações)
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    github_id VARCHAR(100) UNIQUE,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255),
    name VARCHAR(255),
    email VARCHAR(255),
    avatar_url VARCHAR(500),
    role VARCHAR(50) NOT NULL DEFAULT 'ROLE_USER',
    approved BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_github_id ON users(github_id);

-- 2. Tabela de Desenvolvedores Monitorados no Ranking
CREATE TABLE IF NOT EXISTS tracked_developers (
    id BIGSERIAL PRIMARY KEY,
    github_id BIGINT,
    username VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255),
    avatar_url VARCHAR(500),
    html_url VARCHAR(500),
    bio VARCHAR(1000),
    public_repos INT DEFAULT 0,
    followers INT DEFAULT 0,
    total_commits_cached INT DEFAULT 0,
    year_commits_cached INT DEFAULT 0,
    current_streak INT DEFAULT 0,
    tier VARCHAR(50) NOT NULL DEFAULT 'BRONZE',
    last_synced_at TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    added_by VARCHAR(100),
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_dev_username ON tracked_developers(username);
CREATE INDEX IF NOT EXISTS idx_dev_total_commits ON tracked_developers(total_commits_cached DESC);
CREATE INDEX IF NOT EXISTS idx_dev_active ON tracked_developers(active);

-- 3. Tabela de Registros Temporais de Commits (Histórico por Data)
CREATE TABLE IF NOT EXISTS developer_commit_records (
    id BIGSERIAL PRIMARY KEY,
    developer_id BIGINT NOT NULL REFERENCES tracked_developers(id) ON DELETE CASCADE,
    record_date DATE NOT NULL,
    commit_count INT NOT NULL DEFAULT 0,
    recorded_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_dev_record_date UNIQUE (developer_id, record_date)
);

CREATE INDEX IF NOT EXISTS idx_commit_record_date ON developer_commit_records(record_date);
CREATE INDEX IF NOT EXISTS idx_commit_dev_date ON developer_commit_records(developer_id, record_date);

-- 4. Tabela de Commits do Feed Social
CREATE TABLE IF NOT EXISTS feed_commits (
    id BIGSERIAL PRIMARY KEY,
    sha VARCHAR(64) NOT NULL UNIQUE,
    developer_username VARCHAR(100) NOT NULL,
    developer_name VARCHAR(200),
    developer_avatar_url VARCHAR(500),
    repo_name VARCHAR(200),
    repo_url VARCHAR(500),
    commit_message VARCHAR(2000),
    commit_url VARCHAR(500),
    committed_at TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feed_committed_at ON feed_commits(committed_at);
CREATE INDEX IF NOT EXISTS idx_feed_dev_username ON feed_commits(developer_username);

-- 5. Tabela de Reações Sociais dos Posts do Feed
CREATE TABLE IF NOT EXISTS feed_reactions (
    id BIGSERIAL PRIMARY KEY,
    commit_sha VARCHAR(64) NOT NULL,
    username VARCHAR(100) NOT NULL,
    reaction_type VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_commit_user_reaction UNIQUE (commit_sha, username, reaction_type)
);

CREATE INDEX IF NOT EXISTS idx_reaction_sha ON feed_reactions(commit_sha);

-- =============================================================================
-- Dados Iniciais dos Desenvolvedores Monitorados
-- =============================================================================
INSERT INTO tracked_developers (username, name, avatar_url, html_url, bio, public_repos, followers, total_commits_cached, current_streak, tier, added_by, active)
VALUES 
('Kazeyhaya', 'Alexandre Fontenele', 'https://avatars.githubusercontent.com/u/104997103?v=4', 'https://github.com/Kazeyhaya', 'Desenvolvedor Full Stack', 25, 12, 280, 0, 'SILVER', 'system', TRUE),
('carlosbfm', 'Carlos Manoel Alves Bonfim', 'https://avatars.githubusercontent.com/u/177028163?v=4', 'https://github.com/carlosbfm', 'Desenvolvedor de Software', 18, 5, 134, 0, 'BRONZE', 'system', TRUE),
('IcaroMatheusz', 'Ícaro Matheus', 'https://avatars.githubusercontent.com/u/118391807?v=4', 'https://github.com/IcaroMatheusz', 'Desenvolvedor', 15, 8, 129, 0, 'BRONZE', 'system', TRUE),
('AndreGJMacedo', 'André Gomes', 'https://avatars.githubusercontent.com/u/89617300?v=4', 'https://github.com/AndreGJMacedo', 'Desenvolvedor', 10, 4, 39, 0, 'BRONZE', 'system', TRUE)
ON CONFLICT (username) DO NOTHING;
