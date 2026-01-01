# 📍 MODULE GPS TRACKING V2 - GUIDE UTILISATEUR

**Version:** 2.0  
**Date:** 30 Octobre 2025  
**Projet:** Hector SalesAI - ADS GROUP

---

## 📋 VUE D'ENSEMBLE

Le Module GPS Tracking V2 transforme les téléphones commerciaux en capteurs GPS intelligents avec :

✅ **Tracking en temps réel** : Capture positions toutes les 5 minutes (configurable)  
✅ **Détection opportunités** : Alerte automatique prospects à proximité (rayon 5km)  
✅ **Rapports hebdomadaires** : Stats distance, visites, heures travaillées (envoi lundi 8h)  
✅ **Interface admin complète** : Configuration sans code, monitoring temps réel  
✅ **PWA mobile** : Mode offline, synchronisation automatique, notifications

---

## 🎯 ACCÈS RAPIDE

### Interface Admin (Managers/Admin)
📍 URL : `https://[votre-domaine]/admin/gps`

**3 onglets disponibles** :
1. **Dashboard** : Stats globales (positions, utilisateurs, distance, opportunités)
2. **Configuration** : Paramètres tracking par entité (France/Luxembourg/Belgique)
3. **Clés API** : Gestion clés externes (Google Maps, OpenWeather)

### Interface Mobile (Commerciaux)
📱 URL : `https://[votre-domaine]/gps/track`

**Fonctionnalités** :
- Toggle ON/OFF tracking
- Position actuelle (lat/lng, précision, batterie)
- Liste opportunités à proximité

---

## ⚙️ CONFIGURATION RAPIDE

### 1. Connexion Admin
```
Email : votre-email@adsgroup-security.com
Mot de passe : [votre mot de passe]
```

### 2. Activer Tracking pour une Entité

**Navigation** : Admin Panel → GPS → Onglet "Configuration"

**Paramètres disponibles** :
- **Entity** : France / Luxembourg / Belgique / Global
- **Tracking GPS activé** : ON/OFF
- **Fréquence tracking** : 1-60 minutes (défaut : 5 min)
- **Heures tracking** : Début (08:00) → Fin (19:00)
- **Jours tracking** : Lundi-Vendredi (1=Lundi, 7=Dimanche)
- **Opportunités activées** : ON/OFF
- **Rayon détection** : 1-50 km (défaut : 5 km)
- **Priorité minimale** : 0-100 (défaut : 30)
- **Rétention données** : 7-365 jours (défaut : 90 jours)
- **Nettoyage auto** : ON/OFF
- **Rapports hebdomadaires** : ON/OFF (envoi lundi 8h)

**Action** : Cliquer "Enregistrer" → Toast confirmation

### 3. Ajouter Clés API (Optionnel mais recommandé)

**Navigation** : Admin Panel → GPS → Onglet "Clés API"

**Clés supportées** :
- **Google Maps API** : Geocoding reverse (adresse depuis GPS)
- **OpenWeather API** : Météo temps réel (future feature)

**Procédure** :
1. Sélectionner Provider (Google Maps / OpenWeather)
2. Sélectionner Entity (france / luxembourg / belgique)
3. Coller API Key
4. Cliquer "Ajouter"
5. Vérifier status "Actif" ✅

---

## 📱 UTILISATION MOBILE (COMMERCIAUX)

### Première Utilisation

1. **Ouvrir l'app mobile** : `https://[domaine]/gps/track`
2. **Autoriser géolocalisation** : Navigateur demandera permission → Accepter
3. **Activer tracking** : Toggle ON
4. **Vérifier position** : Latitude, Longitude, Précision doivent s'afficher

### Opportunités Proximité

**Affichage automatique** quand :
- Tracking activé ✅
- Commercial à < 5km d'un prospect ✅
- Priorité prospect ≥ 30 ✅

**Informations affichées** :
- Nom prospect
- Adresse
- Distance (km)
- Badge priorité (Haute/Moyenne/Basse)

### Mode Offline

**Service Worker activé** :
- Positions enregistrées localement si hors ligne
- Synchronisation auto dès connexion rétablie
- Badge "Syncing..." visible pendant sync

---

## 📊 RAPPORTS HEBDOMADAIRES

### Configuration

**Navigation** : Admin Panel → GPS → Configuration

**Paramètres** :
- **Rapports hebdo activés** : ON
- **Jour envoi** : Lundi (1) → Dimanche (7)
- **Heure envoi** : 08:00:00 (format HH:MM:SS)
- **Destinataires** : liste emails séparés par virgule

### Contenu Rapport

**Métriques incluses** :
- Distance totale parcourue (km)
- Nombre visites effectuées
- Heures travaillées (calcul automatique)
- Zones géographiques couvertes
- Opportunités détectées

**Format** : Email HTML + PDF attaché (future feature)

---

## 🔧 TROUBLESHOOTING

### Tracking ne démarre pas

**Vérifications** :
1. ✅ Tracking activé dans config admin ?
2. ✅ Permission géolocalisation accordée (navigateur) ?
3. ✅ Heures tracking respectées ? (ex: 08:00-19:00)
4. ✅ Jour de semaine actif ? (ex: Lun-Ven uniquement)

**Solutions** :
- Recharger page mobile `/gps/track`
- Vérifier console browser (F12) pour erreurs
- Désactiver/Réactiver toggle tracking

### Opportunités non affichées

**Causes possibles** :
- Opportunités désactivées dans config
- Rayon détection trop petit (augmenter de 5km → 10km)
- Priorité minimale trop haute (baisser de 30 → 10)
- Aucun prospect dans BDD à proximité

**Diagnostic** :
```sql
-- Vérifier prospects avec GPS
SELECT COUNT(*) FROM prospects WHERE latitude IS NOT NULL;

-- Vérifier opportunités détectées
SELECT * FROM gps_opportunities WHERE user_id = 'USER_ID' ORDER BY detected_at DESC LIMIT 10;
```

### Erreur 401 sur Update Config

**CORRIGÉ dans v2.0** ✅

Si problème persiste :
1. Déconnexion/Reconnexion admin
2. Vider cache navigateur
3. Vérifier rôle user = `admin_groupe` (non `commercial`)

### Rapports hebdo non reçus

**⚠️ BUG CONNU** : pg-boss CRON scheduling échoue

**Workaround** :
1. Exécution manuelle possible via script :
```bash
# Sur serveur
curl -X POST http://localhost:5000/api/admin/gps/manual-weekly-report
```

2. Alternative : Triggers BDD PostgreSQL (contacter dev)

---

## 🔐 SÉCURITÉ & PERMISSIONS

### Rôles Requis

| Fonctionnalité | Rôle requis |
|----------------|-------------|
| Admin GPS (config) | `admin_groupe` |
| Tracking mobile | `commercial` / `manager_entity` |
| Dashboard stats | `admin_groupe` / `manager_entity` |
| Clés API | `admin_groupe` |

### Données Chiffrées

**Clés API** :
- Chiffrement AES-256-GCM
- IV unique par clé
- Stockage encrypted dans BDD

**Positions GPS** :
- Pas de chiffrement (données non sensibles)
- Rétention limitée (défaut : 90 jours)
- Nettoyage automatique activable

---

## 📊 MÉTRIQUES & KPI

### Dashboard Admin

**Stats 30 derniers jours** :
- Total positions enregistrées
- Utilisateurs actifs (ayant envoyé ≥1 position)
- Distance totale (km) - calcul Haversine
- Opportunités détectées

**Filtres disponibles** :
- Par entity (france/luxembourg/belgique)
- Par période (7/14/30/90 jours)

---

## 🛠️ ADMINISTRATION AVANCÉE

### Accès Base de Données

**Tables GPS** (8 tables) :
```sql
-- Config système
SELECT * FROM gps_system_config WHERE entity_id = 'france';

-- Positions récentes
SELECT * FROM gps_positions ORDER BY captured_at DESC LIMIT 100;

-- Stats journalières
SELECT * FROM gps_daily_stats WHERE date >= NOW() - INTERVAL '7 days';

-- Opportunités détectées
SELECT * FROM gps_opportunities WHERE priority = 'haute';

-- Clés API (encrypted)
SELECT id, provider, entity_id, is_active FROM api_credentials;
```

### Maintenance

**Nettoyage manuel positions anciennes** :
```sql
DELETE FROM gps_positions 
WHERE captured_at < NOW() - INTERVAL '90 days';
```

**Reset config entity** :
```sql
UPDATE gps_system_config 
SET tracking_enabled = true, 
    tracking_frequency_minutes = 5,
    opportunities_radius_km = '5.00'
WHERE entity_id = 'france';
```

---

## 📞 SUPPORT

**Bugs connus** : Voir section TROUBLESHOOTING ci-dessus

**Contact développeur** :
- Email : kaladjian@adsgroup-security.com
- Projet : HectorSalesAI - Module GPS V2

**Documentation technique** :
- `RAPPORT_DEV_GPS.md` : Rapport développement complet
- `shared/schema-gps.ts` : Schémas base de données
- `server/routes/gps-admin.ts` : API admin
- `server/routes/gps-track.ts` : API mobile

---

## 🎉 CHANGELOG

### v2.0 (30 Oct 2025)

**Features** :
- ✅ Interface admin complète (3 onglets)
- ✅ Page mobile tracking avec PWA
- ✅ Détection opportunités automatique
- ✅ Rapports hebdomadaires (workers pg-boss)
- ✅ Service Worker + Queue offline
- ✅ 8 tables BDD + indexes optimisés

**Fixes** :
- ✅ **Erreur 401 sur PUT config** : Correction middleware auth
- ✅ Import AdminLayout : Export nommé vs default
- ⚠️ **pg-boss CRON** : Scheduling échoue (non-bloquant, exécution manuelle OK)

---

**Dernière mise à jour** : 30 Octobre 2025  
**Version document** : 1.0
