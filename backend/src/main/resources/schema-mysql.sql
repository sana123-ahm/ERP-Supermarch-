-- Users Table
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'MANAGER', 'CAISSIER', 'MAGASINIER', 'RH') NOT NULL,
    phone_number VARCHAR(20),
    avatar_url VARCHAR(500),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Products Table
CREATE TABLE products (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description LONGTEXT,
    price DECIMAL(10, 2) NOT NULL,
    cost_price DECIMAL(10, 2),
    barcode VARCHAR(100) UNIQUE,
    sku VARCHAR(100) UNIQUE,
    category VARCHAR(100),
    image_url VARCHAR(500),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_barcode (barcode),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Stocks Table
CREATE TABLE stocks (
    id VARCHAR(36) PRIMARY KEY,
    product_id VARCHAR(36) NOT NULL UNIQUE,
    quantity INT NOT NULL,
    min_quantity INT NOT NULL,
    max_quantity INT,
    warehouse_location VARCHAR(100),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Suppliers Table
CREATE TABLE suppliers (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description LONGTEXT,
    email VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    country VARCHAR(100),
    contact_person VARCHAR(255),
    categories TEXT,
    tax_id VARCHAR(50),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Purchases Table
CREATE TABLE purchases (
    id VARCHAR(36) PRIMARY KEY,
    supplier_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    purchase_date TIMESTAMP NOT NULL,
    expected_delivery_date TIMESTAMP,
    actual_delivery_date TIMESTAMP,
    status ENUM('PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED') NOT NULL,
    total_amount DECIMAL(12, 2),
    tax_amount DECIMAL(10, 2),
    notes LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_supplier_id (supplier_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Purchase Items Table
CREATE TABLE purchase_items (
    id VARCHAR(36) PRIMARY KEY,
    purchase_id VARCHAR(36) NOT NULL,
    product_id VARCHAR(36) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(12, 2),
    tax_percentage DECIMAL(5, 2),
    FOREIGN KEY (purchase_id) REFERENCES purchases(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    INDEX idx_purchase_id (purchase_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sales Table
CREATE TABLE sales (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    sale_date TIMESTAMP NOT NULL,
    total_amount DECIMAL(12, 2) NOT NULL,
    tax_amount DECIMAL(10, 2),
    discount_amount DECIMAL(10, 2),
    payment_method ENUM('CASH', 'CARD', 'CHECK', 'TRANSFER', 'MOBILE_PAYMENT') NOT NULL,
    status ENUM('PENDING', 'COMPLETED', 'CANCELLED', 'RETURNED') NOT NULL,
    receipt_number VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sale Items Table
CREATE TABLE sale_items (
    id VARCHAR(36) PRIMARY KEY,
    sale_id VARCHAR(36) NOT NULL,
    product_id VARCHAR(36) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(12, 2),
    discount_percentage DECIMAL(5, 2),
    FOREIGN KEY (sale_id) REFERENCES sales(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    INDEX idx_sale_id (sale_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Employees Table
CREATE TABLE employees (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL UNIQUE,
    employee_number VARCHAR(50) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    phone_number VARCHAR(20),
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    country VARCHAR(100),
    status ENUM('ACTIVE', 'INACTIVE', 'ON_LEAVE', 'SUSPENDED', 'TERMINATED') NOT NULL,
    position VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    contract_type VARCHAR(50),
    hire_date DATE NOT NULL,
    salary DECIMAL(10, 2),
    id_number VARCHAR(50),
    bank_account VARCHAR(100),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_department (department)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Leaves Table
CREATE TABLE leaves (
    id VARCHAR(36) PRIMARY KEY,
    employee_id VARCHAR(36) NOT NULL,
    leave_type ENUM('ANNUAL', 'SICK', 'PERSONAL', 'MATERNITY', 'PATERNITY', 'UNPAID') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    number_of_days INT NOT NULL,
    status ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED') NOT NULL,
    reason LONGTEXT,
    approved_by VARCHAR(36),
    approval_date TIMESTAMP,
    rejection_reason LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (approved_by) REFERENCES users(id),
    INDEX idx_employee_id (employee_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Timesheets Table
CREATE TABLE timesheets (
    id VARCHAR(36) PRIMARY KEY,
    employee_id VARCHAR(36) NOT NULL,
    work_date DATE NOT NULL,
    check_in_time TIME,
    check_out_time TIME,
    hours_worked DOUBLE,
    status ENUM('OPEN', 'SUBMITTED', 'APPROVED', 'REJECTED') NOT NULL,
    notes LONGTEXT,
    approved_by VARCHAR(36),
    approval_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (approved_by) REFERENCES users(id),
    INDEX idx_employee_id (employee_id),
    INDEX idx_work_date (work_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reports Table
CREATE TABLE reports (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    report_type ENUM('SALES', 'PURCHASES', 'INVENTORY', 'REVENUE', 'EMPLOYEE_PERFORMANCE', 'FINANCIAL', 'CUSTOM') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_sales DECIMAL(12, 2),
    total_purchases DECIMAL(12, 2),
    total_revenue DECIMAL(12, 2),
    total_profit DECIMAL(12, 2),
    low_stock_items INT,
    data LONGTEXT,
    generated_by VARCHAR(36) NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (generated_by) REFERENCES users(id),
    INDEX idx_report_type (report_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert Sample Users
INSERT INTO users (id, email, password, name, role, phone_number, active) VALUES
('1', 'admin@supermarche.com', '$2a$10$SlVZmhKmSSZvUI0WvpDpLOYkJ8X8n5Z8K9Z9Z9Z9Z9Z9Z9Z9Z9Z9', 'Admin Principal', 'ADMIN', '555-0001', TRUE),
('2', 'manager@supermarche.com', '$2a$10$SlVZmhKmSSZvUI0WvpDpLOYkJ8X8n5Z8K9Z9Z9Z9Z9Z9Z9Z9Z9Z9', 'Jean Manager', 'MANAGER', '555-0002', TRUE),
('3', 'caissier@supermarche.com', '$2a$10$SlVZmhKmSSZvUI0WvpDpLOYkJ8X8n5Z8K9Z9Z9Z9Z9Z9Z9Z9Z9Z9', 'Marie Caissière', 'CAISSIER', '555-0003', TRUE),
('4', 'magasinier@supermarche.com', '$2a$10$SlVZmhKmSSZvUI0WvpDpLOYkJ8X8n5Z8K9Z9Z9Z9Z9Z9Z9Z9Z9Z9', 'Pierre Magasinier', 'MAGASINIER', '555-0004', TRUE),
('5', 'rh@supermarche.com', '$2a$10$SlVZmhKmSSZvUI0WvpDpLOYkJ8X8n5Z8K9Z9Z9Z9Z9Z9Z9Z9Z9Z9', 'Sophie RH', 'RH', '555-0005', TRUE);

-- Stock Movements Table
CREATE TABLE stock_movements (
    id VARCHAR(36) PRIMARY KEY,
    product_id VARCHAR(36) NOT NULL,
    quantity INT NOT NULL,
    type ENUM('IN', 'OUT', 'INVENTORY') NOT NULL,
    reason VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(36),
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_product_id (product_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notifications Table
CREATE TABLE notifications (
    id VARCHAR(36) PRIMARY KEY,
    sender_name VARCHAR(255),
    sender_role ENUM('ADMIN', 'MANAGER', 'CAISSIER', 'MAGASINIER', 'RH'),
    target_role ENUM('ADMIN', 'MANAGER', 'CAISSIER', 'MAGASINIER', 'RH') NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE,
    INDEX idx_target_role (target_role),
    INDEX idx_sender_role (sender_role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

