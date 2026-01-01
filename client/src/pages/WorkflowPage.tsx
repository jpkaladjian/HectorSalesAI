import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Camera as CameraIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkflowCreation } from "@/components/WorkflowCreation";
import { Camera } from "@/components/Camera";
import { NavigationBar } from "@/components/NavigationBar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function WorkflowPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showCamera, setShowCamera] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedCardData, setAnalyzedCardData] = useState<any>(null);

  // Extract query params from URL
  const params = new URLSearchParams(window.location.search);
  const initialCardData = {
    nom: params.get('nom') || undefined,
    prenom: params.get('prenom') || undefined,
    entreprise: params.get('entreprise') || undefined,
    email: params.get('email') || undefined,
    telephone: params.get('telephone') || undefined,
    poste: params.get('poste') || undefined,
    secteur: params.get('secteur') || undefined,
    adresse1: params.get('adresse1') || undefined,
    adresse2: params.get('adresse2') || undefined,
    codePostal: params.get('codePostal') || undefined,
    ville: params.get('ville') || undefined,
    pays: params.get('pays') || undefined,
  };

  // Use analyzed data if available, otherwise use initial data
  const cardData = analyzedCardData || initialCardData;

  const handleCameraCapture = async (file: File | File[]) => {
    try {
      setShowCamera(false);
      setIsAnalyzing(true);

      // Convert file to base64
      const fileToConvert = Array.isArray(file) ? file[0] : file;
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        try {
          const base64Image = reader.result as string;

          toast({
            title: "Analyse en cours...",
            description: "Extraction des informations de la carte de visite",
          });

          // Send to API for analysis
          const response = await apiRequest("POST", "/api/analyze-business-card", {
            imageData: base64Image,
          });

          if (response.success && response.data) {
            setAnalyzedCardData(response.data);
            toast({
              title: "Carte analysée avec succès",
              description: "Les informations ont été extraites et pré-remplies",
            });
          } else {
            throw new Error("Impossible d'extraire les données de la carte");
          }
        } catch (error) {
          console.error("[WorkflowPage] Analysis error:", error);
          toast({
            title: "Erreur d'analyse",
            description: error instanceof Error ? error.message : "Impossible d'analyser la carte. Vérifiez que la photo est nette.",
            variant: "destructive",
          });
        } finally {
          setIsAnalyzing(false);
        }
      };

      reader.onerror = () => {
        toast({
          title: "Erreur de lecture",
          description: "Impossible de lire l'image capturée",
          variant: "destructive",
        });
        setIsAnalyzing(false);
      };

      reader.readAsDataURL(fileToConvert);
    } catch (error) {
      console.error("[WorkflowPage] Camera capture error:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la capture",
        variant: "destructive",
      });
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => setLocation("/crm/dashboard")}
            data-testid="button-back-dashboard"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au Dashboard
          </Button>
          <Button
            onClick={() => setShowCamera(true)}
            disabled={isAnalyzing}
            variant="outline"
            data-testid="button-scan-business-card"
          >
            <CameraIcon className="mr-2 h-4 w-4" />
            {isAnalyzing ? "Analyse en cours..." : "Scanner carte de visite"}
          </Button>
        </div>
        <NavigationBar showHomeButton={true} />
      </div>

      {showCamera && (
        <Camera
          mode="photo"
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
          allowMultiplePhotos={false}
        />
      )}

      <WorkflowCreation
        cardData={cardData}
        onSuccess={() => {
          setTimeout(() => {
            setLocation("/crm/dashboard");
          }, 2000);
        }}
        onCancel={() => setLocation("/crm/dashboard")}
      />
    </div>
  );
}
