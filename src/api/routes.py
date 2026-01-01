from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
from src.core.preparer_rdv import preparateur_rdv
from src.models.database import get_db
from src.models.prospect import Prospect
from src.models.rdv import RDV

router = APIRouter()

class PreparerRDVRequest(BaseModel):
    nom: str
    prenom: str
    entreprise: str
    secteur: str
    fonction: Optional[str] = None
    date_rdv: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "nom": "Dupont",
                "prenom": "Jean",
                "entreprise": "Carrefour Lyon Part-Dieu",
                "secteur": "Grande distribution",
                "fonction": "Responsable Sécurité",
                "date_rdv": "2025-10-25 10:00"
            }
        }

@router.post("/preparer-rdv", summary="Préparer un dossier RDV complet")
async def preparer_rdv_endpoint(request: PreparerRDVRequest):
    """
    Génère un dossier RDV complet avec :
    - Recherche web multi-sources (enrichie si fonction fournie)
    - Analyse profil DISC
    - Détection opportunités multi-entités (Pappers)
    - Recommandations personnalisées
    
    **Temps de génération :** ~15-20 secondes
    """
    try:
        dossier = preparateur_rdv.preparer(
            nom=request.nom,
            prenom=request.prenom,
            entreprise=request.entreprise,
            secteur=request.secteur,
            fonction=request.fonction,
            date_rdv=request.date_rdv
        )
        
        return {
            "success": True,
            "message": "Dossier RDV généré avec succès",
            "dossier": dossier
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la préparation du RDV : {str(e)}"
        )

@router.get("/health", summary="Vérifier l'état de l'API")
async def health_check():
    """Endpoint de santé pour monitoring"""
    return {
        "status": "healthy",
        "service": "Hector MVP API",
        "version": "1.0.0"
    }

@router.get("/prospects", summary="Liste tous les prospects")
async def list_prospects(
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Récupère la liste de tous les prospects"""
    prospects = db.query(Prospect).order_by(
        Prospect.created_at.desc()
    ).limit(limit).all()
    
    return {
        "success": True,
        "count": len(prospects),
        "prospects": [
            {
                "id": p.id,
                "nom": p.nom,
                "prenom": p.prenom,
                "entreprise": p.entreprise,
                "secteur": p.secteur,
                "fonction": p.fonction,
                "profil_disc": p.profil_disc,
                "created_at": p.created_at.isoformat() if p.created_at else None
            }
            for p in prospects
        ]
    }

@router.get("/rdvs", summary="Liste tous les RDV")
async def list_rdvs(
    limit: int = 50,
    statut: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Récupère la liste de tous les RDV"""
    query = db.query(RDV)
    
    if statut:
        query = query.filter(RDV.statut == statut)
    
    rdvs = query.order_by(RDV.created_at.desc()).limit(limit).all()
    
    return {
        "success": True,
        "count": len(rdvs),
        "rdvs": [
            {
                "id": rdv.id,
                "prospect_id": rdv.prospect_id,
                "date_rdv": rdv.date_rdv.isoformat() if rdv.date_rdv else None,
                "duree_prevue": rdv.duree_prevue,
                "statut": rdv.statut,
                "created_at": rdv.created_at.isoformat() if rdv.created_at else None
            }
            for rdv in rdvs
        ]
    }

@router.get("/rdvs/{rdv_id}", summary="Détails d'un RDV")
async def get_rdv(
    rdv_id: int,
    db: Session = Depends(get_db)
):
    """Récupère le détail complet d'un RDV"""
    rdv = db.query(RDV).filter(RDV.id == rdv_id).first()
    
    if not rdv:
        raise HTTPException(status_code=404, detail="RDV non trouvé")
    
    return {
        "success": True,
        "rdv": {
            "id": rdv.id,
            "prospect_id": rdv.prospect_id,
            "date_rdv": rdv.date_rdv.isoformat() if rdv.date_rdv else None,
            "lieu": rdv.lieu,
            "duree_prevue": rdv.duree_prevue,
            "statut": rdv.statut,
            "dossier_preparation": rdv.dossier_preparation,
            "compte_rendu": rdv.compte_rendu,
            "notes": rdv.notes,
            "score_opportunite": rdv.score_opportunite,
            "created_at": rdv.created_at.isoformat() if rdv.created_at else None,
            "updated_at": rdv.updated_at.isoformat() if rdv.updated_at else None
        }
    }
