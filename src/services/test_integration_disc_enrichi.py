#!/usr/bin/env python3
"""
Test d'intégration : Pipeline complet avec DISC enrichi (Web + LinkedIn + Facebook)
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from orchestrator import HectorReadyOrchestratorFixed, RDVInfo

def test_disc_enrichi():
    """
    Test complet avec analyse DISC enrichie
    """
    
    print("\n" + "🧪"*40)
    print("TEST D'INTÉGRATION : ANALYSE DISC ENRICHIE")
    print("🧪"*40)
    
    # Créer RDV test (Pizza Delice)
    rdv = RDVInfo(
        entreprise="PIZZA DELICE",
        contact_nom="BELLINI",
        contact_prenom="Marco",
        date_rdv="31/10/2025",
        heure_rdv="13:20",
        lieu="7 avenue Alsace Lorraine, BOURGOIN-JALLIEU",
        secteur="Restauration",
        ville="BOURGOIN-JALLIEU",
        code_postal="38300"
    )
    
    # Initialiser orchestrateur
    print("\n📦 Initialisation orchestrateur...")
    orchestrator = HectorReadyOrchestratorFixed()
    
    # Lancer génération
    print("\n🚀 Lancement pipeline enrichi...")
    result = orchestrator.generate_rdv_preparation(rdv)
    
    # Vérifications
    print("\n" + "="*60)
    print("VÉRIFICATIONS POST-GÉNÉRATION")
    print("="*60)
    
    disc_profile = result['steps']['disc_profile']
    
    # Vérification 1 : Profil fusionné présent
    assert 'profil_final' in disc_profile, "❌ profil_final manquant"
    print(f"✅ Profil final : {disc_profile['profil_final']}")
    
    # Vérification 2 : Fiabilité globale
    assert 'fiabilite_globale' in disc_profile, "❌ fiabilite_globale manquante"
    print(f"✅ Fiabilité globale : {disc_profile['fiabilite_globale']}%")
    
    # Vérification 3 : Sources utilisées
    assert 'sources_utilisees' in disc_profile, "❌ sources_utilisees manquantes"
    print(f"✅ Sources utilisées : {', '.join(disc_profile['sources_utilisees']).upper()}")
    
    # Vérification 4 : Archétype personnalisé
    assert 'archetype' in disc_profile, "❌ archetype manquant"
    print(f"✅ Archétype : {disc_profile['archetype']}")
    
    # Vérification 5 : Scores finaux
    assert 'scores_finaux' in disc_profile, "❌ scores_finaux manquants"
    scores = disc_profile['scores_finaux']
    print(f"✅ Scores : D={scores['D']}% I={scores['I']}% S={scores['S']}% C={scores['C']}%")
    
    # Vérification 6 : Détails sources
    assert 'sources_details' in disc_profile, "❌ sources_details manquants"
    print(f"✅ Détails sources disponibles")
    
    # Vérification 7 : Révélation (optionnel)
    if disc_profile.get('revelation'):
        print(f"✅ Révélation : {disc_profile['revelation']}")
    
    # Vérification 8 : Indices par source
    assert 'indices_par_source' in disc_profile, "❌ indices_par_source manquants"
    indices = disc_profile['indices_par_source']
    print(f"✅ Indices par source :")
    for source, data in indices.items():
        if isinstance(data, dict):
            print(f"   - {source.upper()} : {sum(len(v) if isinstance(v, list) else 1 for v in data.values())} éléments")
        else:
            print(f"   - {source.upper()} : {len(data) if isinstance(data, list) else 'N/A'}")
    
    # Vérification 9 : PDF généré
    assert result['success'], "❌ Génération PDF échouée"
    assert result['pdf_path'], "❌ Chemin PDF manquant"
    print(f"✅ PDF généré : {result['pdf_path']}")
    
    # Vérification 10 : Compatibilité PDF (métadonnées)
    assert 'profil_dominant_lettre' in disc_profile, "❌ profil_dominant_lettre manquant"
    assert 'scores' in disc_profile, "❌ scores manquant (alias)"
    assert 'fiabilite' in disc_profile, "❌ fiabilite manquante (alias)"
    print(f"✅ Métadonnées PDF compatibles")
    
    print("\n" + "="*60)
    print("✅ TOUS LES TESTS PASSÉS")
    print("="*60)
    
    # Résumé final
    print(f"\n📊 RÉSUMÉ :")
    print(f"   - Profil : {disc_profile['profil_final']} ({disc_profile['archetype']})")
    print(f"   - Fiabilité : {disc_profile['fiabilite_globale']}%")
    print(f"   - Sources : {len(disc_profile['sources_utilisees'])}")
    print(f"   - PDF : {os.path.basename(result['pdf_path'])}")
    
    return result


if __name__ == "__main__":
    try:
        result = test_disc_enrichi()
        print("\n🎉 TEST D'INTÉGRATION RÉUSSI\n")
        sys.exit(0)
    except AssertionError as e:
        print(f"\n❌ ÉCHEC TEST : {e}\n")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ ERREUR : {e}\n")
        import traceback
        traceback.print_exc()
        sys.exit(1)
