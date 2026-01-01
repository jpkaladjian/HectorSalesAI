"""
Service 1 : DataCollector
Collecte données depuis Pappers et Brave Search avec fallback gracieux
"""
from typing import Dict, Optional, List
from src.integrations.pappers import pappers_api
from src.integrations.web_search import web_search
import json


class DataCollector:
    """Collecte toutes les données nécessaires pour préparer un RDV"""
    
    def __init__(self):
        self.pappers = pappers_api
        self.web = web_search
    
    def get_pappers_data(
        self, 
        nom: str, 
        prenom: str, 
        entreprise: str
    ) -> Dict:
        """
        Collecte données Pappers avec fallback gracieux
        
        Args:
            nom: Nom du dirigeant
            prenom: Prénom du dirigeant
            entreprise: Nom entreprise principale
            
        Returns:
            Dict avec données Pappers ou fallback si erreur/pas de résultat
        """
        print(f"[DataCollector] 🏢 Recherche Pappers : {prenom} {nom}...")
        
        try:
            entreprises = self.pappers.rechercher_dirigeant(nom, prenom)
            
            if not entreprises:
                print(f"[DataCollector] ⚠️ Pappers : Aucune entreprise trouvée")
                return {
                    "status": "no_data",
                    "entreprises": [],
                    "nb_entreprises": 0,
                    "message": "Aucune donnée Pappers disponible",
                    "entreprise_principale": entreprise
                }
            
            # Identifier l'entreprise principale
            entreprise_principale = None
            autres_entreprises = []
            
            for e in entreprises:
                if e.get("nom", "").lower() == entreprise.lower():
                    entreprise_principale = e
                else:
                    autres_entreprises.append(e)
            
            print(f"[DataCollector] ✅ Pappers : {len(entreprises)} entreprise(s) trouvée(s)")
            if entreprise_principale:
                print(f"[DataCollector]    - Entreprise principale : {entreprise_principale.get('nom')}")
            if autres_entreprises:
                print(f"[DataCollector]    - {len(autres_entreprises)} autre(s) entreprise(s) détectée(s)")
            
            return {
                "status": "success",
                "entreprises": entreprises,
                "entreprise_principale": entreprise_principale,
                "autres_entreprises": autres_entreprises,
                "nb_entreprises": len(entreprises),
                "multiplicateur": len(entreprises),
                "message": f"{len(entreprises)} entreprise(s) trouvée(s)"
            }
            
        except Exception as e:
            print(f"[DataCollector] ❌ Erreur Pappers : {e}")
            return {
                "status": "error",
                "entreprises": [],
                "nb_entreprises": 0,
                "error": str(e),
                "message": f"Erreur Pappers : {str(e)}",
                "entreprise_principale": entreprise
            }
    
    def get_web_data(
        self,
        nom: str,
        prenom: str,
        entreprise: str,
        fonction: Optional[str] = None
    ) -> Dict:
        """
        Collecte données web (Brave Search)
        
        Args:
            nom, prenom: Identité prospect
            entreprise: Nom entreprise
            fonction: Fonction du contact (optionnel)
            
        Returns:
            Dict avec résultats web formatés
        """
        print(f"[DataCollector] 🌐 Recherche web...")
        
        try:
            # Construction requête enrichie si fonction disponible
            if fonction:
                query = f"{prenom} {nom} {fonction} {entreprise}"
                print(f"[DataCollector]    Query enrichie : {query}")
            else:
                query = f"{prenom} {nom} {entreprise}"
            
            results = self.web.search(query, count=10)
            
            if not results:
                print(f"[DataCollector] ⚠️ Web : Aucun résultat")
                return {
                    "status": "no_data",
                    "results": [],
                    "nb_results": 0,
                    "formatted_text": "Aucune information web disponible.",
                    "message": "Aucun résultat web"
                }
            
            # Formater pour analyse DISC
            formatted_text = self._format_web_results(results[:5])
            
            print(f"[DataCollector] ✅ Web : {len(results)} résultat(s)")
            
            return {
                "status": "success",
                "results": results,
                "nb_results": len(results),
                "formatted_text": formatted_text,
                "top_results": results[:5],
                "message": f"{len(results)} résultat(s) web trouvé(s)"
            }
            
        except Exception as e:
            print(f"[DataCollector] ❌ Erreur Web Search : {e}")
            return {
                "status": "error",
                "results": [],
                "nb_results": 0,
                "formatted_text": f"Erreur recherche web : {str(e)}",
                "error": str(e),
                "message": f"Erreur web : {str(e)}"
            }
    
    def _format_web_results(self, results: List[Dict]) -> str:
        """Formate résultats web pour analyse DISC"""
        if not results:
            return "Aucune information web trouvée."
        
        formatted = ""
        for i, r in enumerate(results, 1):
            formatted += f"**Source {i}: {r.get('title', 'Sans titre')}**\n"
            formatted += f"{r.get('description', 'Pas de description')}\n"
            formatted += f"URL: {r.get('url', '')}\n\n"
        
        return formatted
    
    def collect_all_sources(
        self,
        nom: str,
        prenom: str,
        entreprise: str,
        secteur: str,
        fonction: Optional[str] = None
    ) -> Dict:
        """
        Collecte TOUTES les données en parallèle
        
        Args:
            nom, prenom: Identité prospect
            entreprise: Nom entreprise
            secteur: Secteur d'activité
            fonction: Fonction du contact (optionnel)
            
        Returns:
            Dict avec toutes les données collectées
        """
        print(f"\n[DataCollector] 🚀 Collecte complète pour {prenom} {nom}")
        print(f"[DataCollector]    Entreprise : {entreprise}")
        print(f"[DataCollector]    Secteur : {secteur}")
        if fonction:
            print(f"[DataCollector]    Fonction : {fonction}")
        
        # Collecte Pappers
        pappers_data = self.get_pappers_data(nom, prenom, entreprise)
        
        # Collecte Web
        web_data = self.get_web_data(nom, prenom, entreprise, fonction)
        
        # Résumé
        print(f"\n[DataCollector] 📊 Résumé collecte :")
        print(f"[DataCollector]    - Pappers : {pappers_data['status']} ({pappers_data['message']})")
        print(f"[DataCollector]    - Web : {web_data['status']} ({web_data['message']})")
        
        return {
            "prospect": {
                "nom": nom,
                "prenom": prenom,
                "entreprise": entreprise,
                "secteur": secteur,
                "fonction": fonction
            },
            "pappers": pappers_data,
            "web": web_data,
            "collection_complete": (
                pappers_data["status"] != "error" and 
                web_data["status"] != "error"
            ),
            "timestamp": self._get_timestamp()
        }
    
    def _get_timestamp(self) -> str:
        """Retourne timestamp formaté"""
        from datetime import datetime
        return datetime.now().isoformat()


# Instance globale
data_collector = DataCollector()
