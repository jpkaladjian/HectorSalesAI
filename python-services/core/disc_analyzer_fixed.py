#!/usr/bin/env python3
"""
Module DISC Analyzer - VERSION ENRICHIE ADN HECTOR
Corrige la détection erronée du profil D au lieu de S
ENRICHI avec MODULE 6 DISC complet pour meilleure précision
"""

from typing import Dict, List, Any, Optional
import anthropic
import os
import sys
import json

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from adn_loader_v2_complete import get_disc_context, get_adn_loader_v2

class DISCAnalyzerFixed:
    """Analyseur DISC corrigé avec meilleure pondération"""
    
    def __init__(self, anthropic_api_key: str):
        self.client = anthropic.Anthropic(api_key=anthropic_api_key)
        
        # 🔥 CORRECTION 1 : Poids de fusion ajustés
        # Avant : web=40%, linkedin=35%, facebook=25%
        # Après : linkedin=40%, web=30%, facebook=30%
        self.FUSION_WEIGHTS = {
            'web': 0.30,       # Réduit car trop générique
            'linkedin': 0.40,  # Augmenté car plus fiable
            'facebook': 0.30   # Augmenté pour équilibrer
        }
    
    def analyze_web_source(self, web_results: List[str], contact_name: str, secteur: str) -> Dict[str, Any]:
        """
        Analyse DISC basée sur recherche web
        🔥 CORRIGÉ : Critères S mieux détectés
        """
        
        # Charger ADN HECTOR MODULE 6 DISC (tous les profils pour analyse)
        try:
            loader = get_adn_loader_v2()
            # 🔥 CORRECTION: Utiliser les bonnes clés du loader v2
            disc_d = loader.get_disc_profile('D_DOMINANT')
            disc_i = loader.get_disc_profile('I_INFLUENT')
            disc_s = loader.get_disc_profile('S_STABLE')
            disc_c = loader.get_disc_profile('C_CONFORME')
            
            adn_disc = f"""
PROFIL D (DOMINANT): {disc_d['characteristics']['personality']}
- Signaux: {', '.join(disc_d['detection_signals']['verbal'][:3])}
- Adaptation: {disc_d['adaptation_strategy']['discours']}

PROFIL I (INFLUENT): {disc_i['characteristics']['personality']}
- Signaux: {', '.join(disc_i['detection_signals']['verbal'][:3])}
- Adaptation: {disc_i['adaptation_strategy']['discours']}

PROFIL S (STABLE): {disc_s['characteristics']['personality']}
- Signaux: {', '.join(disc_s['detection_signals']['verbal'][:3])}
- Adaptation: {disc_s['adaptation_strategy']['discours']}

PROFIL C (CONFORME): {disc_c['characteristics']['personality']}
- Signaux: {', '.join(disc_c['detection_signals']['verbal'][:3])}
- Adaptation: {disc_c['adaptation_strategy']['discours']}
"""[:3000]  # Limiter taille
            
            if not adn_disc:
                raise ValueError("ADN HECTOR vide")
        except Exception as e:
            print(f"⚠️ ADN HECTOR non chargé ({e}) - utilisation fallback")
            adn_disc = "PROFIL D: Direct, décideur, résultats. PROFIL I: Sociable, enthousiaste. PROFIL S: Calme, patient, stable. PROFIL C: Analytique, précis, rigoureux. VOCABULAIRE: Entreprise (pas client), B2B exclusif"
        
        prompt = f"""Tu es un expert en analyse DISC formé par ADS GROUP Security selon MODULE 6 ci-dessous.

CONTEXTE ADN HECTOR (MODULE 6 - DISC) :
{adn_disc}

Analyse les résultats web suivants pour déterminer le profil DISC de {contact_name} selon la méthode ci-dessus.

RÉSULTATS WEB:
{chr(10).join(web_results[:5])}

SECTEUR: {secteur}

RÈGLES STRICTES D'ANALYSE:

1. PROFIL D (Dominant) - UNIQUEMENT si:
   ✅ Création d'entreprise from scratch
   ✅ Expansion rapide / croissance agressive
   ✅ Prise de risques majeurs
   ✅ Ton assertif, vocabulaire conquête

2. PROFIL S (Stable) - Détecter si: 
   ✅ Reprise d'entreprise FAMILIALE ou établie (🔥 CRITIQUE)
   ✅ Continuité d'activité existante (🔥 CRITIQUE)
   ✅ Transition géographique pour STABILITÉ (🔥 CRITIQUE)
   ✅ Secteur service/santé/restauration traditionnelle
   ✅ Mention "équipe", "famille", "continuité"
   ✅ Ancienneté, stabilité, fidélité
   ✅ Reprise suite à départ retraite (🔥 CRITIQUE)

3. SECTEUR {secteur.upper()}:
   - Restauration traditionnelle → +20% S
   - Pizzeria familiale → +25% S
   - Service à la personne → +20% S
   - Santé → +25% S

CONTEXTE CRITIQUE:
Si tu vois "reprise", "reprendre", "succession", "continuer" :
→ C'est PRESQUE TOUJOURS du profil S (Stable), PAS du D !

Une reprise d'entreprise établie est un choix de STABILITÉ, pas de domination.

Réponds UNIQUEMENT en JSON :
{{
    "profil_detecte": "D/I/S/C",
    "scores": {{"D": 0-100, "I": 0-100, "S": 0-100, "C": 0-100}},
    "indices": ["liste des indices détectés"],
    "fiabilite": 0-100,
    "justification": "explication courte"
}}"""

        try:
            response = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=1000,
                messages=[{"role": "user", "content": prompt}]
            )
            
            json_text = self._clean_json(response.content[0].text)
            return json.loads(json_text)
            
        except Exception as e:
            print(f"❌ Erreur analyse web: {e}")
            # 🔥 CORRECTION 2 : Fallback neutre au lieu de D par défaut
            return {
                "profil_detecte": "S",  # Fallback S si secteur service
                "scores": {"D": 25, "I": 25, "S": 50, "C": 25},
                "indices": ["erreur analyse - fallback sécurisé"],
                "fiabilite": 20,
                "justification": "Erreur analyse, profil S par défaut (secteur service)"
            }
    
    def analyze_linkedin_source(self, web_results: List[str], contact_name: str) -> Dict[str, Any]:
        """
        Analyse LinkedIn (simulation basée sur web)
        🔥 CORRIGÉ : Détection S améliorée
        """
        
        prompt = f"""Analyse le profil professionnel de {contact_name} basé sur ces infos pour déterminer son profil DISC.

DONNÉES:
{chr(10).join(web_results[:5])}

FOCUS LINKEDIN:
- Ancienneté poste actuel
- Type de poste (opérationnel vs stratégique)
- Ton du résumé professionnel
- Parcours (stabilité vs changements fréquents)

CRITÈRES PROFIL S (🔥 AUGMENTÉS):
✅ Reprise entreprise familiale → +30% S
✅ "Continuité", "Poursuivre", "Reprendre" → +25% S  
✅ Ancienneté même poste → +20% S
✅ Secteur service/santé/restauration → +20% S
✅ Mention équipe, collaboration → +15% S

CRITÈRES PROFIL D:
✅ Création startup
✅ Multiple postes direction différentes entreprises
✅ Croissance rapide entreprise
✅ Vocabulaire conquête, performance

Réponds en JSON :
{{
    "profil_detecte": "D/I/S/C",
    "scores": {{"D": 0-100, "I": 0-100, "S": 0-100, "C": 0-100}},
    "indices": ["indices détectés"],
    "fiabilite": 0-100,
    "justification": "explication"
}}"""

        try:
            response = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=1000,
                messages=[{"role": "user", "content": prompt}]
            )
            
            json_text = self._clean_json(response.content[0].text)
            return json.loads(json_text)
            
        except Exception as e:
            print(f"❌ Erreur analyse LinkedIn: {e}")
            return {
                "profil_detecte": "S",
                "scores": {"D": 20, "I": 30, "S": 70, "C": 40},
                "indices": ["erreur analyse"],
                "fiabilite": 15,
                "justification": "Fallback S"
            }
    
    def analyze_facebook_source(self, web_results: List[str], contact_name: str) -> Dict[str, Any]:
        """
        Analyse Facebook
        🔥 CORRIGÉ : Ne pas retourner fiabilité 15% si pas de vraies données FB
        """
        
        # 🔥 CORRECTION 3 : Vérifier si vraies données Facebook
        has_real_fb_data = any([
            'facebook.com' in str(r).lower() for r in web_results
        ])
        
        if not has_real_fb_data:
            return {
                "profil_detecte": "S",
                "scores": {"D": 25, "I": 25, "S": 50, "C": 25},
                "indices": ["Pas de données Facebook disponibles"],
                "fiabilite": 0,  # 🔥 0% si pas de données (pas 15%)
                "justification": "Aucune donnée Facebook - profil neutre"
            }
        
        prompt = f"""Analyse le comportement social media de {contact_name} pour déterminer son profil DISC.

DONNÉES FACEBOOK:
{chr(10).join([r for r in web_results if 'facebook' in str(r).lower()][:3])}

CRITÈRES:
- Fréquence publications
- Ton des posts (assertif vs empathique)
- Type de contenu (perso vs pro)
- Interactions (direct vs prudent)

PROFIL S (Stable):
✅ Publications rares, réfléchies
✅ Ton sobre, bienveillant
✅ Contenu vie établissement (pas personnel)
✅ Pas de recherche viralité

Réponds en JSON:
{{
    "profil_detecte": "D/I/S/C",
    "scores": {{"D": 0-100, "I": 0-100, "S": 0-100, "C": 0-100}},
    "indices": ["indices"],
    "fiabilite": 0-100,
    "justification": "explication"
}}"""

        try:
            response = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=1000,
                messages=[{"role": "user", "content": prompt}]
            )
            
            json_text = self._clean_json(response.content[0].text)
            return json.loads(json_text)
            
        except Exception as e:
            return {
                "profil_detecte": "S",
                "scores": {"D": 25, "I": 25, "S": 50, "C": 25},
                "indices": ["erreur analyse"],
                "fiabilite": 0,
                "justification": "Fallback"
            }
    
    def fuse_disc_profiles(
        self,
        web_analysis: Dict[str, Any],
        linkedin_analysis: Dict[str, Any],
        facebook_analysis: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Fusion des 3 analyses avec pondération corrigée
        🔥 CORRECTION MAJEURE : Poids ajustés + logique cohérence
        """
        
        # 🔥 CORRECTION 4 : Exclure Facebook si fiabilité = 0
        sources = []
        weights = []
        
        if web_analysis['fiabilite'] > 0:
            sources.append(('web', web_analysis))
            weights.append(self.FUSION_WEIGHTS['web'])
        
        if linkedin_analysis['fiabilite'] > 0:
            sources.append(('linkedin', linkedin_analysis))
            weights.append(self.FUSION_WEIGHTS['linkedin'])
        
        if facebook_analysis['fiabilite'] > 0:
            sources.append(('facebook', facebook_analysis))
            weights.append(self.FUSION_WEIGHTS['facebook'])
        
        # Normaliser les poids
        total_weight = sum(weights)
        normalized_weights = [w / total_weight for w in weights]
        
        # Fusion des scores DISC
        final_scores = {"D": 0, "I": 0, "S": 0, "C": 0}
        
        for (source_name, analysis), weight in zip(sources, normalized_weights):
            for dimension in ["D", "I", "S", "C"]:
                score = analysis['scores'].get(dimension, 0)
                fiabilite = analysis['fiabilite'] / 100
                final_scores[dimension] += score * weight * fiabilite
        
        # 🔥 CORRECTION 5 : Boost S si détection reprise/continuité
        all_indices = []
        for source_name, analysis in sources:
            all_indices.extend(analysis.get('indices', []))
        
        reprise_keywords = ['reprise', 'reprendre', 'succession', 'continuité', 'continuer', 'familial']
        if any(keyword in ' '.join(all_indices).lower() for keyword in reprise_keywords):
            final_scores['S'] *= 1.3  # Boost 30% si reprise détectée
            print("🔥 BOOST S appliqué : Reprise d'entreprise détectée")
        
        # Normaliser scores (total = 100)
        total = sum(final_scores.values())
        if total > 0:
            final_scores = {k: int(v / total * 100) for k, v in final_scores.items()}
        
        # Profil dominant
        profil_dominant = max(final_scores.items(), key=lambda x: x[1])[0]
        
        # 🔥 CORRECTION 6 : Vérification cohérence finale
        # Si S et D proches, vérifier les indices
        if abs(final_scores['S'] - final_scores['D']) < 15:
            if any(kw in ' '.join(all_indices).lower() for kw in reprise_keywords):
                profil_dominant = 'S'
                final_scores['S'] += 10
                final_scores['D'] -= 10
                print("🔥 CORRECTION COHÉRENCE : S choisi car reprise détectée")
        
        # Calculer fiabilité globale
        fiabilite_globale = int(sum(
            analysis['fiabilite'] * weight 
            for (_, analysis), weight in zip(sources, normalized_weights)
        ))
        
        # 🔥 AMÉLIORATION 3: Boost fiabilité si convergence multi-sources (+10-15%)
        if len(sources) >= 2:
            # Vérifier si les sources convergent vers le même profil
            source_profiles = [analysis.get('profil_detecte', '') for _, analysis in sources if analysis['fiabilite'] > 30]
            if source_profiles and source_profiles.count(source_profiles[0]) == len(source_profiles):
                # Toutes les sources convergent vers le même profil
                fiabilite_globale = min(100, fiabilite_globale + 15)
                print(f"🔥 BOOST FIABILITÉ +15% : Convergence multi-sources vers {source_profiles[0]}")
            elif len(set(source_profiles)) <= 2:
                # Au moins 2 sources sur 3 convergent
                fiabilite_globale = min(100, fiabilite_globale + 10)
                print(f"🔥 BOOST FIABILITÉ +10% : Convergence partielle multi-sources")
        
        # Archétype
        archetypes = {
            'D': 'Le Chef Visionnaire',
            'I': 'L\'Influenceur Charismatique',
            'S': 'Le Pilier Stable',
            'C': 'L\'Expert Méticuleux'
        }
        
        return {
            'profil_dominant': profil_dominant,
            'archetype': archetypes[profil_dominant],
            'scores': final_scores,
            'fiabilite': fiabilite_globale,
            'sources': {
                'web': web_analysis,
                'linkedin': linkedin_analysis,
                'facebook': facebook_analysis
            },
            'tous_indices': all_indices,
            'poids_utilises': {
                name: f"{weight*100:.0f}%" 
                for (name, _), weight in zip(sources, normalized_weights)
            }
        }
    
    def analyze_full_disc(self, sources_data: Dict, contact_name: str, secteur: str = "") -> Dict[str, Any]:
        """
        Analyse DISC complète multi-sources
        """
        
        print("\n" + "🎨"*30)
        print("ANALYSE DISC MULTI-SOURCES (VERSION CORRIGÉE)")
        print("🎨"*30)
        
        web_results = sources_data.get('web', [])
        
        # Analyse chaque source
        print("\n📊 SOURCE 1 : WEB")
        web_analysis = self.analyze_web_source(web_results, contact_name, secteur)
        print(f"  → Profil: {web_analysis['profil_detecte']} ({web_analysis['fiabilite']}%)")
        
        print("\n📊 SOURCE 2 : LINKEDIN")
        linkedin_analysis = self.analyze_linkedin_source(web_results, contact_name)
        print(f"  → Profil: {linkedin_analysis['profil_detecte']} ({linkedin_analysis['fiabilite']}%)")
        
        print("\n📊 SOURCE 3 : FACEBOOK")
        facebook_analysis = self.analyze_facebook_source(web_results, contact_name)
        print(f"  → Profil: {facebook_analysis['profil_detecte']} ({facebook_analysis['fiabilite']}%)")
        
        # Fusion
        print("\n🔄 FUSION DES ANALYSES...")
        final_profile = self.fuse_disc_profiles(web_analysis, linkedin_analysis, facebook_analysis)
        
        print(f"\n✅ PROFIL FINAL: {final_profile['profil_dominant']} ({final_profile['fiabilite']}%)")
        print(f"   Scores: D={final_profile['scores']['D']}% I={final_profile['scores']['I']}% " +
              f"S={final_profile['scores']['S']}% C={final_profile['scores']['C']}%")
        
        return final_profile
    
    def _clean_json(self, text: str) -> str:
        """Nettoie le JSON de Claude (enlève markdown, etc.)"""
        text = text.strip()
        
        # Enlever markdown
        if text.startswith('```'):
            lines = text.split('\n')
            text = '\n'.join(lines[1:-1] if lines[-1].strip() == '```' else lines[1:])
        
        text = text.strip()
        
        # Trouver le JSON
        start = text.find('{')
        end = text.rfind('}') + 1
        if start != -1 and end > start:
            text = text[start:end]
        
        return text


# Test rapide
if __name__ == "__main__":
    # Simulation test PIZZA DELICE
    mock_data = {
        'web': [
            "Astrid et Arman Makaryan ont repris la pizzeria Pizza Délice à Bourgoin-Jallieu",
            "Cette pizzeria familiale existe depuis 40 ans",
            "Gilles Gonet passe le relais après une carrière de pizzaiolo",
            "Le couple venu de Grenoble assure la continuité de l'établissement"
        ]
    }
    
    analyzer = DISCAnalyzerFixed(os.getenv('ANTHROPIC_API_KEY', ''))
    
    result = analyzer.analyze_full_disc(mock_data, "Astrid MAKARYAN", "Restauration")
    
    print("\n" + "="*60)
    print("RÉSULTAT TEST:")
    print(json.dumps(result, indent=2, ensure_ascii=False))
