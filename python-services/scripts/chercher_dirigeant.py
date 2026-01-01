import sys
sys.path.append('.')

from src.integrations.web_search import web_search
from src.integrations.pappers import pappers_api

print("🔍 RECHERCHE DIRIGEANT - Hellopharmacie La Verpillière")
print("="*60)

# ÉTAPE 1 : Recherche web
print("\n1️⃣ RECHERCHE WEB")
print("-"*60)
results_web = web_search.search("Hellopharmacie La Verpillière pharmacien titulaire", count=5)

if results_web:
    print(f"✅ {len(results_web)} résultats trouvés :\n")
    for i, r in enumerate(results_web, 1):
        print(f"{i}. {r['title']}")
        print(f"   {r['description'][:150]}...")
        print(f"   {r['url']}\n")
else:
    print("❌ Aucun résultat web")

# ÉTAPE 2 : Recherche Pappers par nom entreprise
print("\n2️⃣ RECHERCHE PAPPERS (par entreprise)")
print("-"*60)

# On va essayer de chercher avec le nom de la pharmacie
# Pappers peut chercher par nom d'entreprise et ville
print("Recherche : 'Hellopharmacie' + 'La Verpillière'...")

# Note : L'API Pappers recherche-dirigeants ne cherche que par nom de personne
# Mais on peut essayer une recherche générale
import requests
import os

try:
    url = "https://api.pappers.fr/v2/recherche"
    params = {
        "api_token": os.getenv("PAPPERS_API_KEY"),
        "q": "Hellopharmacie Verpillière",
        "code_commune": "38538"  # Code INSEE La Verpillière
    }
    
    response = requests.get(url, params=params, timeout=10)
    response.raise_for_status()
    data = response.json()
    
    if data.get("resultats"):
        print(f"✅ {len(data['resultats'])} entreprise(s) trouvée(s) :\n")
        for entreprise in data['resultats'][:3]:
            print(f"🏢 {entreprise.get('nom_entreprise')}")
            print(f"   SIRET : {entreprise.get('siret')}")
            print(f"   Adresse : {entreprise.get('siege', {}).get('adresse_ligne_1')}")
            
            # Récupérer les dirigeants
            dirigeants = entreprise.get('representants', [])
            if dirigeants:
                print(f"   👤 Dirigeants :")
                for d in dirigeants:
                    nom = d.get('nom', '')
                    prenom = d.get('prenom', '')
                    qualite = d.get('qualite', '')
                    print(f"      - {prenom} {nom} ({qualite})")
            print()
    else:
        print("⚠️ Aucune entreprise trouvée dans Pappers")
        
except Exception as e:
    print(f"❌ Erreur Pappers : {e}")

print("\n✅ RECHERCHE TERMINÉE")
print("="*60)
