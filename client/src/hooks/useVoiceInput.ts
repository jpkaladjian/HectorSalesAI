import { useState, useCallback, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseVoiceInputOptions {
  lang?: string;
  onResult?: (transcript: string) => void;
  convertNumbers?: boolean; // Pour SIRET : convertir mots en chiffres
}

interface UseVoiceInputReturn {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

/**
 * Hook pour reconnaissance vocale Web Speech API
 * Compatible Chrome, Safari, Edge (nécessite HTTPS)
 */
export function useVoiceInput({
  lang = 'fr-FR',
  onResult,
  convertNumbers = false
}: UseVoiceInputOptions = {}): UseVoiceInputReturn {
  
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Détection support Web Speech API
  const isSupported = useRef(
    typeof window !== 'undefined' && 
    ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
  ).current;
  
  const recognitionRef = useRef<any>(null);
  
  // Initialiser Web Speech API
  useEffect(() => {
    if (!isSupported) {
      setError('Reconnaissance vocale non supportée par ce navigateur');
      return;
    }
    
    // @ts-ignore - Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = lang;
    recognition.continuous = false; // Un seul résultat
    recognition.interimResults = false; // Résultat final uniquement
    recognition.maxAlternatives = 1;
    
    // Événement : Résultat reconnu
    recognition.onresult = (event: any) => {
      const result = event.results[0][0].transcript;
      let processedResult = result;
      
      // Conversion mots → chiffres pour SIRET
      if (convertNumbers) {
        processedResult = convertFrenchNumbersToDigits(result);
      }
      
      setTranscript(processedResult);
      setIsListening(false);
      
      if (onResult) {
        onResult(processedResult);
      }
      
      toast({
        title: "Reconnaissance réussie",
        description: processedResult,
      });
    };
    
    // Événement : Erreur
    recognition.onerror = (event: any) => {
      console.error('[VOICE] Erreur reconnaissance:', event.error);
      setIsListening(false);
      
      let errorMessage = "Erreur de reconnaissance vocale";
      
      switch (event.error) {
        case 'not-allowed':
        case 'permission-denied':
          errorMessage = "Microphone non autorisé. Vérifiez les permissions du navigateur.";
          break;
        case 'no-speech':
          errorMessage = "Aucune parole détectée. Réessayez.";
          break;
        case 'network':
          errorMessage = "Erreur réseau. Vérifiez votre connexion.";
          break;
        case 'aborted':
          errorMessage = "Reconnaissance annulée.";
          break;
      }
      
      setError(errorMessage);
      toast({
        title: "Erreur vocale",
        description: errorMessage,
        variant: "destructive",
      });
    };
    
    // Événement : Fin de reconnaissance
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognitionRef.current = recognition;
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [isSupported, lang, convertNumbers, onResult, toast]);
  
  
  const startListening = useCallback(() => {
    if (!isSupported) {
      toast({
        title: "Non supporté",
        description: "Votre navigateur ne supporte pas la reconnaissance vocale. Utilisez Chrome, Safari ou Edge.",
        variant: "destructive",
      });
      return;
    }
    
    if (recognitionRef.current && !isListening) {
      setError(null);
      setTranscript('');
      
      try {
        recognitionRef.current.start();
        setIsListening(true);
        
        toast({
          title: "Écoute en cours...",
          description: "Parlez maintenant",
        });
      } catch (err) {
        console.error('[VOICE] Erreur démarrage:', err);
        setError("Impossible de démarrer le microphone");
      }
    }
  }, [isSupported, isListening, toast]);
  
  
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);
  
  
  const resetTranscript = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);
  
  
  return {
    isListening,
    isSupported,
    transcript,
    error,
    startListening,
    stopListening,
    resetTranscript
  };
}


/**
 * Convertit les mots français en chiffres pour SIRET
 * Ex: "quatre cent quarante trois" → "443"
 */
function convertFrenchNumbersToDigits(text: string): string {
  const numberMap: Record<string, string> = {
    'zéro': '0',
    'zero': '0',
    'un': '1',
    'une': '1',
    'deux': '2',
    'trois': '3',
    'quatre': '4',
    'cinq': '5',
    'six': '6',
    'sept': '7',
    'huit': '8',
    'neuf': '9',
  };
  
  let result = text.toLowerCase();
  
  // Remplacer mots par chiffres
  Object.entries(numberMap).forEach(([word, digit]) => {
    const regex = new RegExp(`\\b${word}\\b`, 'g');
    result = result.replace(regex, digit);
  });
  
  // Supprimer espaces et caractères non-numériques
  result = result.replace(/[^\d]/g, '');
  
  return result;
}
