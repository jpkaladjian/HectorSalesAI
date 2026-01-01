# 🤖 Hector - AI Sales Assistant & Multi-Country Enrichment System

![Status](https://img.shields.io/badge/Status-Production%20Ready-success?style=flat-square)
![Tests](https://img.shields.io/badge/Tests-91%2F91%20Passing-brightgreen?style=flat-square)
![Countries](https://img.shields.io/badge/Countries-13%20Supported-blue?style=flat-square)
![Version](https://img.shields.io/badge/Version-1.0.0-orange?style=flat-square)

**Hector** est un assistant commercial IA pour ADS GROUP avec un système d'enrichissement multi-pays automatique. Il combine l'IA conversationnelle (Claude AI), un CRM complet, et un enrichissement intelligent des données d'entreprises pour 13 pays.

---

## ✨ Fonctionnalités Clés

- 🌍 **Enrichissement Multi-Pays** - 13 pays supportés (France, Belgique, Suisse, Luxembourg, UK, Allemagne, Espagne, Italie + 5 DOM-TOM)
- 🔄 **Fallback Intelligent** - Basculement automatique entre 3 providers (Pappers, OpenCorporates, WebSearch)
- 📊 **Monitoring Production** - 12 métriques Prometheus + alertes automatiques
- 🔒 **Sécurité Robuste** - Rate limiting, validation Zod, secrets management
- 📖 **Documentation Interactive** - Swagger UI avec 13 exemples de requêtes
- ✅ **Tests Complets** - 91 tests (unitaires + E2E) - 100% de réussite
- 🚀 **Production Ready** - Déploiement Replit en un clic

---

## 🚀 Quick Start (3 Minutes)

```bash
# 1. Installation
npm install

# 2. Configuration (créer .env)
cat > .env << EOF
SESSION_SECRET=your-super-secret-key-minimum-32-chars
DATABASE_URL=postgresql://user:password@host:5432/database
BRAVE_SEARCH_API_KEY=your-brave-search-api-key
EOF

# 3. Démarrer le serveur
npm run dev

# 4. Tester l'API
curl http://localhost:5000/api/enrichment/health

# 5. Voir la documentation interactive
open http://localhost:5000/api/enrichment/docs
```

👉 **Guide complet 5 minutes** : [docs/QUICKSTART.md](docs/QUICKSTART.md)

---

## 🌍 13 Pays Supportés

| Région | Pays | Code | Provider Principal | Fallback |
|--------|------|------|-------------------|----------|
| **Europe** | 🇫🇷 France | FR | Pappers (Python) | WebSearch |
| | 🇧🇪 Belgique | BE | OpenCorporates | WebSearch |
| | 🇨🇭 Suisse | CH | WebSearch | - |
| | 🇱🇺 Luxembourg | LU | OpenCorporates | WebSearch |
| | 🇬🇧 Royaume-Uni | GB | OpenCorporates | WebSearch |
| | 🇩🇪 Allemagne | DE | OpenCorporates | WebSearch |
| | 🇪🇸 Espagne | ES | OpenCorporates | WebSearch |
| | 🇮🇹 Italie | IT | OpenCorporates | WebSearch |
| **DOM-TOM** | 🇬🇵 Guadeloupe | GP | Pappers (Python) | WebSearch |
| | 🇲🇶 Martinique | MQ | Pappers (Python) | WebSearch |
| | 🇬🇫 Guyane | GF | Pappers (Python) | WebSearch |
| | 🇷🇪 Réunion | RE | Pappers (Python) | WebSearch |
| | 🇾🇹 Mayotte | YT | Pappers (Python) | WebSearch |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    HECTOR SALES AI                      │
│  (Chat IA + CRM + Enrichissement + Prospection)         │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │   API REST Enrichment  │
              │   (5 endpoints)        │
              │   + Rate Limiting      │
              └────────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │  Enrichment Orchestrator│
              │  (Router intelligent)   │
              │  + Country Registry     │
              └────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
    ┌────────┐      ┌──────────────┐  ┌──────────┐
    │Pappers │      │OpenCorporates│  │WebSearch │
    │(Python)│      │   (REST)     │  │ (Brave)  │
    │FR+5DOM │      │   8 pays     │  │ CH+FB    │
    └────────┘      └──────────────┘  └──────────┘
         │                 │                 │
         └─────────────────┴─────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │  Monitoring & Metrics  │
              │  (Prometheus + Logs)   │
              └────────────────────────┘
```

👉 **Architecture détaillée** : [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

---

## 📡 API Endpoints

### Production Endpoints

| Endpoint | Méthode | Description | Rate Limit |
|----------|---------|-------------|------------|
| `/api/enrichment` | POST | Enrichir une entreprise | 10 req/min |
| `/api/enrichment/countries` | GET | Liste des pays supportés | - |
| `/api/enrichment/health` | GET | Health check système | - |
| `/api/enrichment/metrics` | GET | Métriques JSON/Prometheus | - |
| `/api/enrichment/alerts` | GET | Alertes actives | - |

### Exemple de Requête

```bash
curl -X POST http://localhost:5000/api/enrichment \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "CHE-123.456.789",
    "countryCode": "CH",
    "companyName": "Nestlé SA",
    "enableFallback": true
  }'
```

### Exemple de Réponse

```json
{
  "success": true,
  "data": {
    "nom": "Nestlé SA",
    "identifiantNational": "CHE-123.456.789",
    "identifiantNationalType": "CHE",
    "adresse": {
      "adresse": "Avenue Nestlé 55",
      "codePostal": "1800",
      "ville": "Vevey",
      "pays": "Suisse"
    },
    "dirigeants": [
      {
        "nom": "Schneider",
        "prenom": "Mark",
        "fonction": "CEO"
      }
    ],
    "secteurActivite": "Food & Beverage",
    "qualityScore": 90,
    "source": "web_search",
    "dateEnrichissement": "2025-10-27T10:30:00Z"
  },
  "provider": "web_search",
  "fallbackUsed": false
}
```

👉 **Documentation interactive** : http://localhost:5000/api/enrichment/docs

---

## 🧪 Tests

### Lancer tous les tests

```bash
# Tous les tests (91 tests)
npm test

# Tests d'enrichissement uniquement
npx vitest run lib/services/enrichment

# Tests E2E
npx vitest run lib/services/enrichment/__tests__/e2e.test.ts

# Mode watch (développement)
npm test -- --watch
```

### Résultats

```
✓ Country Registry (14 tests)
✓ OpenCorporates Provider (15 tests)
✓ WebSearch Provider (21 tests)
✓ Enrichment Orchestrator (22 tests)
✓ Tests E2E (19 tests)

Test Files  4 passed (4)
     Tests  91 passed (91)
  Duration  3.66s
```

---

## 🚀 Déploiement

### Déploiement sur Replit

1. **Configurer les Secrets** (Replit Secrets)
   ```
   SESSION_SECRET=your-super-secret-key-minimum-32-chars
   DATABASE_URL=postgresql://... (auto-configuré)
   BRAVE_SEARCH_API_KEY=your-brave-api-key
   ```

2. **Publier**
   - Cliquer sur **Publish** dans Replit
   - Choisir un domaine : `your-app.replit.app`
   - HTTPS automatiquement configuré ✅

3. **Valider le déploiement**
   ```bash
   # Health check
   curl https://your-app.replit.app/api/enrichment/health
   
   # Métriques
   curl https://your-app.replit.app/api/enrichment/metrics
   ```

👉 **Guide complet** : [docs/DEPLOIEMENT_PRODUCTION.md](docs/DEPLOIEMENT_PRODUCTION.md)  
👉 **Checklist** : [docs/CHECKLIST_DEPLOIEMENT.md](docs/CHECKLIST_DEPLOIEMENT.md)

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [QUICKSTART.md](docs/QUICKSTART.md) | Guide 5 minutes pour démarrer |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Architecture du système |
| [INTEGRATION_HECTOR.md](docs/INTEGRATION_HECTOR.md) | Guide d'intégration (600+ lignes) |
| [DEPLOIEMENT_PRODUCTION.md](docs/DEPLOIEMENT_PRODUCTION.md) | Guide de déploiement (400+ lignes) |
| [PRODUCTION_READY_REPORT.md](docs/PRODUCTION_READY_REPORT.md) | Rapport de validation |
| [CHANGELOG.md](CHANGELOG.md) | Historique des versions |
| **Swagger UI** | http://localhost:5000/api/enrichment/docs |

---

## 📊 Métriques & Monitoring

### Métriques Prometheus

```bash
# Format JSON
curl http://localhost:5000/api/enrichment/metrics

# Format Prometheus
curl http://localhost:5000/api/enrichment/metrics?format=prometheus
```

### Alertes Automatiques

```bash
# Vérifier les alertes actives
curl http://localhost:5000/api/enrichment/alerts

# Réponse exemple
{
  "alerts": [
    "Taux d'erreur élevé: 15% d'échecs"
  ],
  "severity": "warning"
}
```

**12 métriques disponibles** :
- Requests, Success, Failures, Fallbacks
- Response time, Quality score
- Distribution par provider et pays
- Quality score distribution

---

## 🛠️ Stack Technique

### Backend
- **Node.js** + **Express.js** + **TypeScript**
- **PostgreSQL** (Neon) avec **Drizzle ORM**
- **Anthropic Claude AI** pour l'IA conversationnelle
- **Python FastAPI** pour services Pappers/DISC/Prospection

### Frontend
- **React 18** + **TypeScript** + **Vite**
- **shadcn/ui** (Radix UI) + **Tailwind CSS**
- **TanStack Query** pour data fetching
- **Wouter** pour routing

### External APIs
- **Pappers API** (France + DOM-TOM)
- **OpenCorporates API** (8 pays européens)
- **Brave Search API** (WebSearch fallback)

---

## 🔐 Sécurité

- ✅ **Rate Limiting** : 10 requêtes/minute par IP
- ✅ **Validation Zod** : Toutes les entrées validées
- ✅ **Secrets Management** : Stockage sécurisé (Replit Secrets)
- ✅ **HTTPS** : Forcé en production
- ✅ **Logs structurés** : Sans données sensibles
- ✅ **Error handling** : Messages sécurisés

---

## 📈 Performance

| Métrique | Résultat | Objectif | Statut |
|----------|----------|----------|--------|
| Temps de réponse | < 2s | < 3s | ✅ |
| Taux de succès | > 95% | > 90% | ✅ |
| Concurrence | 5 parallèles | 3+ | ✅ |
| Throughput | 10 req/min | 10 req/min | ✅ |

---

## 🤝 Support & Contact

### Documentation & Ressources

- **Support Technique** : ADS GROUP - Hector Team
- **API Brave Search** : https://brave.com/search/api/
- **Replit Support** : https://replit.com/support

### Troubleshooting

Consultez le guide de troubleshooting : [docs/DEPLOIEMENT_PRODUCTION.md#troubleshooting](docs/DEPLOIEMENT_PRODUCTION.md#8-troubleshooting-courant)

**5 problèmes courants résolus** :
1. "Pays non configuré"
2. "Trop de requêtes" (429)
3. "API Python indisponible"
4. Quality Score faible
5. Temps de réponse élevé

---

## 📝 License

© 2025 ADS GROUP - Tous droits réservés

---

## 🎯 Statut du Projet

- ✅ **Tests** : 91/91 passent (100%)
- ✅ **Documentation** : Complète (1500+ lignes)
- ✅ **API** : 5 endpoints production-ready
- ✅ **Monitoring** : 12 métriques + alertes
- ✅ **Sécurité** : Rate limiting + validation
- ✅ **Performance** : < 3s response time
- ✅ **Déploiement** : Guide complet

**🚀 Status : PRODUCTION READY** - Validé le 27 octobre 2025

---

**Version** : 1.0.0  
**Dernière mise à jour** : 27 octobre 2025  
**Auteur** : ADS GROUP - Hector Sales AI Team
