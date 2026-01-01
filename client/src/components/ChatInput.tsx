import { useState, KeyboardEvent, useCallback } from "react";
import { Send, Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { useToast } from "@/hooks/use-toast";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const { toast } = useToast();
  
  const handleSpeechSuccess = useCallback((transcript: string) => {
    setMessage(prev => {
      const newMessage = prev ? `${prev} ${transcript}` : transcript;
      return newMessage;
    });
  }, []);
  
  const handleSpeechError = useCallback((error: string) => {
    toast({
      title: "Erreur microphone",
      description: error,
      variant: "destructive",
    });
  }, [toast]);
  
  const { isListening, isSupported, startListening, stopListening } = useSpeechRecognition(
    handleSpeechSuccess,
    handleSpeechError
  );

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleMicClick = () => {
    if (!isSupported) {
      toast({
        title: "Non supporté",
        description: "La reconnaissance vocale n'est pas supportée par votre navigateur",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="border-t bg-background p-2 md:p-4">
      <div className="max-w-4xl mx-auto flex gap-2 items-end">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Posez votre question à Hector..."
          className="resize-none min-h-[48px] md:min-h-[56px] max-h-[200px] text-sm md:text-base"
          disabled={disabled}
          data-testid="input-message"
          rows={1}
        />
        {isSupported && (
          <Button
            onClick={handleMicClick}
            disabled={disabled}
            size="icon"
            variant={isListening ? "default" : "ghost"}
            className="shrink-0"
            data-testid="button-voice"
            title={isListening ? "Arrêter l'enregistrement" : "Dicter avec le micro"}
          >
            {isListening ? (
              <MicOff className="w-7 h-7 animate-pulse" />
            ) : (
              <Mic className="w-7 h-7" />
            )}
          </Button>
        )}
        <Button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          size="default"
          className="shrink-0 h-[48px] md:h-auto"
          data-testid="button-send"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
