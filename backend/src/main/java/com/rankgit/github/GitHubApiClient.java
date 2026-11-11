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
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.time.LocalDate;
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

    /**
     * Busca o total de commits e os últimos commits do usuário em UMA ÚNICA chamada otimizada,
     * agrupando as datas reais e calculando o streak exato sem estourar o rate limit do GitHub.
     */
    public CommitActivityResult fetchCommitActivity(String username) {
        String cleanUsername = extractUsername(username);
        String query = "author:" + cleanUsername;

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

            int totalCount = response != null && response.totalCount() != null ? response.totalCount() : 0;
            Map<LocalDate, Integer> dailyCounts = new HashMap<>();

            if (response != null && response.items() != null) {
                for (GitHubCommitSearchResponse.CommitItem item : response.items()) {
                    if (item.commit() == null) continue;
                    String rawDate = null;
                    if (item.commit().author() != null && item.commit().author().date() != null) {
                        rawDate = item.commit().author().date();
                    } else if (item.commit().committer() != null && item.commit().committer().date() != null) {
                        rawDate = item.commit().committer().date();
                    }

                    if (rawDate != null && rawDate.length() >= 10) {
                        try {
                            LocalDate date = LocalDate.parse(rawDate.substring(0, 10));
                            dailyCounts.put(date, dailyCounts.getOrDefault(date, 0) + 1);
                        } catch (Exception ex) {
                            // Ignora datas com formato irregular
                        }
                    }
                }
            }

            int streak = calculateStreak(dailyCounts);
            return new CommitActivityResult(totalCount, dailyCounts, streak);
        } catch (Exception e) {
            log.warn("Erro ao buscar atividade de commits para {}: {}", cleanUsername, e.getMessage());
            return new CommitActivityResult(0, new HashMap<>(), 0);
        }
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
     * Busca os repositórios públicos mais recentes de um usuário no GitHub.
     */
    public List<GitHubRepoResponse> fetchUserRepos(String username) {
        String cleanUsername = extractUsername(username);
        try {
            GitHubRepoResponse[] repos = restClient.get()
                    .uri("/users/{username}/repos?sort=updated&per_page=6", cleanUsername)
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
     */
    public List<DeveloperDetailsDto.RecentCommitDto> fetchRecentCommits(String username) {
        String cleanUsername = extractUsername(username);
        String query = "author:" + cleanUsername;

        try {
            GitHubCommitSearchResponse response = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/search/commits")
                            .queryParam("q", query)
                            .queryParam("sort", "author-date")
                            .queryParam("order", "desc")
                            .queryParam("per_page", 10)
                            .build())
                    .headers(this::applyAuthHeader)
                    .retrieve()
                    .body(GitHubCommitSearchResponse.class);

            if (response != null && response.items() != null) {
                List<DeveloperDetailsDto.RecentCommitDto> list = new ArrayList<>();
                for (GitHubCommitSearchResponse.CommitItem item : response.items()) {
                    if (item.commit() == null) continue;

                    String message = item.commit().message() != null ? item.commit().message().split("\n")[0] : "";
                    String date = "";
                    if (item.commit().author() != null && item.commit().author().date() != null) {
                        date = item.commit().author().date();
                    } else if (item.commit().committer() != null && item.commit().committer().date() != null) {
                        date = item.commit().committer().date();
                    }

                    String sha = item.sha() != null ? item.sha() : "";
                    String shortSha = sha.length() >= 7 ? sha.substring(0, 7) : sha;
                    String repoName = item.repository() != null ? item.repository().fullName() : "";
                    String repoUrl = item.repository() != null ? item.repository().htmlUrl() : "";
                    String commitUrl = item.htmlUrl() != null ? item.htmlUrl() : "";

                    list.add(new DeveloperDetailsDto.RecentCommitDto(
                            sha, shortSha, message, date, repoName, repoUrl, commitUrl
                    ));
                }
                return list;
            }
        } catch (Exception e) {
            log.warn("Erro ao buscar commits recentes para {}: {}", cleanUsername, e.getMessage());
        }

        return Collections.emptyList();
    }

    private void applyAuthHeader(HttpHeaders headers) {
        String token = gitHubProperties.getApiToken();
        if (token != null && !token.trim().isEmpty()) {
            headers.setBearerAuth(token.trim());
        }
    }
}
