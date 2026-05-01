# 🛒 SuperMarket ERP - Système de Gestion Intégré

Une solution ERP complète et moderne conçue pour la gestion optimisée d'un supermarché. Ce projet repose sur une architecture robuste **Full Stack** utilisant les standards industriels les plus récents.

## 🚀 Technologies Utilisées

### Backend (Architecture JEE Moderne)
- **Framework :** Spring Boot 3.2 (Jakarta EE 10)
- **Langage :** Java 17
- **Sécurité :** Spring Security & JWT (JSON Web Tokens)
- **Persistance :** Spring Data JPA / Hibernate
- **Base de données :** MySQL
- **Documentation :** Swagger UI (OpenAPI 3)

### Frontend (Interface Premium)
- **Framework :** React 18 avec TypeScript
- **Build Tool :** Vite
- **Styling :** Tailwind CSS & Shadcui (Vanilla CSS flexibility)
- **Icônes :** Lucide React
- **Gestion d'état :** Context API

---

## 📦 Modules Principaux

### 1. Tableau de Bord (Dashboard)
- Statistiques en temps réel (Ventes, Stocks, Revenus).
- Graphiques analytiques performants.
- Conversion automatique des devises (DH).

### 2. Point de Vente (POS)
- Interface de caisse intuitive et rapide.
- Gestion du panier et validation instantanée des stocks.
- Calcul automatique de la TVA et des totaux.

### 3. Gestion des Stocks & Produits
- Catalogue de produits avec codes-barres.
- Seuils d'alerte pour le réapprovisionnement.
- Historique complet des mouvements de stock.

### 4. Ressources Humaines (RH)
- Gestion des employés et de leurs contrats.
- **Système de Pointage (Timesheet) :** Check-in/Check-out quotidien.
- **Gestion des Congés :** Flux d'approbation entre employés et managers.

### 5. Communication Inter-Services (Inbox)
- Messagerie sécurisée entre les différents services (Caisse, RH, Admin, Magasin).
- Interface style "Chat" avec historique des échanges.
- Notifications en temps réel et badges de messages non lus.

### 6. Fournisseurs & Achats
- Gestion du répertoire des fournisseurs.
- Cycle de commandes d'achat et suivi des statuts.

---

## 🛠️ Installation et Lancement

### Prérequis
- Java 17+
- Node.js 18+
- MySQL 8.0

### Configuration de la Base de Données
1. Créez une base de données nommée `erp_supermarche`.
2. Configurez vos identifiants dans `backend/src/main/resources/application.properties`.

### Lancement du Backend
```bash
cd backend
mvn spring-boot:run
```
*L'API sera disponible sur : http://localhost:3000*
*Swagger UI : http://localhost:3000/swagger-ui/index.html*

### Lancement du Frontend
```bash
cd frontend
npm install
npm run dev
```
*L'interface sera disponible sur : http://localhost:5173*

---

## 🔐 Sécurité et Rôles
Le système utilise une gestion d'accès basée sur les rôles (**RBAC**) :
- **ADMIN :** Accès total au système.
- **MANAGER :** Gestion opérationnelle et rapports.
- **RH :** Gestion du personnel et des pointages.
- **CAISSIER :** Accès limité au module de vente (POS).
- **MAGASINIER :** Gestion des stocks et inventaires.

---

## 📄 Licence
Ce projet a été développé dans le cadre d'une solution ERP professionnelle pour supermarchés.
