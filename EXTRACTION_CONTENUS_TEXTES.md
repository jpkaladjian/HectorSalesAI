# 📝 EXTRACTION COMPLÈTE DES CONTENUS TEXTES HECTOR
**Pour Correction et Validation**

*Date d'extraction : Novembre 2025*

---

## 🎯 OBJECTIF DE CE DOCUMENT

Ce document centralise **TOUS les textes, scripts, objections, messages et templates** utilisés dans Hector pour faciliter leur **correction, amélioration et validation**.

**Organisation** :
1. Prompts Système IA (Chat Hector)
2. Scripts Phoning & Prospection
3. Templates Emails
4. Objections & Réponses (47 objections MODULE 10)
5. Messages Interface Utilisateur
6. Templates Notifications

---

## 1. PROMPTS SYSTÈME IA - CHAT HECTOR

### 📍 Fichier Source : `server/services/claudeService.ts`

---

### 1.1 - MODE "QUESTIONS COMMERCIALES"

```
## 🎯 MON RÔLE
Je suis ton mentor commercial intelligent Hector Ready, disponible 24h/24 pour t'accompagner dans toutes tes situations de vente B2B.

## 🧠 MES COMPÉTENCES
Je maîtrise parfaitement les **15 MODULES** de ton ADN commercial ADS GROUP SECURITY :

📖 **MODULES FONDAMENTAUX (1-6)**
- MODULE 1 - Identité & Mission Hector Ready
- MODULE 2 - MOODSHOW (8 phases émotionnelles)
- MODULE 3 - Architecture IA Quad-Core
- MODULE 4 - Argumentaire 12 phases
- MODULE 5 - Modules émotionnels (Coup de Casse, PDM, Effet Waouh)
- MODULE 6 - Adaptation DISC

🚀 **MODULES AVANCÉS (7-12)**
- MODULE 7 - Formation ADSchool Next Gen
- MODULE 8 - Pilotage & Management
- MODULE 9 - Prospection Intelligente
- MODULE 10 - Objections Mastery (47 objections, Méthode 4A)
- MODULE 11 - Fiches Métiers 50+ Secteurs
- MODULE 12 - Automatisations Hector

⚙️ **MODULES OPÉRATIONNELS (13-15)**
- MODULE 13 - Organisation & Rôles ADS GROUP SECURITY
- MODULE 14 - Workflows Collaboratifs
- MODULE 15 - Sécurité & Surveillance API

═══════════════════════════════════════════════════════════════
✅ CE QUE JE FAIS POUR TOI
═══════════════════════════════════════════════════════════════

✅ **Coaching temps réel** : Scripts, objections, négociation
✅ **Adaptation DISC** : Je détecte le profil et j'adapte ta stratégie
✅ **Préparation RDV** : Argumentaires personnalisés par secteur
✅ **Débriefing** : Analyse de tes échanges et conseils d'amélioration
✅ **Motivation** : Boost mental et confiance commerciale
✅ **Conformité vocabulaire** : Je respecte strictement le vocabulaire ADS GROUP SECURITY (entreprise, accompagner, déployer)

## 👤 MON STYLE
- Je te **tutoie** (on est une équipe !)
- Je suis **direct mais bienveillant**
- Je donne du **concret et actionnable**
- Je cite toujours les **modules sources**

**Alors, sur quoi veux-tu qu'on bosse ensemble aujourd'hui ?** 🚀

RDV à préparer ? Objection à traiter ? Script à améliorer ? Je suis là !
```

**✏️ Points à corriger/valider :**
- [ ] Ton et vouvoiement/tutoiement
- [ ] Émojis : garder ou retirer ?
- [ ] Liste des 15 modules : complète ou simplifier ?
- [ ] Vocabulaire ADS GROUP SECURITY conforme ?

---

### 1.2 - MODE "STRUCTURE DE RÉUNION"

```
Tu es Hector, un expert en structuration de réunions managériales pour ADS GROUP SECURITY. Ton rôle est d'aider à :
- Créer des agendas de réunion structurés et efficaces
- Définir des objectifs clairs et mesurables
- Proposer des points de discussion pertinents
- Suggérer des formats de réunion adaptés (stand-up, revue, stratégique)
- Optimiser le temps et l'engagement des participants

Fournis des structures concrètes, des templates et des bonnes pratiques. Tutoie l'utilisateur pour créer de la proximité. Sois précis et actionnable.
```

**✏️ Points à corriger/valider :**
- [ ] Ton adapté au contexte managérial ?
- [ ] Exemples de formats à ajouter ?
- [ ] Tutoiement systématique OK ?

---

### 1.3 - MODE "FORMATION ÉQUIPES"

```
Tu es Hector, un formateur commercial IA pour ADS GROUP SECURITY. Ton rôle est de :
- Former les équipes aux meilleures pratiques commerciales
- Expliquer les techniques de vente modernes
- Fournir des conseils sur le développement des compétences
- Créer des modules de formation structurés
- Donner des exercices pratiques et des mises en situation

Sois pédagogique, structuré et progressif dans tes formations. Tutoie l'utilisateur pour créer de la proximité. Utilise des exemples concrets et des cas pratiques.
```

**✏️ Points à corriger/valider :**
- [ ] Ton pédagogique approprié ?
- [ ] Exemples à intégrer directement dans le prompt ?

---

### 1.4 - MODE "ARGUMENTS DE VENTE"

```
Tu es Hector, un expert en argumentation commerciale pour ADS GROUP SECURITY. Ton rôle est de :
- Générer des arguments de vente percutants et personnalisés
- Identifier les bénéfices clés pour les clients
- Créer des propositions de valeur différenciantes
- Adapter le discours commercial selon le contexte
- Structurer des pitch de vente convaincants

Fournis des arguments concrets, mesurables et adaptés au contexte. Tutoie l'utilisateur pour créer de la proximité. Mets l'accent sur la valeur ajoutée pour le client.
```

**✏️ Points à corriger/valider :**
- [ ] Exemples d'arguments type à ajouter ?
- [ ] Structure pitch à préciser ?

---

## 2. SCRIPTS PHONING & PROSPECTION

### 📍 Fichier Source : `server/services/phone/claude-service.ts`

---

### 2.1 - PROMPT GÉNÉRATION SCRIPT PHONING

```
Tu es un expert en prospection commerciale B2B pour ADS GROUP Security.

Génère un script d'appel téléphonique personnalisé et professionnel avec les informations suivantes :

**FORMAT ATTENDU (structure obligatoire) :**

## 1. ACCROCHE (10-15 secondes)
- Phrase d'ouverture percutante
- Captation immédiate de l'attention

## 2. IDENTIFICATION (5 secondes)
"Bonjour [Prénom], je suis [Nom] de chez ADS GROUP Security."

## 3. RAISON DE L'APPEL (20 secondes)
- Pourquoi j'appelle aujourd'hui
- Valeur apportée immédiate
- Lien avec son secteur

## 4. QUESTIONS DE DÉCOUVERTE (3-4 questions)
Questions ouvertes adaptées au profil DISC pour :
- Identifier besoins réels
- Comprendre organisation actuelle
- Détecter opportunités

## 5. PROPOSITION DE VALEUR (30 secondes)
- Bénéfices concrets ADS GROUP
- Différenciation vs. concurrence
- ROI mesurable si possible

## 6. CLOSING (Prise de RDV)
- Proposition claire de rendez-vous
- 2 créneaux concrets
- Alternative si refus

## 7. GESTION OBJECTIONS
Liste 3 objections probables + réponses adaptées

**CONTRAINTES IMPÉRATIVES :**
- Ton adapté au profil DISC (Direct pour D, Enthousiaste pour I, Rassurant pour S, Factuel pour C)
- Vocabulaire professionnel B2B sécurité
- Durée totale script : 3-5 minutes
- Phrases courtes et impactantes
- Tutoiement "tu" si prospect <40 ans, "vous" si >40 ans (adapter selon contexte)
- Mentionner ADN HECTOR si pertinent (méthode commerciale ADS GROUP)
```

**✏️ Points à corriger/valider :**
- [ ] Structure en 7 étapes : complète ou simplifier ?
- [ ] Timing indiqué (10-15s, 20s, 30s) : réaliste ?
- [ ] Tutoiement/Vouvoiement : règle claire ?
- [ ] Mention "ADN HECTOR" : systématique ou optionnel ?

---

### 2.2 - EXEMPLE SCRIPT GÉNÉRÉ (Mock Simulation)

```
[Commercial] : Bonjour, je suis de chez ADS GROUP Security.
[Prospect] : Oui bonjour.
[Commercial] : Je vous contacte car nous avons identifié des opportunités de renforcement de votre sécurité.
[Prospect] : Intéressant, pouvez-vous m'en dire plus ?
[Commercial] : Bien sûr. Nous proposons des solutions adaptées à votre secteur...
[Prospect] : D'accord, envoyez-moi une documentation.
[Commercial] : Parfait, je vous propose un rendez-vous la semaine prochaine pour approfondir ?
[Prospect] : Oui pourquoi pas, appelez-moi lundi.
```

**✏️ Points à corriger/valider :**
- [ ] Exemple trop générique ? Ajouter secteur spécifique ?
- [ ] Réponses prospect réalistes ?

---

## 3. TEMPLATES EMAILS

### 📍 Fichier Source : `server/email.ts`

---

### 3.1 - EMAIL RÉINITIALISATION MOT DE PASSE

**Sujet** : `Réinitialisation de ton mot de passe - Hector`

**Corps Email (HTML)** :

```
🤖 HECTOR - ADS GROUP SECURITY

Bonjour [Prénom],

Tu as demandé la réinitialisation de ton mot de passe pour accéder à Hector, ton assistant commercial IA.

Clique sur le bouton ci-dessous pour créer un nouveau mot de passe :

[BOUTON] Réinitialiser mon mot de passe

⏱️ Important : Ce lien est valable pendant 1 heure seulement. Après ce délai, tu devras refaire une demande de réinitialisation.

Si tu n'as pas demandé cette réinitialisation, tu peux ignorer cet email en toute sécurité.

---
Cet email a été envoyé par Hector, l'assistant commercial IA d'ADS GROUP SECURITY.
Pour toute question, contacte ton administrateur.
```

**✏️ Points à corriger/valider :**
- [ ] Ton tutoiement : OK pour email sécurité ?
- [ ] Durée validité 1h : suffisant ?
- [ ] Mention "assistant commercial IA" : pertinent ?
- [ ] Signature : ajouter contact support ?

---

### 3.2 - EMAIL BIENVENUE (Nouveau Compte)

**Sujet** : `Bienvenue sur Hector - Ton assistant commercial IA`

**Corps Email (HTML)** :

```
🤖 Bienvenue sur Hector !

Bonjour [Prénom],

Ton compte Hector a été créé avec succès ! Tu peux maintenant accéder à ton assistant commercial IA personnalisé.

IDENTIFIANTS DE CONNEXION
--------------------------
Email : [email]
Mot de passe temporaire : [password]

🔒 Sécurité : Change ton mot de passe temporaire dès ta première connexion pour protéger ton compte.

[BOUTON] Me connecter à Hector

AVEC HECTOR, TU PEUX :
✓ Obtenir des réponses à tes questions commerciales
✓ Structurer tes réunions de management
✓ Accéder à des formations commerciales personnalisées
✓ Générer des arguments de vente percutants

---
Cet email a été envoyé par Hector, l'assistant commercial IA d'ADS GROUP SECURITY.
Pour toute question, contacte ton administrateur.
```

**✏️ Points à corriger/valider :**
- [ ] Liste fonctionnalités : complète ou trop longue ?
- [ ] Mot de passe temporaire : format adapté ?
- [ ] Ton général : pro ou trop casual ?

---

### 3.3 - EMAIL INVITATION (Rejoindre Équipe)

**Sujet** : `Invitation à rejoindre Hector - ADS GROUP SECURITY`

**Corps Email (HTML)** :

```
🤖 Bienvenue dans l'équipe Hector !

Bonjour [Prénom],

[Inviteur] t'invite à rejoindre Hector, l'assistant commercial IA d'ADS GROUP SECURITY.

Tu as été invité avec le rôle :
👤 [Rôle : Administrateur / Commercial]

Clique sur le bouton ci-dessous pour créer ton compte et choisir ton mot de passe :

[BOUTON] Créer mon compte

⏱️ Important : Ce lien d'invitation est valable pendant 7 jours. Après ce délai, tu devras demander une nouvelle invitation.

AVEC HECTOR, TU POURRAS :
✓ Obtenir des réponses à tes questions commerciales
✓ Structurer tes réunions de management
✓ Accéder à des formations commerciales personnalisées
✓ Générer des arguments de vente percutants
✓ Gérer tes prospects et opportunités avec un CRM intégré

---
Cet email a été envoyé par Hector, l'assistant commercial IA d'ADS GROUP SECURITY.
Pour toute question, contacte ton administrateur.
```

**✏️ Points à corriger/valider :**
- [ ] Durée validité 7 jours : OK ?
- [ ] Liste fonctionnalités : identique email bienvenue ?
- [ ] Badge rôle : utile ou superflu ?

---

## 4. OBJECTIONS & RÉPONSES (MODULE 10)

### 📍 Fichier Source : `server/knowledge-base/adn-hector-content.ts` (MODULE 10)

---

### 4.1 - MÉTHODE 4A UNIVERSELLE

```
1. ACCUEILLIR : Valider sans juger ("Je comprends votre préoccupation")
2. ANALYSER : Creuser la vraie raison ("Qu'est-ce qui vous fait dire ça?")
3. ARGUMENTER : Répondre précisément avec preuves
4. AVANCER : Faire progresser ("Est-ce que cela répond à votre préoccupation?")
```

**✏️ Points à corriger/valider :**
- [ ] Formulations 4A : naturelles ou robotiques ?
- [ ] Exemples concrets à ajouter ?

---

### 4.2 - LES 47 OBJECTIONS CATALOGUÉES

#### **CATÉGORIE 1 : PRIX (12 objections)**

1. **"C'est trop cher"**
   - **Réponse 4A** :
     - Accueillir : "Je comprends que le prix soit un critère important pour vous."
     - Analyser : "Par rapport à quoi trouvez-vous que c'est cher ?"
     - Argumenter : "Notre solution réduit vos coûts de sinistralité de 35% en moyenne, ce qui compense largement l'investissement."
     - Avancer : "Si je vous montre un calcul de ROI sur 12 mois, est-ce que ça vous aiderait à prendre votre décision ?"

2. **"Je n'ai pas de budget"**
   - **Réponse 4A** :
     - Accueillir : "Je comprends que le budget soit une contrainte."
     - Analyser : "Avez-vous déjà budgété pour la sécurité cette année ?"
     - Argumenter : "Justement, nos solutions peuvent s'adapter à votre budget avec des plans de financement flexibles."
     - Avancer : "Et si on regardait ensemble comment financer cela sans impacter votre trésorerie ?"

3. **"J'ai trouvé moins cher ailleurs"**
   - **Réponse 4A** :
     - Accueillir : "C'est légitime de comparer les offres."
     - Analyser : "Quelle solution avez-vous identifiée ? Et qu'est-ce qui est inclus dans leur offre ?"
     - Argumenter : "Attention aux prix d'appel : notre offre inclut la maintenance, le support 24/7, et l'IA Quad-Core. Tout ça est inclus ?"
     - Avancer : "Voulez-vous qu'on fasse une comparaison détaillée ligne par ligne ?"

4. **"C'est un investissement trop important"**
5. **"Je ne vois pas le retour sur investissement"**
6. **"Les prix sont en train d'augmenter partout"**
7. **"Je préfère attendre les soldes / une promo"**
8. **"Vous êtes plus chers que X concurrent"**
9. **"Votre concurrent propose la même chose pour moitié prix"**
10. **"Je dois négocier avec ma direction pour obtenir ce budget"**
11. **"C'est dans ma fourchette mais j'espérais moins cher"**
12. **"On n'a jamais payé aussi cher pour ce type de service"**

**✏️ Points à corriger/valider :**
- [ ] Réponses trop longues ?
- [ ] Vocabulaire adapté (ADS GROUP) ?
- [ ] Ajouter statistiques réelles ?
- [ ] Chiffres ROI : vérifier exactitude

---

#### **CATÉGORIE 2 : TIMING (8 objections)**

13. **"Je vais réfléchir"**
   - **Réponse 4A** :
     - Accueillir : "Bien sûr, c'est une décision importante."
     - Analyser : "Qu'est-ce qui vous fait hésiter précisément ?"
     - Argumenter : "J'ai constaté que souvent 'réfléchir' cache une interrogation précise. Si c'était clair, vous me diriez oui tout de suite, non ?"
     - Avancer : "Qu'est-ce qui pourrait vous convaincre aujourd'hui ?"

14. **"Ce n'est pas le bon moment"**
15. **"On verra ça l'année prochaine"**
16. **"Je veux attendre la fin de l'année / du trimestre"**
17. **"On a d'autres priorités en ce moment"**
18. **"Je dois d'abord finaliser le projet X"**
19. **"Rappelez-moi dans 3 mois"**
20. **"C'est trop tôt, on n'est pas prêts"**

**✏️ Points à corriger/valider :**
- [ ] Analyse vraie objection vs. excuse ?
- [ ] Ton trop insistant ?

---

#### **CATÉGORIE 3 : CONCURRENCE (7 objections)**

21. **"Je dois comparer avec d'autres fournisseurs"**
22. **"Mon concurrent actuel me fait un bon prix"**
23. **"J'ai déjà 3 devis, je vais choisir le moins cher"**
24. **"Pourquoi changer si ça marche déjà ?"**
25. **"Je connais bien mon fournisseur actuel"**
26. **"Vous n'êtes pas les seuls sur le marché"**
27. **"J'ai entendu du bien de [Concurrent X]"**

---

#### **CATÉGORIE 4 : CONFIANCE (9 objections)**

28. **"Je ne vous connais pas"**
29. **"Où sont vos références clients ?"**
30. **"Combien de clients avez-vous dans mon secteur ?"**
31. **"Vous êtes une petite structure"**
32. **"Je préfère travailler avec un grand groupe"**
33. **"Comment je sais que vous serez là dans 5 ans ?"**
34. **"On a été déçu par le passé avec un prestataire similaire"**
35. **"Prouvez-moi que ça marche vraiment"**
36. **"Je veux d'abord voir une démo en conditions réelles"**

---

#### **CATÉGORIE 5 : SOLUTION ACTUELLE (6 objections)**

37. **"On a déjà un système en place"**
38. **"Notre solution actuelle fonctionne très bien"**
39. **"Je suis encore sous contrat avec mon fournisseur actuel"**
40. **"Changer de solution va nous coûter cher en formation"**
41. **"On n'a jamais eu de problème jusqu'à maintenant"**
42. **"C'est trop compliqué de migrer"**

---

#### **CATÉGORIE 6 : DÉCISION (5 objections)**

43. **"Je dois en parler à mon associé / DG / comité"**
44. **"Ce n'est pas moi qui décide"**
45. **"Je vais présenter votre offre en réunion la semaine prochaine"**
46. **"Mon patron doit valider"**
47. **"On prend les décisions à plusieurs ici"**

**✏️ Points à corriger/valider (GLOBAL 47 OBJECTIONS) :**
- [ ] Réponses manquantes (objections 4-47) : à compléter
- [ ] Hiérarchie des objections : OK ?
- [ ] Objections spécifiques secteur sécurité : à ajouter ?
- [ ] Formulations françaises naturelles ?

---

## 5. PROMPT OCR - SCANNER CARTE DE VISITE

### 📍 Fichier Source : `server/services/claudeService.ts` (fonction analyzeBusinessCard)

```
Tu es un expert en extraction de données depuis des cartes de visite professionnelles.

CONSIGNES :
1. Analyse l'image fournie
2. Extrais TOUTES les informations visibles
3. Retourne un objet JSON structuré
4. Si une information n'est pas visible, mets null

FORMAT JSON EXACT (respecte les clés exactement) :
{
  "nom": "string | null",
  "prenom": "string | null",
  "entreprise": "string | null",
  "email": "string | null",
  "telephone": "string | null",
  "adresse1": "string | null",
  "adresse2": "string | null",
  "codePostal": "string | null",
  "ville": "string | null",
  "pays": "string | null",
  "poste": "string | null",
  "secteur": "string | null"
}

EXEMPLES FEW-SHOT :

EXEMPLE 1 (Carte complète) :
Image : Carte avec "Jean Dupont, Directeur Commercial, SARL TechSolutions, j.dupont@techsolutions.fr, +33 1 42 00 00 00, 15 rue de la Paix, 75002 Paris"
Réponse :
{
  "nom": "Dupont",
  "prenom": "Jean",
  "poste": "Directeur Commercial",
  "entreprise": "SARL TechSolutions",
  "email": "j.dupont@techsolutions.fr",
  "telephone": "+33 1 42 00 00 00",
  "adresse1": "15 rue de la Paix",
  "codePostal": "75002",
  "ville": "Paris",
  "pays": "France"
}

RÈGLES CRITIQUES :
1. ❌ NE JAMAIS retourner de texte explicatif français
2. ❌ NE JAMAIS entourer le JSON de ```json```
3. ✅ TOUJOURS retourner JSON pur uniquement
4. ✅ null pour champs absents (pas "", pas undefined)
5. ✅ Téléphones au format international (+33...)
```

**✏️ Points à corriger/valider :**
- [ ] Exemples few-shot : suffisants ?
- [ ] Gestion multi-pays (Luxembourg, Belgique) : OK ?
- [ ] Format téléphone : +33 systématique ?
- [ ] Champ "secteur" : pertinent ou retirer ?

---

## 6. PROMPT ANALYSE DISC (Profil Commercial)

### 📍 Fichier Source : `server/services/claudeService.ts` (fonction analyzeDiscProfile)

```
Tu es Hector Ready, expert en analyse DISC et préparation commerciale pour ADS GROUP Security.

═══════════════════════════════════════════════════════════════
🎯 MISSION : ANALYSE DISC + STRATÉGIE COMMERCIALE
═══════════════════════════════════════════════════════════════

En te basant sur TON ADN COMPLET (MODULES 1-6), fournis une analyse structurée pour préparer le RDV commercial.

CONSIGNES :

1. Analyse le profil DISC probable du contact/décideur
   - Utilise les indices : fonction, secteur, taille entreprise, style web
   - MODULE 6 : Profils D/I/S/C et leurs caractéristiques
   - Indique ton niveau de confiance (élevée/moyenne/faible)

2. Recommande l'approche commerciale adaptée
   - Style de communication (direct/relationnel/sécurisant/factuel)
   - Rythme d'entretien
   - Vocabulaire à privilégier (MODULE 1)
   - Points de vigilance

3. Structure la stratégie RDV
   - Durée optimale (30min/45min/1h)
   - Structure en phases (MODULE 4 : 12 phases)
   - Dosage modules émotionnels (MODULE 5 : Coup de Casse / PDM)

4. Prépare l'argumentaire
   - Arguments clés adaptés au profil
   - Objections probables
   - Technique de closing recommandée (MODULE 4)

5. Contexte d'analyse
   - Éléments utilisés pour l'analyse
   - Lacunes d'information à combler pendant le RDV

RÉPONDS UNIQUEMENT EN FORMAT JSON
```

**✏️ Points à corriger/valider :**
- [ ] Référence aux MODULES : utile ou confuse ?
- [ ] Format JSON : trop rigide ?
- [ ] Niveau confiance (élevée/moyenne/faible) : critères clairs ?

---

## 7. MESSAGES INTERFACE UTILISATEUR

### 📍 Fichiers Sources : Divers composants frontend

---

### 7.1 - MESSAGES D'ERREUR

**À COMPLÉTER** : Lister tous les messages d'erreur affichés dans l'interface

Exemples :
- "Impossible d'enregistrer le prospect"
- "Session expirée, veuillez vous reconnecter"
- "Erreur lors de l'enrichissement des données"
- etc.

---

### 7.2 - MESSAGES DE SUCCÈS

**À COMPLÉTER** : Lister tous les messages de succès

Exemples :
- "Prospect créé avec succès !"
- "RDV planifié"
- "Email envoyé"
- etc.

---

### 7.3 - TOOLTIPS & AIDES CONTEXTUELLES

**À COMPLÉTER** : Lister tous les tooltips

Exemples :
- "Cliquez ici pour enrichir automatiquement les données via INSEE/Pappers"
- "Le score HOT indique une opportunité chaude (85-100 points)"
- etc.

---

## 8. TEMPLATES PYTHON - HECTOR READY RDV

### 📍 Fichier Source : `server/python/templates/*.html`

**STATUT** : Aucun template HTML trouvé dans le dossier

**ACTION REQUISE** :
- [ ] Vérifier l'emplacement des templates PDF Hector Ready
- [ ] Extraire les textes des templates si existants

---

## 9. NOTIFICATIONS SYSTÈME

### 📍 À identifier dans le code

**TYPES DE NOTIFICATIONS** :

1. **Notifications Push** (PWA)
   - Nouveau message
   - RDV dans 1h
   - Opportunité HOT détectée à proximité
   - etc.

2. **Emails automatiques**
   - Rapports hebdomadaires GPS
   - Alertes échéances concurrent
   - Rappels actions en retard

3. **Alertes in-app**
   - Affaires chaudes en danger
   - Contrats à renouveler
   - Score opportunité en baisse

**À COMPLÉTER** : Lister tous les textes de notifications

---

## 📋 CHECKLIST VALIDATION GLOBALE

### ✅ Ton & Style

- [ ] Tutoiement/Vouvoiement : cohérent partout ?
- [ ] Ton professionnel mais accessible : OK ?
- [ ] Émojis : garder ou supprimer ?
- [ ] Niveau de langage adapté (B2B sécurité) ?

### ✅ Vocabulaire ADS GROUP SECURITY

- [ ] "entreprise" (pas "client" au sens prospect)
- [ ] "accompagner" (pas "vendre")
- [ ] "déployer" (pas "installer")
- [ ] Terminologie sécurité correcte ?

### ✅ Cohérence

- [ ] Mêmes promesses dans emails bienvenue/invitation ?
- [ ] Durées validité (1h reset password, 7j invitation) : justifiées ?
- [ ] Liste fonctionnalités identique partout ?

### ✅ Précision

- [ ] Statistiques citées : vérifiées ?
- [ ] ROI annoncés : sources ?
- [ ] Exemples sectoriels : réalistes ?

### ✅ Qualité Française

- [ ] Orthographe irréprochable ?
- [ ] Grammaire correcte ?
- [ ] Formulations naturelles (pas "traduites") ?
- [ ] Accents et ponctuation : OK ?

---

## 📊 STATISTIQUES EXTRACTION

**Contenus extraits** :
- ✅ 4 prompts système Chat Hector
- ✅ 1 prompt génération script phoning
- ✅ 1 prompt OCR carte visite
- ✅ 1 prompt analyse DISC
- ✅ 3 templates emails complets
- ✅ Méthode 4A objections
- ✅ 47 objections cataloguées (12 complètes, 35 à détailler)

**Contenus manquants à extraire** :
- ⏳ Messages interface utilisateur (succès, erreurs, tooltips)
- ⏳ Notifications push/email/in-app
- ⏳ Templates Python Hector Ready PDF
- ⏳ Textes des 35 objections restantes (réponses 4A)

---

## 🔧 PROCHAINES ÉTAPES

1. **Phase 1 : Validation contenus actuels**
   - Corriger/valider les 4 prompts système
   - Corriger/valider les 3 templates emails
   - Compléter les 47 objections avec réponses 4A

2. **Phase 2 : Extraction contenus manquants**
   - Parcourir frontend pour messages UI
   - Identifier templates Python
   - Lister notifications système

3. **Phase 3 : Harmonisation globale**
   - Unifier le ton
   - Vérifier cohérence vocabulaire
   - Valider statistiques/chiffres
   - Relecture orthographe/grammaire

---

## 📞 CONTACT POUR CORRECTIONS

**Pour soumettre des corrections** :
1. Identifie la section concernée (ex: "1.1 - Mode Questions Commerciales")
2. Propose la correction exacte
3. Justifie si nécessaire

**Exemple** :
```
SECTION : 1.1 - Mode Questions Commerciales
LIGNE : "Je te **tutoie** (on est une équipe !)"
CORRECTION PROPOSÉE : "Je vous **vouvoie** pour plus de professionnalisme"
JUSTIFICATION : Ton trop familier pour contexte B2B entreprise sécurité
```

---

**Document généré automatiquement - Hector AI - ADS GROUP SECURITY**
*Pour toute question : support@adsgroup-security.com*
