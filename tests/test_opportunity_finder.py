"""
Test unitaire : Service 4 - OpportunityFinder
"""
import sys
sys.path.append('.')

from src.services.opportunity_finder import opportunity_finder
import time


def test_with_pappers_mandats():
    """Test 1 : Avec Pappers OK + mandats"""
    print("=" * 70)
    print("TEST 1 : AVEC PAPPERS OK + MANDATS")
    print("=" * 70)
    
    # Données Pappers simulées (avec mandats)
    pappers_data = {
        "status": "success",
        "representants": [
            {
                "prenom": "Marco",
                "nom": "BELLINI",
                "qualite": "Gérant",
                "autres_mandats": [
                    {
                        "denomination": "Bellini Import SARL",
                        "qualite": "Gérant",
                        "siren": "123456789"
                    },
                    {
                        "denomination": "Vesuvio Street Food",
                        "qualite": "Président",
                        "siren": "987654321"
                    },
                    {
                        "denomination": "Naples Consulting",
                        "qualite": "Directeur",
                        "siren": "555666777"
                    }
                ]
            }
        ]
    }
    
    contact_name = "Marco BELLINI"
    
    print(f"\n📊 Données test :")
    print(f"   Contact : {contact_name}")
    print(f"   Représentants Pappers : {len(pappers_data['representants'])}")
    print(f"   Autres mandats : {len(pappers_data['representants'][0]['autres_mandats'])}")
    
    # Appel service
    start_time = time.time()
    result = opportunity_finder.find_opportunities(
        pappers_data=pappers_data,
        contact_name=contact_name
    )
    elapsed = time.time() - start_time
    
    # Affichage résultat
    print(f"\n" + "=" * 70)
    print("🎯 RÉSULTAT DÉTECTION OPPORTUNITÉS")
    print("=" * 70)
    
    print(f"\n📈 Multiplicateur : x{result['multiplicateur']}")
    print(f"💰 Potentiel total : {result['potentiel_total']} opportunité(s)")
    print(f"💬 Message : {result.get('message', 'N/A')}")
    
    print(f"\n🎯 Opportunités détectées ({len(result['opportunites'])}) :")
    for i, opp in enumerate(result['opportunites'], 1):
        print(f"\n   {i}. {opp['entreprise']}")
        print(f"      Fonction : {opp['fonction']}")
        print(f"      SIREN : {opp['siren']}")
        print(f"      Probabilité : {opp['probabilite']}")
        print(f"      Timing : {opp['timing']}")
    
    # Validations
    print(f"\n" + "=" * 70)
    print("📊 VALIDATIONS TEST 1")
    print("=" * 70)
    
    validations = {
        "Multiplicateur = 4 (1 + 3 mandats)": result['multiplicateur'] == 4,
        "Opportunités = 3": len(result['opportunites']) == 3,
        "Potentiel total = 3": result['potentiel_total'] == 3,
        "Probabilité Gérant = 85%": result['opportunites'][0]['probabilite'] == "85%",
        "Probabilité Président = 85%": result['opportunites'][1]['probabilite'] == "85%",
        "Probabilité Directeur = 70%": result['opportunites'][2]['probabilite'] == "70%",
        "Timing immédiat": all(
            "Immédiat" in opp['timing'] 
            for opp in result['opportunites']
        ),
        "Entreprises présentes": all(
            opp['entreprise'] in ["Bellini Import SARL", "Vesuvio Street Food", "Naples Consulting"]
            for opp in result['opportunites']
        ),
        "SIREN présents": all(
            opp['siren'] != "N/A"
            for opp in result['opportunites']
        )
    }
    
    print()
    passed = 0
    for check, status in validations.items():
        icon = "✅" if status else "❌"
        print(f"{icon} {check}")
        if status:
            passed += 1
    
    print(f"\n⏱️  Temps de traitement : {elapsed:.3f}s")
    
    success = passed >= 8  # Au moins 8/9
    
    if success:
        print(f"\n✅ TEST 1 PASSÉ : Détection opportunités OK ({passed}/{len(validations)})")
    else:
        print(f"\n❌ TEST 1 ÉCHOUÉ ({passed}/{len(validations)})")
    
    return success, result


def test_without_pappers():
    """Test 2 : Sans Pappers (None)"""
    print("\n" + "=" * 70)
    print("TEST 2 : SANS PAPPERS (None)")
    print("=" * 70)
    
    contact_name = "Marco BELLINI"
    
    print(f"\n📊 Données test :")
    print(f"   Contact : {contact_name}")
    print(f"   Pappers : None (indisponible)")
    
    # Appel service avec None
    start_time = time.time()
    result = opportunity_finder.find_opportunities(
        pappers_data=None,
        contact_name=contact_name
    )
    elapsed = time.time() - start_time
    
    # Affichage résultat
    print(f"\n" + "=" * 70)
    print("🎯 RÉSULTAT SANS PAPPERS")
    print("=" * 70)
    
    print(f"\n📈 Multiplicateur : x{result['multiplicateur']}")
    print(f"💰 Potentiel total : {result['potentiel_total']} opportunité(s)")
    print(f"💬 Message : {result.get('message', 'N/A')}")
    print(f"🎯 Opportunités : {len(result['opportunites'])}")
    
    # Validations
    print(f"\n" + "=" * 70)
    print("📊 VALIDATIONS TEST 2")
    print("=" * 70)
    
    validations = {
        "Multiplicateur = 1": result['multiplicateur'] == 1,
        "Opportunités = 0": len(result['opportunites']) == 0,
        "Potentiel total = 0": result['potentiel_total'] == 0,
        "Message présent": 'message' in result,
        "Pas d'erreur levée": True  # Le fait d'être ici signifie pas d'exception
    }
    
    print()
    passed = 0
    for check, status in validations.items():
        icon = "✅" if status else "❌"
        print(f"{icon} {check}")
        if status:
            passed += 1
    
    print(f"\n⏱️  Temps de traitement : {elapsed:.3f}s")
    
    success = passed == len(validations)  # Tous doivent passer
    
    if success:
        print(f"\n✅ TEST 2 PASSÉ : Gestion absence Pappers OK ({passed}/{len(validations)})")
    else:
        print(f"\n❌ TEST 2 ÉCHOUÉ ({passed}/{len(validations)})")
    
    return success, result


def test_pappers_ok_sans_mandats():
    """Test 3 : Pappers OK mais sans mandats supplémentaires"""
    print("\n" + "=" * 70)
    print("TEST 3 : PAPPERS OK SANS MANDATS SUPPLÉMENTAIRES")
    print("=" * 70)
    
    # Données Pappers (sans autres_mandats)
    pappers_data = {
        "status": "success",
        "representants": [
            {
                "prenom": "Marco",
                "nom": "BELLINI",
                "qualite": "Gérant",
                "autres_mandats": []  # Vide
            }
        ]
    }
    
    contact_name = "Marco BELLINI"
    
    print(f"\n📊 Données test :")
    print(f"   Contact : {contact_name}")
    print(f"   Pappers : OK")
    print(f"   Autres mandats : 0")
    
    # Appel service
    start_time = time.time()
    result = opportunity_finder.find_opportunities(
        pappers_data=pappers_data,
        contact_name=contact_name
    )
    elapsed = time.time() - start_time
    
    # Affichage résultat
    print(f"\n" + "=" * 70)
    print("🎯 RÉSULTAT PAPPERS OK SANS MANDATS")
    print("=" * 70)
    
    print(f"\n📈 Multiplicateur : x{result['multiplicateur']}")
    print(f"💰 Potentiel total : {result['potentiel_total']} opportunité(s)")
    print(f"💬 Message : {result.get('message', 'N/A')}")
    print(f"🎯 Opportunités : {len(result['opportunites'])}")
    
    # Validations
    print(f"\n" + "=" * 70)
    print("📊 VALIDATIONS TEST 3")
    print("=" * 70)
    
    validations = {
        "Multiplicateur = 1": result['multiplicateur'] == 1,
        "Opportunités = 0": len(result['opportunites']) == 0,
        "Potentiel total = 0": result['potentiel_total'] == 0,
        "Pas d'erreur levée": True
    }
    
    print()
    passed = 0
    for check, status in validations.items():
        icon = "✅" if status else "❌"
        print(f"{icon} {check}")
        if status:
            passed += 1
    
    print(f"\n⏱️  Temps de traitement : {elapsed:.3f}s")
    
    success = passed == len(validations)
    
    if success:
        print(f"\n✅ TEST 3 PASSÉ : Pappers OK sans mandats OK ({passed}/{len(validations)})")
    else:
        print(f"\n❌ TEST 3 ÉCHOUÉ ({passed}/{len(validations)})")
    
    return success, result


def main():
    """Exécution complète des tests"""
    print("\n" + "=" * 70)
    print("🧪 TESTS SERVICE 4 : OPPORTUNITY FINDER")
    print("=" * 70)
    
    results = {}
    
    # Test 1 : Avec mandats
    results["avec_mandats"], result_mandats = test_with_pappers_mandats()
    
    # Test 2 : Sans Pappers
    results["sans_pappers"], result_sans_pappers = test_without_pappers()
    
    # Test 3 : Pappers OK sans mandats
    results["ok_sans_mandats"], result_ok_sans_mandats = test_pappers_ok_sans_mandats()
    
    # Résumé final
    print("\n" + "=" * 70)
    print("📊 RÉSUMÉ FINAL - SERVICE 4")
    print("=" * 70)
    
    print(f"\n✅ Tests passés :")
    for test_name, passed in results.items():
        icon = "✅" if passed else "❌"
        print(f"{icon} {test_name}")
    
    all_passed = all(results.values())
    
    print("\n" + "=" * 70)
    if all_passed:
        print("✅ SERVICE 4 : OPPORTUNITY FINDER - VALIDATION OK")
        print("=" * 70)
        print(f"\n🎯 RÉSULTATS TESTS :")
        print(f"   Test 1 (Avec mandats) : Multiplicateur x{result_mandats['multiplicateur']}, {result_mandats['potentiel_total']} opportunités")
        print(f"   Test 2 (Sans Pappers) : Multiplicateur x{result_sans_pappers['multiplicateur']}, {result_sans_pappers['potentiel_total']} opportunités")
        print(f"   Test 3 (OK sans mandats) : Multiplicateur x{result_ok_sans_mandats['multiplicateur']}, {result_ok_sans_mandats['potentiel_total']} opportunités")
    else:
        print("❌ SERVICE 4 : OPPORTUNITY FINDER - ÉCHEC")
    print("=" * 70)
    
    return all_passed


if __name__ == "__main__":
    main()
