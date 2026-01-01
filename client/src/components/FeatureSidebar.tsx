import { MessageSquare, Calendar, GraduationCap, Lightbulb, Plus, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { FeatureType } from "@shared/schema";
import hectorAvatar from "@assets/image_1761123466101.png";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface Conversation {
  id: string;
  title: string;
  createdAt: string;
}

interface FeatureSidebarProps {
  selectedFeature: FeatureType;
  onFeatureSelect: (feature: FeatureType) => void;
  onNewConversation: () => void;
  conversations?: Conversation[];
  selectedConversationId?: string | null;
  onConversationSelect?: (conversationId: string) => void;
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

export function FeatureSidebar({ 
  selectedFeature, 
  onFeatureSelect, 
  onNewConversation,
  conversations = [],
  selectedConversationId,
  onConversationSelect
}: FeatureSidebarProps) {
  return (
    <div className="hidden md:flex w-80 border-r bg-sidebar h-screen flex-col p-4 gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 mb-2">
          <Avatar className="w-10 h-10 border-2 border-primary/20 shrink-0">
            <AvatarImage src={hectorAvatar} alt="Hector" className="object-cover" />
            <AvatarFallback className="bg-primary text-primary-foreground">
              <Bot className="w-5 h-5" />
            </AvatarFallback>
          </Avatar>
          <h2 className="text-lg font-semibold text-sidebar-foreground">Hector IA</h2>
        </div>
        
        <Button
          onClick={onNewConversation}
          variant="default"
          className="w-full justify-start gap-2"
          data-testid="button-new-conversation"
        >
          <Plus className="w-4 h-4" />
          Nouvelle conversation
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {conversations.length > 0 && (
          <>
            <p className="text-sm font-medium text-sidebar-foreground px-2">Conversations récentes</p>
            <div className="space-y-2">
              {conversations.slice(0, 5).map((conv) => (
                <Button
                  key={conv.id}
                  variant={selectedConversationId === conv.id ? "secondary" : "ghost"}
                  className="w-full justify-start text-left h-auto py-2"
                  onClick={() => onConversationSelect?.(conv.id)}
                  data-testid={`button-conversation-${conv.id}`}
                >
                  <div className="truncate w-full">
                    <div className="font-medium text-sm truncate">{conv.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(conv.createdAt), { 
                        addSuffix: true, 
                        locale: fr 
                      })}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </>
        )}
        
        <p className="text-sm font-medium text-sidebar-foreground px-2">Fonctionnalités</p>
        
        {features.map((feature) => {
          const Icon = feature.icon;
          const isSelected = selectedFeature === feature.type;
          
          return (
            <Card
              key={feature.type}
              className={`cursor-pointer transition-all hover-elevate ${
                isSelected ? "border-primary shadow-md" : ""
              }`}
              onClick={() => onFeatureSelect(feature.type)}
              data-testid={`card-feature-${feature.type}`}
            >
              <CardHeader className="p-4 space-y-1">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    isSelected ? "bg-primary text-primary-foreground" : "bg-accent"
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <CardTitle className="text-sm">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <CardDescription className="text-xs leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
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
  );
}
