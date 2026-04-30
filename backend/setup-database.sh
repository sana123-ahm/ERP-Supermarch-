#!/bin/bash
# setup-database.sh - Script d'initialisation de la base de données

echo "🚀 Configuration ERP Supermarché - Base de Données"
echo "=================================================="

# Vérifier que MySQL est installé
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL n'est pas installé"
    echo "Veuillez installer MySQL 8.0 ou supérieur"
    exit 1
fi

echo "✅ MySQL détecté"
echo ""

# Demander les identifiants
read -p "Entrez votre username MySQL (défaut: root): " DB_USER
DB_USER=${DB_USER:-root}

read -sp "Entrez votre password MySQL: " DB_PASSWORD
echo ""

# Créer la base de données
echo ""
echo "📊 Création de la base de données..."
mysql -u "$DB_USER" -p"$DB_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS erp_supermarche;"

if [ $? -eq 0 ]; then
    echo "✅ Base de données créée"
else
    echo "❌ Erreur lors de la création de la base de données"
    exit 1
fi

# Importer le schéma
echo ""
echo "📋 Import du schéma SQL..."
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
mysql -u "$DB_USER" -p"$DB_PASSWORD" erp_supermarche < "$SCRIPT_DIR/src/main/resources/schema.sql"

if [ $? -eq 0 ]; then
    echo "✅ Schéma importé avec succès"
else
    echo "❌ Erreur lors de l'import du schéma"
    exit 1
fi

# Afficher la configuration
echo ""
echo "=================================================="
echo "✨ Configuration Complète!"
echo "=================================================="
echo ""
echo "Mise à jour application.properties:"
echo "spring.datasource.url=jdbc:mysql://localhost:3306/erp_supermarche"
echo "spring.datasource.username=$DB_USER"
echo "spring.datasource.password=****"
echo ""
echo "Utilisateurs de test:"
echo "  Admin      : admin@supermarche.com / admin123"
echo "  Manager    : manager@supermarche.com / manager123"
echo "  Caissier   : caissier@supermarche.com / caissier123"
echo "  Magasinier : magasinier@supermarche.com / magasinier123"
echo "  RH         : rh@supermarche.com / rh123"
echo ""
echo "🚀 Prêt à démarrer le backend!"
echo "   Exécutez: mvn spring-boot:run"
