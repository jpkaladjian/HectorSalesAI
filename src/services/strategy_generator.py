"""
Service 3 : StrategyGenerator
Génère stratégies commerciales adaptées au profil DISC
"""
from typing import Dict, List, Optional
from datetime import datetime


class StrategyGenerator:
    """
    Génère stratégies de vente adaptées au profil DISC
    
    4 stratégies :
    - ROUGE (D) : 30 min MAX, direct, ROI
    - JAUNE (I) : 60 min, storytelling, vision
    - VERT (S) : 75-90 min, rassurant, témoignages
    - BLEU (C) : 60-75 min, méthodique, données
    """
    
    def __init__(self):
        # Vocabulaire BASE MODULE 1 (universel)
        self.vocabulaire_base = {
            "ne_jamais_dire": [
                "Client",
                "Vendre",
                "Installer",
                "Particulier",
                "Problème",
                "Coût",
                "Dépense"
            ],
            "toujours_dire": [
                "Entreprise",
                "Accompagner",
                "Déployer",
                "Professionnel",
                "Opportunité",
                "Investissement",
                "Performance"
            ]
        }
    
    def generate_strategy(
        self,
        disc_profile: Dict,
        rdv_info: Dict,
        pappers_data: Optional[Dict] = None
    ) -> Dict:
        """
        Génère stratégie complète selon profil DISC
        
        Args:
            disc_profile: Résultat DISCAnalyzer (profil_dominant, scores, etc.)
            rdv_info: Infos RDV (entreprise, date, heure, lieu)
            pappers_data: Données Pappers (optionnel)
            
        Returns:
            Stratégie complète adaptée
        """
        profil_dominant = disc_profile.get("profil_dominant")
        scores = disc_profile.get("scores", {})
        
        print(f"\n[StrategyGenerator] 🎯 Génération stratégie pour profil {profil_dominant}")
        print(f"[StrategyGenerator]    Scores : D={scores['D']}% I={scores['I']}% S={scores['S']}% C={scores['C']}%")
        
        # Sélectionner stratégie selon profil dominant
        if profil_dominant == "D":
            strategy_core = self._strategy_rouge(scores, rdv_info, pappers_data)
        elif profil_dominant == "I":
            strategy_core = self._strategy_jaune(scores, rdv_info, pappers_data)
        elif profil_dominant == "S":
            strategy_core = self._strategy_vert(scores, rdv_info, pappers_data)
        elif profil_dominant == "C":
            strategy_core = self._strategy_bleu(scores, rdv_info, pappers_data)
        else:
            # Fallback générique
            strategy_core = self._strategy_rouge(scores, rdv_info, pappers_data)
        
        # Enrichir avec vocabulaire, questions, closing
        strategy_core["vocabulaire"] = self._get_vocabulaire_adapte(profil_dominant, scores)
        strategy_core["questions_ciblees"] = self._get_questions_ciblees(
            profil_dominant, scores, pappers_data
        )
        strategy_core["closing"] = self._get_closing_adapte(profil_dominant, scores)
        
        print(f"[StrategyGenerator] ✅ Stratégie {strategy_core['nom']} générée")
        print(f"[StrategyGenerator]    Durée : {strategy_core['duree']}")
        print(f"[StrategyGenerator]    Questions : {len(strategy_core['questions_ciblees'])}")
        
        return strategy_core
    
    def _strategy_rouge(
        self,
        scores: Dict[str, int],
        rdv_info: Dict,
        pappers_data: Optional[Dict]
    ) -> Dict:
        """
        Stratégie ROUGE (Profil D - Dominant)
        
        Durée : 30 min MAX
        Style : Direct, ROI, résultats rapides
        """
        return {
            "profil": "ROUGE (D - Dominant)",
            "nom": "Stratégie Impact Express",
            "duree": "30 minutes MAXIMUM",
            "objectif": "Décision rapide basée sur ROI immédiat",
            
            "structure": {
                "accroche": {
                    "timing": "0-2 min",
                    "objectif": "CHOC + CRÉDIBILITÉ",
                    "elements": [
                        "Stat impactante (ex: '87% entreprises perdent 40% productivité')",
                        "Référence client prestigieux (ex: 'CAC40, Fortune 500')",
                        "Annonce ROI immédiat (ex: '+32% performance en 3 mois')"
                    ]
                },
                "decouverte": {
                    "timing": "5-15 min",
                    "objectif": "3 questions MAX ultra-ciblées",
                    "principes": [
                        "Questions fermées (oui/non)",
                        "Focus sur impact/résultats",
                        "Pas de détails techniques",
                        "Validation points de douleur rapide"
                    ]
                },
                "demo": {
                    "timing": "15-25 min",
                    "objectif": "1 cas d'usage focalisé",
                    "principes": [
                        "UN SEUL cas d'usage (le plus impactant)",
                        "Chiffres concrets (ROI, délais, performances)",
                        "Comparaison avant/après",
                        "Pas de détails techniques inutiles"
                    ]
                },
                "closing": {
                    "timing": "25-30 min",
                    "objectif": "DÉCISION IMMÉDIATE",
                    "technique": "Alternative fermée"
                }
            },
            
            "registre_vocabulaire": {
                "mots_cles": [
                    "Performance",
                    "ROI",
                    "Résultats rapides",
                    "Être le premier",
                    "Avantage concurrentiel",
                    "Leadership",
                    "Décision",
                    "Impact immédiat"
                ],
                "format_communication": "Direct, factuel, chiffré"
            },
            
            "pieges_eviter": [
                "❌ Trop de détails techniques",
                "❌ Discours trop long (>30 min)",
                "❌ Questions ouvertes multiples",
                "❌ Hésitation ou manque d'assurance",
                "❌ Parler de processus/méthode (focus RÉSULTATS)"
            ]
        }
    
    def _strategy_jaune(
        self,
        scores: Dict[str, int],
        rdv_info: Dict,
        pappers_data: Optional[Dict]
    ) -> Dict:
        """
        Stratégie JAUNE (Profil I - Influent)
        
        Durée : 60 min
        Style : Storytelling, vision, image
        """
        return {
            "profil": "JAUNE (I - Influent)",
            "nom": "Stratégie Vision & Rayonnement",
            "duree": "60 minutes",
            "objectif": "Créer enthousiasme et adhésion émotionnelle",
            
            "structure": {
                "accroche": {
                    "timing": "0-5 min",
                    "objectif": "CRÉER CONNEXION ÉMOTIONNELLE",
                    "elements": [
                        "Histoire inspirante (client transformé)",
                        "Vision future enthousiasmante",
                        "Mise en valeur de l'innovation"
                    ]
                },
                "decouverte": {
                    "timing": "10-25 min",
                    "objectif": "5-7 questions conversationnelles",
                    "principes": [
                        "Questions ouvertes sur vision/ambitions",
                        "Écoute active et reformulation enthousiaste",
                        "Focus sur image et reconnaissance",
                        "Valoriser idées du prospect"
                    ]
                },
                "demo": {
                    "timing": "25-50 min",
                    "objectif": "Storytelling multi-cas",
                    "principes": [
                        "Plusieurs success stories",
                        "Focus sur transformation/avant-après",
                        "Témoignages vidéo si possible",
                        "Mise en scène visuelle (slides dynamiques)"
                    ]
                },
                "closing": {
                    "timing": "50-60 min",
                    "objectif": "ENGAGEMENT ENTHOUSIASTE",
                    "technique": "Exclusivité et vision partagée"
                }
            },
            
            "registre_vocabulaire": {
                "mots_cles": [
                    "Innovation",
                    "Vision",
                    "Avant-gardiste",
                    "Reconnaissance",
                    "Transformation",
                    "Inspiration",
                    "Opportunité unique",
                    "Ensemble"
                ],
                "format_communication": "Enthousiaste, visuel, storytelling"
            },
            
            "pieges_eviter": [
                "❌ Trop de données chiffrées brutes",
                "❌ Ton monotone ou trop sérieux",
                "❌ Manque de visuels/storytelling",
                "❌ Ne pas valoriser les idées du prospect",
                "❌ Closing trop agressif"
            ]
        }
    
    def _strategy_vert(
        self,
        scores: Dict[str, int],
        rdv_info: Dict,
        pappers_data: Optional[Dict]
    ) -> Dict:
        """
        Stratégie VERT (Profil S - Stable)
        
        Durée : 75-90 min
        Style : Rassurant, patient, témoignages
        """
        return {
            "profil": "VERT (S - Stable)",
            "nom": "Stratégie Accompagnement Sécurisé",
            "duree": "75-90 minutes",
            "objectif": "Créer confiance et sécurité à long terme",
            
            "structure": {
                "accroche": {
                    "timing": "0-5 min",
                    "objectif": "CRÉER CLIMAT DE CONFIANCE",
                    "elements": [
                        "Présentation posée et rassurante",
                        "Témoignage client similaire (secteur, taille)",
                        "Mise en avant de la stabilité (ancienneté, références)"
                    ]
                },
                "decouverte": {
                    "timing": "10-35 min",
                    "objectif": "4-6 questions rassurantes",
                    "principes": [
                        "Questions ouvertes sur contexte/équipe",
                        "Écoute patient sans presser",
                        "Focus sur stabilité et processus",
                        "Rassurer sur accompagnement"
                    ]
                },
                "demo": {
                    "timing": "35-70 min",
                    "objectif": "Démonstration progressive et détaillée",
                    "principes": [
                        "Explication pas-à-pas méthodique",
                        "Témoignages clients (vidéo/écrit)",
                        "Mise en avant support et formation",
                        "Garanties et sécurité"
                    ]
                },
                "closing": {
                    "timing": "70-90 min",
                    "objectif": "ENGAGEMENT PROGRESSIF",
                    "technique": "Étapes rassurantes avec garanties"
                }
            },
            
            "registre_vocabulaire": {
                "mots_cles": [
                    "Accompagnement",
                    "Sécurité",
                    "Stabilité",
                    "Équipe",
                    "Confiance",
                    "Support continu",
                    "Garantie",
                    "Progressif"
                ],
                "format_communication": "Posé, rassurant, patient"
            },
            
            "pieges_eviter": [
                "❌ Presser la décision",
                "❌ Manquer de témoignages/références",
                "❌ Ton trop commercial/agressif",
                "❌ Négliger questions sur équipe/processus",
                "❌ Manquer de garanties"
            ]
        }
    
    def _strategy_bleu(
        self,
        scores: Dict[str, int],
        rdv_info: Dict,
        pappers_data: Optional[Dict]
    ) -> Dict:
        """
        Stratégie BLEU (Profil C - Conforme)
        
        Durée : 60-75 min
        Style : Méthodique, données, certifications
        """
        return {
            "profil": "BLEU (C - Conforme)",
            "nom": "Stratégie Analyse & Conformité",
            "duree": "60-75 minutes",
            "objectif": "Démontrer rigueur et conformité totale",
            
            "structure": {
                "accroche": {
                    "timing": "0-3 min",
                    "objectif": "CRÉDIBILITÉ TECHNIQUE",
                    "elements": [
                        "Certifications (ISO, RGPD, etc.)",
                        "Méthodologie rigoureuse",
                        "Données précises et vérifiables"
                    ]
                },
                "decouverte": {
                    "timing": "5-30 min",
                    "objectif": "5-8 questions techniques précises",
                    "principes": [
                        "Questions détaillées sur processus actuel",
                        "Focus conformité/sécurité/normes",
                        "Prise de notes visible",
                        "Validation technique des besoins"
                    ]
                },
                "demo": {
                    "timing": "30-65 min",
                    "objectif": "Démonstration technique détaillée",
                    "principes": [
                        "Architecture technique expliquée",
                        "Normes et certifications détaillées",
                        "Données de performance (benchmarks)",
                        "Documentation complète présentée"
                    ]
                },
                "closing": {
                    "timing": "65-75 min",
                    "objectif": "DÉCISION DOCUMENTÉE",
                    "technique": "Proposition détaillée avec étapes claires"
                }
            },
            
            "registre_vocabulaire": {
                "mots_cles": [
                    "Certification ISO",
                    "Conformité RGPD",
                    "Données précises",
                    "Méthodologie",
                    "Sécurité",
                    "Normes",
                    "Audit",
                    "Documentation"
                ],
                "format_communication": "Technique, précis, structuré"
            },
            
            "pieges_eviter": [
                "❌ Manquer de données/preuves",
                "❌ Discours trop commercial (pas assez technique)",
                "❌ Manquer de documentation",
                "❌ Ignorer questions techniques",
                "❌ Closing émotionnel"
            ]
        }
    
    def _get_vocabulaire_adapte(
        self,
        profil: str,
        scores: Dict[str, int]
    ) -> Dict:
        """
        Vocabulaire adapté selon profil DISC
        
        Base MODULE 1 + Registre profil
        """
        vocabulaire = {
            "base": self.vocabulaire_base,
            "registre_profil": []
        }
        
        if profil == "D":
            vocabulaire["registre_profil"] = [
                "Performance",
                "ROI",
                "Résultats rapides",
                "Être le premier",
                "Avantage concurrentiel",
                "Leadership",
                "Décision"
            ]
        elif profil == "I":
            vocabulaire["registre_profil"] = [
                "Innovation",
                "Vision",
                "Reconnaissance",
                "Transformation",
                "Inspiration",
                "Opportunité unique",
                "Ensemble"
            ]
        elif profil == "S":
            vocabulaire["registre_profil"] = [
                "Accompagnement",
                "Sécurité",
                "Stabilité",
                "Équipe",
                "Confiance",
                "Support continu",
                "Garantie"
            ]
        elif profil == "C":
            vocabulaire["registre_profil"] = [
                "Certification ISO",
                "Conformité RGPD",
                "Données précises",
                "Méthodologie",
                "Sécurité",
                "Normes",
                "Audit"
            ]
        
        return vocabulaire
    
    def _get_questions_ciblees(
        self,
        profil: str,
        scores: Dict[str, int],
        pappers_data: Optional[Dict]
    ) -> List[str]:
        """
        Questions ciblées selon profil DISC
        
        ROUGE : 3 MAX ultra-ciblées
        JAUNE : 5-7 conversationnelles
        VERT : 4-6 rassurantes
        BLEU : 5-8 techniques
        """
        if profil == "D":
            # ROUGE : 3 MAX, format ROI/impact
            return [
                "Quel est votre objectif de croissance pour les 6 prochains mois ?",
                "Quel impact aurait une augmentation de 30% de votre productivité ?",
                "Qui sont vos 3 principaux concurrents et comment vous différenciez-vous ?"
            ]
        
        elif profil == "I":
            # JAUNE : 5-7, format émotionnel/vision
            return [
                "Quelle est votre vision pour votre entreprise dans 3 ans ?",
                "Comment souhaitez-vous que vos clients perçoivent votre marque ?",
                "Quelles innovations vous enthousiasment le plus actuellement ?",
                "Comment valorisez-vous votre équipe et leur contribution ?",
                "Quelle serait votre plus grande fierté si ce projet réussissait ?",
                "Comment imaginez-vous la transformation de votre activité ?",
                "Quels retours de vos clients vous touchent le plus ?"
            ]
        
        elif profil == "S":
            # VERT : 4-6, format sécurité/équipe
            return [
                "Comment votre équipe actuelle est-elle organisée ?",
                "Quels sont les processus qui fonctionnent bien aujourd'hui ?",
                "Quelles garanties sont importantes pour vous dans un partenariat ?",
                "Comment gérez-vous habituellement les changements dans votre organisation ?",
                "Quel type de support attendez-vous d'un partenaire ?",
                "Comment assurez-vous la continuité de vos opérations ?"
            ]
        
        elif profil == "C":
            # BLEU : 5-8, format technique/précis
            return [
                "Quelles sont vos exigences en termes de conformité RGPD ?",
                "Quelles certifications recherchez-vous chez un prestataire ?",
                "Quelle est votre architecture technique actuelle ?",
                "Quels KPIs mesurez-vous pour évaluer la performance ?",
                "Quelles normes de sécurité devez-vous respecter ?",
                "Quel est votre processus de validation des solutions techniques ?",
                "Quels sont vos critères d'évaluation pour ce type de projet ?",
                "Quelle documentation attendez-vous avant une décision ?"
            ]
        
        else:
            # Fallback générique
            return [
                "Quels sont vos objectifs principaux ?",
                "Quels défis rencontrez-vous actuellement ?",
                "Qu'attendez-vous d'un partenaire ?"
            ]
    
    def _get_closing_adapte(
        self,
        profil: str,
        scores: Dict[str, int]
    ) -> Dict:
        """
        Technique de closing adaptée selon profil DISC
        """
        if profil == "D":
            # ROUGE : Direct, alternative fermée
            return {
                "technique": "Alternative fermée",
                "exemple": "Préférez-vous démarrer dès lundi avec l'offre Performance, ou attendre mercredi avec l'offre Premium incluant l'accompagnement renforcé ?",
                "timing": "25-30 min",
                "ton": "Direct, assumé, confiant"
            }
        
        elif profil == "I":
            # JAUNE : Enthousiaste, exclusivité
            return {
                "technique": "Vision partagée & exclusivité",
                "exemple": "Imaginez dans 6 mois : votre équipe transformée, vos clients enthousiastes... Je propose qu'on construise cette vision ensemble dès maintenant. On a justement 2 créneaux exclusifs cette semaine pour démarrer.",
                "timing": "50-60 min",
                "ton": "Enthousiaste, inspirant, inclusif"
            }
        
        elif profil == "S":
            # VERT : Progressif, garanties
            return {
                "technique": "Étapes rassurantes",
                "exemple": "Voici comment on peut avancer en douceur : Étape 1 (sans engagement) : audit gratuit. Étape 2 : test pilote 30 jours satisfait ou remboursé. Étape 3 : déploiement progressif. Qu'en pensez-vous ?",
                "timing": "70-90 min",
                "ton": "Rassurant, patient, pas pressant"
            }
        
        elif profil == "C":
            # BLEU : Documenté, étapes claires
            return {
                "technique": "Proposition structurée",
                "exemple": "Je vous propose 3 options documentées : Option A (conforme ISO 27001), Option B (+ certification RGPD), Option C (formule complète avec audit). Je vous envoie la documentation détaillée aujourd'hui, et on planifie un point technique mardi pour vos questions.",
                "timing": "65-75 min",
                "ton": "Méthodique, documenté, précis"
            }
        
        else:
            # Fallback
            return {
                "technique": "Générique",
                "exemple": "Souhaitez-vous que nous avancions ensemble sur ce projet ?",
                "timing": "Variable",
                "ton": "Neutre"
            }


# Instance globale
strategy_generator = StrategyGenerator()
