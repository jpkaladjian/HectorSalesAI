import { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  
  useEffect(() => {
    // Ne pas afficher si déjà installé
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }
    
    // Ne pas afficher si déjà refusé récemment (< 7 jours)
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const daysSince = (Date.now() - parseInt(dismissed)) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) {
        console.log('[PWA] Install prompt en cooldown:', Math.round(7 - daysSince), 'jours restants');
        return;
      }
    }
    
    // Ne pas afficher si déjà installé précédemment
    if (localStorage.getItem('pwa-installed') === 'true') {
      return;
    }
    
    let timeoutId: number | undefined;
    
    const handler = (e: Event) => {
      // Empêcher le prompt automatique du navigateur
      e.preventDefault();
      
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Afficher notre prompt custom après 30 secondes (une seule fois)
      if (!timeoutId) {
        timeoutId = window.setTimeout(() => {
          setShowPrompt(true);
        }, 30000);
      }
    };
    
    window.addEventListener('beforeinstallprompt', handler);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);
  
  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    // Afficher le prompt natif
    deferredPrompt.prompt();
    
    // Attendre le choix utilisateur
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log('[PWA] Installation:', outcome);
    
    if (outcome === 'accepted') {
      localStorage.setItem('pwa-installed', 'true');
    } else {
      localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    }
    
    // Reset
    setDeferredPrompt(null);
    setShowPrompt(false);
  };
  
  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };
  
  if (!showPrompt || !deferredPrompt) return null;
  
  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-4 z-50 border border-gray-200 dark:border-gray-700">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        data-testid="button-dismiss-pwa-prompt"
      >
        <X size={20} />
      </button>
      
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <Download className="text-white" size={24} />
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            Installer Hector CRM
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Accédez à Hector CRM comme une app native, avec notifications et mode offline.
          </p>
          
          <div className="flex gap-2">
            <button
              onClick={handleInstall}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition"
              data-testid="button-install-pwa"
            >
              Installer
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              data-testid="button-dismiss-pwa"
            >
              Plus tard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
