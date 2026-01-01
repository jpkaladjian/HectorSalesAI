import { useState, useRef, useEffect } from "react";
import { Camera as CameraIcon, Video, X, RotateCcw, Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface CameraProps {
  mode: "photo" | "video";
  onCapture: (files: File | File[]) => void; // Support single file or multiple files
  onClose: () => void;
  allowMultiplePhotos?: boolean; // For business card front/back
}

export function Camera({ mode, onCapture, onClose, allowMultiplePhotos = false }: CameraProps) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [capturedImages, setCapturedImages] = useState<string[]>([]); // Support multiple photos
  const [capturedVideo, setCapturedVideo] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showAddVersoOption, setShowAddVersoOption] = useState(false); // New: show "add verso" choice
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  const { toast } = useToast();

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      // Essayer d'abord avec la caméra arrière (pour mobile)
      let constraints: MediaStreamConstraints = {
        video: { facingMode: "environment" }, // Caméra arrière sur mobile
        audio: mode === "video"
      };

      console.log('[Camera] 🎥 Demande d\'accès caméra arrière...');
      let stream: MediaStream;
      
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (error) {
        // Fallback sur la caméra par défaut (pour PC ou si caméra arrière indisponible)
        console.log('[Camera] ⚠️ Caméra arrière indisponible, utilisation caméra par défaut...');
        constraints = {
          video: true,
          audio: mode === "video"
        };
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      }
      streamRef.current = stream;
      
      console.log('[Camera] ✅ Stream obtenu, tracks:', stream.getTracks().map(t => ({
        kind: t.kind,
        label: t.label,
        enabled: t.enabled,
        readyState: t.readyState
      })));

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        console.log('[Camera] 📺 srcObject assigné au video element');
        
        // Attendre que la vidéo soit prête
        videoRef.current.onloadedmetadata = () => {
          const width = videoRef.current?.videoWidth || 0;
          const height = videoRef.current?.videoHeight || 0;
          console.log('[Camera] 📐 Metadata chargées - dimensions:', width, 'x', height);
          
          if (width === 0 || height === 0) {
            console.error('[Camera] ⚠️ PROBLÈME: Dimensions vidéo = 0!');
          } else {
            console.log('[Camera] ✅ Vidéo prête à être affichée');
          }
        };
        
        try {
          await videoRef.current.play();
          console.log('[Camera] ▶️ video.play() réussi');
          setIsStreaming(true);
        } catch (playError) {
          console.error('[Camera] ❌ Erreur video.play():', playError);
          // Essayer de jouer à nouveau après un court délai
          setTimeout(() => {
            videoRef.current?.play().then(() => {
              console.log('[Camera] ▶️ video.play() réussi (2ème tentative)');
              setIsStreaming(true);
            }).catch(e => console.error('[Camera] ❌ play() échoué même en 2ème tentative:', e));
          }, 100);
        }
      }
    } catch (error) {
      console.error("[Camera] ❌ Erreur accès caméra:", error);
      toast({
        title: "Erreur caméra",
        description: "Impossible d'accéder à la caméra. Vérifiez les permissions.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
    setIsStreaming(false);
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Optimisation : redimensionner l'image pour réduire la taille
    // Pour les cartes de visite, 1920px de largeur max est largement suffisant pour l'OCR
    const maxWidth = 1920;
    const maxHeight = 1080;
    
    let targetWidth = video.videoWidth;
    let targetHeight = video.videoHeight;
    
    // Calculer les dimensions optimales en préservant le ratio
    if (targetWidth > maxWidth || targetHeight > maxHeight) {
      const ratio = Math.min(maxWidth / targetWidth, maxHeight / targetHeight);
      targetWidth = Math.floor(targetWidth * ratio);
      targetHeight = Math.floor(targetHeight * ratio);
    }
    
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Dessiner l'image redimensionnée
      ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
      
      // Compression JPEG à 0.85 (bon équilibre qualité/taille)
      const imageDataUrl = canvas.toDataURL("image/jpeg", 0.85);
      setCapturedImages(prev => [...prev, imageDataUrl]);
      
      console.log(`[Camera] 📸 Photo capturée : ${targetWidth}x${targetHeight}, taille base64: ${Math.round(imageDataUrl.length / 1024)}KB`);
      
      // Stop camera after taking photo
      stopCamera();
      
      // If allowMultiplePhotos and this is the first photo, show choice
      if (allowMultiplePhotos && capturedImages.length === 0) {
        setShowAddVersoOption(true);
      } else {
        setShowAddVersoOption(false);
      }
    }
  };

  const startVideoRecording = () => {
    if (!streamRef.current) return;

    try {
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: "video/webm;codecs=vp8,opus"
      });

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        setCapturedVideo(blob);
        stopCamera();
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setRecordingTime(0);

      recordingIntervalRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Recording error:", error);
      toast({
        title: "Erreur enregistrement",
        description: "Impossible de démarrer l'enregistrement vidéo.",
        variant: "destructive",
      });
    }
  };

  const stopVideoRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const handleAddVerso = () => {
    // User wants to add a second photo (verso)
    setShowAddVersoOption(false);
    startCamera();
  };

  const retake = () => {
    setCapturedImages([]);
    setCapturedVideo(null);
    setRecordingTime(0);
    setShowAddVersoOption(false);
    startCamera();
  };

  const confirm = async () => {
    if (mode === "photo" && capturedImages.length > 0) {
      // Convert all captured images to files with unique timestamps
      const baseTimestamp = Date.now();
      const files = await Promise.all(
        capturedImages.map(async (imageDataUrl, index) => {
          const blob = await fetch(imageDataUrl).then(r => r.blob());
          const label = allowMultiplePhotos && capturedImages.length > 1
            ? (index === 0 ? 'recto' : 'verso')
            : '';
          // Add index to timestamp to ensure uniqueness
          const uniqueTimestamp = baseTimestamp + index;
          const filename = label 
            ? `photo-${label}-${uniqueTimestamp}.jpg`
            : `photo-${uniqueTimestamp}.jpg`;
          return new File([blob], filename, { type: "image/jpeg" });
        })
      );
      
      // Return single file or array based on count
      onCapture(files.length === 1 ? files[0] : files);
    } else if (mode === "video" && capturedVideo) {
      const file = new File([capturedVideo], `video-${Date.now()}.webm`, { type: "video/webm" });
      onCapture(file);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Determine if we should show the choice screen (after first photo)
  const showChoiceScreen = allowMultiplePhotos && capturedImages.length === 1 && showAddVersoOption;

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-black/50">
          <h2 className="text-white font-semibold">
            {mode === "photo" ? "Prendre une photo" : "Enregistrer une vidéo"}
          </h2>
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            className="text-white hover:bg-white/20"
            data-testid="button-close-camera"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Camera View */}
        <div className="flex-1 relative flex items-center justify-center bg-black">
          {/* Live camera feed */}
          <video
            ref={videoRef}
            className="max-w-full max-h-full object-contain"
            style={{ 
              display: (isStreaming && !showChoiceScreen && (capturedImages.length === 0 || (allowMultiplePhotos && capturedImages.length === 1)) && !capturedVideo) ? 'block' : 'none',
              minWidth: '320px',
              minHeight: '240px'
            }}
            autoPlay
            playsInline
            muted
          />

          {/* Captured photos preview */}
          {capturedImages.length > 0 && !showChoiceScreen && (
            <div className={`flex gap-4 ${capturedImages.length > 1 ? 'flex-row' : ''} max-w-full max-h-full p-4`}>
              {capturedImages.map((imageDataUrl, index) => (
                <div key={index} className="flex flex-col items-center gap-2">
                  <img
                    src={imageDataUrl}
                    alt={`Photo ${index + 1}`}
                    className="max-w-full max-h-[60vh] object-contain rounded-lg"
                  />
                  <span className="text-white text-sm bg-black/50 px-3 py-1 rounded-full">
                    {allowMultiplePhotos && capturedImages.length > 1 
                      ? (index === 0 ? 'Recto' : 'Verso') 
                      : `Photo ${index + 1}`}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Choice screen after first photo */}
          {showChoiceScreen && (
            <div className="flex flex-col items-center gap-6 p-4">
              <img
                src={capturedImages[0]}
                alt="Photo recto"
                className="max-w-full max-h-[50vh] object-contain rounded-lg"
              />
              <span className="text-white text-sm bg-black/50 px-3 py-1 rounded-full">
                Recto
              </span>
              <p className="text-white text-center text-lg">
                Souhaitez-vous ajouter une photo du verso ?
              </p>
            </div>
          )}

          {/* Captured video preview */}
          {capturedVideo && (
            <video
              src={URL.createObjectURL(capturedVideo)}
              className="max-w-full max-h-full object-contain"
              controls
              autoPlay
              loop
            />
          )}

          {/* Recording indicator */}
          {isRecording && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-full flex items-center gap-2">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
              <span className="font-mono">{formatTime(recordingTime)}</span>
            </div>
          )}

          {/* Hidden canvas for photo capture */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Controls */}
        <div className="p-6 bg-black/50">
          {/* Show choice buttons after first photo */}
          {showChoiceScreen && (
            <div className="flex flex-col items-center gap-4">
              <div className="flex gap-4">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={retake}
                  className="h-12 px-6 bg-white/10 border-white text-white hover:bg-white/20"
                  data-testid="button-retake"
                >
                  <RotateCcw className="h-5 w-5 mr-2" />
                  Recommencer
                </Button>

                <Button
                  size="lg"
                  onClick={confirm}
                  className="h-12 px-6 bg-primary hover:bg-primary/90"
                  data-testid="button-confirm-single-photo"
                >
                  <Check className="h-5 w-5 mr-2" />
                  Valider
                </Button>

                <Button
                  size="lg"
                  onClick={handleAddVerso}
                  className="h-12 px-6 bg-blue-600 hover:bg-blue-700"
                  data-testid="button-add-verso"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Ajouter photo verso
                </Button>
              </div>
            </div>
          )}

          {/* Initial capture button */}
          {!showChoiceScreen && capturedImages.length === 0 && !capturedVideo && (
            <>
              {mode === "photo" && (
                <div className="flex flex-col items-center gap-4">
                  {allowMultiplePhotos && (
                    <p className="text-white text-sm">Photo recto</p>
                  )}
                  <Button
                    size="lg"
                    onClick={takePhoto}
                    disabled={!isStreaming}
                    className="h-16 w-16 rounded-full bg-white hover:bg-gray-200"
                    data-testid="button-take-photo"
                  >
                    <CameraIcon className="h-8 w-8 text-black" />
                  </Button>
                </div>
              )}

              {mode === "video" && !isRecording && (
                <Button
                  size="lg"
                  onClick={startVideoRecording}
                  disabled={!isStreaming}
                  className="h-16 w-16 rounded-full bg-red-600 hover:bg-red-700"
                  data-testid="button-start-recording"
                >
                  <Video className="h-8 w-8 text-white" />
                </Button>
              )}

              {mode === "video" && isRecording && (
                <Button
                  size="lg"
                  onClick={stopVideoRecording}
                  className="h-16 w-16 rounded-full bg-white hover:bg-gray-200"
                  data-testid="button-stop-recording"
                >
                  <div className="h-6 w-6 bg-red-600 rounded-sm" />
                </Button>
              )}
            </>
          )}

          {/* Show confirm/retake after taking second photo (or in non-multi mode) */}
          {!showChoiceScreen && 
           ((!allowMultiplePhotos && capturedImages.length > 0) || 
            (allowMultiplePhotos && capturedImages.length === 2) || 
            capturedVideo) && (
            <div className="flex items-center justify-center gap-4">
              <Button
                size="lg"
                variant="outline"
                onClick={retake}
                className="h-12 px-6 bg-white/10 border-white text-white hover:bg-white/20"
                data-testid="button-retake"
              >
                <RotateCcw className="h-5 w-5 mr-2" />
                Reprendre
              </Button>

              <Button
                size="lg"
                onClick={confirm}
                className="h-12 px-6 bg-primary hover:bg-primary/90"
                data-testid="button-confirm-capture"
              >
                <Check className="h-5 w-5 mr-2" />
                Valider
              </Button>
            </div>
          )}

          {/* Second photo capture */}
          {!showChoiceScreen && allowMultiplePhotos && capturedImages.length === 1 && isStreaming && (
            <div className="flex flex-col items-center gap-4">
              <p className="text-white text-sm">Photo verso</p>
              <div className="flex gap-4">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={retake}
                  className="h-12 px-6 bg-white/10 border-white text-white hover:bg-white/20"
                  data-testid="button-retake"
                >
                  <RotateCcw className="h-5 w-5 mr-2" />
                  Recommencer
                </Button>
                <Button
                  size="lg"
                  onClick={takePhoto}
                  disabled={!isStreaming}
                  className="h-16 w-16 rounded-full bg-white hover:bg-gray-200"
                  data-testid="button-take-photo-2"
                >
                  <CameraIcon className="h-8 w-8 text-black" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
