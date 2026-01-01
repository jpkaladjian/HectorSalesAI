"""
ADN HECTOR - Loader Complet v6.2
=================================
Chargement des 15 modules de knowledge base Hector Ready
Pour projet: HectorSalesAI (Préparation RDV automatisée)
Date: 25 octobre 2025
"""

class ADNHectorLoader:
    """
    Gestionnaire centralisé de tous les modules ADN Hector
    15 modules opérationnels pour intelligence commerciale augmentée
    """
    
    def __init__(self):
        self.modules = {}
        self._load_all_modules()
    
    def _load_all_modules(self):
        """Charge les 15 modules dans la mémoire"""
        
        # MODULE 1: Identité & Mission Hector Ready
        self.modules['module_01'] = {
            'name': 'Identité & Mission Hector Ready',
            'version': '6.2',
            'description': 'Vision, mission et positionnement du système Hector',
            'content': """
RÉSUMÉ MODULE 1:
Hector Ready est le CRM intelligent nouvelle génération d'ADS GROUP SECURITY.
Mission: Transformer chaque commercial en expert augmenté par l'IA.
Architecture Quad-Core: SmartDetect + LISA + HazeFlow 2 + DualTone.
Philosophie MOODSHOW: Comprendre l'humain pour mieux accompagner.
            """
        }
        
        # MODULE 2: Méthode MOODSHOW
        self.modules['module_02'] = {
            'name': 'Méthode MOODSHOW',
            'version': '6.2',
            'description': 'Méthodologie commerciale en 8 étapes',
            'content': """
RÉSUMÉ MODULE 2:
M - Meet: Prise de contact
O - Observe: Observation comportementale  
O - Open: Ouverture relationnelle
D - Discover: Découverte besoins
S - Show: Démonstration valeur
H - Handle: Traitement objections
O - Offer: Proposition commerciale
W - Win: Closing et signature
Approche centrée client avec adaptation DISC.
            """
        }
        
        # MODULE 3: Architecture IA Quad-Core
        self.modules['module_03'] = {
            'name': 'Architecture IA Quad-Core',
            'version': '6.2',
            'description': 'Les 4 technologies IA de sécurité',
            'content': """
RÉSUMÉ MODULE 3:
4 Technologies IA complémentaires:

1. SmartDetect: Vision IA (analyse vidéo comportementale)
2. LISA: Audio IA (détection menaces sonores)
3. HazeFlow 2: Vision nocturne (clarté parfaite nuit/brouillard)
4. DualTone: Confirmation bi-modale (visuel + audio)

Avantages: Réduction 99% fausses alarmes, détection proactive, fiabilité maximale.
            """
        }
        
        # MODULE 4: Argumentaire 12 Phases
        self.modules['module_04'] = {
            'name': 'Argumentaire 12 Phases',
            'version': '6.2',
            'description': 'Structure complète du rendez-vous commercial',
            'content': """
RÉSUMÉ MODULE 4:
Les 12 phases du RDV commercial structuré:

Phase 1: Préparation
Phase 2: Prise de contact
Phase 3: Mise en confiance
Phase 4: Découverte situation
Phase 5: Identification besoins
Phase 6: Coup de Casse (électrochoc)
Phase 7: Présentation solution
Phase 8: Démonstration valeur
Phase 9: Traitement objections
Phase 10: Présentation conditions
Phase 11: Closing
Phase 12: Prise de RDV2 ou signature

Durée totale: 60-90 minutes optimisées.
            """
        }
        
        # MODULE 5: Modules Émotionnels Stratégiques
        self.modules['module_05'] = {
            'name': 'Modules Émotionnels Stratégiques',
            'version': '6.2',
            'description': 'Techniques d\'impact émotionnel',
            'content': """
RÉSUMÉ MODULE 5:
3 modules émotionnels puissants:

1. COUP DE CASSE: Créer électrochoc pour déclencher urgence
   - Statistiques choc sectorielles
   - Coût d'un sinistre visualisé
   - Scénario catastrophe personnalisé

2. PRISE DE CONSCIENCE IMMÉDIATE (PDM): Faire réaliser vulnérabilité actuelle
   - Questions miroir
   - Visualisation risques
   - Quantification impact

3. EFFET WAOUH: Démonstration spectaculaire technologie
   - Démo live impressionnante
   - Comparaison avant/après
   - Témoignages clients transformés

Déclenchent émotion → décision rapide.
            """
        }
        
        # MODULE 6: Intelligence Comportementale (DISC + PNL)
        self.modules['module_06'] = {
            'name': 'Intelligence Comportementale DISC + PNL',
            'version': '6.2',
            'description': 'Analyse psychologique et adaptation commerciale',
            'content': """
RÉSUMÉ MODULE 6:
Profils DISC pour adaptation commerciale:

D - DOMINANT (Rouge): Direct, orienté résultats, impatient
→ Adaptation: Être concis, parler ROI, aller droit au but

I - INFLUENT (Jaune): Social, enthousiaste, relationnel  
→ Adaptation: Storytelling, émotion, preuve sociale

S - STABLE (Vert): Patient, loyal, sécuritaire
→ Adaptation: Rassurer, témoignages, garanties

C - CONFORME (Bleu): Analytique, précis, méthodique
→ Adaptation: Données chiffrées, documentation, détails techniques

Indicateurs de détection: Langage verbal + non-verbal + comportement.
Adaptation en temps réel pour maximiser closing.
            """
        }
        
        # MODULE 7: Formation ADSchool Next Gen
        self.modules['module_07'] = {
            'name': 'Formation ADSchool Next Gen',
            'version': '6.2',
            'description': 'Programme de formation continue commerciaux',
            'content': """
RÉSUMÉ MODULE 7:
ADSchool = Centre de formation augmenté par IA

4 NIVEAUX DE CERTIFICATION:
- Bronze (1-2 mois): Fondations Hector Ready
- Argent (3-4 mois): Techniques avancées  
- Or (6-8 mois): Expertise complète
- Platine (12+ mois): Formateur agréé

FORMAT:
- Micro-learning quotidien (10 min/jour)
- Parcours personnalisé adapté aux gaps
- Sparring Partner IA pour simulations
- Validation par RDV réels supervisés

BIBLIOTHÈQUE:
- 200+ vidéos
- 12 modules documentaires
- 500+ scénarios simulation
- Tableaux de bord progression

Objectif: Former ne suffit plus, il faut augmenter.
            """
        }
        
        # MODULE 8: Pilotage & Management
        self.modules['module_08'] = {
            'name': 'Pilotage & Management Commercial',
            'version': '6.2',
            'description': 'Dashboards, KPIs et rituels management',
            'content': """
RÉSUMÉ MODULE 8:
Pilotage commercial structuré par rôle:

DASHBOARDS PAR RÔLE:
- SDR (Visio): Contrats visio, MRR, transferts BD/IC
- BD (Terrain): Contrats terrain, taux signature R1, affaires chaudes
- IC (Reconduction): Taux reconduction, nouveau business
- Chef des Ventes: Performance équipe BD + perso
- DG/Président: Vue consolidée groupe

AFFAIRES CHAUDES:
- Définition: R1 sans signature → R2 obligatoire sous 7j
- Alertes ROUGE/ORANGE selon urgence
- Suivi conjoint commercial + manager
- Taux transformation R2: objectif 60-70%

RITUELS MANAGEMENT:
- Daily: Check dashboard (matin 15min, soir 10min)
- Weekly: Réunion équipe lundi + 1-on-1 vendredi
- Monthly: Bilan mois + formation thématique
- Quarterly: Séminaire commercial

KPIs GLOBAUX:
- ARR objectif: 6M€
- Taux signature R1: >70%
- MRR growth: +8%/mois
- Satisfaction équipe: 4.3/5

Philosophie: Ce qui ne se mesure pas ne s'améliore pas.
            """
        }
        
        # MODULE 9: Prospection Intelligente
        self.modules['module_09'] = {
            'name': 'Prospection Intelligente',
            'version': '6.2',
            'description': 'Système de scoring prédictif et 7 canaux prospection',
            'content': """
RÉSUMÉ MODULE 9:
Prospection optimisée data-driven

SYSTÈME SCORING PRÉDICTIF (0-100):
- Fit Profil (40 pts): Secteur, taille, zone, décideur
- Engagement (30 pts): Visites site, téléchargements, réponses
- Timing (20 pts): Événement déclencheur, renouvellement
- Budget (10 pts): Budget confirmé/probable

Catégories: HOT (80-100) | WARM (60-79) | COLD (40-59) | FREEZER (0-39)

7 CANAUX OPTIMISÉS (par ROI décroissant):
1. Referral/Apporteurs: ROI 450%, Taux conv. 55%
2. Inbound (site web): ROI 380%, Taux conv. 42%
3. LinkedIn Outreach: ROI 220%, Taux conv. 28%
4. Email Cold: ROI 180%, Taux conv. 18%
5. Phoning Qualifié: ROI 160%, Taux conv. 22%
6. Événements Locaux: ROI 140%, Taux conv. 32%
7. Partenariats: ROI 200%, Taux conv. 35%

QUALIFICATION BANT+:
- Budget: Enveloppe allouée ou coût sinistre
- Authority: Décideur final identifié
- Need: Besoin explicite/latent/à créer
- Timing: <1 mois = HOT, >6 mois = COLD
- Pain: Douleur émotionnelle + financière + opérationnelle

NURTURING AUTOMATISÉ:
- Séquence COLD→WARM: 30 jours, 8 touchpoints
- Séquence WARM→HOT: 15 jours, 7 touchpoints

Objectif: +35% taux conversion via ciblage précis.
            """
        }
        
        # MODULE 10: Objections Mastery
        self.modules['module_10'] = {
            'name': 'Objections Mastery',
            'version': '6.2',
            'description': '47 objections cataloguées avec méthode 4A',
            'content': """
RÉSUMÉ MODULE 10:
Transformer les objections en opportunités

MÉTHODE 4A UNIVERSELLE:
1. ACCUEILLIR: Valider sans juger ("Je comprends votre préoccupation")
2. ANALYSER: Creuser la vraie raison ("Qu'est-ce qui vous fait dire ça?")
3. ARGUMENTER: Répondre précisément avec preuves
4. AVANCER: Faire progresser ("Est-ce que cela répond à votre préoccupation?")

3 TYPES D'OBJECTIONS:
- RÉELLE (30%): Problème concret → Traiter avec 4A complet
- RÉFLEXE (50%): Défense automatique → Rassurer rapidement  
- MASQUÉE (20%): Cache vraie raison → Investiguer en profondeur

47 OBJECTIONS CATALOGUÉES:
- Prix (12): "C'est trop cher", "Pas de budget", "Moins cher ailleurs"
- Timing (8): "Je vais réfléchir", "On verra plus tard"
- Concurrence (7): "Je dois comparer", "Concurrent moins cher"
- Confiance (9): "Je ne vous connais pas", "Où sont vos références"
- Solution actuelle (6): "On a déjà quelque chose"
- Décision (5): "Je dois en parler à..."

DÉTECTION OBJECTIONS MASQUÉES:
- Signaux verbaux: "Je vais réfléchir" (hésitation)
- Signaux non-verbaux: Regard fuyant, bras croisés
- Question magique: "Qu'est-ce qui vous freine VRAIMENT?"

PRÉVENTION:
- Technique "Vous allez me dire...": Traiter avant qu'elle n'arrive
- Intégration dans argumentaire (Phase 6: Coup de Casse)

ENTRAÎNEMENT IA:
- Sparring Partner Hector: 47×4 profils DISC = 188 simulations
- Feedback temps réel + recommandations
- Progression par niveaux: Facile → Moyen → Difficile → Masqué

Objectif: +40% taux closing par maîtrise objections.
            """
        }
        
        # MODULE 11: Fiches Métiers 50+ Secteurs
        self.modules['module_11'] = {
            'name': 'Fiches Métiers 50+ Secteurs',
            'version': '6.2',
            'description': 'Adaptation sectorielle et crédibilité client',
            'content': """
RÉSUMÉ MODULE 11:
50+ fiches sectorielles pour crédibilité maximale

STRUCTURE FICHE TYPE:
1. Profil secteur: CA moyen, effectif, budget sécurité
2. Enjeux sécurité: Risques principaux, sinistralité, coût sinistre
3. Vocabulaire métier: Termes spécifiques, formulations adaptées
4. Cas d'usage: Configuration type, IA Quad-Core adaptée
5. Objections typiques: Top 3 objections + réponses calibrées
6. Références clients: Témoignages, résultats chiffrés
7. ROI sectoriel: Retour investissement moyen, délai rentabilité

8 CATÉGORIES:
- Commerce & Distribution (10 secteurs)
- Santé & Médical (8)
- Hôtellerie & Restauration (7)
- Industrie & Logistique (6)
- Services & Bureaux (8)
- Éducation & Culture (4)
- Automobile & Mobilité (3)
- Autres secteurs (4)

EXEMPLES DÉTAILLÉS:
- Commerce Alimentaire: Démarque 5,2% → 1,4%, ROI 348%
- Restaurant Traditionnel: Vol cave + cuisine, ROI 197%
- Pharmacie: Zone stupéfiants, conformité RGPD, ROI 285%

UTILISATION:
- AVANT RDV (10 min): Consulter fiche secteur client
- PENDANT RDV: Hector affiche suggestions temps réel
- APRÈS RDV: Enrichir fiche avec retours terrain

IMPACT MESURABLE:
- SANS fiche: Taux closing 24%, Cycle 45 jours
- AVEC fiche: Taux closing 38% (+58%), Cycle 28 jours (-38%)

Principe: La crédibilité ne se décrète pas, elle se construit.
10 minutes de préparation = 38% de closing en plus.
            """
        }
        
        # MODULE 12: Automatisations Hector
        self.modules['module_12'] = {
            'name': 'Automatisations Hector',
            'version': '6.2',
            'description': '10 automatisations pour +10h/semaine',
            'content': """
RÉSUMÉ MODULE 12:
10 automatisations = +10h/semaine de productivité

PROBLÈME AVANT HECTOR:
16h/semaine perdues en admin (40% du temps):
- CRM/Reporting: 6h
- Emails/Relances: 4h
- Comptes-rendus: 3h
- Planification: 2h
- Analyse: 1h

SOLUTION HECTOR:
Temps commercial optimisé: 34h prospection/RDV (+10h récupérées)

10 AUTOMATISATIONS:

1. AUTO-ENRICHISSEMENT CRM POST-RDV (Gain: 2h/sem)
   - Transcription automatique
   - Extraction infos clés
   - Mise à jour CRM instantanée

2. GÉNÉRATION COMPTE-RENDU RDV (Gain: 3h/sem)
   - Synthèse structurée auto
   - Envoi client + manager

3. RELANCES INTELLIGENTES MULTI-CANAUX (Gain: 1,5h/sem)
   - Email/LinkedIn/SMS automatiques
   - Personnalisation contexte
   - Envoi moment optimal

4. PRÉPARATION AUTOMATIQUE PRÉ-RDV (Gain: 2h/sem)
   - Brief complet 4h avant
   - Actualités entreprise
   - Questions clés suggérées

5. SCORING AUTOMATIQUE OPPORTUNITÉS (Gain: 1h/sem)
   - Calcul score sur 100
   - Priorisation HOT/WARM/COLD
   - Recommandations actions

6. DÉTECTION OPPORTUNITÉS UPSELL/CROSS-SELL (Gain: 1,5h/sem)
   - Analyse portefeuille clients
   - 6 déclencheurs automatiques
   - Potentiel CA calculé

7. REPORTING AUTOMATIQUE MANAGER (Gain manager: 2h/sem)
   - Dashboard hebdo consolidé
   - Alertes KPI
   - Prévisions fin mois

8. CRÉATION AUTOMATIQUE TÂCHES & RAPPELS (Gain: 0,5h/sem)
   - Détection engagements pris
   - Rappels J-3, J-1, H-4
   - Priorisation par impact

9. ANALYSE SENTIMENTS CLIENTS (Gain: 0,5h/sem)
   - Détection insatisfaction
   - Alertes risque churn
   - Recommandations actions

10. SUGGESTIONS INTELLIGENTES CLOSING (Temps réel)
    - Arguments adaptés profil DISC
    - Réponses objections contextuelles
    - Moments propices closing

RÉSULTAT:
+10h/semaine = +96 RDV/an = +476K€ CA additionnel
ROI: +25% productivité commerciale mesurée.
            """
        }
        
        # MODULE 13: Organisation & Rôles ADS GROUP
        self.modules['module_13'] = {
            'name': 'Organisation & Rôles ADS GROUP Security',
            'version': '1.0',
            'description': 'Structure hiérarchique et périmètres de responsabilité',
            'content': """
RÉSUMÉ MODULE 13:
Structure organisationnelle claire 7 niveaux

HIÉRARCHIE (du haut vers bas):
7. PRÉSIDENT: Accès absolu, manage SDR+IC directement
6. DG: Accès absolu, manage SDR+IC directement  
5. RESPONSABLE DÉVELOPPEMENT: Manage Chefs, vend gros comptes (36-48-60 mois)
4. CHEF DES VENTES: Manage BD uniquement, vend (36-48-60 mois)
3. IC (Ingénieur Commercial): Reconduction + Chasse, toutes durées 12-60 mois
2. BD (Business Developer): Chasseur pur terrain, 36-48-60 mois uniquement
1. SDR (Sales Dev Rep): Chasseur visio, 36-48-60 mois uniquement

RÈGLES DURÉES CONTRATS:
- CHASSEURS (SDR, BD, Chef, Resp Dev): 36-48-60 mois UNIQUEMENT
  ❌ 12 et 24 mois INTERDITS (trop court)
- IC: TOUTES durées 12-60 mois (reconduction + chasse)
- DG/Président: TOUTES durées (exceptions business)

QUI MANAGE QUI:
- Chef des Ventes manage: BD UNIQUEMENT (PAS IC, PAS SDR)
- DG/Président manage: SDR + IC directement
- Resp Dev manage: Chefs des Ventes

RÔLES CLÉS:
- SDR: Visio pur, cycle R1→R4 max, peut transférer vers BD/IC
- BD: Terrain pur, cycle court R1→R2, objectif signature R1
- IC: Double mission (70% reconduction + 30% nouveau)
- Chef: Manager équipe BD + Vendeur solo

COLLABORATION:
- Transfert SDR→BD/IC si besoin terrain
- Commission partagée: SDR 5% + BD/IC 7,5% (vs 10% solo SDR)
- Workflow formalisé dans Hector

ÉVOLUTIONS PRÉVUES:
- À 6 mois: Manager SDR dédié, Manager IC dédié
- À 12 mois: Directeurs régionaux
- À 18 mois: Key Account Managers

Objectif: Clarté des rôles = efficacité maximale.
            """
        }
        
        # MODULE 14: Workflows Collaboratifs
        self.modules['module_14'] = {
            'name': 'Workflows Collaboratifs',
            'version': '1.0',
            'description': 'Collaboration SDR-BD-IC et gestion affaires chaudes',
            'content': """
RÉSUMÉ MODULE 14:
Fluidifier collaboration visio-terrain

WORKFLOW TRANSFERT SDR → BD/IC:

QUAND TRANSFÉRER?
- R3/R4 atteint sans signature
- Client demande RDV présentiel
- Démo physique nécessaire
- Installation requiert visite

PROCESSUS (6 ÉTAPES):
1. SDR: Demande appui BD/IC via Hector + contexte complet
2. BD/IC: Notification + Accepter/Refuser sous 24h
3. Coordination: Brief SDR→BD/IC (15 min)
4. RDV Terrain: BD/IC effectue démo + objectif signature
5. Issue: Signé/Perdu/En cours
6. Commissions: Partagées si signature (SDR 5% + BD/IC 7,5%)

MATRICE DÉCISION:
- Client enthousiaste R1/R2: Pas de transfert
- Client hésite R2/R3: Proposer terrain selon contexte
- Client demande "voir sur place": Transfert immédiat
- Concurrent fait démo physique: Transfert urgent

AFFAIRES CHAUDES WORKFLOW:

DÉFINITION:
- R1 effectué sans signature = Affaire chaude
- R2 devient OBLIGATOIRE sous 7 jours
- Manager notifié automatiquement

PROCESSUS:
J+0: Clôture R1 → Hector active affaire chaude
J+1 à J+3: Actions intermédiaires (docs, relances, préparation)
J+3 MAX: R2 positionné impérativement
J+4 à J+7: Préparation R2 avec manager
Jour R2: Closing (objectif: signature, pas "avancer")

ALERTES:
- ROUGE: R2 non positionné >3j
- ORANGE: R2 <24h (valider préparation)
- VERTE: R2 programmé >72h

RÈGLES D'OR:
- R2 positionné <7j après R1 (idéalement <5j)
- Contact client tous les 2j minimum
- Manager informé en continu
- Checklist R2 complétée
- Contrat prêt à signer au R2

COMMISSIONS PARTAGÉES:
- SDR solo: 10% ARR
- BD/IC solo: 15% ARR (nouveau) / 8% ARR (reconduction)
- SDR + BD/IC: 5% + 7,5% = 12,5% total

KPIS TRANSFERTS:
- Taux acceptation BD/IC: >90%
- Taux transformation transfert→signé: 60-70%
- Temps moyen réponse BD/IC: <12h
- Satisfaction client NPS: >8/10

EXPÉRIENCE CLIENT UNIFIÉE:
- Brief complet SDR→BD/IC
- Client informé du transfert (email coordonné)
- Cohérence discours commercial
- Continuité argumentaire
- Pas de redondance découverte

Mindset: "Nous gagnons ENSEMBLE. Le client veut la meilleure solution."
            """
        }
        
        # MODULE 15: Sécurité & Surveillance API
        self.modules['module_15'] = {
            'name': 'Sécurité & Surveillance API',
            'version': '1.0',
            'description': 'Protection contre blacklist API et surveillance active',
            'content': """
RÉSUMÉ MODULE 15:
Protection totale Hector contre risques API

RISQUES IDENTIFIÉS:
1. Blacklist IP
2. Throttling API (rate limiting)
3. Suspension de compte
4. Blast email
5. Réputation domaine dégradée
6. Détection scraping
7. Dépassement quotas
8. Violation CGU

5 COUCHES DE SÉCURITÉ:

NIVEAU 1: CONTRÔLE DES APPELS
- Validation avant envoi
- Cache intelligent (réduction 60% appels)
- Retry logic exponential backoff

NIVEAU 2: RATE LIMITING INTELLIGENT
- Quotas par API configurés
- Temporisations aléatoires (1-3 sec)
- Queue de requêtes
- Pause automatique si limite proche

NIVEAU 3: PROTECTION IDENTITÉS
- Rotation proxies (20+ IPs)
- User-agents dynamiques (50+ variants)
- Headers authentiques
- Cooldown par proxy (1h après 100 req)

NIVEAU 4: SURVEILLANCE & ALERTES
- Monitoring temps réel quotas
- Détection anomalies
- Alertes admin (80%, 90%, 95%, 100%)
- Dashboard sécurité

NIVEAU 5: CONFORMITÉ & ÉTHIQUE
- Respect CGU de chaque API
- Usage responsable
- Audit régulier
- Documentation complète

QUOTAS PAR API:
- Google Search: 100/jour, seuil alerte 80%
- LinkedIn: 50/jour, 75%
- PagesJaunes: 200/jour, 80%
- Pappers: 1000/jour, 85%
- Brave Search: 2000/mois, 80%
- Claude API: 10000/jour, 90%
- Supabase: 50000/jour, 80%

ALERTES AUTOMATIQUES:
- INFO: 80% quota → Email admin
- WARNING: 90% quota → Email + Push
- CRITICAL: 95% quota → Blocage proche
- BLOCKED: 100% quota → Pause automatique 1h

REMÉDIATION AUTO:
- Code 429 (Too Many Requests): Pause 15 min
- Code 403 (Forbidden): Changer proxy
- Code 401 (Unauthorized): Refresh token
- Code 503 (Service Unavailable): Retry après 5 min

JOURNAL SÉCURITÉ:
- Table PostgreSQL api_security_log
- Horodatage incidents
- Type incident
- Actions remédiation
- Résolution

KPIS SÉCURITÉ:
- Taux blocage API: <0.1%
- Quota moyen utilisé: <70%
- Incidents/jour: <1
- Temps résolution: <15 min
- Uptime APIs: >99.5%
- Latence moyenne: <2s

CONFORMITÉ STRICTE:
- Google: API officielle uniquement, cache 24h min
- LinkedIn: OAuth 2.0, respecter rate limits
- PagesJaunes: 3-5 sec entre requêtes
- Pappers: Cache 7 jours (données INPI)

MAINTENANCE:
- Quotidien: Vérif quotas + logs incidents
- Hebdomadaire: Audit conformité CGU
- Mensuel: Tests sécurité complets

Objectif: Fonctionnement conforme, sécurisé, durable sans suspension.
            """
        }
    
    def get_module(self, module_id: str) -> dict:
        """Récupère un module spécifique"""
        return self.modules.get(module_id, {})
    
    def get_module_content(self, module_id: str) -> str:
        """Récupère le contenu d'un module"""
        module = self.modules.get(module_id, {})
        return module.get('content', '')
    
    def get_all_modules(self) -> dict:
        """Retourne tous les modules"""
        return self.modules
    
    def get_modules_summary(self) -> str:
        """Génère un résumé des 15 modules"""
        summary = "=== ADN HECTOR READY v6.2 - 15 MODULES ===\n\n"
        for module_id, module_data in self.modules.items():
            summary += f"{module_id.upper()}: {module_data['name']}\n"
            summary += f"  Version: {module_data['version']}\n"
            summary += f"  Description: {module_data['description']}\n\n"
        return summary
    
    def search_modules(self, keyword: str) -> list:
        """Recherche un mot-clé dans tous les modules"""
        results = []
        keyword_lower = keyword.lower()
        
        for module_id, module_data in self.modules.items():
            content = module_data['content'].lower()
            name = module_data['name'].lower()
            description = module_data['description'].lower()
            
            if keyword_lower in content or keyword_lower in name or keyword_lower in description:
                results.append({
                    'module_id': module_id,
                    'name': module_data['name'],
                    'description': module_data['description']
                })
        
        return results


# Fonctions utilitaires globales
def load_adn_hector() -> ADNHectorLoader:
    """Charge l'ADN Hector complet"""
    return ADNHectorLoader()


# Fonctions wrapper pour compatibilité avec ancien système
_loader_instance = None

def get_loader() -> ADNHectorLoader:
    """Obtenir instance singleton du loader"""
    global _loader_instance
    if _loader_instance is None:
        _loader_instance = ADNHectorLoader()
    return _loader_instance


def get_disc_context() -> str:
    """Récupère MODULE 6 (DISC) complet"""
    loader = get_loader()
    return loader.get_module_content('module_06')


def get_vocabulary() -> str:
    """Récupère vocabulaire ADS GROUP depuis MODULE 1"""
    loader = get_loader()
    module_01 = loader.get_module_content('module_01')
    return "VOCABULAIRE STRICT ADS GROUP:\n- Entreprise/Commerce (JAMAIS client)\n- Accompagner (JAMAIS vendre)\n- Déployer (JAMAIS installer)\n- B2B EXCLUSIF (professionnels uniquement)\n\n" + module_01


def get_moodshow() -> str:
    """Récupère MODULE 2 (MOODSHOW)"""
    loader = get_loader()
    return loader.get_module_content('module_02')


def get_positioning_b2b() -> str:
    """Récupère positionnement B2B"""
    return "POSITIONNEMENT B2B EXCLUSIF:\nADS GROUP Security travaille uniquement avec des professionnels en BtoB.\nJamais de particuliers (B2C).\nVocabulaire adapté au monde professionnel."


def get_disc_scripts() -> dict:
    """Récupère scripts commerciaux DISC depuis MODULE 6"""
    loader = get_loader()
    module_disc = loader.get_module_content('module_06')
    return {
        'D': 'Script D: Être concis, parler ROI, aller droit au but',
        'I': 'Script I: Storytelling, émotion, preuve sociale', 
        'S': 'Script S: Rassurer, témoignages, garanties',
        'C': 'Script C: Données chiffrées, documentation, détails techniques'
    }


def get_module_content(module_id: str) -> str:
    """
    Retourne le contenu d'un module spécifique par son ID
    
    Args:
        module_id: ID du module (ex: 'module_06')
    
    Returns:
        Contenu du module ou chaîne vide si non trouvé
    """
    loader = get_loader()
    return loader.get_module_content(module_id)


def get_relevant_modules_for_rdv(context: dict) -> list:
    """
    Sélectionne les modules pertinents selon le contexte RDV
    
    Args:
        context: Dict avec secteur, phase, profil_disc, etc.
    
    Returns:
        Liste des module_ids pertinents
    """
    modules_pertinents = []
    
    # Modules TOUJOURS inclus
    modules_pertinents.extend([
        'module_04',  # Argumentaire 12 Phases
        'module_06',  # Intelligence Comportementale DISC
        'module_10',  # Objections Mastery
    ])
    
    # MODULE 11 si secteur spécifié
    if context.get('secteur'):
        modules_pertinents.append('module_11')  # Fiches Métiers
    
    # MODULE 9 si phase prospection
    if context.get('phase') == 'prospection':
        modules_pertinents.append('module_09')  # Prospection Intelligente
    
    # MODULE 5 pour techniques émotionnelles
    modules_pertinents.append('module_05')  # Modules Émotionnels
    
    return list(set(modules_pertinents))  # Déduplique


def generate_rdv_brief(prospect_data: dict) -> str:
    """
    Génère un brief RDV complet avec modules ADN pertinents
    
    Args:
        prospect_data: Données prospect (nom, secteur, profil DISC, etc.)
    
    Returns:
        Brief RDV formaté en markdown
    """
    loader = load_adn_hector()
    
    brief = f"""
═══════════════════════════════════════════════════════════
BRIEF RDV COMMERCIAL - {prospect_data.get('nom_entreprise', 'N/A')}
═══════════════════════════════════════════════════════════

INFORMATIONS PROSPECT:
- Entreprise: {prospect_data.get('nom_entreprise', 'N/A')}
- Contact: {prospect_data.get('nom_contact', 'N/A')}
- Secteur: {prospect_data.get('secteur', 'N/A')}
- Profil DISC détecté: {prospect_data.get('profil_disc', 'N/A')}
- Budget estimé: {prospect_data.get('budget', 'N/A')}

───────────────────────────────────────────────────────────
ADAPTATION PROFIL DISC
───────────────────────────────────────────────────────────
{loader.get_module_content('module_06')}

───────────────────────────────────────────────────────────
STRUCTURE RDV (12 PHASES)
───────────────────────────────────────────────────────────
{loader.get_module_content('module_04')}

───────────────────────────────────────────────────────────
TECHNIQUES ÉMOTIONNELLES
───────────────────────────────────────────────────────────
{loader.get_module_content('module_05')}

───────────────────────────────────────────────────────────
OBJECTIONS À ANTICIPER (MÉTHODE 4A)
───────────────────────────────────────────────────────────
{loader.get_module_content('module_10')}

═══════════════════════════════════════════════════════════
FIN DU BRIEF
═══════════════════════════════════════════════════════════
"""
    
    return brief


# Tests de validation (optionnels)
if __name__ == "__main__":
    print("\n🧪 Tests ADN Hector Loader v6.2\n")
    
    # Test 1: Chargement
    loader = load_adn_hector()
    print(f"✅ {len(loader.modules)} modules chargés")
    
    # Test 2: Résumé
    print("\n" + loader.get_modules_summary())
    
    # Test 3: Recherche
    results = loader.search_modules('objection')
    print(f"\n🔍 Recherche 'objection': {len(results)} résultats")
    for r in results:
        print(f"  - {r['module_id']}: {r['name']}")
    
    # Test 4: Génération brief
    prospect_test = {
        'nom_entreprise': 'Restaurant Test',
        'nom_contact': 'Jean Dupont',
        'secteur': 'restaurant',
        'profil_disc': 'D',
        'budget': '15K€'
    }
    
    brief = generate_rdv_brief(prospect_test)
    print(f"\n📋 Brief généré ({len(brief)} caractères)\n")
    print(brief[:800] + "...\n")
    
    print("✅ Tests terminés avec succès!")
