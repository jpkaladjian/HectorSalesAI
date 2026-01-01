# Guide Utilisateur - Hector CRM
## Assistant IA commercial pour ADS GROUP SECURITY

**Version** : 1.0 MVP  
**Date** : Octobre 2025  
**Public** : Commerciaux ADS GROUP SECURITY (SDR, BD, IC, Chef des Ventes)

---

## Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Premiers pas](#premiers-pas)
3. [Navigation CRM](#navigation-crm)
4. [Gestion des Prospects](#gestion-des-prospects)
5. [Pipeline Commercial](#pipeline-commercial)
6. [Transferts SDR vers BD](#transferts-sdr-vers-bd)
7. [Affaires Chaudes](#affaires-chaudes)
8. [Mes Statistiques](#mes-statistiques)
9. [Workflow Automatisé](#workflow-automatisé)
10. [Vocabulaire ADS GROUP](#vocabulaire-ads-group)
11. [Assistance Hector IA](#assistance-hector-ia)

---

## Vue d'ensemble

### Qu'est-ce que Hector CRM ?

Hector est votre **assistant commercial intelligent** spécialement conçu pour les équipes commerciales d'ADS GROUP SECURITY. Il combine :

- **Un CRM complet** pour gérer vos prospects et opportunités
- **Un assistant IA conversationnel** pour vous accompagner dans vos ventes
- **Des statistiques en temps réel** pour piloter votre performance
- **Des workflows automatisés** pour gagner du temps

### À qui s'adresse Hector ?

Hector est conçu pour **4 rôles commerciaux** :

| Rôle | Code | Fonction principale |
|------|------|---------------------|
| **SDR** | sdr | Prospection à distance (visio) - R1 à R4 |
| **Business Developer** | bd | Développement terrain - Reprises SDR + R1/R2 |
| **Ingénieur Commercial** | ic | Signatures + reconductions |
| **Chef des Ventes** | chef | Management équipe BD + performance perso |

**Également disponible pour :**
- Responsable Développement (resp_dev)
- Directeur Général (dg)
- Président (president)

### Architecture du CRM

```
Hector CRM
├── Chat IA (Assistant commercial)
├── CRM Dashboard (Vue d'ensemble)
├── Prospects (Base entreprises)
├── Pipeline Commercial
│   ├── SDR Visio (R1 → R4)
│   └── BD Terrain (R1 → R2)
├── Affaires Chaudes (Opportunités urgentes)
├── Transferts SDR → BD
├── Actions & RDVs
├── Mes Statistiques (KPIs par rôle)
└── Workflow Automatisé
```

---

## Premiers pas

### 1. Connexion à Hector

1. Ouvrez votre navigateur et accédez à l'URL Hector CRM
2. Entrez votre **email professionnel** @adsgroup-security.com
3. Entrez votre **mot de passe**
4. Cochez "Se souvenir de moi" pour rester connecté 30 jours
5. Cliquez sur "Se connecter"

**Première connexion ?**
- Vous recevrez un email d'invitation avec un lien
- Créez votre mot de passe (minimum 8 caractères)
- Votre compte est automatiquement activé

**Mot de passe oublié ?**
1. Cliquez sur "Mot de passe oublié ?" sur la page de connexion
2. Entrez votre email @adsgroup-security.com
3. Consultez vos emails pour le lien de réinitialisation
4. Créez un nouveau mot de passe

### 2. Interface principale

Après connexion, vous arrivez sur **l'écran d'accueil** avec :

- **Assistant Hector IA** : Posez vos questions commerciales
- **Boutons rapides** : Accès CRM, Stats, Opportunités
- **Navigation** : Menu en haut de page

### 3. Navigation

**Menu principal** (disponible sur toutes les pages) :

- **Accueil** : Retour à l'assistant IA
- **CRM Dashboard** : Vue d'ensemble activité
- **Pipeline** : Gestion opportunités
- **Prospects** : Base entreprises
- **Affaires Chaudes** : Opportunités urgentes
- **Transferts** : Gestion transferts SDR→BD (si SDR/BD)
- **Mes Stats** : Tableau de bord personnel
- **Admin** : Gestion utilisateurs (administrateurs uniquement)

---

## Navigation CRM

### CRM Dashboard

**Accès** : Menu "CRM Dashboard" ou bouton "Accéder au CRM"

Le dashboard affiche **4 indicateurs clés** :

1. **Opportunités Actives** : Nombre total dans votre pipeline
2. **Signatures ce mois** : Contrats signés ce mois
3. **MRR Généré** : Abonnement mensuel récurrent total
4. **Affaires Chaudes** : Opportunités nécessitant un R2

**Actions rapides** :
- Créer une nouvelle opportunité
- Accéder au pipeline commercial
- Voir mes statistiques
- Gérer mes prospects

### Structure des données

Hector organise vos données en **4 entités** :

1. **Prospects** : Les entreprises que vous prospectez
2. **Opportunités** : Les projets commerciaux en cours
3. **Actions** : Les tâches à effectuer (appels, emails, relances)
4. **RDVs** : Les rendez-vous planifiés

---

## Gestion des Prospects

### Qu'est-ce qu'un Prospect ?

Un **prospect** est une entreprise que vous prospectez pour lui vendre nos solutions de sécurité. Dans Hector, **jamais de "clients"** - on parle toujours d'**entreprises** ou de **prospects**.

### Créer un nouveau prospect

**Accès** : Menu "Prospects" > Bouton "Nouveau Prospect"

**Informations obligatoires** :
- **Nom de l'entreprise** : Raison sociale complète
- **Contact principal** : Nom du décideur
- **Email** : Email professionnel du contact
- **Téléphone** : Numéro direct

**Informations optionnelles** :
- Adresse complète
- Secteur d'activité
- Nombre d'employés
- Site web
- Notes libres

**Bonnes pratiques** :
- Vérifiez l'orthographe du nom d'entreprise
- Privilégiez les contacts décideurs (DG, DAF, Responsable sécurité)
- Notez la source de prospection (salon, appel sortant, recommandation)

### Analyser une carte de visite

Hector peut **extraire automatiquement** les informations d'une carte de visite !

**Procédure** :
1. Menu "Prospects" > "Analyser carte de visite"
2. Prenez une photo claire de la carte (ou uploadez une image)
3. Hector extrait : nom, fonction, entreprise, email, téléphone
4. Vérifiez les informations extraites
5. Complétez si nécessaire
6. Cliquez "Créer le prospect"

### Gérer vos prospects

**Actions disponibles sur un prospect** :
- Modifier les informations
- Créer une opportunité liée
- Voir l'historique des interactions
- Supprimer (si aucune opportunité liée)

---

## Pipeline Commercial

### Architecture Dual Pipeline

Hector utilise **2 pipelines distincts** selon votre méthode de prospection :

#### Pipeline SDR Visio (8 étapes)

Pour les **SDR** qui prospectent à distance par visioconférence :

| Étape | Code | Description |
|-------|------|-------------|
| **R1 Planifié** | r1_visio_planifie | 1er RDV visio à planifier |
| **R1 Fait** | r1_visio_fait | 1er RDV visio effectué |
| **R2 Planifié** | r2_visio_planifie | 2ème RDV visio à planifier |
| **R2 Fait** | r2_visio_fait | 2ème RDV visio effectué |
| **R3 Planifié** | r3_visio_planifie | 3ème RDV visio à planifier |
| **R3 Fait** | r3_visio_fait | 3ème RDV visio effectué |
| **R4 Planifié** | r4_visio_planifie | 4ème RDV visio (signature) à planifier |
| **R4 Fait** | r4_visio_fait | 4ème RDV visio effectué |

**Après R4** : Soit **signé** soit **perdu**

#### Pipeline BD Terrain (6 étapes)

Pour les **Business Developers** et **IC** qui se déplacent sur le terrain :

| Étape | Code | Description |
|-------|------|-------------|
| **R1 Planifié** | r1_planifie | 1er RDV terrain à planifier |
| **R1 Fait** | r1_fait | 1er RDV terrain effectué |
| **R1 Perdu - Attente R2** | r1_perdu_attente_r2 | R1 non concluant → devient affaire chaude |
| **R2 Planifié** | r2_planifie | 2ème RDV terrain à planifier |
| **R2 Fait** | r2_fait | 2ème RDV terrain effectué |
| **R2 Perdu** | r2_perdu | Définitivement perdu après R2 |

**Après R2** : Soit **signé** soit **perdu définitivement**

### Créer une opportunité

**Accès** : Menu "Pipeline Commercial" > Bouton "Nouvelle Opportunité"

**Étape 1 : Informations de base**
- **Titre** : Nom court du projet (ex: "Télésurveillance Usine Nord")
- **Prospect** : Sélectionnez l'entreprise dans la liste
- **Type de prestation** : Télésurveillance / Vidéosurveillance / Contrôle d'accès / Défibrillateurs
- **Statut initial** : R1 Visio Planifié (SDR) ou R1 Planifié (BD/IC)

**Étape 2 : Abonnement**
- **Nombre de contrats** : Quantité de sites/équipements
- **Abonnement mensuel HT** : Prix mensuel par contrat
- **Durée d'engagement** : 12, 24, 36, 48 ou 60 mois

**Attention aux durées** :
- **SDR, BD, Chef, Resp Dev** : Uniquement **36, 48 ou 60 mois**
- **Président, DG, IC** : Toutes durées possibles (12 à 60 mois)

**Étape 3 : Informations optionnelles**
- Description détaillée du projet
- Profil DISC du décideur
- Notes commerciales

**MRR et ARR calculés automatiquement** :
- **MRR** (Monthly Recurring Revenue) = Nombre contrats × Abonnement mensuel HT
- **ARR** (Annual Recurring Revenue) = MRR × 12

### Gérer une opportunité

**Vue Kanban** :
- Les opportunités sont affichées en **colonnes** selon leur statut
- Glissez-déposez une carte pour changer le statut (desktop)
- Cliquez sur une carte pour voir les détails

**Actions disponibles** :
- Modifier les informations
- Changer le statut
- Clôturer R1 (si non concluant)
- Positionner R2 (si R1 perdu)
- Transférer à un BD (SDR uniquement)
- Marquer comme signé
- Supprimer

### Signatures

Quand une opportunité est **signée** :

1. Changez le statut vers "Signé"
2. Renseignez la **date de signature**
3. Le **signataire** est automatiquement enregistré (vous)
4. Les **commissions** sont calculées automatiquement

**Calcul des commissions** :
Les commissions sont réparties selon la hiérarchie :
- **Signataire** : Commission principale
- **SDR créateur** : Si l'opportunité vient d'un SDR
- **BD repreneur** : Si transfert SDR→BD
- **Chef de ventes** : Commission management
- **Responsable développement** : Commission direction
- **DG + Président** : Commissions stratégiques

---

## Transferts SDR vers BD

### Pourquoi transférer ?

Les **SDR** prospectent à distance (visio). Quand un prospect est **qualifié et intéressé**, le SDR peut transférer l'opportunité à un **Business Developer** ou un **IC** pour :

- Rencontrer le prospect sur le terrain
- Concrétiser la signature en face-à-face
- Bénéficier de l'expertise terrain du BD/IC

### Comment ça marche ?

#### Pour les SDR : Demander un transfert

**Accès** : Ouvrir l'opportunité > Bouton "Transférer à un BD/IC"

**Procédure** :
1. Choisir le **repreneur** (BD ou IC disponible)
2. Indiquer la **raison du transfert** :
   - Prospect qualifié nécessitant RDV terrain
   - Secteur géographique du repreneur
   - Expertise technique requise
   - Autre (à préciser)
3. Ajouter des **notes** pour faciliter la reprise
4. Cliquer "Demander le transfert"

**Après demande** :
- Le repreneur reçoit une **notification**
- L'opportunité reste dans votre pipeline (statut "Transfert demandé")
- Vous pouvez suivre l'état dans "Mes demandes de transfert"

#### Pour les BD/IC : Accepter ou refuser un transfert

**Accès** : Menu "Transferts" > Onglet "À traiter"

**Vous voyez** :
- Les opportunités que des SDR veulent vous transférer
- Informations : Entreprise, projet, MRR, raison du transfert
- Notes du SDR

**Actions** :
1. **Accepter** : L'opportunité arrive dans votre pipeline
2. **Refuser** : L'opportunité reste chez le SDR (avec message explicatif)

**Après acceptation** :
- Vous devenez **repreneur** de l'opportunité
- L'opportunité passe automatiquement en statut **R1 Planifié** (terrain)
- Le SDR conserve son statut de **créateur** pour les commissions
- Vous planifiez le 1er RDV terrain

### Commissions sur transferts

Les commissions sont **partagées** entre SDR et BD/IC :

- **SDR créateur** : Commission pour la création et qualification
- **BD/IC repreneur** : Commission pour la signature terrain
- **Répartition automatique** selon grille de commissions

**Exemple** :
- SDR crée opportunité MRR 5000€
- SDR transfère au BD
- BD signe le contrat
- Commissions réparties : 40% SDR, 60% BD (exemple)

---

## Affaires Chaudes

### Qu'est-ce qu'une affaire chaude ?

Une **affaire chaude** est une opportunité où :

- Le **R1 a échoué** (prospect pas convaincu au 1er RDV)
- Mais le prospect **reste intéressé**
- Un **R2 est nécessaire** pour relancer

**Marquage automatique** :
Quand vous cloturez un R1 avec "Non signé", l'opportunité devient automatiquement une affaire chaude.

### Gérer les affaires chaudes

**Accès** : Menu "Affaires Chaudes"

**Informations affichées** :
- Entreprise et titre de l'opportunité
- MRR potentiel
- **Date limite R2** : Deadline pour planifier le R2
- **Jours restants** : Urgence (rouge si < 7 jours)
- Raison de non-signature au R1
- Actions prévues avant R2

**Actions disponibles** :

#### 1. Positionner R2
Planifiez le 2ème rendez-vous :
- Date et heure du R2
- Actions à effectuer avant (envoi doc, appel, relance)
- L'opportunité passe en statut "R2 Planifié"

#### 2. Relancer
Envoyez un message de relance au prospect :
- Email automatique avec texte personnalisable
- Rappel de l'intérêt du projet
- Proposition de créneau pour R2

#### 3. Abandonner
Si le prospect n'est plus intéressé :
- Marquez l'opportunité comme "Perdu"
- Indiquez la raison (budget, concurrent, timing, etc.)

### Best practices affaires chaudes

1. **Ne laissez jamais une affaire chaude sans R2 positionné**
2. **Relancez dans les 48h** après le R1 non concluant
3. **Préparez le R2** : nouvelles informations, offre adaptée, démo
4. **Respectez la deadline** : Un R2 trop tard = opportunité perdue

---

## Mes Statistiques

### Dashboard personnel

**Accès** : Menu "Mes Statistiques"

Votre tableau de bord affiche **vos KPIs** selon votre rôle.

### Stats SDR

**Activité commerciale** :
- Opportunités créées (total)
- Pipeline visio actif (en cours)
- Cycle de vente moyen (jours)

**Performance** :
- Signatures solo (sans transfert)
- Signatures avec BD (après transfert)
- Transferts BD effectués
- Taux de signature autonome (%)

**Résultats financiers** :
- MRR généré (total)
- ARR généré (total)
- Commissions totales gagnées

### Stats Business Developer

**Activité** :
- Signatures solo (opportunités créées par vous)
- Reprises SDR signées (transferts acceptés)
- Signatures R1 (conclues au 1er RDV)

**Affaires chaudes** :
- Affaires chaudes actives
- R2 non encore positionnés
- Délai moyen R1 → R2

**Résultats financiers** :
- MRR généré
- Commissions totales

**Performance R1** :
- Taux de signature R1 (%)
- Délai moyen entre R1 et R2 (jours)

### Stats Ingénieur Commercial

**Signatures** :
- Nouveaux clients signés
- Reconductions signées (renouvellements)
- Total signatures

**Affaires chaudes** :
- Affaires chaudes actives
- Durée moyenne avant signature

**Résultats financiers** :
- MRR généré
- Commissions totales

### Stats Chef des Ventes

**Performance personnelle** :
- Vos signatures
- Vos affaires chaudes
- Vos commissions

**Performance équipe BD** :
- Signatures totales équipe
- MRR généré équipe
- Affaires chaudes équipe
- Nombre de BD dans l'équipe

**Évolution** :
- Graphiques de progression mensuelle
- Comparaison objectifs vs réalisé

---

## Workflow Automatisé

### Qu'est-ce que le workflow ?

Le **workflow automatisé** vous permet de créer **plusieurs entités en une seule fois** :

1. Un **Prospect**
2. Une **Opportunité** liée
3. Un **RDV** planifié
4. Une **Action** de suivi

**Bonus** : Génération automatique de documents (PDF dossier, invitation iCal)

### Utiliser le workflow

**Accès** : Menu "Workflow" ou bouton "Créer workflow complet"

**Étape 1 : Informations Prospect**
- Nom entreprise
- Contact principal
- Email, téléphone
- Adresse

**Étape 2 : Opportunité**
- Titre du projet
- Type de prestation
- Nombre de contrats
- Abonnement mensuel HT
- Durée d'engagement

**Étape 3 : Premier RDV**
- Date et heure
- Type : Visio ou Terrain
- Lieu (si terrain)
- Notes de préparation

**Étape 4 : Action de suivi**
- Type : Appel de relance / Email de suivi / Envoi documentation
- Date d'échéance
- Priorité

**Validation** :
- Vérifiez le récapitulatif
- Cliquez "Créer le workflow complet"
- Tous les éléments sont créés automatiquement

**Documents générés** :
- **PDF Dossier commercial** : Synthèse prospect + opportunité
- **Fichier iCal** : Invitation RDV (à envoyer au prospect)

---

## Vocabulaire ADS GROUP

### Terminologie officielle

Chez ADS GROUP SECURITY, nous utilisons un **vocabulaire spécifique** pour professionnaliser nos échanges. Hector applique strictement cette terminologie.

| NE DITES JAMAIS | DITES TOUJOURS |
|-----------------|----------------|
| Client | Entreprise / Prospect |
| Vendre | Accompagner / Signer |
| Vente | Signature / Contrat |
| Devis | Proposition commerciale / Abonnement |
| Prix | Abonnement mensuel HT |
| Chiffre d'affaires | MRR / ARR |
| Installer | Déployer |
| Produit | Prestation / Solution |
| Lead | Opportunité |
| Deal | Opportunité |

### Exemples corrects

**Incorrect** :
"J'ai vendu 3 produits à un nouveau client pour 500€/mois."

**Correct** :
"J'ai accompagné une nouvelle entreprise qui a signé 3 contrats de télésurveillance pour un abonnement de 500€ HT/mois."

**Incorrect** :
"Je dois faire un devis pour ce lead."

**Correct** :
"Je dois préparer une proposition commerciale pour cette opportunité."

### Nos 4 prestations

| Prestation | Description | Abonnement mensuel HT |
|------------|-------------|----------------------|
| **Télésurveillance avec IA** | Surveillance 24/7 avec détection IA | 69€ - 199€ |
| **Vidéosurveillance intelligente** | Caméras connectées + analyse vidéo | 89€ - 249€ |
| **Contrôle d'accès connecté** | Gestion accès sécurisés | 59€ - 179€ |
| **Défibrillateurs connectés** | DAE + maintenance + monitoring | 119€ - 299€ |

---

## Assistance Hector IA

### Utiliser l'assistant conversationnel

**Accès** : Page d'accueil ou bouton "Chat avec Hector"

Hector peut vous aider sur **4 domaines** :

#### 1. Questions commerciales
"Comment argumenter face à un prospect qui trouve l'abonnement trop cher ?"

#### 2. Préparation réunions
"J'ai un RDV avec un DG demain, comment structurer mon discours ?"

#### 3. Formation commerciale
"Explique-moi la méthode DISC pour mieux comprendre mes prospects."

#### 4. Génération d'arguments
"Donne-moi 5 arguments pour convaincre une PME d'installer de la télésurveillance."

### Bonnes pratiques

**Pour obtenir les meilleures réponses** :

1. **Soyez précis** : "Prospect PME 50 salariés, secteur logistique, budget 2000€/mois"
2. **Donnez du contexte** : "R1 passé, prospect intéressé mais hésite sur la durée"
3. **Posez des questions ouvertes** : "Comment..." plutôt que "Est-ce que..."
4. **Utilisez le vocabulaire ADS GROUP** : Hector corrigera si besoin

**Exemples de questions** :

- "Comment gérer un prospect qui veut comparer avec la concurrence ?"
- "Prépare-moi une structure de RDV pour une entreprise du BTP"
- "Quels arguments pour convaincre un hôtel de passer à la vidéosurveillance ?"
- "Analyse ce profil DISC : D élevé, I faible"

### Limites de Hector

Hector **ne peut pas** :
- Modifier directement votre CRM (utilisez les boutons d'action)
- Envoyer des emails à votre place
- Planifier des RDVs automatiquement
- Accéder aux données d'autres commerciaux

Hector **peut** :
- Répondre à vos questions commerciales
- Vous guider dans votre argumentaire
- Vous former sur les techniques de vente
- Analyser des situations commerciales

---

## Support et Assistance

### Besoin d'aide ?

**Contact support technique** :
- Email : support-hector@adsgroup-security.com
- Téléphone : XX XX XX XX XX (heures bureau)
- Slack : Canal #hector-crm

**Documentation** :
- Guide utilisateur complet : Ce document
- FAQ : [Consultez la FAQ](FAQ.md)
- Guides par rôle : [Guide SDR](GUIDE_PAR_ROLE.md#sdr), [Guide BD](GUIDE_PAR_ROLE.md#bd), etc.

### Signaler un bug

Si vous rencontrez un problème technique :

1. Notez l'heure et la page où le problème apparaît
2. Faites une capture d'écran si possible
3. Envoyez un email à support-hector@adsgroup-security.com avec :
   - Description du problème
   - Étapes pour le reproduire
   - Capture d'écran

### Demander une évolution

Vous avez une idée pour améliorer Hector ?

1. Décrivez votre besoin clairement
2. Expliquez comment ça améliorerait votre travail
3. Envoyez votre suggestion à support-hector@adsgroup-security.com

---

## Annexes

### Raccourcis clavier

| Raccourci | Action |
|-----------|--------|
| Ctrl + K | Ouvrir recherche rapide |
| Ctrl + N | Nouvelle opportunité |
| Ctrl + P | Nouveau prospect |
| Échap | Fermer dialogue |

### Navigateurs compatibles

- Google Chrome (recommandé)
- Firefox
- Safari (Mac)
- Edge

**Version mobile** : Application optimisée pour smartphone et tablette

### Sécurité et confidentialité

- **Connexion sécurisée** : HTTPS obligatoire
- **Sessions** : 30 jours si "Se souvenir" sinon jusqu'à fermeture navigateur
- **Données** : Isolation totale par utilisateur
- **Mot de passe** : Chiffré avec bcrypt
- **Domaine réservé** : Uniquement @adsgroup-security.com

---

**Document rédigé par** : Équipe Hector CRM  
**Dernière mise à jour** : Octobre 2025  
**Version** : 1.0 MVP

Pour toute question : support-hector@adsgroup-security.com
