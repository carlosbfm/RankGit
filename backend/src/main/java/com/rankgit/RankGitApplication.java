package com.rankgit;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class RankGitApplication {

    public static void main(String[] args) {
        SpringApplication.run(RankGitApplication.class, args);
    }
}
