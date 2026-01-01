import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { 
  Plus, 
  Search, 
  Calendar,
  Trash2,
  Edit,
  User,
  MapPin,
  Clock,
  FileText,
  Sparkles,
  Download,
  Loader2,
  CheckCircle2,
  Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { NavigationBar } from "@/components/NavigationBar";
import type { Rdv, Prospect } from "@shared/schema";
import { format, isPast, isFuture, isToday } from "date-fns";
import { fr } from "date-fns/locale";

export default function Rdvs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingRdv, setEditingRdv] = useState<Rdv | null>(null);
  const [preparingRdvId, setPreparingRdvId] = useState<string | null>(null);
  const [prefilledProspectId, setPrefilledProspectId] = useState<string | null>(null);
  const { toast } = useToast();
  const [location, setLocation] = useLocation();

  // PHASE 4: Detect prospectId in URL params and auto-open dialog
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const prospectIdFromUrl = params.get('prospectId');
    
    if (prospectIdFromUrl) {
      console.log('[RDV PREFILL] prospectId détecté dans URL:', prospectIdFromUrl);
      setPrefilledProspectId(prospectIdFromUrl);
      setIsCreateDialogOpen(true);
      
      // Clean URL after opening dialog
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [location]);

  const { data: rdvs = [], isLoading } = useQuery<Rdv[]>({
    queryKey: ["/api/crm/rdvs"],
  });

  const { data: prospects = [] } = useQuery<Prospect[]>({
    queryKey: ["/api/crm/prospects"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<Rdv>) => {
      return await apiRequest("POST", "/api/crm/rdvs", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/rdvs"] });
      
      // Show toast before closing dialog to ensure it renders
      toast({
        title: "RDV créé",
        description: "Le rendez-vous a été ajouté avec succès",
      });
      
      // Close dialog after a small delay to allow toast to render
      setTimeout(() => {
        setIsCreateDialogOpen(false);
      }, 100);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Rdv> }) => {
      return await apiRequest("PATCH", `/api/crm/rdvs/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/rdvs"] });
      setEditingRdv(null);
      toast({
        title: "RDV mis à jour",
        description: "Les modifications ont été enregistrées",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/crm/rdvs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/rdvs"] });
      toast({
        title: "RDV supprimé",
        description: "Le rendez-vous a été supprimé avec succès",
      });
    },
  });

  const prepareRdvMutation = useMutation({
    mutationFn: async (rdvId: string) => {
      setPreparingRdvId(rdvId); // Set loading state
      return await apiRequest("POST", `/api/workflow/prepare-rdv/${rdvId}`);
    },
    onSuccess: (data: any) => {
      setPreparingRdvId(null); // Clear loading state
      
      // Invalidate RDV cache to update UI with new pdfPath and pdfGeneratedAt
      queryClient.invalidateQueries({ queryKey: ["/api/crm/rdvs"] });
      
      if (data.pdfBuffer) {
        // Convertir le base64 en blob et télécharger
        const byteCharacters = atob(data.pdfBuffer);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        // Extract filename from pdfPath returned by API
        const fileName = data.pdfPath?.split('/').pop() || `preparation_rdv_${data.preparationId}.pdf`;
        link.download = fileName;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        // Check for partial errors
        const hasErrors = data.erreurs && Object.keys(data.erreurs).length > 0;
        if (hasErrors) {
          toast({
            title: "Préparation partielle générée",
            description: "Le PDF a été téléchargé mais certaines données n'ont pas pu être récupérées",
          });
        } else {
          toast({
            title: "Préparation RDV générée",
            description: "Le PDF a été téléchargé avec succès",
          });
        }
      } else {
        // No PDF generated - show error details
        const errorMessages = [];
        if (data.erreurs?.pappers) errorMessages.push("Pappers: " + data.erreurs.pappers);
        if (data.erreurs?.braveSearch) errorMessages.push("Recherche web: " + data.erreurs.braveSearch);
        if (data.erreurs?.claudeDisc) errorMessages.push("Analyse DISC: " + data.erreurs.claudeDisc);
        if (data.erreurs?.pdfGeneration) errorMessages.push("PDF: " + data.erreurs.pdfGeneration);
        
        toast({
          title: "Erreur de préparation",
          description: errorMessages.join(" | ") || "Impossible de générer le dossier de préparation",
          variant: "destructive"
        });
      }
    },
    onError: (error: any) => {
      setPreparingRdvId(null); // Clear loading state on error
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la préparation du RDV",
        variant: "destructive"
      });
    },
  });

  const downloadExistingPDF = (rdv: Rdv) => {
    // Download existing PDF from dossierPreparation
    if (rdv.dossierPreparation && (rdv.dossierPreparation as any).pdfBase64) {
      const pdfBase64 = (rdv.dossierPreparation as any).pdfBase64;
      const byteCharacters = atob(pdfBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Use the stored PDF filename or fallback to default
      const fileName = rdv.pdfPath?.split('/').pop() || `preparation_rdv_${rdv.id}.pdf`;
      link.download = fileName;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "PDF téléchargé",
        description: "Le dossier de préparation a été téléchargé",
      });
    }
  };

  const generatePDF = (rdv: Rdv) => {
    const prospect = prospects.find(p => p.id === rdv.prospectId);
    
    // Créer le contenu du PDF en HTML
    const pdfContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Compte-rendu RDV - ${prospect?.nom || 'Prospect'}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #1e3a5f; padding-bottom: 20px; }
          .logo { font-size: 28px; font-weight: bold; color: #1e3a5f; margin-bottom: 10px; }
          .title { font-size: 22px; margin: 20px 0; color: #333; }
          .info { margin: 30px 0; }
          .info-row { margin: 10px 0; display: flex; }
          .info-label { font-weight: bold; width: 150px; color: #555; }
          .info-value { flex: 1; }
          .section { margin: 30px 0; }
          .section-title { font-size: 18px; font-weight: bold; color: #1e3a5f; margin-bottom: 10px; border-bottom: 2px solid #e0e0e0; padding-bottom: 5px; }
          .content { background: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 10px; white-space: pre-wrap; }
          .footer { margin-top: 50px; text-align: center; color: #777; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">HECTOR - ADS GROUP</div>
          <div class="title">Compte-rendu de rendez-vous</div>
        </div>
        
        <div class="info">
          <div class="info-row">
            <span class="info-label">Prospect:</span>
            <span class="info-value">${prospect?.nom || 'N/A'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Date:</span>
            <span class="info-value">${rdv.dateRdv ? format(new Date(rdv.dateRdv), "dd MMMM yyyy 'à' HH:mm", { locale: fr }) : 'N/A'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Lieu:</span>
            <span class="info-value">${rdv.lieu || 'Non précisé'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Type:</span>
            <span class="info-value">${rdv.type || 'N/A'}</span>
          </div>
        </div>

        ${rdv.objectif ? `
        <div class="section">
          <div class="section-title">Objectif du rendez-vous</div>
          <div class="content">${rdv.objectif}</div>
        </div>
        ` : ''}

        ${rdv.compteRendu ? `
        <div class="section">
          <div class="section-title">Compte-rendu</div>
          <div class="content">${rdv.compteRendu}</div>
        </div>
        ` : ''}

        ${rdv.prochainesEtapes ? `
        <div class="section">
          <div class="section-title">Prochaines étapes</div>
          <div class="content">${rdv.prochainesEtapes}</div>
        </div>
        ` : ''}

        <div class="footer">
          <p>Document généré par Hector - ADS GROUP CRM</p>
          <p>Date de génération: ${format(new Date(), "dd/MM/yyyy 'à' HH:mm", { locale: fr })}</p>
        </div>
      </body>
      </html>
    `;

    // Ouvrir le contenu dans une nouvelle fenêtre pour impression
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(pdfContent);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }

    toast({
      title: "PDF généré",
      description: "Le compte-rendu est prêt à être imprimé",
    });
  };

  const filteredRdvs = rdvs
    .filter(rdv => {
      const prospect = prospects.find(p => p.id === rdv.prospectId);
      return searchQuery === "" || 
        prospect?.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rdv.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rdv.lieu?.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => {
      if (!a.dateRdv || !b.dateRdv) return 0;
      return new Date(b.dateRdv).getTime() - new Date(a.dateRdv).getTime();
    });

  const upcomingRdvs = filteredRdvs.filter(r => 
    r.dateRdv && (isToday(new Date(r.dateRdv)) || isFuture(new Date(r.dateRdv)))
  );
  const pastRdvs = filteredRdvs.filter(r => 
    r.dateRdv && isPast(new Date(r.dateRdv)) && !isToday(new Date(r.dateRdv))
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Rendez-vous</h1>
              <p className="text-sm text-primary-foreground/80">Planifie et suit tes RDVs</p>
            </div>
            <div className="flex items-center gap-2">
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="secondary" data-testid="button-create-rdv">
                    <Plus className="h-4 w-4 mr-2" />
                    Nouveau RDV
                  </Button>
                </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Créer un rendez-vous</DialogTitle>
                </DialogHeader>
                <RdvForm
                  onSubmit={(data) => createMutation.mutate(data)}
                  prospects={prospects}
                  isPending={createMutation.isPending}
                  prefilledProspectId={prefilledProspectId}
                />
              </DialogContent>
            </Dialog>
            <NavigationBar showHomeButton={true} />
          </div>
        </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher un rendez-vous..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-rdvs"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            Chargement des rendez-vous...
          </div>
        ) : filteredRdvs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? "Aucun rendez-vous trouvé" : "Aucun rendez-vous planifié"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Upcoming RDVs */}
            {upcomingRdvs.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  À venir ({upcomingRdvs.length})
                </h2>
                <div className="grid gap-3">
                  {upcomingRdvs.map((rdv) => (
                    <RdvCard
                      key={rdv.id}
                      rdv={rdv}
                      prospects={prospects}
                      onEdit={setEditingRdv}
                      onDelete={(id) => deleteMutation.mutate(id)}
                      onGeneratePDF={generatePDF}
                      onPrepareRdv={(rdvId) => prepareRdvMutation.mutate(rdvId)}
                      onDownloadPDF={downloadExistingPDF}
                      preparingRdvId={preparingRdvId}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Past RDVs */}
            {pastRdvs.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-muted-foreground">
                  Passés ({pastRdvs.length})
                </h2>
                <div className="grid gap-3">
                  {pastRdvs.map((rdv) => (
                    <RdvCard
                      key={rdv.id}
                      rdv={rdv}
                      prospects={prospects}
                      onEdit={setEditingRdv}
                      onDelete={(id) => deleteMutation.mutate(id)}
                      onGeneratePDF={generatePDF}
                      onPrepareRdv={(rdvId) => prepareRdvMutation.mutate(rdvId)}
                      onDownloadPDF={downloadExistingPDF}
                      preparingRdvId={preparingRdvId}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Edit Dialog */}
      {editingRdv && (
        <Dialog open={!!editingRdv} onOpenChange={(open) => !open && setEditingRdv(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Modifier le rendez-vous</DialogTitle>
            </DialogHeader>
            <RdvForm
              initialData={editingRdv}
              onSubmit={(data) => updateMutation.mutate({ id: editingRdv.id, data })}
              prospects={prospects}
              isPending={updateMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function RdvCard({
  rdv,
  prospects,
  onEdit,
  onDelete,
  onGeneratePDF,
  onPrepareRdv,
  onDownloadPDF,
  preparingRdvId,
}: {
  rdv: Rdv;
  prospects: Prospect[];
  onEdit: (rdv: Rdv) => void;
  onDelete: (id: string) => void;
  onGeneratePDF: (rdv: Rdv) => void;
  onPrepareRdv: (rdvId: string) => void;
  onDownloadPDF: (rdv: Rdv) => void;
  preparingRdvId: string | null;
}) {
  const prospect = prospects.find(p => p.id === rdv.prospectId);
  const isPastRdv = rdv.dateRdv && isPast(new Date(rdv.dateRdv)) && !isToday(new Date(rdv.dateRdv));

  return (
    <Card data-testid={`card-rdv-${rdv.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <CardTitle className="text-lg">
                {prospect?.prenom && `${prospect.prenom} `}
                {prospect?.nom ? prospect.nom.toUpperCase() : "Prospect inconnu"}
              </CardTitle>
              {rdv.type && (
                <Badge variant="outline" className="capitalize">
                  {rdv.type}
                </Badge>
              )}
            </div>
            
            {prospect?.enseigneCommerciale && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Building2 className="h-4 w-4" />
                <span className="font-medium">{prospect.enseigneCommerciale}</span>
              </div>
            )}
            
            {rdv.dateRdv && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{format(new Date(rdv.dateRdv), "dd MMMM yyyy 'à' HH:mm", { locale: fr })}</span>
              </div>
            )}
            {rdv.lieu && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <MapPin className="h-4 w-4" />
                <span>{rdv.lieu}</span>
              </div>
            )}
            
            {rdv.createdAt && (
              <div className="text-xs text-muted-foreground/60 mt-2">
                Créé le {format(new Date(rdv.createdAt), "dd/MM/yyyy", { locale: fr })}
              </div>
            )}
          </div>
          <div className="flex gap-1 shrink-0">
            {rdv.pdfPath ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDownloadPDF(rdv)}
                title="Télécharger le dossier de préparation PDF"
                data-testid={`button-download-pdf-${rdv.id}`}
              >
                <Download className="h-4 w-4 text-primary" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onPrepareRdv(rdv.id)}
                title={preparingRdvId === rdv.id ? "Génération en cours..." : "Préparer RDV (Recherche automatique + PDF)"}
                data-testid={`button-prepare-${rdv.id}`}
                disabled={preparingRdvId === rdv.id}
                className="bg-orange-500 hover:bg-orange-600 text-white disabled:bg-orange-300"
              >
                {preparingRdvId === rdv.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onGeneratePDF(rdv)}
              title="Générer compte-rendu PDF"
              data-testid={`button-pdf-${rdv.id}`}
            >
              <FileText className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(rdv)}
              data-testid={`button-edit-${rdv.id}`}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(rdv.id)}
              data-testid={`button-delete-${rdv.id}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {rdv.objectif && (
          <div>
            <p className="text-sm font-medium mb-1">Objectif</p>
            <p className="text-sm text-muted-foreground">{rdv.objectif}</p>
          </div>
        )}
        {rdv.compteRendu && (
          <div>
            <p className="text-sm font-medium mb-1">Compte-rendu</p>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{rdv.compteRendu}</p>
          </div>
        )}
        {rdv.prochainesEtapes && (
          <div>
            <p className="text-sm font-medium mb-1">Prochaines étapes</p>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{rdv.prochainesEtapes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RdvForm({
  initialData,
  onSubmit,
  prospects,
  isPending,
  prefilledProspectId,
}: {
  initialData?: Rdv;
  onSubmit: (data: Partial<Rdv>) => void;
  prospects: Prospect[];
  isPending: boolean;
  prefilledProspectId?: string | null;
}) {
  // Valeur par défaut pour dateRdv : demain à 14h00
  const getDefaultDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(14, 0, 0, 0);
    return format(tomorrow, "yyyy-MM-dd'T'HH:mm");
  };

  const [formData, setFormData] = useState({
    type: initialData?.type || "presentiel",
    prospectId: initialData?.prospectId || prefilledProspectId || "",
    dateRdv: initialData?.dateRdv 
      ? format(new Date(initialData.dateRdv), "yyyy-MM-dd'T'HH:mm")
      : getDefaultDate(),
    lieu: initialData?.lieu || "",
    objectif: initialData?.objectif || "",
    compteRendu: initialData?.compteRendu || "",
    prochainesEtapes: initialData?.prochainesEtapes || "",
  });
  
  const [prospectData, setProspectData] = useState<any>(null);
  const [isLoadingProspect, setIsLoadingProspect] = useState(false);
  const { toast } = useToast();

  // PHASE 4: Load prospect data for pre-filling when prefilledProspectId is provided
  useEffect(() => {
    if (prefilledProspectId && !initialData) {
      loadProspectDataForRdv(prefilledProspectId);
    }
  }, [prefilledProspectId]);

  async function loadProspectDataForRdv(prospectId: string) {
    setIsLoadingProspect(true);
    
    try {
      const response = await fetch(`/api/prospects/${prospectId}/for-rdv`);
      
      if (!response.ok) {
        throw new Error('Erreur chargement prospect');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setProspectData(result.data);
        
        // Pré-remplir automatiquement le lieu avec l'adresse du prospect
        setFormData(prev => ({
          ...prev,
          prospectId: prospectId,
          lieu: result.data.adresseComplete || prev.lieu,
        }));
        
        console.log('[RDV PREFILL] ✅ Données prospect chargées et formulaire pré-rempli');
        
        toast({
          title: "Données prospect chargées",
          description: `RDV pour ${result.data.entreprise}`,
        });
      }
      
    } catch (error) {
      console.error('[RDV PREFILL] Erreur chargement prospect:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du prospect",
        variant: "destructive",
      });
    } finally {
      setIsLoadingProspect(false);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      dateRdv: formData.dateRdv ? new Date(formData.dateRdv) : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Loading indicator */}
      {isLoadingProspect && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />
            <span className="text-sm text-blue-700 dark:text-blue-300">Chargement des données prospect...</span>
          </div>
        </div>
      )}
      
      {/* Badge prospect enrichi */}
      {prospectData && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-sm font-semibold text-green-800 dark:text-green-300">
              Données prospect pré-remplies
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-700 dark:text-gray-300">
            <div>
              <span className="font-medium">Entreprise:</span> {prospectData.entreprise}
            </div>
            {prospectData.secteur && (
              <div>
                <span className="font-medium">Secteur:</span> {prospectData.secteur}
              </div>
            )}
            {prospectData.contactComplet && (
              <div>
                <span className="font-medium">Contact:</span> {prospectData.contactComplet}
              </div>
            )}
            {prospectData.telephone && (
              <div>
                <span className="font-medium">Tél:</span> {prospectData.telephone}
              </div>
            )}
            {prospectData.isFullyEnriched && (
              <div className="col-span-2 mt-1 pt-1 border-t border-green-200 dark:border-green-700">
                <span className="text-green-700 dark:text-green-400 font-medium">✓ Données enrichies disponibles</span>
                {prospectData.formeJuridique && <span className="ml-2">{prospectData.formeJuridique}</span>}
                {prospectData.effectif && <span className="ml-2">• {prospectData.effectif}</span>}
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type">Type de RDV *</Label>
          <Select 
            value={formData.type} 
            onValueChange={(v) => setFormData({ ...formData, type: v })}
          >
            <SelectTrigger id="type" data-testid="select-rdv-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="presentiel">Présentiel</SelectItem>
              <SelectItem value="visio">Visioconférence</SelectItem>
              <SelectItem value="tel">Téléphonique</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="prospectId">Prospect *</Label>
          <Select 
            value={formData.prospectId} 
            onValueChange={(v) => setFormData({ ...formData, prospectId: v })}
          >
            <SelectTrigger id="prospectId" data-testid="select-prospect">
              <SelectValue placeholder="Sélectionne un prospect" />
            </SelectTrigger>
            <SelectContent>
              {prospects.map(prospect => (
                <SelectItem key={prospect.id} value={prospect.id}>
                  {prospect.nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="dateRdv">Date et heure *</Label>
          <Input
            id="dateRdv"
            type="datetime-local"
            value={formData.dateRdv}
            onChange={(e) => setFormData({ ...formData, dateRdv: e.target.value })}
            required
            data-testid="input-date"
          />
        </div>

        <div>
          <Label htmlFor="lieu">Lieu</Label>
          <Input
            id="lieu"
            value={formData.lieu}
            onChange={(e) => setFormData({ ...formData, lieu: e.target.value })}
            placeholder="Adresse ou lien visio"
            data-testid="input-lieu"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="objectif">Objectif du RDV</Label>
        <Textarea
          id="objectif"
          value={formData.objectif}
          onChange={(e) => setFormData({ ...formData, objectif: e.target.value })}
          placeholder="Quel est l'objectif de ce rendez-vous ?"
          rows={2}
          data-testid="textarea-objectif"
        />
      </div>

      <div>
        <Label htmlFor="compteRendu">Compte-rendu</Label>
        <Textarea
          id="compteRendu"
          value={formData.compteRendu}
          onChange={(e) => setFormData({ ...formData, compteRendu: e.target.value })}
          placeholder="Notes et compte-rendu du rendez-vous..."
          rows={4}
          data-testid="textarea-compte-rendu"
        />
      </div>

      <div>
        <Label htmlFor="prochainesEtapes">Prochaines étapes</Label>
        <Textarea
          id="prochainesEtapes"
          value={formData.prochainesEtapes}
          onChange={(e) => setFormData({ ...formData, prochainesEtapes: e.target.value })}
          placeholder="Actions à suivre après ce RDV..."
          rows={3}
          data-testid="textarea-prochaines-etapes"
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="submit"
          disabled={isPending || !formData.prospectId}
          data-testid="button-submit-rdv"
        >
          {isPending ? "Enregistrement..." : initialData ? "Mettre à jour" : "Créer"}
        </Button>
      </div>
    </form>
  );
}
