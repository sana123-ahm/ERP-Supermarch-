# ERP Supermarché - Backend Spring Boot

Architecture MVC complète pour un système de gestion de supermarché avec MySQL.

## 📋 Structure du Projet

```
Backend/
├── pom.xml
├── src/main/java/com/erpsupermarche/
│   ├── ErpSupermarcharApplication.java
│   ├── controller/        # Contrôleurs REST
│   ├── service/           # Services métier
│   ├── entity/            # Entités JPA
│   ├── repository/        # Repositories
│   ├── dto/               # Data Transfer Objects
│   ├── config/            # Configuration
│   ├── security/          # Sécurité & JWT
│   ├── exception/         # Gestion des exceptions
│   └── utils/             # Utilitaires
└── src/main/resources/
    ├── application.properties
    └── schema.sql
```

## 🔐 Authentification & Rôles

### Rôles disponibles:
- **ADMIN**: Accès complet au système
- **MANAGER**: Gestion des achats, ventes, rapports
- **CAISSIER**: Transactions de vente (POS)
- **MAGASINIER**: Gestion du stock
- **RH**: Gestion des employés, congés, pointage

### Utilisateurs de test:
```
Email: admin@supermarche.com | Mot de passe: admin123 | Rôle: ADMIN
Email: manager@supermarche.com | Mot de passe: manager123 | Rôle: MANAGER
Email: caissier@supermarche.com | Mot de passe: caissier123 | Rôle: CAISSIER
Email: magasinier@supermarche.com | Mot de passe: magasinier123 | Rôle: MAGASINIER
Email: rh@supermarche.com | Mot de passe: rh123 | Rôle: RH
```

## 🚀 Installation

### Prérequis:
- Java 17+
- Maven 3.6+
- MySQL 8.0+

### Étapes:

1. **Cloner le repository**
```bash
cd Backend
```

2. **Configurer la base de données**

Créer une base de données MySQL:
```sql
CREATE DATABASE erp_supermarche;
USE erp_supermarche;
```

Modifier `application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/erp_supermarche
spring.datasource.username=root
spring.datasource.password=votre_password
```

3. **Exécuter le script SQL**
```bash
mysql -u root -p erp_supermarche < src/main/resources/schema.sql
```

4. **Installer les dépendances et démarrer**
```bash
mvn clean install
mvn spring-boot:run
```

Le serveur démarrera sur `http://localhost:3000/api`

## 📚 API Endpoints

### Authentification
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription

### Produits
- `GET /api/products` - Liste tous les produits
- `GET /api/products/{id}` - Détails d'un produit
- `GET /api/products/barcode/{barcode}` - Rechercher par code-barres
- `POST /api/products` - Créer un produit (ADMIN, MANAGER)
- `PUT /api/products/{id}` - Modifier un produit (ADMIN, MANAGER)
- `DELETE /api/products/{id}` - Supprimer un produit (ADMIN)

### Stock
- `GET /api/stock/{productId}` - Stock d'un produit
- `POST /api/stock` - Créer une entrée de stock
- `PUT /api/stock/{productId}` - Mettre à jour le stock
- `PUT /api/stock/{productId}/increment` - Augmenter le stock
- `PUT /api/stock/{productId}/decrement` - Diminuer le stock

### Fournisseurs
- `GET /api/suppliers` - Liste des fournisseurs
- `GET /api/suppliers/{id}` - Détails d'un fournisseur
- `POST /api/suppliers` - Créer un fournisseur (ADMIN, MANAGER)
- `PUT /api/suppliers/{id}` - Modifier un fournisseur (ADMIN, MANAGER)
- `DELETE /api/suppliers/{id}` - Supprimer un fournisseur (ADMIN)

### Achats
- `GET /api/purchases` - Liste des achats
- `GET /api/purchases/{id}` - Détails d'un achat
- `POST /api/purchases` - Créer un achat (ADMIN, MANAGER)
- `PATCH /api/purchases/{id}/status` - Mettre à jour le statut

### Ventes (POS)
- `GET /api/sales` - Liste des ventes
- `GET /api/sales/{id}` - Détails d'une vente
- `GET /api/sales/cashier/{cashierId}` - Ventes d'un caissier
- `POST /api/sales` - Créer une vente (CAISSIER)

### Employés
- `GET /api/employees` - Liste des employés
- `GET /api/employees/{id}` - Détails d'un employé
- `GET /api/employees/department/{department}` - Employés par département
- `POST /api/employees` - Créer un employé (ADMIN, RH)
- `PUT /api/employees/{id}` - Modifier un employé (ADMIN, RH)

### Congés
- `GET /api/leaves/employee/{employeeId}` - Congés d'un employé
- `GET /api/leaves/pending` - Congés en attente
- `POST /api/leaves` - Demander un congé
- `PATCH /api/leaves/{id}/approve` - Approuver un congé (ADMIN, RH)
- `PATCH /api/leaves/{id}/reject` - Rejeter un congé (ADMIN, RH)

### Pointage
- `POST /api/timesheets/{employeeId}/check-in` - Enregistrer l'arrivée
- `PATCH /api/timesheets/{timesheetId}/check-out` - Enregistrer le départ
- `GET /api/timesheets/employee/{employeeId}` - Pointage d'un employé

### Rapports
- `GET /api/reports/{id}` - Détails d'un rapport
- `GET /api/reports/user/{userId}` - Rapports d'un utilisateur
- `POST /api/reports/sales` - Générer un rapport de ventes

## 🔑 Format d'authentification

Les requêtes authentifiées doivent inclure le header:
```
Authorization: Bearer {token}
```

### Exemple de connexion:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@supermarche.com",
    "password": "admin123"
  }'
```

Réponse:
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "user": {
    "id": "1",
    "email": "admin@supermarche.com",
    "name": "Admin Principal",
    "role": "ADMIN",
    "active": true
  }
}
```

## 📊 Modèle de données

### Entités principales:
- **User**: Utilisateurs du système
- **Product**: Produits/Articles
- **Stock**: Inventaire
- **Supplier**: Fournisseurs
- **Purchase**: Commandes d'achat
- **PurchaseItem**: Lignes de commande
- **Sale**: Transactions de vente (POS)
- **SaleItem**: Lignes de vente
- **Employee**: Données d'employé
- **Leave**: Demandes de congé
- **Timesheet**: Pointage
- **Report**: Rapports

## 🔒 Sécurité

- Authentification JWT
- Chiffrement des mots de passe (BCrypt)
- CORS configuré
- Contrôle d'accès basé sur les rôles (RBAC)
- Validation des données

## 📝 Notes

1. Les mots de passe des utilisateurs de test sont codés en dur pour la démonstration
2. En production, utiliser un gestionnaire de secrets
3. Configurer HTTPS pour les communications sécurisées
4. Configurer une base de données plus robuste (PostgreSQL recommandé)

## 🛠️ Dépannage

### Erreur de connexion MySQL
```
Vérifier que MySQL est en cours d'exécution
Vérifier les paramètres de connexion dans application.properties
```

### Erreur de port 3000 en utilisation
```bash
Changer le port dans application.properties:
server.port=8080
```

### Problème d'authentification
```
Vérifier le format du JWT token
Vérifier l'expiration du token (7 jours par défaut)
```

## 📞 Support

Pour des questions ou des problèmes, veuillez consulter la documentation Spring Boot:
- https://spring.io/projects/spring-boot
- https://spring.io/projects/spring-security
