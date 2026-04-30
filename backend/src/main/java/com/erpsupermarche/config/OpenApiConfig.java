package com.erpsupermarche.config;

import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.OpenAPI;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("ERP Supermarché API")
                        .version("1.0.0")
                        .description("API REST pour l'ERP Supermarché. Documentation interactive via Swagger UI.")
                        .contact(new Contact().name("ERP Team").email("support@erpsupermarche.local"))
                );
    }
}
