# Architecture Backend - Documentation Technique

## Vue d'ensemble

Système d'ERP complètement fonctionnel pour supermarché avec architecture MVC professionnelle.

## 🏗️ Architecture MVC

### Couche Présentation (Controllers)
- `AuthController`: Gestion de l'authentification et autorisation
- `ProductController`: Gestion des produits
- `StockController`: Gestion de l'inventaire
- `SupplierController`: Gestion des fournisseurs
- `PurchaseController`: Gestion des achats
- `SaleController`: Point de vente (POS)
- `EmployeeController`: Gestion des employés
- `LeaveController`: Gestion des congés
- `TimesheetController`: Pointage
- `ReportController`: Rapports

### Couche Métier (Services)
- `UserService`: Gestion des utilisateurs
- `ProductService`: Logique des produits
- `StockService`: Logique d'inventaire
- `SupplierService`: Logique des fournisseurs
- `PurchaseService`: Logique des achats
- `SaleService`: Logique de point de vente
- `EmployeeService`: Logique d'employés
- `LeaveService`: Logique de congés
- `TimesheetService`: Logique de pointage
- `ReportService`: Génération de rapports

### Couche Données (Repository)
- Accès direct à la base de données via Spring Data JPA
- Requêtes personnalisées optimisées
- Indices de base de données pour performance

### Couche Entité (Models)
Représentations des données avec relations JPA

### Couche Configuration
- `SecurityConfig`: Configuration Spring Security avec JWT
- `WebConfig`: Configuration CORS et web
- `JwtTokenProvider`: Gestion des tokens JWT
- `CustomUserDetailsService`: Service d'authentification personnalisé

### Gestion des Erreurs
- `GlobalExceptionHandler`: Gestion centralisée des exceptions
- `ResourceNotFoundException`: Exception pour ressources manquantes
- `UnauthorizedException`: Exception pour accès non autorisé

## 🔐 Authentification JWT

1. Utilisateur se connecte avec email/password
2. Serveur valide et génère un JWT
3. Client stocke le token
4. Client inclut le token dans l'Authorization header
5. Serveur valide le token pour chaque requête

### Token Structure
```
Header.Payload.Signature
```

### Configuration
- Secret: Configuré dans application.properties
- Expiration: 7 jours
- Algorithm: HS512

## 📊 Flux de données

### Exemple: Créer une vente
1. Frontend envoie POST /api/sales avec les détails
2. SaleController reçoit et valide la requête
3. SaleService crée la vente et les items
4. SaleRepository sauvegarde dans MySQL
5. StockService décrémente le stock automatiquement
6. Response avec vente créée et receipt_number

### Exemple: Approuver un congé
1. Frontend envoie PATCH /api/leaves/{id}/approve
2. LeaveController valide l'autorisation (RH/ADMIN)
3. LeaveService met à jour le statut et date d'approbation
4. LeaveRepository sauvegarde les changements
5. EmployeeService met à jour le statut de l'employé
6. Notification générée (à implémenter)

## 💾 Modèle de base de données

### Relations clés
- User → Employee (1:1)
- User → Purchase (1:N)
- User → Sale (1:N)
- User → Leave (1:N)
- Product → Stock (1:1)
- Product → PurchaseItem (1:N)
- Product → SaleItem (1:N)
- Supplier → Purchase (1:N)
- Employee → Leave (1:N)
- Employee → Timesheet (1:N)

### Indices optimisés
```sql
idx_email (users.email)
idx_barcode (products.barcode)
idx_category (products.category)
idx_supplier_id (purchases.supplier_id)
idx_status (purchases.status)
```

## 🚀 Optimisations

1. **Pagination** (à ajouter pour listes longues)
   - Limiter 50 items par page
   - Indices pour tri rapide

2. **Cache** (à configurer)
   - Products catégories
   - Stock minimum/maximum

3. **Lazy Loading**
   - Collections mappées avec LAZY
   - Évite les requêtes N+1

4. **Batch Processing**
   - Configuration Hibernate batch_size=20
   - order_inserts=true

## 🔄 Transactions

Gérées automatiquement par Spring:
```java
@Transactional
public void complexeOperation() {
    // All operations committed or rolled back together
}
```

## 📋 Validation

- Validation d'inputs dans les DTOs
- Vérification de permissions par rôle
- Contrôle de stocks avant vente
- Vérification de solde de congés

## 🧪 Tests recommandés

```java
// Unit Tests
UserServiceTest
ProductServiceTest
SaleServiceTest

// Integration Tests
SaleIntegrationTest
PurchaseIntegrationTest
EmployeeIntegrationTest
```

## 📈 Scalabilité

Pour augmenter la charge:

1. **Cache distribué**
   ```xml
   <dependency>
       <groupId>org.springframework.boot</groupId>
       <artifactId>spring-boot-starter-data-redis</artifactId>
   </dependency>
   ```

2. **Queue asynchrone**
   ```xml
   <dependency>
       <groupId>org.springframework.boot</groupId>
       <artifactId>spring-boot-starter-amqp</artifactId>
   </dependency>
   ```

3. **Elasticsearch pour rapports**
   ```xml
   <dependency>
       <groupId>org.springframework.boot</groupId>
       <artifactId>spring-boot-starter-data-elasticsearch</artifactId>
   </dependency>
   ```

## 🔔 Améliorations futures

1. **Notifications**
   - Email pour approuvations
   - SMS pour alertes stock

2. **Intégrations**
   - API de paiement (Stripe, PayPal)
   - Système comptable
   - Service SMS

3. **Fonctionnalités**
   - Promotions/Réductions
   - Fidélité clients
   - Prévisions de stocks
   - Dashboard temps réel

4. **Performance**
   - GraphQL API
   - Microservices
   - Kubernetes deployment
