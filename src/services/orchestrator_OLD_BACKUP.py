"""
Service 6 : Orchestrator - Chef d'orchestre Hector Ready
Coordonne les 5 services pour générer la préparation RDV complète
"""
from typing import Dict, Optional
from datetime import datetime
import os

from src.services.data_collector import data_collector
from src.services.disc_analyzer import disc_analyzer
from src.services.strategy_generator import strategy_generator
from src.services.opportunity_finder import opportunity_finder
from src.services.pdf_generator import pdf_generator


class HectorReadyOrchestrator:
    """
    Chef d'orchestre du workflow Hector Ready
    
    Coordonne les 5 services :
    1. DataCollector : Collecte multi-sources (Pappers + Brave)
    2. DISCAnalyzer : Analyse DISC (3 sources + fusion)
    3. StrategyGenerator : Stratégie adaptée au profil
    4. OpportunityFinder : Détection multiplicateurs
    5. PDFGenerator : Génération PDF 14 pages
    """
    
    def __init__(self):
        """Initialise l'orchestrateur avec les 5 services"""
        self.collector = data_collector
        self.disc_analyzer = disc_analyzer
        self.strategy_generator = strategy_generator
        self.opportunity_finder = opportunity_finder
        self.pdf_generator = pdf_generator
    
    def generate_rdv_preparation(
        self,
        rdv_info: Dict,
        output_dir: str = "outputs"
    ) -> Dict:
        """
        Génère la préparation RDV complète
        
        Args:
            rdv_info: Infos RDV (entreprise, contact, date, heure, lieu)
            output_dir: Répertoire de sortie pour le PDF
            
        Returns:
            Dict avec pdf_path, durée, statut de chaque étape
        """
        start_time = datetime.now()
        
        print("\n" + "=" * 70)
        print("🚀 HECTOR READY - Génération Préparation RDV")
        print("=" * 70)
        
        print(f"\n📋 RDV Information :")
        print(f"   Entreprise : {rdv_info.get('entreprise', 'N/A')}")
        print(f"   Contact : {rdv_info.get('contact_prenom', '')} {rdv_info.get('contact_nom', '')}")
        print(f"   Date : {rdv_info.get('date_rdv', 'N/A')} à {rdv_info.get('heure_rdv', 'N/A')}")
        print(f"   Lieu : {rdv_info.get('lieu', 'N/A')}")
        
        result = {
            "success": False,
            "pdf_path": None,
            "duration_seconds": 0,
            "steps": {}
        }
        
        # ÉTAPE 1 : Collecte multi-sources
        print(f"\n{'=' * 70}")
        print("ÉTAPE 1/5 : Collecte multi-sources (Pappers + Brave Search)")
        print("=" * 70)
        
        try:
            sources = self.collector.collect_all_sources(
                nom=rdv_info.get("contact_nom", ""),
                prenom=rdv_info.get("contact_prenom", ""),
                entreprise=rdv_info.get("entreprise", ""),
                secteur=rdv_info.get("secteur", ""),
                fonction=rdv_info.get("fonction", None)
            )
            
            result["steps"]["collecte"] = {
                "status": "success",
                "pappers_status": sources["pappers"]["status"],
                "web_results": sources["web"]["nb_results"]
            }
            
            print(f"  ✅ Collecte terminée")
            print(f"     - Pappers : {sources['pappers']['status']}")
            print(f"     - Web : {sources['web']['nb_results']} résultats")
            
        except Exception as e:
            print(f"  ❌ Erreur collecte : {e}")
            result["steps"]["collecte"] = {"status": "error", "error": str(e)}
            # Continuer avec données vides
            sources = {
                "pappers": {"status": "error"},
                "web": {"status": "error", "nb_results": 0, "formatted_text": ""}
            }
        
        # ÉTAPE 2 : Analyse DISC
        print(f"\n{'=' * 70}")
        print("ÉTAPE 2/5 : Analyse DISC (3 sources + fusion)")
        print("=" * 70)
        
        try:
            contact_name = f"{rdv_info.get('contact_prenom', '')} {rdv_info.get('contact_nom', '')}"
            
            disc_profile = self.disc_analyzer.analyze_full_disc(
                web_data=sources["web"].get("formatted_text", ""),
                nom=rdv_info.get("contact_nom", ""),
                prenom=rdv_info.get("contact_prenom", ""),
                entreprise=rdv_info.get("entreprise", ""),
                secteur=rdv_info.get("secteur", ""),
                fonction=rdv_info.get("fonction", None)
            )
            
            result["steps"]["disc_analysis"] = {
                "status": "success",
                "profil_dominant": disc_profile.get("profil_dominant"),
                "fiabilite": disc_profile.get("fiabilite")
            }
            
            print(f"  ✅ Analyse DISC terminée")
            print(f"     - Profil : {disc_profile['profil_dominant']} ({disc_profile['archetype']})")
            print(f"     - Fiabilité : {disc_profile['fiabilite']}%")
            print(f"     - Scores : D={disc_profile['scores']['D']}% I={disc_profile['scores']['I']}% S={disc_profile['scores']['S']}% C={disc_profile['scores']['C']}%")
            
        except Exception as e:
            print(f"  ❌ Erreur analyse DISC : {e}")
            result["steps"]["disc_analysis"] = {"status": "error", "error": str(e)}
            # Fallback profil générique
            disc_profile = {
                "profil_dominant": "D",
                "profil_secondaire": "I",
                "scores": {"D": 50, "I": 50, "S": 50, "C": 50},
                "fiabilite": 0,
                "archetype": "Profil Générique",
                "analyses_sources": []
            }
        
        # ÉTAPE 3 : Génération stratégie
        print(f"\n{'=' * 70}")
        print("ÉTAPE 3/5 : Génération stratégie adaptée")
        print("=" * 70)
        
        try:
            pappers_data = sources.get("pappers") if sources["pappers"]["status"] == "success" else None
            
            strategy = self.strategy_generator.generate_strategy(
                disc_profile=disc_profile,
                rdv_info=rdv_info,
                pappers_data=pappers_data
            )
            
            result["steps"]["strategy"] = {
                "status": "success",
                "nom": strategy.get("nom"),
                "duree": strategy.get("duree")
            }
            
            print(f"  ✅ Stratégie générée")
            print(f"     - Nom : {strategy['nom']}")
            print(f"     - Durée : {strategy['duree']}")
            print(f"     - Questions : {len(strategy.get('questions_ciblees', []))}")
            
        except Exception as e:
            print(f"  ❌ Erreur stratégie : {e}")
            result["steps"]["strategy"] = {"status": "error", "error": str(e)}
            # Fallback stratégie générique
            strategy = self.strategy_generator.generate_strategy(disc_profile, rdv_info, None)
        
        # ÉTAPE 4 : Détection opportunités
        print(f"\n{'=' * 70}")
        print("ÉTAPE 4/5 : Détection opportunités multiplicateurs")
        print("=" * 70)
        
        try:
            pappers_data = sources.get("pappers") if sources["pappers"]["status"] == "success" else None
            contact_name = f"{rdv_info.get('contact_prenom', '')} {rdv_info.get('contact_nom', '')}"
            
            opportunities = self.opportunity_finder.find_opportunities(
                pappers_data=pappers_data,
                contact_name=contact_name
            )
            
            result["steps"]["opportunities"] = {
                "status": "success",
                "multiplicateur": opportunities.get("multiplicateur"),
                "potentiel": opportunities.get("potentiel_total")
            }
            
            print(f"  ✅ Opportunités détectées")
            print(f"     - Multiplicateur : x{opportunities['multiplicateur']}")
            print(f"     - Potentiel : {opportunities['potentiel_total']} opportunité(s)")
            
        except Exception as e:
            print(f"  ❌ Erreur opportunités : {e}")
            result["steps"]["opportunities"] = {"status": "error", "error": str(e)}
            # Fallback sans opportunités
            opportunities = {
                "multiplicateur": 1,
                "opportunites": [],
                "potentiel_total": 0
            }
        
        # ÉTAPE 5 : Génération PDF
        print(f"\n{'=' * 70}")
        print("ÉTAPE 5/5 : Génération PDF 14 pages")
        print("=" * 70)
        
        try:
            # Créer nom fichier
            entreprise_slug = rdv_info.get("entreprise", "entreprise").replace(" ", "_").lower()
            date_slug = rdv_info.get("date_rdv", "").replace("/", "-")
            filename = f"preparation_rdv_{entreprise_slug}_{date_slug}.pdf"
            output_path = os.path.join(output_dir, filename)
            
            # Générer PDF
            pdf_path = self.pdf_generator.generate_pdf(
                output_path=output_path,
                rdv_info=rdv_info,
                pappers_data=sources.get("pappers") if sources["pappers"]["status"] == "success" else None,
                web_data=sources.get("web"),
                disc_profile=disc_profile,
                strategy=strategy,
                opportunities=opportunities
            )
            
            result["steps"]["pdf_generation"] = {
                "status": "success",
                "pdf_path": pdf_path
            }
            
            # Vérifier taille
            file_size = os.path.getsize(pdf_path) if os.path.exists(pdf_path) else 0
            
            print(f"  ✅ PDF généré")
            print(f"     - Chemin : {pdf_path}")
            print(f"     - Taille : {file_size / 1024:.1f} KB")
            
            result["success"] = True
            result["pdf_path"] = pdf_path
            
        except Exception as e:
            print(f"  ❌ Erreur génération PDF : {e}")
            result["steps"]["pdf_generation"] = {"status": "error", "error": str(e)}
            result["success"] = False
        
        # Durée totale
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        result["duration_seconds"] = duration
        
        # Résumé final
        print(f"\n{'=' * 70}")
        if result["success"]:
            print("✅ PRÉPARATION RDV TERMINÉE AVEC SUCCÈS")
        else:
            print("⚠️ PRÉPARATION RDV TERMINÉE AVEC ERREURS")
        print("=" * 70)
        
        print(f"\n📊 Résumé :")
        print(f"   Durée totale : {duration:.1f}s")
        print(f"   PDF généré : {result['pdf_path'] or 'NON'}")
        
        # Statut des étapes
        print(f"\n📋 Statut des étapes :")
        for step_name, step_data in result["steps"].items():
            status_icon = "✅" if step_data["status"] == "success" else "❌"
            print(f"   {status_icon} {step_name} : {step_data['status']}")
        
        print("=" * 70)
        
        return result


# Instance globale
hector_orchestrator = HectorReadyOrchestrator()
