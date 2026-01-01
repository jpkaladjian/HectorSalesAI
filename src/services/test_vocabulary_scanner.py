#!/usr/bin/env python3
"""Scanner automatique de conformité vocabulaire"""
import re
import sys
from pathlib import Path
from typing import List, Dict

sys.path.insert(0, str(Path(__file__).parent.parent))

FORBIDDEN_TERMS = {
    'client': 'entreprise',
    'clients': 'entreprises',
    'vendre': 'accompagner',
    'vente': 'accompagnement',
    'ventes': 'accompagnements',
    'vendeur': 'commercial',
    'vendeurs': 'commerciaux',
    'installer': 'déployer',
    'installation': 'déploiement',
    'installations': 'déploiements',
    'prix': 'investissement',
}

def scan_text(text: str) -> Dict:
    """Scanne un texte et retourne violations"""
    violations = []
    text_lower = text.lower()
    
    for forbidden, replacement in FORBIDDEN_TERMS.items():
        pattern = r'\b' + re.escape(forbidden) + r'\b'
        matches = list(re.finditer(pattern, text_lower, re.IGNORECASE))
        if matches:
            violations.append({
                'mot': forbidden,
                'remplacement': replacement,
                'occurrences': len(matches)
            })
    
    return {
        'total_violations': len(violations),
        'violations': violations,
        'score_conformite': 100 - (len(violations) * 10)
    }

print("\n🔍 SCANNER VOCABULAIRE ADS GROUP\n")

# Test sur exemple
test_text = """
Nous accompagnons l'entreprise dans le déploiement de sa solution de sécurité.
Notre investissement commercial est adapté aux besoins de chaque professionnel.
"""

result = scan_text(test_text)
print(f"Test sur exemple CONFORME:")
print(f"   Violations: {result['total_violations']}")
print(f"   Score: {result['score_conformite']}/100")

test_text_bad = """
Nous vendons au client une installation de caméras.
Le prix de vente est intéressant pour les clients professionnels.
"""

result_bad = scan_text(test_text_bad)
print(f"\nTest sur exemple NON-CONFORME:")
print(f"   Violations: {result_bad['total_violations']}")
for v in result_bad['violations']:
    print(f"   ❌ '{v['mot']}' → devrait être '{v['remplacement']}' ({v['occurrences']}x)")
print(f"   Score: {result_bad['score_conformite']}/100")

if result['total_violations'] == 0 and result_bad['total_violations'] > 0:
    print("\n✅ Scanner fonctionne correctement")
    sys.exit(0)
else:
    print("\n❌ Scanner a un problème")
    sys.exit(1)
