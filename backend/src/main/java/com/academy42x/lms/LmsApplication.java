package com.academy42x.lms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

/** 42X Academy LMS backend — REST API under /api. */
@SpringBootApplication
@ConfigurationPropertiesScan
public class LmsApplication {

    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(LmsApplication.class);
        // The local Microsoft sign-in (AzureSqlTokenCallback) opens a browser; headless mode blocks that.
        app.setHeadless(false);
        app.run(args);
    }
}
