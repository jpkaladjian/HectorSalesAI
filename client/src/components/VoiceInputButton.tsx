import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceInputButtonProps {
  isListening: boolean;
  isSupported: boolean;
  onClick: () => void;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
}

/**
 * Bouton microphone pour reconnaissance vocale
 * Animation pulse quand écoute active
 */
export function VoiceInputButton({
  isListening,
  isSupported,
  onClick,
  className,
  size = "icon"
}: VoiceInputButtonProps) {
  
  if (!isSupported) {
    return null; // Cache le bouton si non supporté
  }
  
  return (
    <Button
      type="button"
      size={size}
      variant="ghost"
      onClick={onClick}
      disabled={!isSupported}
      className={cn(
        "transition-all",
        isListening && "text-red-600 dark:text-red-500",
        isListening && "animate-pulse",
        className
      )}
      data-testid={`button-voice-${isListening ? 'stop' : 'start'}`}
      title={isListening ? "Arrêter l'écoute" : "Activer la reconnaissance vocale"}
    >
      {isListening ? (
        <MicOff className="h-4 w-4" />
      ) : (
        <Mic className="h-4 w-4" />
      )}
    </Button>
  );
}
