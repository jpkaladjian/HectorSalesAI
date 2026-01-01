#!/usr/bin/env python
"""Script pour tester l'API complète avec démarrage/arrêt automatique"""

import subprocess
import time
import requests
import json
import sys
import signal

def main():
    print("🚀 DÉMARRAGE API HECTOR MVP")
    print("="*70)
    
    # Démarrer l'API en arrière-plan
    print("⏳ Démarrage du serveur FastAPI sur port 5001...")
    api_process = subprocess.Popen(
        ["python", "main.py"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    
    # Attendre que l'API soit prête
    print("   Attente de la disponibilité de l'API...")
    max_retries = 15
    for i in range(max_retries):
        try:
            response = requests.get("http://localhost:5001/api/health", timeout=2)
            if response.status_code == 200:
                print("✅ API démarrée avec succès !\n")
                break
        except:
            time.sleep(1)
            if i == max_retries - 1:
                print("❌ Impossible de démarrer l'API")
                api_process.kill()
                sys.exit(1)
    
    try:
        # TEST 1: Health check
        print("1️⃣ TEST HEALTH CHECK")
        print("-"*70)
        response = requests.get("http://localhost:5001/api/health")
        if response.status_code == 200:
            print("✅ API accessible !")
            print(f"   {response.json()}\n")
        else:
            print(f"❌ Erreur {response.status_code}\n")
        
        # TEST 2: Préparation RDV
        print("2️⃣ TEST PRÉPARATION RDV")
        print("-"*70)
        print("Génération dossier pour Adeline LEJEUNE...")
        
        payload = {
            "nom": "LEJEUNE",
            "prenom": "Adeline",
            "entreprise": "Hellopharmacie La Verpillière",
            "secteur": "Pharmacie",
            "date_rdv": "2025-10-22 14:00"
        }
        
        response = requests.post(
            "http://localhost:5001/api/preparer-rdv",
            json=payload,
            timeout=40
        )
        
        if response.status_code == 200:
            data = response.json()
            dossier = data["dossier"]
            
            print("✅ Dossier RDV généré !\n")
            print(f"   Prospect : {dossier['prospect']['prenom']} {dossier['prospect']['nom']}")
            print(f"   Entreprise : {dossier['prospect']['entreprise']}")
            print(f"   Profil DISC : {dossier['analyse_disc']['profil_dominant']} ({dossier['analyse_disc']['scores'][dossier['analyse_disc']['profil_dominant']]}%)")
            print(f"   Opportunités : {dossier['opportunites_cachees']['nb_opportunites']}")
            
            # Sauvegarder
            with open('dossier_api_test.json', 'w', encoding='utf-8') as f:
                json.dump(dossier, f, indent=2, ensure_ascii=False)
            
            print(f"\n   💾 Dossier sauvegardé : dossier_api_test.json")
        else:
            print(f"❌ Erreur {response.status_code}")
            print(f"   {response.text}")
        
        print("\n" + "="*70)
        print("✅ TESTS API TERMINÉS")
        print("\n💡 Pour tester manuellement : http://localhost:5001/docs")
        
    finally:
        # Arrêter l'API
        print("\n🛑 Arrêt de l'API...")
        api_process.send_signal(signal.SIGTERM)
        api_process.wait(timeout=5)
        print("✅ API arrêtée proprement\n")

if __name__ == "__main__":
    main()
