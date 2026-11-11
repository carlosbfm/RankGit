package com.rankgit.gamification;

public enum BadgeType {
    COMMIT_MACHINE("Commit Machine", "Mais de 1.000 commits acumulados"),
    STREAK_MASTER("Streak Master", "Mais de 7 dias consecutivos com commits"),
    OCTOCAT_VETERAN("Octocat Veteran", "Possui mais de 30 repositórios públicos"),
    WEEKLY_SPRINTER("Weekly Sprinter", "Mais de 25 commits registrados nesta semana"),
    COMMUNITY_STAR("Community Star", "Mais de 50 seguidores no GitHub"),
    PODIUM_CHAMPION("Podium Champion", "Alcançou o Top 3 no ranking geral");

    private final String title;
    private final String description;

    BadgeType(String title, String description) {
        this.title = title;
        this.description = description;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }
}
