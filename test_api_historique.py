#!/usr/bin/env python
"""Test des endpoints API d'historique"""

import subprocess
import time
import requests
import json
import sys
import signal

def main():
    print("🧪 TEST API HISTORIQUE (PERSISTANCE)")
    print("="*70)
    
    # Démarrer l'API
    print("⏳ Démarrage API...")
    api_process = subprocess.Popen(
        ["python", "main.py"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    
    # Attendre que l'API soit prête
    for i in range(15):
        try:
            response = requests.get("http://localhost:5001/api/health", timeout=2)
            if response.status_code == 200:
                print("✅ API démarrée !\n")
                break
        except:
            time.sleep(1)
    
    try:
        # TEST 1: Liste des prospects
        print("1️⃣ TEST GET /api/prospects")
        print("-"*70)
        
        response = requests.get("http://localhost:5001/api/prospects")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ {data['count']} prospect(s) trouvé(s)")
            if data['count'] > 0:
                for p in data['prospects']:
                    print(f"   - {p['prenom']} {p['nom']} ({p['entreprise']})")
        else:
            print(f"❌ Erreur {response.status_code}")
        
        # TEST 2: Liste des RDV
        print("\n2️⃣ TEST GET /api/rdvs")
        print("-"*70)
        
        response = requests.get("http://localhost:5001/api/rdvs")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ {data['count']} RDV trouvé(s)")
            if data['count'] > 0:
                rdv_id = data['rdvs'][0]['id']
                print(f"   - RDV ID: {rdv_id}")
                print(f"   - Date: {data['rdvs'][0]['date_rdv']}")
                print(f"   - Statut: {data['rdvs'][0]['statut']}")
                
                # TEST 3: Détail d'un RDV
                print(f"\n3️⃣ TEST GET /api/rdvs/{rdv_id}")
                print("-"*70)
                
                response = requests.get(f"http://localhost:5001/api/rdvs/{rdv_id}")
                if response.status_code == 200:
                    data = response.json()
                    rdv = data['rdv']
                    print(f"✅ RDV trouvé !")
                    print(f"   Prospect ID: {rdv['prospect_id']}")
                    print(f"   Date: {rdv['date_rdv']}")
                    print(f"   Durée: {rdv['duree_prevue']}")
                    print(f"   Statut: {rdv['statut']}")
                    
                    if rdv.get('dossier_preparation'):
                        dossier = rdv['dossier_preparation']
                        print(f"\n   📄 Dossier de préparation:")
                        print(f"      Prospect: {dossier['prospect']['prenom']} {dossier['prospect']['nom']}")
                        print(f"      Fonction: {dossier['prospect']['fonction']}")
                        print(f"      Profil DISC: {dossier['analyse_disc']['profil_dominant']}")
                else:
                    print(f"❌ Erreur {response.status_code}")
        else:
            print(f"❌ Erreur {response.status_code}")
        
        print("\n" + "="*70)
        print("✅ TESTS API HISTORIQUE TERMINÉS")
        print("\n📚 Documentation complète : http://localhost:5001/docs")
        
    finally:
        print("\n🛑 Arrêt de l'API...")
        api_process.send_signal(signal.SIGTERM)
        api_process.wait(timeout=5)
        print("✅ API arrêtée\n")

if __name__ == "__main__":
    main()
