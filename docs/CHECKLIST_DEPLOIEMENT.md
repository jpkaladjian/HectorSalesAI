# ✅ Checklist de Déploiement Production

Checklist complète pour déployer le système d'enrichissement multi-pays en production.

**Version** : 1.0.0  
**Date** : 27 octobre 2025

---

## 📋 Pré-Déploiement

### 1. Tests & Qualité

- [ ] **Tous les tests passent** (91/91)
  ```bash
  npm test
  # Vérifier: Test Files 4 passed (4), Tests 91 passed (91)
  ```

- [ ] **Tests d'enrichissement spécifiques passent**
  ```bash
  npx vitest run lib/services/enrichment
  # Vérifier: 91 tests passent
  ```

- [ ] **Pas d'erreurs TypeScript**
  ```bash
  npx tsc --noEmit
  # Vérifier: Aucune erreur
  ```

- [ ] **Pas d'erreurs ESLint critiques**
  ```bash
  npm run lint 2>&1 | grep -i error | wc -l
  # Vérifier: 0 erreurs
  ```

---

### 2. Variables d'Environnement

- [ ] **SESSION_SECRET défini** (minimum 32 caractères)
  ```bash
  # Générer si nécessaire:
  openssl rand -base64 32
  ```
  - [ ] Ajouté dans Replit Secrets
  - [ ] Longueur >= 32 caractères
  - [ ] Caractères aléatoires sécurisés

- [ ] **DATABASE_URL configuré**
  - [ ] Format PostgreSQL valide : `postgresql://user:password@host:5432/database`
  - [ ] Auto-configuré sur Replit ✅
  - [ ] Connexion testée

- [ ] **BRAVE_SEARCH_API_KEY défini**
  - [ ] Clé obtenue de https://brave.com/search/api/
  - [ ] Ajoutée dans Replit Secrets
  - [ ] Quota vérifié (requests/month)

- [ ] **PAPPERS_API_KEY (optionnel)**
  - [ ] Clé obtenue de https://www.pappers.fr/api
  - [ ] Ajoutée dans Replit Secrets si utilisé
  - [ ] ⚠️ Optionnel : Pappers est un service Python externe

---

### 3. Configuration

- [ ] **package.json vérifié**
  - [ ] Scripts `dev`, `build`, `start` présents
  - [ ] Toutes les dépendances installées
  - [ ] Version Node.js compatible (>=18)

- [ ] **Database schema synchronisé**
  ```bash
  npm run db:push
  # ou npm run db:push --force si warnings
  ```

- [ ] **Python service démarrable** (si utilisation Pappers)
  ```bash
  ps aux | grep python
  # Vérifier que le service Python tourne sur port 5001
  ```

---

### 4. Sécurité

- [ ] **Rate limiting configuré**
  - [ ] 10 requêtes/minute par IP
  - [ ] Fenêtre de 60 secondes
  - [ ] Messages d'erreur 429 appropriés

- [ ] **Validation Zod active**
  - [ ] Tous les endpoints API validés
  - [ ] Messages d'erreur clairs (400)

- [ ] **Secrets management sécurisé**
  - [ ] Aucun secret dans le code source
  - [ ] `.env` dans `.gitignore`
  - [ ] Secrets stockés dans Replit Secrets

- [ ] **Logs sécurisés**
  - [ ] Pas de secrets loggés
  - [ ] Pas de données sensibles dans les logs
  - [ ] Logs structurés (JSON)

- [ ] **HTTPS forcé** (production)
  - [ ] Redirection HTTP → HTTPS
  - [ ] Certificat TLS valide (auto via Replit)

---

### 5. Documentation

- [ ] **README.md à jour**
  - [ ] Description complète
  - [ ] Quick start fonctionnel
  - [ ] Liens vers documentation

- [ ] **API documentation accessible**
  ```bash
  curl -I http://localhost:5000/api/enrichment/docs
  # Vérifier: 200 OK
  ```

- [ ] **CHANGELOG.md à jour**
  - [ ] Version 1.0.0 documentée
  - [ ] Toutes les fonctionnalités listées

- [ ] **Guides complets**
  - [ ] QUICKSTART.md créé
  - [ ] ARCHITECTURE.md créé
  - [ ] INTEGRATION_HECTOR.md créé (600+ lignes)
  - [ ] DEPLOIEMENT_PRODUCTION.md créé (400+ lignes)

---

### 6. Monitoring

- [ ] **Health check fonctionnel**
  ```bash
  curl http://localhost:5000/api/enrichment/health
  # Vérifier: {"status": "healthy", "supportedCountries": 13}
  ```

- [ ] **Métriques exposées**
  ```bash
  curl http://localhost:5000/api/enrichment/metrics
  # Vérifier: JSON avec métriques complètes
  ```

- [ ] **Format Prometheus disponible**
  ```bash
  curl http://localhost:5000/api/enrichment/metrics?format=prometheus
  # Vérifier: Format Prometheus valide
  ```

- [ ] **Alertes configurées**
  ```bash
  curl http://localhost:5000/api/enrichment/alerts
  # Vérifier: {"alerts": [], "severity": "ok"}
  ```

---

### 7. API Endpoints

- [ ] **POST /api/enrichment testé**
  ```bash
  curl -X POST http://localhost:5000/api/enrichment \
    -H "Content-Type: application/json" \
    -d '{"identifier":"CHE-123.456.789","countryCode":"CH"}'
  # Vérifier: success: true
  ```

- [ ] **GET /api/enrichment/countries testé**
  ```bash
  curl http://localhost:5000/api/enrichment/countries
  # Vérifier: 13 pays retournés
  ```

- [ ] **GET /api/enrichment/health testé**
  ```bash
  curl http://localhost:5000/api/enrichment/health
  # Vérifier: status: healthy
  ```

- [ ] **Rate limiting testé**
  ```bash
  # Lancer 15 requêtes rapidement
  for i in {1..15}; do curl http://localhost:5000/api/enrichment/health; done
  # Vérifier: 429 après la 10ème requête
  ```

---

## 🚀 Déploiement sur Replit

### 8. Configuration Replit

- [ ] **Secrets ajoutés dans Replit**
  - [ ] SESSION_SECRET
  - [ ] DATABASE_URL (auto)
  - [ ] BRAVE_SEARCH_API_KEY
  - [ ] PAPPERS_API_KEY (optionnel)

- [ ] **Replit PostgreSQL activé**
  - [ ] Base de données créée
  - [ ] DATABASE_URL auto-configuré
  - [ ] Connexion vérifiée

- [ ] **Workflow configuré**
  - [ ] "Start application" utilise `npm run dev`
  - [ ] Démarre automatiquement

- [ ] **Domaine configuré**
  - [ ] Nom choisi : `your-app.replit.app`
  - [ ] Ou domaine personnalisé configuré

---

### 9. Publication

- [ ] **Code poussé sur branche main**
  ```bash
  git status
  git add .
  git commit -m "Production ready v1.0.0"
  git push origin main
  ```

- [ ] **Tag de version créé**
  ```bash
  git tag v1.0.0
  git push origin v1.0.0
  ```

- [ ] **Replit Deployment lancé**
  - [ ] Cliquer sur "Publish" dans Replit
  - [ ] Configuration vérifiée
  - [ ] Déploiement réussi

- [ ] **HTTPS activé automatiquement**
  - [ ] Certificat TLS généré
  - [ ] `https://your-app.replit.app` accessible

---

## ✅ Post-Déploiement

### 10. Tests Fonctionnels Production

- [ ] **Health check production OK**
  ```bash
  curl https://your-app.replit.app/api/enrichment/health
  # Vérifier: status: healthy
  ```

- [ ] **API enrichissement fonctionne**
  ```bash
  curl -X POST https://your-app.replit.app/api/enrichment \
    -H "Content-Type: application/json" \
    -d '{"identifier":"CHE-123.456.789","countryCode":"CH"}'
  # Vérifier: success: true, data présente
  ```

- [ ] **Documentation accessible**
  ```bash
  curl -I https://your-app.replit.app/api/enrichment/docs
  # Vérifier: 200 OK
  ```

- [ ] **Métriques remontées**
  ```bash
  curl https://your-app.replit.app/api/enrichment/metrics
  # Vérifier: Métriques présentes
  ```

---

### 11. Tests de Charge

- [ ] **Test 10 requêtes séquentielles**
  ```bash
  for i in {1..10}; do
    curl -X POST https://your-app.replit.app/api/enrichment \
      -H "Content-Type: application/json" \
      -d '{"identifier":"CHE-111.222.333","countryCode":"CH"}'
  done
  # Vérifier: Toutes réussissent
  ```

- [ ] **Test rate limiting production**
  ```bash
  # 15 requêtes rapides
  for i in {1..15}; do curl https://your-app.replit.app/api/enrichment/health; done
  # Vérifier: 429 après la 10ème
  ```

- [ ] **Test concurrence (5 parallèles)**
  ```bash
  for i in {1..5}; do
    curl -X POST https://your-app.replit.app/api/enrichment \
      -d '{"identifier":"CHE-'$i'","countryCode":"CH"}' &
  done
  wait
  # Vérifier: Toutes réussissent
  ```

- [ ] **Temps de réponse < 3s**
  ```bash
  time curl -X POST https://your-app.replit.app/api/enrichment \
    -d '{"identifier":"CHE-123.456.789","countryCode":"CH"}'
  # Vérifier: < 3 secondes
  ```

---

### 12. Monitoring Production

- [ ] **Métriques Prometheus intégrées**
  - [ ] URL Prometheus configurée
  - [ ] Scraping fonctionne
  - [ ] Métriques visibles dans Grafana

- [ ] **Dashboard Grafana créé** (optionnel)
  - [ ] Panel "Success Rate"
  - [ ] Panel "Response Time"
  - [ ] Panel "Requests by Provider"
  - [ ] Panel "Quality Score Distribution"

- [ ] **Alertes configurées**
  - [ ] Alert: Taux d'erreur > 10%
  - [ ] Alert: Fallback rate > 20%
  - [ ] Alert: Response time > 5s
  - [ ] Canal de notification configuré (Slack/Email)

- [ ] **Logs centralisés** (optionnel)
  - [ ] Logs envoyés à système central
  - [ ] Logs structurés (JSON)
  - [ ] Recherche fonctionnelle

---

### 13. Sécurité Production

- [ ] **Certificat HTTPS valide**
  ```bash
  curl -I https://your-app.replit.app
  # Vérifier: Pas d'erreur SSL
  ```

- [ ] **Headers de sécurité présents**
  - [ ] `X-Content-Type-Options: nosniff`
  - [ ] `X-Frame-Options: DENY`
  - [ ] `Strict-Transport-Security`

- [ ] **Rate limiting actif**
  - [ ] Testé et fonctionnel
  - [ ] Logs des rejets 429

- [ ] **Pas de secrets exposés**
  - [ ] Vérifier logs
  - [ ] Vérifier réponses API
  - [ ] Vérifier erreurs

---

### 14. Documentation Mise à Jour

- [ ] **README.md avec URL production**
  - [ ] Badge "Production Ready" ✅
  - [ ] URL de production ajoutée
  - [ ] Instructions de test mises à jour

- [ ] **CHANGELOG.md complété**
  - [ ] Version 1.0.0 publiée
  - [ ] Date de déploiement ajoutée

- [ ] **PRODUCTION_READY_REPORT.md finalisé**
  - [ ] Statut : Production Ready ✅
  - [ ] Toutes les métriques validées

---

### 15. Communication

- [ ] **Équipe technique informée**
  - [ ] URL de production partagée
  - [ ] Documentation partagée
  - [ ] Accès monitoring partagés

- [ ] **Stakeholders informés**
  - [ ] Notification de disponibilité
  - [ ] Guide d'utilisation partagé
  - [ ] Support contact fourni

- [ ] **Documentation utilisateur**
  - [ ] Guide d'intégration accessible
  - [ ] Exemples de code fournis
  - [ ] FAQ créée (si nécessaire)

---

## 🎯 Validation Finale

### Checklist Globale

- [ ] ✅ **91/91 tests passent** (100%)
- [ ] ✅ **API accessible en production**
- [ ] ✅ **Documentation complète**
- [ ] ✅ **Monitoring configuré**
- [ ] ✅ **Sécurité validée**
- [ ] ✅ **Performance validée** (< 3s)
- [ ] ✅ **Rate limiting actif**
- [ ] ✅ **Alertes configurées**
- [ ] ✅ **Backup automatique**
- [ ] ✅ **Équipe informée**

---

## 📞 Rollback Plan

### En Cas de Problème Critique

1. **Rollback immédiat**
   ```bash
   git checkout v0.9.0  # Version précédente stable
   # Redéployer sur Replit
   ```

2. **Notification**
   - Informer l'équipe
   - Documenter le problème
   - Créer ticket incident

3. **Investigation**
   - Vérifier logs
   - Reproduire en staging
   - Identifier la cause

4. **Fix & Redéploiement**
   - Corriger le problème
   - Tester en staging
   - Redéployer en production

---

## ✅ Signature de Validation

**Date de déploiement** : ___________________

**Validé par** :
- [ ] Tech Lead : __________________
- [ ] DevOps : __________________
- [ ] Product Owner : __________________

**Statut** : 🚀 **PRODUCTION READY**

**URL Production** : https://your-app.replit.app

**Version** : 1.0.0

---

**Prochaine revue** : 1 semaine après déploiement  
**Support** : ADS GROUP - Hector Team
