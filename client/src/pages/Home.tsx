import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Menu } from "lucide-react";
import { Message, FeatureType } from "@shared/schema";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { FeatureSidebar } from "@/components/FeatureSidebar";
import { MobileSidebar } from "@/components/MobileSidebar";
import { TypingIndicator } from "@/components/TypingIndicator";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { Camera } from "@/components/Camera";
import { PatronSearchModal } from "@/components/PatronSearchModal";
import { NavigationBar } from "@/components/NavigationBar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";

export default function Home() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<FeatureType>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cameraMode, setCameraMode] = useState<"photo" | "video" | null>(null);
  const [patronSearchOpen, setPatronSearchOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Load conversations
  const { data: conversations = [] } = useQuery({
    queryKey: ['/api/conversations'],
    enabled: !!user,
  });

  // Load messages when conversation is selected
  useEffect(() => {
    if (conversationId) {
      const loadMessages = async () => {
        try {
          const msgs = await apiRequest("GET", `/api/messages/${conversationId}`);
          setMessages(msgs);
        } catch (error) {
          console.error('[Frontend] Error loading messages:', error);
          toast({
            title: "Erreur",
            description: "Impossible de charger les messages",
            variant: "destructive",
          });
        }
      };
      loadMessages();
    }
  }, [conversationId, toast]);


  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      setIsTyping(true);
      const response = await apiRequest("POST", "/api/chat/send", {
        content,
        conversationId,
        featureType: selectedFeature,
      });
      return response;
    },
    onSuccess: (data: any) => {
      console.log('[Frontend] Message sent successfully, full response:', JSON.stringify(data, null, 2));
      
      // Update conversation ID if this is a new conversation
      if (data.conversationId && !conversationId) {
        setConversationId(data.conversationId);
      }
      
      // Add both messages to the local state with defensive checks
      setMessages(prev => {
        const newMessages = [...prev];
        
        // Add user message if present and not already in state
        if (data.userMessage && data.userMessage.id) {
          if (!newMessages.find(m => m.id === data.userMessage.id)) {
            console.log('[Frontend] Adding user message:', data.userMessage.id);
            newMessages.push(data.userMessage);
          }
        } else {
          console.error('[Frontend] userMessage is missing from response:', data);
        }
        
        // Add assistant message if present and not already in state
        if (data.assistantMessage && data.assistantMessage.id) {
          if (!newMessages.find(m => m.id === data.assistantMessage.id)) {
            console.log('[Frontend] Adding assistant message:', data.assistantMessage.id);
            newMessages.push(data.assistantMessage);
          }
        } else {
          console.error('[Frontend] assistantMessage is missing from response:', data);
        }
        
        // Sort by creation date
        return newMessages.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });
      
      setIsTyping(false);
    },
    onError: (error: Error) => {
      console.error('[Frontend] Error sending message:', error);
      setIsTyping(false);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'envoyer le message",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = (content: string) => {
    console.log('[Frontend] Sending message:', content);
    sendMessageMutation.mutate(content);
  };

  const handleNewConversation = () => {
    console.log('[Frontend] Starting new conversation');
    setConversationId(null);
    setSelectedFeature(null);
    setMessages([]);
  };

  const handleFeatureSelect = (feature: FeatureType) => {
    console.log('[Frontend] Feature selected:', feature);
    setSelectedFeature(feature);
  };

  const handleCameraClick = (mode: "photo" | "video") => {
    setCameraMode(mode);
  };

  const handleCameraCapture = async (files: File | File[]) => {
    const fileArray = Array.isArray(files) ? files : [files];
    console.log('[Frontend] Files captured:', fileArray.length, fileArray.map(f => f.name));
    
    // Close camera modal immediately
    setCameraMode(null);
    
    // Show analyzing toast
    toast({
      title: "Analyse en cours...",
      description: "Extraction automatique des informations de la carte de visite",
    });
    
    try {
      // Use first image for analysis (recto)
      const firstFile = fileArray[0];
      
      // Convert to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(firstFile);
      });
      
      const imageDataUrl = await base64Promise;
      
      // Call analysis API
      console.log('[Frontend] Analyzing business card...');
      const analysisResponse = await apiRequest("POST", "/api/analyze-business-card", {
        imageData: imageDataUrl,
      });
      
      console.log('[Frontend] Analysis complete:', analysisResponse);
      
      toast({
        title: "Analyse terminée ✓",
        description: "Informations extraites avec succès !",
      });
      
      // Navigate to workflow with pre-filled data
      const extractedData = analysisResponse.data;
      const queryParams = new URLSearchParams();
      
      if (extractedData.nom) queryParams.set('nom', extractedData.nom);
      if (extractedData.prenom) queryParams.set('prenom', extractedData.prenom);
      if (extractedData.entreprise) queryParams.set('entreprise', extractedData.entreprise);
      if (extractedData.email) queryParams.set('email', extractedData.email);
      if (extractedData.telephone) queryParams.set('telephone', extractedData.telephone);
      if (extractedData.poste) queryParams.set('poste', extractedData.poste);
      if (extractedData.secteur) queryParams.set('secteur', extractedData.secteur);
      if (extractedData.adresse1) queryParams.set('adresse1', extractedData.adresse1);
      if (extractedData.adresse2) queryParams.set('adresse2', extractedData.adresse2);
      if (extractedData.codePostal) queryParams.set('codePostal', extractedData.codePostal);
      if (extractedData.ville) queryParams.set('ville', extractedData.ville);
      if (extractedData.pays) queryParams.set('pays', extractedData.pays);
      
      // Store image data in sessionStorage for preview
      sessionStorage.setItem('businessCardImage', imageDataUrl);
      
      setLocation(`/crm/workflow?${queryParams.toString()}`);
      
    } catch (error) {
      console.error('[Frontend] Analysis error:', error);
      toast({
        title: "Erreur d'analyse",
        description: error instanceof Error ? error.message : "Impossible d'analyser la carte. Essayez de remplir manuellement.",
        variant: "destructive",
      });
      
      // Still navigate to workflow but without pre-filled data
      setLocation('/crm/workflow');
    }
  };

  const handleCameraClose = () => {
    setCameraMode(null);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const showWelcome = !conversationId && messages.length === 0 && !selectedFeature;

  const handleConversationSelect = (convId: string) => {
    console.log('[Frontend] Conversation selected:', convId);
    setConversationId(convId);
  };

  return (
    <div className="flex h-screen bg-background">
      <FeatureSidebar
        selectedFeature={selectedFeature}
        onFeatureSelect={handleFeatureSelect}
        onNewConversation={handleNewConversation}
        conversations={conversations as any[]}
        selectedConversationId={conversationId}
        onConversationSelect={handleConversationSelect}
      />

      <MobileSidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        selectedFeature={selectedFeature}
        onFeatureSelect={handleFeatureSelect}
        onNewConversation={handleNewConversation}
      />

      <div className="flex-1 flex flex-col">
        <header className="border-b bg-card px-3 md:px-6 py-3 md:py-4 shrink-0">
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(true)}
                data-testid="button-mobile-menu"
              >
                <Menu className="w-5 h-5" />
              </Button>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-lg md:text-2xl font-semibold text-foreground truncate">
                {isMobile ? "Hector" : "Hector - Assistant Commercial IA"}
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground mt-0.5 md:mt-1 truncate">
                {selectedFeature === "commercial" && "Questions Commerciales"}
                {selectedFeature === "meeting" && "Structure de Réunion"}
                {selectedFeature === "training" && "Formation Commerciale"}
                {selectedFeature === "arguments" && "Arguments de Vente"}
                {!selectedFeature && "Sélectionnez une fonctionnalité"}
              </p>
            </div>
            <NavigationBar showHomeButton={false} />
          </div>
        </header>

        {showWelcome ? (
          <WelcomeScreen 
            onFeatureSelect={handleFeatureSelect}
            onCameraClick={handleCameraClick}
            onPatronSearchClick={() => setPatronSearchOpen(true)}
          />
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-3 md:p-6">
              <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
                {messages.length === 0 && !isTyping && (
                  <div className="flex items-center justify-center py-12 text-muted-foreground">
                    Commencez une conversation...
                  </div>
                )}
                
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                
                {isTyping && <TypingIndicator />}
                
                <div ref={messagesEndRef} />
              </div>
            </div>

            <ChatInput
              onSendMessage={handleSendMessage}
              disabled={sendMessageMutation.isPending || isTyping}
            />
          </>
        )}
      </div>

      {/* Camera Modal */}
      {cameraMode && (
        <Camera
          mode={cameraMode}
          onCapture={handleCameraCapture}
          onClose={handleCameraClose}
          allowMultiplePhotos={cameraMode === "photo"} // Enable front/back for business cards
        />
      )}

      {/* Patron Search Modal */}
      <PatronSearchModal
        open={patronSearchOpen}
        onOpenChange={setPatronSearchOpen}
      />
    </div>
  );
}
