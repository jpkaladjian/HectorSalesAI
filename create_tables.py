import sys
sys.path.append('.')

from src.models.database import engine, Base
from src.models.prospect import Prospect
from src.models.rdv import RDV

print("🗄️ CRÉATION DES TABLES")
print("="*60)

Base.metadata.create_all(bind=engine)

print("✅ Tables créées avec succès :")
print("   - prospects")
print("   - rdvs")
print("\n💾 Base de données : hector.db")
