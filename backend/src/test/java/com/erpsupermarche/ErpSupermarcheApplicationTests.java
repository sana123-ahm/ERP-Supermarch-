package com.erpsupermarche;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {"spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1","spring.jpa.hibernate.ddl-auto=create-drop"})
class ErpSupermarcheApplicationTests {

    @Test
    void contextLoads() {
        // Basic smoke test: application context loads with in-memory H2
    }
}
