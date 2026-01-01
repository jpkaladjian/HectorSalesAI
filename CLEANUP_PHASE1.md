# 🧹 PHASE 1 - PLAN DE NETTOYAGE

**Date**: 1er janvier 2026  
**Branche**: `refactor/phase1-cleanup`  
**Backup**: `backup/pre-refactoring-2026-01-01`

---

## ✅ ÉTAPE 1 : Créer la structure docs/

Exécuter dans le terminal Replit :

```bash
# Créer les sous-dossiers
mkdir -p docs/guides
mkdir -p docs/reports
mkdir -p docs/modules
mkdir -p docs/architecture
```

---

## ✅ ÉTAPE 2 : Déplacer les fichiers de documentation

```bash
# Guides utilisateur
mv GUIDE_UTILISATEUR.md docs/guides/
mv GUIDE_UTILISATEUR_HECTOR.md docs/guides/
mv GUIDE_PAR_ROLE.md docs/guides/
mv FAQ.md docs/guides/

# Modules documentation
mv GPS_MODULE_GUIDE.md docs/modules/
mv AUDIT_MODULE_PROSPECTION_LINKEDIN.md docs/modules/
mv CRON_JOBS.md docs/modules/
mv EXTRACTION_CONTENUS_TEXTES.md docs/modules/

# Index et listes
mv INDEX_DOCUMENTATION.md docs/
mv INDEX_MODULES_PRODUCTION.md docs/
mv LISTE_CDC_ACTIFS_HECTOR.md docs/
mv LISTE_MODULES_ACTIFS_HECTOR.md docs/

# Rapports de développement
mv PHASE_4_RAPPORT.md docs/reports/
mv PHASE_4_RAPPORT_FINAL.md docs/reports/
mv COMPLETION_100_PERCENT.md docs/reports/
mv RAPPORT_COUNTRIES_REGISTRY.md docs/reports/
mv RAPPORT_DEV_GPS.md docs/reports/
mv RAPPORT_FINAL_VERIFICATION.md docs/reports/
mv RAPPORT_SESSION_2_OPENCORPORATES.md docs/reports/
mv RAPPORT_SESSION_TYPING_31OCT2025.md docs/reports/
mv RAPPORT_TESTS_OCR_WORKFLOW_30OCT2025.md docs/reports/
mv RAPPORT_TESTS_UNITAIRES_JEST_31OCT2025.md docs/reports/
mv RAPPORT_TRANSFORMATION_ADS_GROUP.md docs/reports/
```

---

## ✅ ÉTAPE 3 : Supprimer les fichiers obsolètes/doublons

```bash
# Fichier backup dans Git (mauvaise pratique)
rm src/services/orchestrator_OLD_BACKUP.py

# Doublon du loader Python (73KB)
rm adn_loader_v2_complete.py

# Fichier de test à la racine
rm dossier_api_test.json
```

---

## ✅ ÉTAPE 4 : Commit et push

```bash
git add -A
git commit -m "🧹 Phase 1: Clean up project structure

- Move 20+ documentation files to /docs/
- Remove duplicate files (orchestrator_OLD_BACKUP, adn_loader_v2)
- Remove test file from root
- Organize docs into guides/, reports/, modules/"

git push origin refactor/phase1-cleanup
```

---

## 📁 STRUCTURE FINALE ATTENDUE

```
docs/
├── INDEX_DOCUMENTATION.md
├── INDEX_MODULES_PRODUCTION.md
├── LISTE_CDC_ACTIFS_HECTOR.md
├── LISTE_MODULES_ACTIFS_HECTOR.md
├── CHECKLIST_DEPLOIEMENT.md (existant)
├── PHASE2-SIREN-SIRET.md (existant)
├── guides/
│   ├── GUIDE_UTILISATEUR.md
│   ├── GUIDE_UTILISATEUR_HECTOR.md
│   ├── GUIDE_PAR_ROLE.md
│   └── FAQ.md
├── modules/
│   ├── GPS_MODULE_GUIDE.md
│   ├── AUDIT_MODULE_PROSPECTION_LINKEDIN.md
│   ├── CRON_JOBS.md
│   └── EXTRACTION_CONTENUS_TEXTES.md
└── reports/
    ├── PHASE_4_RAPPORT.md
    ├── PHASE_4_RAPPORT_FINAL.md
    ├── COMPLETION_100_PERCENT.md
    ├── RAPPORT_COUNTRIES_REGISTRY.md
    ├── RAPPORT_DEV_GPS.md
    ├── RAPPORT_FINAL_VERIFICATION.md
    ├── RAPPORT_SESSION_2_OPENCORPORATES.md
    ├── RAPPORT_SESSION_TYPING_31OCT2025.md
    ├── RAPPORT_TESTS_OCR_WORKFLOW_30OCT2025.md
    ├── RAPPORT_TESTS_UNITAIRES_JEST_31OCT2025.md
    └── RAPPORT_TRANSFORMATION_ADS_GROUP.md
```

---

## ✅ CHECKLIST VALIDATION

Après exécution, vérifier :

- [ ] Racine du projet ne contient plus que : README.md, CHANGELOG.md, package.json, configs
- [ ] Tous les .md sont dans /docs/
- [ ] Pas de fichiers `_OLD_BACKUP` ou `_v2_complete`
- [ ] Git status propre après commit

---

## 🔄 ROLLBACK SI PROBLÈME

```bash
git checkout main
git branch -D refactor/phase1-cleanup
# La branche backup reste intacte : backup/pre-refactoring-2026-01-01
```

---

## ➡️ PROCHAINE ÉTAPE

Une fois Phase 1 validée → Phase 1B : Centralisation Python
