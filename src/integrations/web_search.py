import requests
from typing import List, Dict
import os

class WebSearch:
    def __init__(self):
        self.api_key = os.getenv("BRAVE_SEARCH_API_KEY")
        self.base_url = "https://api.search.brave.com/res/v1/web/search"
    
    def search(self, query: str, count: int = 10) -> List[Dict]:
        """Recherche web avec Brave"""
        headers = {"X-Subscription-Token": self.api_key}
        params = {"q": query, "count": count}
        
        try:
            response = requests.get(
                self.base_url, 
                headers=headers, 
                params=params,
                timeout=10
            )
            response.raise_for_status()
            data = response.json()
            
            results = data.get("web", {}).get("results", [])
            formatted = []
            
            for r in results:
                formatted.append({
                    "title": r.get("title"),
                    "description": r.get("description"),
                    "url": r.get("url"),
                    "age": r.get("age")
                })
            
            return formatted
        
        except Exception as e:
            print(f"❌ Erreur Brave Search: {e}")
            return []
    
    def search_prospect(self, nom: str, prenom: str, entreprise: str) -> List[Dict]:
        """Recherche spécifique pour un prospect"""
        query = f"{prenom} {nom} {entreprise}"
        return self.search(query, count=10)

web_search = WebSearch()
