package com.erpsupermarche.config;

import com.erpsupermarche.entity.*;
import com.erpsupermarche.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private StockRepository stockRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        try {
            jdbcTemplate.execute("ALTER TABLE purchases MODIFY COLUMN status VARCHAR(50);");
            System.out.println("Modified purchases status column successfully.");
        } catch (Exception e) {
            System.out.println("Could not modify purchases status column: " + e.getMessage());
        }

        // 1. Create default admin user if not exists
        if (userRepository.findByEmail("admin@erp.com").isEmpty()) {
            createAdmin();
            createManager();
            createCashier();
            createMagasinier();
            createRH();
            createSuppliers();
            createProducts();
            System.out.println("=== Comptes crees avec succes ===");
            System.out.println("ADMIN     : admin@erp.com       / admin123");
            System.out.println("MANAGER   : manager@erp.com     / manager123");
            System.out.println("CAISSIER  : caissier@erp.com    / caissier123");
            System.out.println("MAGASINIER: magasinier@erp.com  / magasinier123");
            System.out.println("RH        : rh@erp.com          / rh123");
            System.out.println("=================================");
        }
    }

    private void createAdmin() {
        User admin = User.builder()
                .name("Admin Principal")
                .email("admin@erp.com")
                .password(passwordEncoder.encode("admin123"))
                .role(UserRole.ADMIN)
                .phoneNumber("0123456789")
                .active(true)
                .build();
        userRepository.save(admin);

        Employee employee = Employee.builder()
                .user(admin)
                .employeeNumber("EMP001")
                .firstName("Admin")
                .lastName("Principal")
                .address("Siège Social ERP")
                .position("Administrateur Système")
                .department("Informatique")
                .hireDate(LocalDate.now().minusYears(1))
                .status(EmploymentStatus.ACTIVE)
                .active(true)
                .build();
        employeeRepository.save(employee);
    }

    private void createManager() {
        User manager = User.builder()
                .name("Jean Manager")
                .email("manager@erp.com")
                .password(passwordEncoder.encode("manager123"))
                .role(UserRole.MANAGER)
                .active(true)
                .build();
        userRepository.save(manager);

        Employee employee = Employee.builder()
                .user(manager)
                .employeeNumber("EMP002")
                .firstName("Jean")
                .lastName("Manager")
                .address("10 rue de la Paix, Paris")
                .position("Directeur de Magasin")
                .department("Direction")
                .hireDate(LocalDate.now().minusMonths(6))
                .status(EmploymentStatus.ACTIVE)
                .active(true)
                .build();
        employeeRepository.save(employee);
    }

    private void createCashier() {
        User cashier = User.builder()
                .name("Marie Caissière")
                .email("caissier@erp.com")
                .password(passwordEncoder.encode("caissier123"))
                .role(UserRole.CAISSIER)
                .active(true)
                .build();
        userRepository.save(cashier);

        Employee employee = Employee.builder()
                .user(cashier)
                .employeeNumber("EMP003")
                .firstName("Marie")
                .lastName("Caissière")
                .address("5 avenue des Fleurs, Lyon")
                .position("Hôtesse de Caisse")
                .department("Ventes")
                .hireDate(LocalDate.now().minusMonths(3))
                .status(EmploymentStatus.ACTIVE)
                .active(true)
                .build();
        employeeRepository.save(employee);
    }

    private void createMagasinier() {
        User mag = User.builder()
                .name("Pierre Magasinier")
                .email("magasinier@erp.com")
                .password(passwordEncoder.encode("magasinier123"))
                .role(UserRole.MAGASINIER)
                .active(true)
                .build();
        userRepository.save(mag);

        employeeRepository.save(Employee.builder()
                .user(mag)
                .employeeNumber("EMP004")
                .firstName("Pierre")
                .lastName("Magasinier")
                .address("12 rue du Stock, Marseille")
                .position("Magasinier")
                .department("Logistique")
                .hireDate(LocalDate.now().minusMonths(4))
                .status(EmploymentStatus.ACTIVE)
                .active(true)
                .build());
    }

    private void createRH() {
        User rh = User.builder()
                .name("Sophie RH")
                .email("rh@erp.com")
                .password(passwordEncoder.encode("rh123"))
                .role(UserRole.RH)
                .active(true)
                .build();
        userRepository.save(rh);

        employeeRepository.save(Employee.builder()
                .user(rh)
                .employeeNumber("EMP005")
                .firstName("Sophie")
                .lastName("Ressources")
                .address("8 avenue du Personnel, Toulouse")
                .position("Responsable RH")
                .department("Ressources Humaines")
                .hireDate(LocalDate.now().minusMonths(2))
                .status(EmploymentStatus.ACTIVE)
                .active(true)
                .build());
    }

    private void createSuppliers() {
        if (supplierRepository.count() == 0) {
            supplierRepository.save(Supplier.builder()
                    .name("Global Food Supplies")
                    .email("contact@globalfood.com")
                    .phoneNumber("0144556677")
                    .address("123 Rue de l'Alimentation, Lyon")
                    .contactPerson("Mr. Durand")
                    .active(true)
                    .build());
            
            supplierRepository.save(Supplier.builder()
                    .name("Tech Drink SA")
                    .email("sales@techdrink.com")
                    .phoneNumber("0122334455")
                    .address("45 Avenue des Boissons, Paris")
                    .active(true)
                    .build());
        }
    }

    private void createProducts() {
        if (productRepository.count() == 0) {
            Product p1 = productRepository.save(Product.builder()
                    .name("Lait Entier 1L")
                    .barcode("3012345678901")
                    .category("Crèmerie")
                    .costPrice(new BigDecimal("0.80"))
                    .price(new BigDecimal("1.20"))
                    .unit("L")
                    .active(true)
                    .build());
            
            stockRepository.save(Stock.builder()
                    .product(p1)
                    .quantity(100)
                    .minQuantity(20)
                    .warehouseLocation("Rayon A1")
                    .build());

            Product p2 = productRepository.save(Product.builder()
                    .name("Coca-Cola 1.5L")
                    .barcode("5449000000996")
                    .category("Boissons")
                    .costPrice(new BigDecimal("1.10"))
                    .price(new BigDecimal("1.95"))
                    .unit("unité")
                    .active(true)
                    .build());
            
            stockRepository.save(Stock.builder()
                    .product(p2)
                    .quantity(150)
                    .minQuantity(30)
                    .warehouseLocation("Rayon C3")
                    .build());
        }
    }
}
