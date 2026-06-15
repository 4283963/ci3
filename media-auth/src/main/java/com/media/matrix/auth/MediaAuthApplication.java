package com.media.matrix.auth;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = {"com.media.matrix.auth", "com.media.matrix.common"})
@MapperScan("com.media.matrix.auth.mapper")
public class MediaAuthApplication {

    public static void main(String[] args) {
        SpringApplication.run(MediaAuthApplication.class, args);
    }
}
