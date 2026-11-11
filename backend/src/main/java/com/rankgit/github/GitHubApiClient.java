package com.rankgit.github;

import com.rankgit.common.exception.BusinessException;
import com.rankgit.common.exception.ResourceNotFoundException;
import com.rankgit.github.dto.CommitActivityResult;
import com.rankgit.github.dto.GitHubCommitSearchResponse;
import com.rankgit.github.dto.GitHubRepoResponse;
import com.rankgit.github.dto.GitHubUserResponse;
import com.rankgit.ranking.dto.DeveloperDetailsDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.time.Instant;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class GitHubApiClient {

    private static final Logger log = LoggerFactory.getLogger(GitHubApiClient.class);
    private static final String GITHUB_API_URL = "https://api.github.com";
    private static final Pattern GITHUB_URL_PATTERN =
            Pattern.compile("^(?:https?:\\/\\/)?(?:www\\.)?github\\.com\\/([a-zA-Z0-9_.-]+)\\/?$");

    private final RestClient restClient;
    private final GitHubProperties gitHubProperties;

    @Value("${spring.security.oauth2.client.registration.github.client-id:}")
    private String clientId;

    @Value("${spring.security.oauth2.client.registration.github.client-secret:}")
    private String clientSecret;

    public GitHubApiClient(GitHubProperties gitHubProperties) {
        this.gitHubProperties = gitHubProperties;
        this.restClient = RestClient.builder()
                .baseUrl(GITHUB_API_URL)
                .defaultHeader(HttpHeaders.ACCEPT, "application/vnd.github+json")
                .defaultHeader("X-GitHub-Api-Version", "2022-11-28")
                .build();
    }

    /**
     * Extrai o nome de usuário a partir de um link do GitHub ou username puro.
     * Ex: https://github.com/torvalds -> torvalds
     *     @torvalds -> torvalds
     *     torvalds -> torvalds
     */
    public String extractUsername(String input) {
        if (input == null || input.trim().isEmpty()) {
            throw new BusinessException("Link ou username do GitHub não pode ser vazio");
        }

        String trimmed = input.trim();

        if (trimmed.startsWith("@")) {
            return trimmed.substring(1);
        }

        Matcher matcher = GITHUB_URL_PATTERN.matcher(trimmed);
        if (matcher.matches()) {
            return matcher.group(1);
        }

        // Se for um link mais longo com subpath (ex: https://github.com/torvalds?tab=repositories)
        if (trimmed.contains("github.com/")) {
            String[] parts = trimmed.split("github\\.com\\/");
            if (parts.length > 1) {
                String sub = parts[1].split("[/?#]")[0];
                if (!sub.isEmpty()) {
                    return sub;
                }
            }
        }

        // Caso seja apenas o username diretamente (ex: torvalds)
        if (trimmed.matches("^[a-zA-Z0-9_.-]+$")) {
            return trimmed;
        }

        throw new BusinessException("Formato inválido de link ou username do GitHub: " + input);
    }

    /**
     * Busca informações públicas de um usuário no GitHub.
     */
    public GitHubUserResponse fetchUserDetails(String username) {
        String cleanUsername = extractUsername(username);

        try {
            return restClient.get()
                    .uri("/users/{username}", cleanUsername)
                    .headers(this::applyAuthHeader)
                    .retrieve()
                    .onStatus(HttpStatusCode::is4xxClientError, (req, resp) -> {
                        if (resp.getStatusCode().value() == 404) {
                            throw new ResourceNotFoundException("Usuário '" + cleanUsername + "' não encontrado no GitHub.");
                        }
                        throw new BusinessException("Erro ao buscar usuário no GitHub: HTTP " + resp.getStatusCode());
                    })
                    .body(GitHubUserResponse.class);
        } catch (ResourceNotFoundException | BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("Erro inesperado ao consultar usuário {} no GitHub: {}", cleanUsername, e.getMessage());
            throw new BusinessException("Não foi possível se comunicar com o GitHub: " + e.getMessage());
        }
    }

    private LocalDate parseCommitDate(String rawDate) {
        if (rawDate == null || rawDate.isBlank()) return null;
        try {
            OffsetDateTime odt = OffsetDateTime.parse(rawDate);
            return odt.atZoneSameInstant(ZoneId.systemDefault()).toLocalDate();
        } catch (Exception e1) {
            try {
                Instant instant = Instant.parse(rawDate);
                return instant.atZone(ZoneId.systemDefault()).toLocalDate();
            } catch (Exception e2) {
                try {
                    return LocalDate.parse(rawDate.substring(0, 10));
                } catch (Exception e3) {
                    return null;
                }
            }
        }
    }

    /**
     * Busca o total de commits e os últimos commits do usuário em chamada otimizada,
     * agrupando as datas reais e calculando o streak exato sem estourar o rate limit do GitHub.
     */
    public CommitActivityResult fetchCommitActivity(String username) {
        String cleanUsername = extractUsername(username);
        String query = "author:" + cleanUsername;

        Set<String> knownShas = new HashSet<>();
        Map<LocalDate, Integer> dailyCounts = new HashMap<>();
        int searchTotalCount = 0;

        // 1. Busca commits recentes diretamente dos repositórios do desenvolvedor
        // (captura commits de repositórios próprios mesmo se o autor git tiver email/nome não indexado no search)
        try {
            List<DeveloperDetailsDto.RecentCommitDto> recentCommits = fetchRecentCommits(cleanUsername);
            for (DeveloperDetailsDto.RecentCommitDto c : recentCommits) {
                if (c.sha() == null || c.sha().isBlank()) continue;
                knownShas.add(c.sha());

                LocalDate date = parseCommitDate(c.date());
                if (date != null) {
                    dailyCounts.put(date, dailyCounts.getOrDefault(date, 0) + 1);
                }
            }
        } catch (Exception e) {
            log.warn("Falha ao obter commits recentes dos repositórios para contagem de {}: {}", cleanUsername, e.getMessage());
        }

        // 2. Busca histórico geral via Search API
        Set<String> searchShas = new HashSet<>();
        try {
            GitHubCommitSearchResponse response = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/search/commits")
                            .queryParam("q", query)
                            .queryParam("sort", "author-date")
                            .queryParam("order", "desc")
                            .queryParam("per_page", 100)
                            .build())
                    .headers(this::applyAuthHeader)
                    .retrieve()
                    .body(GitHubCommitSearchResponse.class);

            searchTotalCount = response != null && response.totalCount() != null ? response.totalCount() : 0;

            if (response != null && response.items() != null) {
                for (GitHubCommitSearchResponse.CommitItem item : response.items()) {
                    if (item.commit() == null || item.sha() == null) continue;
                    searchShas.add(item.sha());

                    // Se esse commit já foi registrado pelos repositórios recentes, não duplica no diário
                    if (knownShas.contains(item.sha())) {
                        continue;
                    }

                    String rawDate = null;
                    if (item.commit().author() != null && item.commit().author().date() != null) {
                        rawDate = item.commit().author().date();
                    } else if (item.commit().committer() != null && item.commit().committer().date() != null) {
                        rawDate = item.commit().committer().date();
                    }

                    LocalDate date = parseCommitDate(rawDate);
                    if (date != null) {
                        dailyCounts.put(date, dailyCounts.getOrDefault(date, 0) + 1);
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Erro ao buscar atividade de commits na search para {}: {}", cleanUsername, e.getMessage());
        }

        // Commits extras dos repositórios que não estavam indexados no search
        long trulyExtraCommits = knownShas.stream().filter(sha -> !searchShas.contains(sha)).count();
        int totalCount = Math.max((int) (searchTotalCount + trulyExtraCommits), dailyCounts.values().stream().mapToInt(Integer::intValue).sum());

        int streak = calculateStreak(dailyCounts);
        return new CommitActivityResult(totalCount, dailyCounts, streak);
    }

    private int calculateStreak(Map<LocalDate, Integer> dailyCounts) {
        LocalDate today = LocalDate.now();
        int streak = 0;

        // Se hoje tem commits, começamos de hoje. Se não, verificamos se ontem teve commits.
        LocalDate current = today;
        if (dailyCounts.getOrDefault(current, 0) == 0) {
            current = today.minusDays(1);
        }

        while (dailyCounts.getOrDefault(current, 0) > 0) {
            streak++;
            current = current.minusDays(1);
        }

        return streak;
    }

    /**
     * Calcula commits filtrados por intervalo de datas usando a sintaxe precisa do GitHub (author-date:).
     */
    public int fetchCommitCount(String username, LocalDate startDate, LocalDate endDate) {
        String cleanUsername = extractUsername(username);
        StringBuilder query = new StringBuilder("author:").append(cleanUsername);

        if (startDate != null && endDate != null) {
            if (startDate.equals(endDate)) {
                query.append(" author-date:").append(startDate.format(DateTimeFormatter.ISO_LOCAL_DATE));
            } else {
                query.append(" author-date:")
                        .append(startDate.format(DateTimeFormatter.ISO_LOCAL_DATE))
                        .append("..")
                        .append(endDate.format(DateTimeFormatter.ISO_LOCAL_DATE));
            }
        } else if (startDate != null) {
            query.append(" author-date:>=").append(startDate.format(DateTimeFormatter.ISO_LOCAL_DATE));
        } else if (endDate != null) {
            query.append(" author-date:<=").append(endDate.format(DateTimeFormatter.ISO_LOCAL_DATE));
        }

        try {
            GitHubCommitSearchResponse response = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/search/commits")
                            .queryParam("q", query.toString())
                            .queryParam("per_page", 1)
                            .build())
                    .headers(this::applyAuthHeader)
                    .retrieve()
                    .body(GitHubCommitSearchResponse.class);

            return response != null && response.totalCount() != null ? response.totalCount() : 0;
        } catch (Exception e) {
            log.warn("Search commits falhou para {} (query: {}): {}", cleanUsername, query, e.getMessage());
            return 0;
        }
    }

    /**
     * Busca os repositórios públicos mais recentes de um usuário no GitHub, ordenados pelos últimos pushes.
     */
    public List<GitHubRepoResponse> fetchUserRepos(String username) {
        String cleanUsername = extractUsername(username);
        try {
            GitHubRepoResponse[] repos = restClient.get()
                    .uri("/users/{username}/repos?sort=pushed&per_page=6", cleanUsername)
                    .headers(this::applyAuthHeader)
                    .retrieve()
                    .body(GitHubRepoResponse[].class);

            return repos != null ? Arrays.asList(repos) : Collections.emptyList();
        } catch (Exception e) {
            log.warn("Erro ao buscar repositórios para {}: {}", cleanUsername, e.getMessage());
            return Collections.emptyList();
        }
    }

    /**
     * Busca os commits recentes do usuário com dados de repositório e mensagem.
     * Combina os commits dos repositórios recentemente atualizados com a busca global de commits,
     * garantindo que commits em repositórios próprios sejam capturados mesmo se o autor local tiver
     * nome/email ligeiramente divergente da conta GitHub.
     */
    public List<DeveloperDetailsDto.RecentCommitDto> fetchRecentCommits(String username) {
        String cleanUsername = extractUsername(username);
        Map<String, DeveloperDetailsDto.RecentCommitDto> commitsMap = new LinkedHashMap<>();

        // 1. Busca commits diretamente dos repositórios recentemente modificados pelo desenvolvedor
        try {
            List<GitHubRepoResponse> repos = fetchUserRepos(cleanUsername);
            for (GitHubRepoResponse repo : repos) {
                if (repo.name() == null || repo.name().isBlank()) continue;
                try {
                    GitHubCommitSearchResponse.CommitItem[] repoCommits = restClient.get()
                            .uri("/repos/{owner}/{repo}/commits?per_page=5", cleanUsername, repo.name())
                            .headers(this::applyAuthHeader)
                            .retrieve()
                            .body(GitHubCommitSearchResponse.CommitItem[].class);

                    if (repoCommits != null) {
                        for (GitHubCommitSearchResponse.CommitItem item : repoCommits) {
                            if (item.commit() == null || item.sha() == null) continue;

                            String sha = item.sha();
                            String shortSha = sha.length() >= 7 ? sha.substring(0, 7) : sha;
                            String message = item.commit().message() != null ? item.commit().message().split("\n")[0] : "";
                            String date = "";
                            if (item.commit().author() != null && item.commit().author().date() != null) {
                                date = item.commit().author().date();
                            } else if (item.commit().committer() != null && item.commit().committer().date() != null) {
                                date = item.commit().committer().date();
                            }

                            String repoFullName = cleanUsername + "/" + repo.name();
                            String commitUrl = item.htmlUrl() != null && !item.htmlUrl().isBlank()
                                    ? item.htmlUrl()
                                    : "https://github.com/" + repoFullName + "/commit/" + sha;

                            commitsMap.putIfAbsent(sha, new DeveloperDetailsDto.RecentCommitDto(
                                    sha, shortSha, message, date, repoFullName, repo.htmlUrl(), commitUrl
                            ));
                        }
                    }
                } catch (Exception e) {
                    log.debug("Não foi possível buscar commits do repositório {}/{}: {}", cleanUsername, repo.name(), e.getMessage());
                }
            }
        } catch (Exception e) {
            log.warn("Falha ao obter lista de repositórios para coletar commits de {}: {}", cleanUsername, e.getMessage());
        }

        // 2. Complementa com a busca global de commits por autor
        try {
            String query = "author:" + cleanUsername;
            GitHubCommitSearchResponse response = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/search/commits")
                            .queryParam("q", query)
                            .queryParam("sort", "author-date")
                            .queryParam("order", "desc")
                            .queryParam("per_page", 15)
                            .build())
                    .headers(this::applyAuthHeader)
                    .retrieve()
                    .body(GitHubCommitSearchResponse.class);

            if (response != null && response.items() != null) {
                for (GitHubCommitSearchResponse.CommitItem item : response.items()) {
                    if (item.commit() == null || item.sha() == null) continue;

                    String sha = item.sha();
                    String shortSha = sha.length() >= 7 ? sha.substring(0, 7) : sha;
                    String message = item.commit().message() != null ? item.commit().message().split("\n")[0] : "";
                    String date = "";
                    if (item.commit().author() != null && item.commit().author().date() != null) {
                        date = item.commit().author().date();
                    } else if (item.commit().committer() != null && item.commit().committer().date() != null) {
                        date = item.commit().committer().date();
                    }

                    String repoName = item.repository() != null ? item.repository().fullName() : "";
                    String repoUrl = item.repository() != null ? item.repository().htmlUrl() : "";
                    String commitUrl = item.htmlUrl() != null ? item.htmlUrl() : "";

                    commitsMap.putIfAbsent(sha, new DeveloperDetailsDto.RecentCommitDto(
                            sha, shortSha, message, date, repoName, repoUrl, commitUrl
                    ));
                }
            }
        } catch (Exception e) {
            log.warn("Erro ao buscar commits na API de search para {}: {}", cleanUsername, e.getMessage());
        }

        List<DeveloperDetailsDto.RecentCommitDto> list = new ArrayList<>(commitsMap.values());

        // Garante ordenação estrita dos commits do mais novo até o mais velho
        list.sort((c1, c2) -> {
            if (c1.date() == null && c2.date() == null) return 0;
            if (c1.date() == null) return 1;
            if (c2.date() == null) return -1;
            return c2.date().compareTo(c1.date());
        });

        return list.size() > 15 ? list.subList(0, 15) : list;
    }

    private void applyAuthHeader(HttpHeaders headers) {
        headers.set("Accept", "application/vnd.github.cloak-preview+json, application/vnd.github+json");
        headers.set("User-Agent", "RankGit-Application");
        String token = gitHubProperties.getApiToken();
        if (token != null && !token.trim().isEmpty()) {
            headers.setBearerAuth(token.trim());
        } else if (clientId != null && !clientId.isBlank() && clientSecret != null && !clientSecret.isBlank()) {
            headers.setBasicAuth(clientId.trim(), clientSecret.trim());
        }
    }
}
