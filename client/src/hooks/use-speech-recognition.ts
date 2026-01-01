import { useState, useEffect, useCallback, useRef } from 'react';

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface WindowWithSpeechRecognition extends Window {
  SpeechRecognition?: new () => SpeechRecognitionInstance;
  webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
}

export function useSpeechRecognition(
  onSuccess?: (transcript: string) => void,
  onError?: (error: string) => void
) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const transcriptBufferRef = useRef<string>('');

  useEffect(() => {
    const win = window as WindowWithSpeechRecognition;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'fr-FR';

      recognition.addEventListener('result', (event: Event) => {
        const e = event as SpeechRecognitionEvent;
        const current = e.resultIndex;
        const transcriptResult = e.results[current][0].transcript;
        // Accumulate transcript in buffer
        transcriptBufferRef.current = transcriptResult;
      });

      recognition.addEventListener('end', () => {
        setIsListening(false);
        // Only call onSuccess if we have a transcript and no error occurred
        if (transcriptBufferRef.current && onSuccess) {
          onSuccess(transcriptBufferRef.current);
        }
        // Clear buffer after processing
        transcriptBufferRef.current = '';
      });

      recognition.addEventListener('error', (event: Event) => {
        const e = event as SpeechRecognitionErrorEvent;
        console.error('Speech recognition error:', e.error);
        setIsListening(false);
        // Clear buffer on error
        transcriptBufferRef.current = '';
        
        // Provide user-friendly error messages
        if (onError) {
          let errorMessage = 'Une erreur est survenue lors de la reconnaissance vocale';
          
          switch (e.error) {
            case 'not-allowed':
            case 'permission-denied':
              errorMessage = 'Accès au microphone refusé. Veuillez autoriser l\'accès au microphone dans les paramètres de votre navigateur.';
              break;
            case 'no-speech':
              errorMessage = 'Aucune parole détectée. Veuillez réessayer.';
              break;
            case 'audio-capture':
              errorMessage = 'Impossible d\'accéder au microphone. Vérifiez qu\'aucune autre application ne l\'utilise.';
              break;
            case 'network':
              errorMessage = 'Erreur réseau. Vérifiez votre connexion internet.';
              break;
            case 'aborted':
              // User manually stopped, no error needed
              return;
          }
          
          onError(errorMessage);
        }
      });

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [onSuccess, onError]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      transcriptBufferRef.current = '';
      setIsListening(true);
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        setIsListening(false);
        
        if (onError) {
          onError('Impossible de démarrer la reconnaissance vocale. Le microphone est peut-être déjà en cours d\'utilisation.');
        }
      }
    }
  }, [isListening, onError]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  return {
    isListening,
    isSupported,
    startListening,
    stopListening,
  };
}
