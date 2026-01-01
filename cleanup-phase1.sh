#!/bin/bash
# ===========================================
# PHASE 1 - SCRIPT DE NETTOYAGE AUTOMATIQUE
# HectorSalesAI - 1er janvier 2026
# ===========================================

set -e  # Arrêter si erreur

echo "🧹 PHASE 1 - Nettoyage HectorSalesAI"
echo "====================================="
echo ""

# Vérifier qu'on est dans le bon dossier
if [ ! -f "package.json" ]; then
    echo "❌ ERREUR: Exécutez ce script depuis la racine du projet HectorSalesAI"
    exit 1
fi

echo "📁 Étape 1: Création de la structure docs/"
mkdir -p docs/guides
mkdir -p docs/reports
mkdir -p docs/modules
echo "   ✅ Structure créée"

echo ""
echo "📄 Étape 2: Déplacement des guides utilisateur"
[ -f "GUIDE_UTILISATEUR.md" ] && mv GUIDE_UTILISATEUR.md docs/guides/ && echo "   ✅ GUIDE_UTILISATEUR.md"
[ -f "GUIDE_UTILISATEUR_HECTOR.md" ] && mv GUIDE_UTILISATEUR_HECTOR.md docs/guides/ && echo "   ✅ GUIDE_UTILISATEUR_HECTOR.md"
[ -f "GUIDE_PAR_ROLE.md" ] && mv GUIDE_PAR_ROLE.md docs/guides/ && echo "   ✅ GUIDE_PAR_ROLE.md"
[ -f "FAQ.md" ] && mv FAQ.md docs/guides/ && echo "   ✅ FAQ.md"

echo ""
echo "📄 Étape 3: Déplacement des docs modules"
[ -f "GPS_MODULE_GUIDE.md" ] && mv GPS_MODULE_GUIDE.md docs/modules/ && echo "   ✅ GPS_MODULE_GUIDE.md"
[ -f "AUDIT_MODULE_PROSPECTION_LINKEDIN.md" ] && mv AUDIT_MODULE_PROSPECTION_LINKEDIN.md docs/modules/ && echo "   ✅ AUDIT_MODULE_PROSPECTION_LINKEDIN.md"
[ -f "CRON_JOBS.md" ] && mv CRON_JOBS.md docs/modules/ && echo "   ✅ CRON_JOBS.md"
[ -f "EXTRACTION_CONTENUS_TEXTES.md" ] && mv EXTRACTION_CONTENUS_TEXTES.md docs/modules/ && echo "   ✅ EXTRACTION_CONTENUS_TEXTES.md"

echo ""
echo "📄 Étape 4: Déplacement des index"
[ -f "INDEX_DOCUMENTATION.md" ] && mv INDEX_DOCUMENTATION.md docs/ && echo "   ✅ INDEX_DOCUMENTATION.md"
[ -f "INDEX_MODULES_PRODUCTION.md" ] && mv INDEX_MODULES_PRODUCTION.md docs/ && echo "   ✅ INDEX_MODULES_PRODUCTION.md"
[ -f "LISTE_CDC_ACTIFS_HECTOR.md" ] && mv LISTE_CDC_ACTIFS_HECTOR.md docs/ && echo "   ✅ LISTE_CDC_ACTIFS_HECTOR.md"
[ -f "LISTE_MODULES_ACTIFS_HECTOR.md" ] && mv LISTE_MODULES_ACTIFS_HECTOR.md docs/ && echo "   ✅ LISTE_MODULES_ACTIFS_HECTOR.md"

echo ""
echo "📄 Étape 5: Déplacement des rapports"
[ -f "PHASE_4_RAPPORT.md" ] && mv PHASE_4_RAPPORT.md docs/reports/ && echo "   ✅ PHASE_4_RAPPORT.md"
[ -f "PHASE_4_RAPPORT_FINAL.md" ] && mv PHASE_4_RAPPORT_FINAL.md docs/reports/ && echo "   ✅ PHASE_4_RAPPORT_FINAL.md"
[ -f "COMPLETION_100_PERCENT.md" ] && mv COMPLETION_100_PERCENT.md docs/reports/ && echo "   ✅ COMPLETION_100_PERCENT.md"
[ -f "RAPPORT_COUNTRIES_REGISTRY.md" ] && mv RAPPORT_COUNTRIES_REGISTRY.md docs/reports/ && echo "   ✅ RAPPORT_COUNTRIES_REGISTRY.md"
[ -f "RAPPORT_DEV_GPS.md" ] && mv RAPPORT_DEV_GPS.md docs/reports/ && echo "   ✅ RAPPORT_DEV_GPS.md"
[ -f "RAPPORT_FINAL_VERIFICATION.md" ] && mv RAPPORT_FINAL_VERIFICATION.md docs/reports/ && echo "   ✅ RAPPORT_FINAL_VERIFICATION.md"
[ -f "RAPPORT_SESSION_2_OPENCORPORATES.md" ] && mv RAPPORT_SESSION_2_OPENCORPORATES.md docs/reports/ && echo "   ✅ RAPPORT_SESSION_2_OPENCORPORATES.md"
[ -f "RAPPORT_SESSION_TYPING_31OCT2025.md" ] && mv RAPPORT_SESSION_TYPING_31OCT2025.md docs/reports/ && echo "   ✅ RAPPORT_SESSION_TYPING_31OCT2025.md"
[ -f "RAPPORT_TESTS_OCR_WORKFLOW_30OCT2025.md" ] && mv RAPPORT_TESTS_OCR_WORKFLOW_30OCT2025.md docs/reports/ && echo "   ✅ RAPPORT_TESTS_OCR_WORKFLOW_30OCT2025.md"
[ -f "RAPPORT_TESTS_UNITAIRES_JEST_31OCT2025.md" ] && mv RAPPORT_TESTS_UNITAIRES_JEST_31OCT2025.md docs/reports/ && echo "   ✅ RAPPORT_TESTS_UNITAIRES_JEST_31OCT2025.md"
[ -f "RAPPORT_TRANSFORMATION_ADS_GROUP.md" ] && mv RAPPORT_TRANSFORMATION_ADS_GROUP.md docs/reports/ && echo "   ✅ RAPPORT_TRANSFORMATION_ADS_GROUP.md"

echo ""
echo "🗑️  Étape 6: Suppression des fichiers obsolètes"
[ -f "src/services/orchestrator_OLD_BACKUP.py" ] && rm src/services/orchestrator_OLD_BACKUP.py && echo "   ✅ Supprimé: orchestrator_OLD_BACKUP.py"
[ -f "adn_loader_v2_complete.py" ] && rm adn_loader_v2_complete.py && echo "   ✅ Supprimé: adn_loader_v2_complete.py"
[ -f "dossier_api_test.json" ] && rm dossier_api_test.json && echo "   ✅ Supprimé: dossier_api_test.json"

echo ""
echo "🧹 Étape 7: Nettoyage du script et fichier plan"
[ -f "CLEANUP_PHASE1.md" ] && rm CLEANUP_PHASE1.md && echo "   ✅ Supprimé: CLEANUP_PHASE1.md"

echo ""
echo "====================================="
echo "✅ PHASE 1 TERMINÉE !"
echo "====================================="
echo ""
echo "📋 Résumé:"
echo "   - Documentation déplacée vers /docs/"
echo "   - Fichiers obsolètes supprimés"
echo "   - Structure nettoyée"
echo ""
echo "🔄 Prochaine étape: Commit et push"
echo ""
echo "   git add -A"
echo "   git commit -m '🧹 Phase 1: Clean up project structure'"
echo "   git push origin refactor/phase1-cleanup"
echo ""

# Auto-suppression du script
rm -- "$0" 2>/dev/null && echo "   ✅ Script auto-supprimé"

echo ""
echo "🎉 Nettoyage terminé avec succès !"
