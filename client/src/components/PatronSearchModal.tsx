import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, Loader2, Building2, User } from "lucide-react";
import { VoiceInputButton } from "@/components/VoiceInputButton";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PatronResultCard } from "@/components/PatronResultCard";

interface PatronSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SearchNomParams {
  nom_entreprise: string;
  ville?: string;
  adresse?: string;
  code_postal?: string;
}

interface SearchSiretParams {
  siret: string;
}

interface SearchTelephoneParams {
  telephone: string;
}

interface PatronResult {
  // Basique
  siret: string;
  siren: string;
  raison_sociale: string;
  enseigne_commerciale: string;
  secteur: string;
  
  // Dirigeant
  dirigeant: {
    nom: string;
    prenom: string;
    fonction: string;
    photo_url: string | null;
  } | null;
  
  // Adresse complète Phase 2.8
  adresse: string;
  adresse_ligne_2?: string;
  complement_adresse?: string;
  code_postal: string;
  ville: string;
  commune?: string;
  departement?: string;
  region?: string;
  pays?: string;
  
  // GPS Phase 2.8
  latitude?: number;
  longitude?: number;
  
  // Coordonnées Phase 2.8
  email: string | null;
  telephone: string | null;
  site_web: string | null;
  
  // Données métier Phase 2.8
  effectif?: number;
  effectif_min?: number;
  effectif_max?: number;
  effectif_texte?: string;
  capital_social?: number;
  tva_intracommunautaire?: string;
  forme_juridique?: string;
  forme_juridique_libelle?: string;
  
  // Alertes juridiques Phase 2.8
  alerte_juridique?: boolean;
  procedure_collective?: boolean;
  procedure_type?: string;
  procedure_collective_libelle?: string;
  procedure_collective_date?: string;
  tribunal_commerce?: string;
  
  // Statut administratif Phase 2.8
  etat_administratif?: string;
  date_creation?: string;
  date_cessation?: string;
  
  // Métadonnées
  pappers_raw_data?: any;
}

export function PatronSearchModal({ open, onOpenChange }: PatronSearchModalProps) {
  const { toast } = useToast();
  
  // Mode 1 : Recherche par nom
  const [nomEntreprise, setNomEntreprise] = useState('');
  const [ville, setVille] = useState('');
  const [adresse, setAdresse] = useState('');
  const [codePostal, setCodePostal] = useState('');
  
  // Mode 2 : Recherche par SIRET
  const [siret, setSiret] = useState('');
  
  // Mode 3 : Recherche par téléphone
  const [telephone, setTelephone] = useState('');
  
  // Résultats
  const [resultsNom, setResultsNom] = useState<PatronResult[]>([]);
  const [resultSiret, setResultSiret] = useState<PatronResult | null>(null);
  const [resultsTelephone, setResultsTelephone] = useState<PatronResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<PatronResult | null>(null);
  const [currentSearchMode, setCurrentSearchMode] = useState<'nom' | 'siret' | 'telephone'>('nom');
  
  // Mode vocal pour nom entreprise
  const voiceNom = useVoiceInput({
    lang: 'fr-FR',
    convertNumbers: false,
    onResult: (transcript) => {
      setNomEntreprise(transcript);
    }
  });
  
  // Mode vocal pour ville
  const voiceVille = useVoiceInput({
    lang: 'fr-FR',
    convertNumbers: false,
    onResult: (transcript) => {
      setVille(transcript);
    }
  });
  
  // Mode vocal pour adresse
  const voiceAdresse = useVoiceInput({
    lang: 'fr-FR',
    convertNumbers: true,
    onResult: (transcript) => {
      setAdresse(transcript);
    }
  });
  
  // Mode vocal pour code postal
  const voiceCodePostal = useVoiceInput({
    lang: 'fr-FR',
    convertNumbers: true,
    onResult: (transcript) => {
      const formatted = transcript.replace(/\s/g, '');
      setCodePostal(formatted.slice(0, 5));
    }
  });
  
  // Mode vocal pour SIRET (avec conversion chiffres)
  const voiceSiret = useVoiceInput({
    lang: 'fr-FR',
    convertNumbers: true,
    onResult: (transcript) => {
      setSiret(formatSiret(transcript));
    }
  });
  
  // Mode vocal pour téléphone (avec conversion chiffres)
  const voiceTelephone = useVoiceInput({
    lang: 'fr-FR',
    convertNumbers: true,
    onResult: (transcript) => {
      setTelephone(formatTelephone(transcript));
    }
  });
  
  
  // Mutation recherche par nom
  const searchByNomMutation = useMutation({
    mutationFn: async (params: SearchNomParams) => {
      const response = await apiRequest("POST", "/api/patron/search-nom", params);
      return response;
    },
    onSuccess: (data: any) => {
      setCurrentSearchMode('nom');
      if (data.success && data.results && data.results.length > 0) {
        setResultsNom(data.results);
        setSelectedResult(null);
        
        if (data.results.length === 1) {
          // Si 1 seul résultat, l'afficher directement
          setSelectedResult(data.results[0]);
        }
        
        toast({
          title: "Recherche terminée",
          description: `${data.count} entreprise(s) trouvée(s)`,
        });
      } else if (data.success && data.count === 0) {
        setResultsNom([]);
        setSelectedResult(null);
        toast({
          title: "Aucun résultat",
          description: data.message || "Aucune entreprise trouvée",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erreur de recherche",
        description: error.message || "Impossible de rechercher l'entreprise",
        variant: "destructive",
      });
    }
  });
  
  
  // Mutation recherche par SIRET
  const searchBySiretMutation = useMutation({
    mutationFn: async (params: SearchSiretParams) => {
      const response = await apiRequest("POST", "/api/patron/search-siret", params);
      return response;
    },
    onSuccess: (data: any) => {
      setCurrentSearchMode('siret');
      if (data.success && data.result) {
        setResultSiret(data.result);
        setSelectedResult(data.result);
        toast({
          title: "Entreprise trouvée",
          description: data.result.raison_sociale,
        });
      } else if (data.success && !data.result) {
        setResultSiret(null);
        setSelectedResult(null);
        toast({
          title: "Aucun résultat",
          description: "Aucune entreprise avec ce SIRET",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erreur de recherche",
        description: error.message || "Impossible de rechercher l'entreprise",
        variant: "destructive",
      });
    }
  });
  
  
  const handleSearchNom = () => {
    if (!nomEntreprise || nomEntreprise.length < 3) {
      toast({
        title: "Nom trop court",
        description: "Le nom de l'entreprise doit contenir au moins 3 caractères",
        variant: "destructive",
      });
      return;
    }
    
    searchByNomMutation.mutate({
      nom_entreprise: nomEntreprise,
      ville: ville || undefined,
      adresse: adresse || undefined,
      code_postal: codePostal || undefined
    });
  };
  
  
  const handleSearchSiret = () => {
    const siretClean = siret.replace(/\s/g, '');
    
    if (!siretClean || siretClean.length !== 14 || !/^\d{14}$/.test(siretClean)) {
      toast({
        title: "SIRET invalide",
        description: "Le SIRET doit contenir exactement 14 chiffres",
        variant: "destructive",
      });
      return;
    }
    
    searchBySiretMutation.mutate({ siret: siretClean });
  };
  
  
  // Mutation recherche par téléphone
  const searchByTelephoneMutation = useMutation({
    mutationFn: async (params: SearchTelephoneParams) => {
      const response = await apiRequest("POST", "/api/patron/search-telephone", params);
      return response;
    },
    onSuccess: (data: any) => {
      if (data.success && data.results && data.results.length > 0) {
        setResultsTelephone(data.results);
        setSelectedResult(null);
        
        if (data.results.length === 1) {
          // Si 1 seul résultat, l'afficher directement
          setSelectedResult(data.results[0]);
        }
        
        toast({
          title: "Recherche terminée",
          description: `${data.count} entreprise(s) trouvée(s)`,
        });
      } else if (data.success && data.count === 0) {
        setResultsTelephone([]);
        setSelectedResult(null);
        toast({
          title: "Aucun résultat",
          description: data.message || "Aucune entreprise trouvée avec ce numéro",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erreur de recherche",
        description: error.message || "Impossible de rechercher l'entreprise",
        variant: "destructive",
      });
    }
  });
  
  
  const handleSearchTelephone = () => {
    const telClean = telephone.replace(/\s/g, '');
    
    if (!telClean || telClean.length < 10) {
      toast({
        title: "Téléphone invalide",
        description: "Le numéro de téléphone doit contenir au moins 10 chiffres",
        variant: "destructive",
      });
      return;
    }
    
    searchByTelephoneMutation.mutate({ telephone: telClean });
  };
  
  
  const handleSelectFromList = (result: PatronResult) => {
    setSelectedResult(result);
  };
  
  
  // Mutation ajout CRM
  const addToCrmMutation = useMutation({
    mutationFn: async (result: PatronResult) => {
      const contactData = {
        siret: result.siret,
        raisonSociale: result.raison_sociale,
        enseigneCommerciale: result.enseigne_commerciale,
        secteur: result.secteur,
        ville: result.ville,
        codePostal: result.code_postal,
        dirigeantNom: result.dirigeant?.nom || null,
        dirigeantPrenom: result.dirigeant?.prenom || null,
        dirigeantFonction: result.dirigeant?.fonction || null,
        dirigeantPhotoUrl: result.dirigeant?.photo_url || null,
        email: result.email,
        telephone: result.telephone,
        siteWeb: result.site_web,
        searchMode: currentSearchMode,
        pappersRawData: result.pappers_raw_data,
      };
      
      const response = await apiRequest("POST", "/api/patron/contacts", contactData);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Contact ajouté",
        description: "Le contact a été ajouté à votre CRM avec succès",
      });
      handleClose();
    },
    onError: (error: any) => {
      if (error.message?.includes('Doublon')) {
        toast({
          title: "Contact déjà existant",
          description: "Ce contact existe déjà dans votre CRM",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erreur d'ajout",
          description: error.message || "Impossible d'ajouter le contact au CRM",
          variant: "destructive",
        });
      }
    }
  });
  
  
  const handleAddToCrm = () => {
    if (selectedResult) {
      addToCrmMutation.mutate(selectedResult);
    }
  };
  
  
  const handleClose = () => {
    // Reset
    setNomEntreprise('');
    setVille('');
    setAdresse('');
    setCodePostal('');
    setSiret('');
    setTelephone('');
    setResultsNom([]);
    setResultSiret(null);
    setResultsTelephone([]);
    setSelectedResult(null);
    onOpenChange(false);
  };
  
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="dialog-patron-search">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Trouve-moi le patron
          </DialogTitle>
          <DialogDescription>
            Recherchez instantanément un dirigeant par nom d'entreprise, SIRET ou téléphone
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="nom" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="nom" data-testid="tab-search-nom">
              Par nom d'entreprise
            </TabsTrigger>
            <TabsTrigger value="siret" data-testid="tab-search-siret">
              Par SIRET
            </TabsTrigger>
            <TabsTrigger value="telephone" data-testid="tab-search-telephone">
              Par téléphone
            </TabsTrigger>
          </TabsList>
          
          {/* ONGLET 1 : Recherche par nom */}
          <TabsContent value="nom" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nom-entreprise">
                  Nom de l'entreprise *
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="nom-entreprise"
                    placeholder="Ex: Pharmacie Centrale"
                    value={nomEntreprise}
                    onChange={(e) => setNomEntreprise(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchNom()}
                    data-testid="input-nom-entreprise"
                  />
                  <VoiceInputButton
                    isListening={voiceNom.isListening}
                    isSupported={voiceNom.isSupported}
                    onClick={voiceNom.isListening ? voiceNom.stopListening : voiceNom.startListening}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="adresse">
                    Adresse (optionnel)
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="adresse"
                      placeholder="Ex: 12 rue de la Paix"
                      value={adresse}
                      onChange={(e) => setAdresse(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearchNom()}
                      data-testid="input-adresse"
                    />
                    <VoiceInputButton
                      isListening={voiceAdresse.isListening}
                      isSupported={voiceAdresse.isSupported}
                      onClick={voiceAdresse.isListening ? voiceAdresse.stopListening : voiceAdresse.startListening}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="code-postal">
                    Code postal (optionnel)
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="code-postal"
                      placeholder="Ex: 75001"
                      value={codePostal}
                      onChange={(e) => setCodePostal(e.target.value.replace(/\D/g, '').slice(0, 5))}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearchNom()}
                      maxLength={5}
                      data-testid="input-code-postal"
                    />
                    <VoiceInputButton
                      isListening={voiceCodePostal.isListening}
                      isSupported={voiceCodePostal.isSupported}
                      onClick={voiceCodePostal.isListening ? voiceCodePostal.stopListening : voiceCodePostal.startListening}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ville">
                  Ville (optionnel)
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="ville"
                    placeholder="Ex: Lyon"
                    value={ville}
                    onChange={(e) => setVille(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchNom()}
                    data-testid="input-ville"
                  />
                  <VoiceInputButton
                    isListening={voiceVille.isListening}
                    isSupported={voiceVille.isSupported}
                    onClick={voiceVille.isListening ? voiceVille.stopListening : voiceVille.startListening}
                  />
                </div>
              </div>
              
              <Button
                onClick={handleSearchNom}
                disabled={searchByNomMutation.isPending || !nomEntreprise}
                className="w-full"
                data-testid="button-search-nom"
              >
                {searchByNomMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Recherche en cours...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Rechercher
                  </>
                )}
              </Button>
            </div>
            
            {/* Liste résultats si plusieurs */}
            {resultsNom.length > 1 && !selectedResult && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">
                  {resultsNom.length} résultats trouvés - Sélectionnez une entreprise :
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {resultsNom.map((result, index) => (
                    <Card
                      key={index}
                      className="p-3 hover-elevate cursor-pointer"
                      onClick={() => handleSelectFromList(result)}
                      data-testid={`result-item-${index}`}
                    >
                      <div className="flex items-start gap-3">
                        <Building2 className="h-5 w-5 mt-0.5 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="font-medium">{result.enseigne_commerciale || result.raison_sociale}</p>
                          <p className="text-sm text-muted-foreground">
                            {result.ville} ({result.code_postal}) • SIRET : {result.siret}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
          
          {/* ONGLET 2 : Recherche par SIRET */}
          <TabsContent value="siret" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siret">
                  Numéro SIRET *
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="siret"
                    placeholder="Ex: 443 061 841 00047"
                    value={siret}
                    onChange={(e) => setSiret(formatSiret(e.target.value))}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchSiret()}
                    maxLength={17} // 14 chiffres + 3 espaces
                    data-testid="input-siret"
                  />
                  <VoiceInputButton
                    isListening={voiceSiret.isListening}
                    isSupported={voiceSiret.isSupported}
                    onClick={voiceSiret.isListening ? voiceSiret.stopListening : voiceSiret.startListening}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Format : 14 chiffres (avec ou sans espaces)
                </p>
              </div>
              
              <Button
                onClick={handleSearchSiret}
                disabled={searchBySiretMutation.isPending || !siret}
                className="w-full"
                data-testid="button-search-siret"
              >
                {searchBySiretMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Recherche en cours...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Rechercher
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
          
          {/* ONGLET 3 : Recherche par téléphone */}
          <TabsContent value="telephone" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="telephone">
                  Numéro de téléphone *
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="telephone"
                    placeholder="Ex: 01 23 45 67 89"
                    value={telephone}
                    onChange={(e) => setTelephone(formatTelephone(e.target.value))}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchTelephone()}
                    maxLength={14} // 10 chiffres + 4 espaces
                    data-testid="input-telephone"
                  />
                  <VoiceInputButton
                    isListening={voiceTelephone.isListening}
                    isSupported={voiceTelephone.isSupported}
                    onClick={voiceTelephone.isListening ? voiceTelephone.stopListening : voiceTelephone.startListening}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Format : 10 chiffres (fixe ou mobile de l'entreprise)
                </p>
              </div>
              
              <Button
                onClick={handleSearchTelephone}
                disabled={searchByTelephoneMutation.isPending || !telephone}
                className="w-full"
                data-testid="button-search-telephone"
              >
                {searchByTelephoneMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Recherche en cours...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Rechercher
                  </>
                )}
              </Button>
            </div>
            
            {/* Liste résultats si plusieurs */}
            {resultsTelephone.length > 1 && !selectedResult && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">
                  {resultsTelephone.length} résultats trouvés - Sélectionnez une entreprise :
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {resultsTelephone.map((result, index) => (
                    <Card
                      key={index}
                      className="p-3 hover-elevate cursor-pointer"
                      onClick={() => handleSelectFromList(result)}
                      data-testid={`result-item-tel-${index}`}
                    >
                      <div className="flex items-start gap-3">
                        <Building2 className="h-5 w-5 mt-0.5 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="font-medium">{result.enseigne_commerciale || result.raison_sociale}</p>
                          <p className="text-sm text-muted-foreground">
                            {result.ville} ({result.code_postal}) • SIRET : {result.siret}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        {/* Affichage fiche dirigeant si sélectionné */}
        {selectedResult && (
          <div className="mt-6">
            <PatronResultCard
              result={selectedResult}
              onClose={() => setSelectedResult(null)}
              onAddToCrm={handleAddToCrm}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}


/**
 * Formate automatiquement le SIRET avec espaces
 * 12345678901234 → 123 456 789 01234
 */
function formatSiret(value: string): string {
  // Supprimer caractères non-numériques
  const digits = value.replace(/\D/g, '');
  
  // Limiter à 14 chiffres
  const limited = digits.slice(0, 14);
  
  // Ajouter espaces tous les 3 chiffres
  if (limited.length <= 3) return limited;
  if (limited.length <= 6) return `${limited.slice(0, 3)} ${limited.slice(3)}`;
  if (limited.length <= 9) return `${limited.slice(0, 3)} ${limited.slice(3, 6)} ${limited.slice(6)}`;
  return `${limited.slice(0, 3)} ${limited.slice(3, 6)} ${limited.slice(6, 9)} ${limited.slice(9)}`;
}

/**
 * Formate automatiquement le téléphone avec espaces
 * 0123456789 → 01 23 45 67 89
 */
function formatTelephone(value: string): string {
  // Supprimer caractères non-numériques
  const digits = value.replace(/\D/g, '');
  
  // Limiter à 10 chiffres
  const limited = digits.slice(0, 10);
  
  // Ajouter espaces par paires
  if (limited.length <= 2) return limited;
  if (limited.length <= 4) return `${limited.slice(0, 2)} ${limited.slice(2)}`;
  if (limited.length <= 6) return `${limited.slice(0, 2)} ${limited.slice(2, 4)} ${limited.slice(4)}`;
  if (limited.length <= 8) return `${limited.slice(0, 2)} ${limited.slice(2, 4)} ${limited.slice(4, 6)} ${limited.slice(6)}`;
  return `${limited.slice(0, 2)} ${limited.slice(2, 4)} ${limited.slice(4, 6)} ${limited.slice(6, 8)} ${limited.slice(8)}`;
}
