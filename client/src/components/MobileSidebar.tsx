import { MessageSquare, Calendar, GraduationCap, Lightbulb, Plus, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { FeatureType } from "@shared/schema";
import hectorAvatar from "@assets/image_1761123466101.png";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFeature: FeatureType;
  onFeatureSelect: (feature: FeatureType) => void;
  onNewConversation: () => void;
}

const features = [
  {
    type: "commercial" as FeatureType,
    icon: MessageSquare,
    title: "Questions Commerciales",
    description: "Obtenez des réponses expertes sur vos défis commerciaux",
  },
  {
    type: "meeting" as FeatureType,
    icon: Calendar,
    title: "Structure de Réunion",
    description: "Créez des agendas et plans de réunion efficaces",
  },
  {
    type: "training" as FeatureType,
    icon: GraduationCap,
    title: "Formation",
    description: "Formez vos équipes aux meilleures pratiques",
  },
  {
    type: "arguments" as FeatureType,
    icon: Lightbulb,
    title: "Arguments de Vente",
    description: "Générez des arguments percutants et personnalisés",
  },
];

export function MobileSidebar({ 
  isOpen, 
  onClose, 
  selectedFeature, 
  onFeatureSelect, 
  onNewConversation 
}: MobileSidebarProps) {
  const handleFeatureSelect = (feature: FeatureType) => {
    onFeatureSelect(feature);
    onClose();
  };

  const handleNewConversation = () => {
    onNewConversation();
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-80 p-4">
        <SheetHeader className="mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border-2 border-primary/20 shrink-0">
              <AvatarImage src={hectorAvatar} alt="Hector" className="object-cover" />
              <AvatarFallback className="bg-primary text-primary-foreground">
                <Bot className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
            <SheetTitle className="text-lg font-semibold">Hector IA</SheetTitle>
          </div>
        </SheetHeader>

        <div className="flex flex-col gap-4 h-full">
          <Button
            onClick={handleNewConversation}
            variant="default"
            className="w-full justify-start gap-2"
            data-testid="button-new-conversation-mobile"
          >
            <Plus className="w-4 h-4" />
            Nouvelle conversation
          </Button>

          <div className="flex-1 overflow-y-auto space-y-3">
            <p className="text-sm font-medium text-foreground px-2">Fonctionnalités</p>
            
            {features.map((feature) => {
              const Icon = feature.icon;
              const isSelected = selectedFeature === feature.type;
              
              return (
                <button
                  key={feature.type}
                  onClick={() => handleFeatureSelect(feature.type)}
                  data-testid={`card-feature-${feature.type}-mobile`}
                  className={`w-full text-left rounded-lg border bg-card transition-all hover-elevate active-elevate-2 ${
                    isSelected ? "border-primary shadow-md" : "border-border"
                  }`}
                >
                  <div className="p-3 space-y-1">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg shrink-0 ${
                        isSelected ? "bg-primary text-primary-foreground" : "bg-accent"
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-semibold text-card-foreground">{feature.title}</h3>
                    </div>
                  </div>
                  <div className="px-3 pb-3">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="border-t pt-4 space-y-2">
            <p className="text-xs text-muted-foreground text-center">
              Propulsé par Claude AI
            </p>
            <p className="text-xs text-muted-foreground text-center font-medium">
              ADS GROUP © 2025
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
