-- Seed data for ERP Supermarche
USE erp_supermarche;

-- 1. Users (Passwords are 'password123' hashed with BCrypt - $2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOnu)
-- Note: DataInitializer.java also creates an admin@erp.com / admin123
INSERT INTO users (id, name, email, password, role, active) VALUES
(UUID(), 'Jean Manager', 'manager@erp.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOnu', 'MANAGER', TRUE),
(UUID(), 'Marie Caissière', 'marie@erp.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOnu', 'CAISSIER', TRUE),
(UUID(), 'Pierre Magasinier', 'pierre@erp.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOnu', 'MAGASINIER', TRUE),
(UUID(), 'Sophie RH', 'sophie@erp.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOnu', 'RH', TRUE);

-- 2. Suppliers
INSERT INTO suppliers (id, name, description, email, phone_number, contact_person, active) VALUES
(UUID(), 'Global Food Supplies', 'Fournisseur principal produits frais', 'contact@globalfood.com', '0144556677', 'Mr. Durand', TRUE),
(UUID(), 'Tech Drink SA', 'Boissons et sodas', 'sales@techdrink.com', '0122334455', 'Mme. Leroy', TRUE),
(UUID(), 'Pro Clean', 'Produits d''entretien et hygiène', 'info@proclean.fr', '0188990011', 'Mr. Martin', TRUE);

-- 3. Products
-- We need to store IDs to link with stocks
SET @prod1 = UUID();
SET @prod2 = UUID();
SET @prod3 = UUID();
SET @prod4 = UUID();
SET @prod5 = UUID();

INSERT INTO products (id, name, barcode, category, buy_price, sale_price, unit) VALUES
(@prod1, 'Lait Entier 1L', '3012345678901', 'Crèmerie', 0.80, 1.20, 'L'),
(@prod2, 'Baguette Tradition', '3012345678902', 'Boulangerie', 0.40, 1.10, 'unité'),
(@prod3, 'Coca-Cola 1.5L', '5449000000996', 'Boissons', 1.20, 1.95, 'unité'),
(@prod4, 'Riz Basmati 1kg', '3012345678904', 'Épicerie', 1.50, 2.50, 'kg'),
(@prod5, 'Lessive Liquide 2L', '3012345678905', 'Entretien', 4.50, 8.90, 'unité');

-- 4. Stocks
INSERT INTO stocks (id, product_id, quantity, min_quantity, warehouse_location) VALUES
(UUID(), @prod1, 50, 10, 'Rayon A1'),
(UUID(), @prod2, 30, 5, 'Rayon B2'),
(UUID(), @prod3, 100, 20, 'Rayon C3'),
(UUID(), @prod4, 40, 10, 'Rayon D4'),
(UUID(), @prod5, 15, 5, 'Rayon E5');

-- 5. Employees (Linked to the users created above)
-- We find the user IDs
INSERT INTO employees (id, user_id, employee_number, first_name, last_name, address, position, department, hire_date)
SELECT UUID(), id, 'EMP002', 'Jean', 'Manager', '10 rue de la Paix, Paris', 'Directeur Magasin', 'Direction', '2023-01-15' FROM users WHERE email = 'manager@erp.com';

INSERT INTO employees (id, user_id, employee_number, first_name, last_name, address, position, department, hire_date)
SELECT UUID(), id, 'EMP003', 'Marie', 'Caissière', '5 avenue des Fleurs, Lyon', 'Hôtesse de Caisse', 'Ventes', '2023-03-10' FROM users WHERE email = 'marie@erp.com';

INSERT INTO employees (id, user_id, employee_number, first_name, last_name, address, position, department, hire_date)
SELECT UUID(), id, 'EMP004', 'Pierre', 'Magasinier', '22 boulevard du Nord, Lille', 'Gestionnaire de Stock', 'Logistique', '2023-02-20' FROM users WHERE email = 'pierre@erp.com';

INSERT INTO employees (id, user_id, employee_number, first_name, last_name, address, position, department, hire_date)
SELECT UUID(), id, 'EMP005', 'Sophie', 'RH', '12 rue du Commerce, Bordeaux', 'Responsable RH', 'RH', '2023-01-01' FROM users WHERE email = 'sophie@erp.com';
