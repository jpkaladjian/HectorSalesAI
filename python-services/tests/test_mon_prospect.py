import sys
sys.path.append('.')

from src.core.preparer_rdv import preparateur_rdv
import json

print("🧪 TEST PROSPECT RÉEL - Hellopharmacie La Verpillière")
print("="*70)

dossier = preparateur_rdv.preparer(
    nom="LEJEUNE",
    prenom="Adeline",
    entreprise="Hellopharmacie La Verpillière",
    secteur="Pharmacie",
    date_rdv="2025-10-22 14:00"
)

# Affichage formaté
print(f"\n📄 DOSSIER RDV GÉNÉRÉ")
print("="*70)
print(f"\n👤 PROSPECT")
print(f"   Nom : {dossier['prospect']['prenom']} {dossier['prospect']['nom']}")
print(f"   Entreprise : {dossier['prospect']['entreprise']}")
print(f"   Secteur : {dossier['prospect']['secteur']}")
print(f"   📍 530 Rue de la République, 38290 La Verpillière")
print(f"   📞 04 74 94 00 14")

print(f"\n📅 RDV")
print(f"   Date : {dossier['rdv']['date']}")
print(f"   Durée : {dossier['rdv']['duree_recommandee']}")

disc = dossier['analyse_disc']
print(f"\n🎨 PROFIL DISC")
print(f"   Dominant : {disc['profil_dominant']} ({disc['scores'][disc['profil_dominant']]}%)")
print(f"   🔴 ROUGE : {disc['scores']['ROUGE']}%")
print(f"   🟡 JAUNE : {disc['scores']['JAUNE']}%")
print(f"   🟢 VERT : {disc['scores']['VERT']}%")
print(f"   🔵 BLEU : {disc['scores']['BLEU']}%")
print(f"   Fiabilité : {disc['fiabilite']}%")
print(f"\n   💡 {disc['justification']}")
print(f"\n   🎯 Approche : {disc['approche_commerciale']}")

print(f"\n💬 VOCABULAIRE RECOMMANDÉ")
for mot in disc['vocabulaire_recommande']:
    print(f"   ✅ {mot}")

opps = dossier['opportunites_cachees']
print(f"\n💎 OPPORTUNITÉS CACHÉES")
print(f"   {opps['message']}")
if opps['nb_opportunites'] > 0:
    for opp in opps['liste']:
        print(f"\n   🏢 {opp['entreprise']}")
        print(f"      Fonction : {opp['fonction']}")
        print(f"      Potentiel : {opp['potentiel']}")

print(f"\n📚 SOURCES WEB ({len(dossier['sources_web'])} sources)")
for i, s in enumerate(dossier['sources_web'][:3], 1):
    print(f"   {i}. {s['titre'][:60]}...")

print(f"\n✅ Dossier généré le {dossier['generated_at']}")
print("="*70)

# Sauvegarder en JSON
with open('dossier_hellopharmacie.json', 'w', encoding='utf-8') as f:
    json.dump(dossier, f, indent=2, ensure_ascii=False)

print("\n💾 Dossier sauvegardé : dossier_hellopharmacie.json")
