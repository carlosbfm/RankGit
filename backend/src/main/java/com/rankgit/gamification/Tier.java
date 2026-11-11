package com.rankgit.gamification;

public enum Tier {
    BRONZE("Bronze", 0, 99, "bg-amber-700/20 text-amber-500 border-amber-600/30"),
    SILVER("Silver", 100, 499, "bg-slate-400/20 text-slate-300 border-slate-400/30"),
    GOLD("Gold", 500, 1499, "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"),
    PLATINUM("Platinum", 1500, 3999, "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"),
    DIAMOND("Diamond", 4000, 9999, "bg-blue-500/20 text-blue-300 border-blue-500/30"),
    GRANDMASTER("Grandmaster", 10000, Integer.MAX_VALUE, "bg-purple-500/20 text-purple-300 border-purple-500/30");

    private final String displayName;
    private final int minCommits;
    private final int maxCommits;
    private final String cssClass;

    Tier(String displayName, int minCommits, int maxCommits, String cssClass) {
        this.displayName = displayName;
        this.minCommits = minCommits;
        this.maxCommits = maxCommits;
        this.cssClass = cssClass;
    }

    public static Tier fromCommitCount(int commits) {
        for (Tier tier : values()) {
            if (commits >= tier.minCommits && commits <= tier.maxCommits) {
                return tier;
            }
        }
        return BRONZE;
    }

    public String getDisplayName() {
        return displayName;
    }

    public int getMinCommits() {
        return minCommits;
    }

    public int getMaxCommits() {
        return maxCommits;
    }

    public String getCssClass() {
        return cssClass;
    }
}
