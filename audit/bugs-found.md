# 🐛 BUGS IDENTIFIÉS - AUDIT HECTOR

**Date**: 28 octobre 2025  
**Auditeur**: Replit Agent  
**Credentials**: kaladjian@adsgroup-security.com

---

## BUG #1 : Module "Trouve-moi le patron" - Route 404 ❌ CORRIGÉ ✅

**Criticité**: P0 (Bloquant)  
**Module**: Trouve-moi le patron  
**Endpoint**: `POST /api/patron/contacts`

### Description
Lors de l'ajout d'un contact trouvé au CRM, l'API retournait une erreur 404 car les requêtes `/api/patron/*` étaient incorrectement routées vers le service Python (port 5001) au lieu du serveur Express.

### Reproduction
1. Se connecter à Hector
2. Ouvrir modal "Trouve-moi le patron"
3. Rechercher un SIRET (ex: 44306184100047)
4. Cliquer "Ajouter au CRM"
5. ❌ Erreur 404: `{"detail":"Not Found"}`

### Cause racine
Dans `server/index.ts`, le proxy `proxyToPython` n'incluait pas `/api/patron` dans la liste des routes Express, donc toutes les requêtes `/api/patron/*` étaient envoyées au Python au lieu d'Express.

### Correction appliquée
**Fichier**: `server/index.ts` ligne 37-53  
**Changement**: Ajout de `/api/patron` à la liste des routes Express

```diff
-  // Skip proxy for Node.js routes (auth, chat, media, ..., enrichment, companies)
+  // Skip proxy for Node.js routes (auth, chat, media, ..., enrichment, companies, patron)
   if (req.originalUrl.startsWith('/api/auth') || 
       ...
       req.originalUrl.startsWith('/api/companies') ||
+      req.originalUrl.startsWith('/api/patron')) {
     return next();
   }
```

### Statut
✅ **CORRIGÉ** - Les requêtes `/api/patron/contacts` sont maintenant gérées par Express

---

## BUG #2 : Validation SIRET avec espaces ❌ CORRIGÉ ✅

**Criticité**: P1 (Critique)  
**Module**: Trouve-moi le patron  
**Endpoint**: `POST /api/patron/contacts`

### Description
Après correction du Bug #1, l'API retournait une erreur 400 "SIRET invalide" car la validation côté serveur ne nettoyait pas les espaces du SIRET avant vérification.

### Reproduction
1. Rechercher un SIRET dans "Trouve-moi le patron"
2. Cliquer "Ajouter au CRM"
3. ❌ Erreur 400: `{"error":"SIRET invalide","message":"Le SIRET doit contenir exactement 14 chiffres"}`
4. Le SIRET envoyé contenait des espaces: "443 061 841 00047" (17 caractères au lieu de 14)

### Cause racine
Dans `server/routes.ts` ligne 2669, la validation vérifie `contactData.siret.length !== 14` mais ne nettoie pas les espaces formatés par le frontend.

### Correction appliquée
**Fichier**: `server/routes.ts` lignes 2671-2681  
**Changement**: Nettoyage des espaces avant validation

```diff
-  // Validation SIRET
-  if (!contactData.siret || contactData.siret.length !== 14) {
+  // Nettoyer et valider SIRET
+  const siretClean = contactData.siret?.replace(/\s/g, '') || '';
+  if (!siretClean || siretClean.length !== 14 || !/^\d{14}$/.test(siretClean)) {
     return res.status(400).json({ 
       error: 'SIRET invalide', 
       message: 'Le SIRET doit contenir exactement 14 chiffres' 
     });
   }
+  
+  // Remplacer le SIRET par la version nettoyée
+  contactData.siret = siretClean;
```

### Statut
✅ **CORRIGÉ** - Les SIRET avec espaces sont maintenant acceptés et nettoyés

---

## BUG #3 : Recherche patron - Endpoints manquants ❌ CORRIGÉ ✅

**Criticité**: P0 (Bloquant)  
**Module**: Trouve-moi le patron - Recherche SIRET  
**Endpoint**: `POST /api/patron/search-siret`

### Description
Lors de la recherche d'un dirigeant par SIRET, l'API retournait une erreur 500 "fetch failed" car l'endpoint `/api/patron/search-siret` n'existait pas dans le service Python. Le code Node.js essayait de faire un proxy vers Python (port 5001), mais ces endpoints n'avaient jamais été implémentés.

### Reproduction
1. Se connecter à Hector
2. Ouvrir modal "Trouve-moi le patron"
3. Onglet "Par SIRET", saisir: 893 010 520 00011
4. Cliquer "Rechercher"
5. ❌ Erreur 500: `{"error":"Erreur recherche patron","message":"fetch failed"}`

### Cause racine
Dans `server/routes.ts` ligne 2598, le code fait :
```typescript
const pythonResponse = await fetch('http://localhost:5001/api/patron/search-siret', ...)
```

Mais cet endpoint n'existe pas dans `src/api/main.py`. Le service Python ne contient que les endpoints :
- `/api/generate-rdv-preparation`
- `/api/ai/generate-script`
- `/api/ai/generate-linkedin-message`

### Correction appliquée
**Fichier**: `server/routes.ts` lignes 2590-2677  
**Changement**: Remplacement du proxy Python par une implémentation native Node.js utilisant l'API Pappers

```typescript
// AVANT (proxy vers Python qui n'existe pas)
const pythonResponse = await fetch('http://localhost:5001/api/patron/search-siret', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(req.body),
});

// APRÈS (implémentation native Node.js)
const siretClean = siret.replace(/\s/g, '');
const PAPPERS_API_KEY = process.env.PAPPERS_API_KEY;
const pappersUrl = `https://api.pappers.fr/v2/entreprise?api_token=${PAPPERS_API_KEY}&siret=${siretClean}`;
const pappersResponse = await fetch(pappersUrl);
const data = await pappersResponse.json();

// Extraire dirigeant principal
const dirigeants = data.representants || [];
const principalDirigeant = dirigeants.find(d => 
  d.qualite?.toLowerCase().includes('gérant') || 
  d.qualite?.toLowerCase().includes('président') ||
  d.qualite?.toLowerCase().includes('directeur')
) || dirigeants[0];

// Construire résultat avec nom, prénom, qualité, entreprise, etc.
```

### Avantages de la correction
1. ✅ Plus besoin de service Python pour cette fonctionnalité
2. ✅ API Pappers déjà utilisée pour enrichissement CASCADE
3. ✅ Validation SIRET intégrée (nettoyage espaces + regex)
4. ✅ Gestion erreurs robuste (404 si entreprise non trouvée)
5. ✅ Extraction intelligente du dirigeant principal

### Statut
✅ **CORRIGÉ** - Recherche SIRET fonctionnelle avec implémentation native Node.js

---

## BUG #4 : Capital social absent (Phase 2.8) ⚠️ COMPORTEMENT NORMAL

**Criticité**: P3 (Mineur)  
**Module**: Enrichissement CASCADE  
**Description**: Le capital social n'est pas toujours disponible via l'API Pappers pour les grandes entreprises (ex: Carrefour).

**Statut**: ⚠️ **COMPORTEMENT NORMAL** - Certaines entreprises n'ont pas cette donnée dans les API publiques. Le code gère correctement le cas `null` en masquant l'affichage.

**Recommandation**: Documenter cette limitation dans l'interface utilisateur.

---

## RÉSUMÉ

- **Total bugs trouvés**: 4
- **Bugs critiques (P0-P1)**: 3 ✅ CORRIGÉS
- **Bugs mineurs (P3)**: 1 ⚠️ COMPORTEMENT NORMAL

### Chronologie corrections
1. **27 oct 23:00** - Bug #1 corrigé (routage /api/patron)
2. **27 oct 23:10** - Bug #2 corrigé (validation SIRET espaces)
3. **28 oct 04:50** - Bug #3 corrigé (implémentation recherche SIRET native)

### Prochaines étapes
- [x] Tester Bug #3 avec SIRET réel (ex: 893 010 520 00011)
- [ ] Implémenter recherche par téléphone (même approche que SIRET)
- [ ] Implémenter recherche par nom entreprise
- [ ] Tests E2E complets module "Trouve-moi le patron"
