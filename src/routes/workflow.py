"""
Routes pour l'automatisation des workflows
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import logging

from src.utils.document_generator import create_workflow_documents

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/workflow", tags=["Workflow"])


class WorkflowDocumentRequest(BaseModel):
    rdv: Dict[str, Any]
    prospect: Optional[Dict[str, Any]] = None
    opportunity: Optional[Dict[str, Any]] = None
    action: Optional[Dict[str, Any]] = None
    user_email: Optional[str] = None
    send_email: bool = False


@router.post("/generate-documents")
async def generate_workflow_documents(request: WorkflowDocumentRequest):
    """
    Génère tous les documents pour un workflow RDV :
    - PDF du dossier complet
    - Fichier iCalendar (.ics)
    - Email de confirmation (optionnel)
    
    Returns:
        Dict contenant les chemins des fichiers générés et le statut de l'envoi
    """
    try:
        logger.info(f"[WORKFLOW] Génération documents pour RDV: {request.rdv.get('titre', 'Sans titre')}")
        
        result = create_workflow_documents(
            rdv=request.rdv,
            prospect=request.prospect,
            opportunity=request.opportunity,
            action=request.action,
            user_email=request.user_email,
            send_email=request.send_email
        )
        
        logger.info(f"[WORKFLOW] Documents générés - PDF: {result['pdf_path']}, iCal: {result['ical_path']}, Email: {result['email_sent']}")
        
        return result
        
    except Exception as e:
        logger.error(f"[WORKFLOW] Erreur lors de la génération des documents: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la génération des documents: {str(e)}"
        )
