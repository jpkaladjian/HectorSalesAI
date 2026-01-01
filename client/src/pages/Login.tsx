import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { AdsGroupLogo } from "@/components/AdsGroupLogo";
import aiHandImage from "@assets/image_1760986018611.png";
import { apiRequest } from "@/lib/queryClient";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'password'>('email');
  const { toast } = useToast();

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side domain validation
    if (!email.endsWith('@adsgroup-security.com')) {
      toast({
        variant: "destructive",
        title: "Accès refusé",
        description: "Seuls les emails @adsgroup-security.com sont autorisés",
      });
      return;
    }

    setStep('password');
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiRequest('POST', '/api/auth/login', { 
        email, 
        password,
        rememberMe 
      });
      
      // Login successful (session cookie is automatically stored by browser)
      console.log('✅ Login successful, session created', { rememberMe });
      
      // Force full page reload to refresh auth state
      // Use replace instead of href to ensure reload on mobile
      window.location.replace('/');
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        variant: "destructive",
        title: "Échec de la connexion",
        description: error.message || "Email ou mot de passe incorrect",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setStep('email');
    setPassword('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0A1628]">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left: Logo + Login Form */}
            <div className="w-full max-w-md mx-auto md:mx-0 md:ml-auto space-y-8">
              {/* Logo centered above form */}
              <div className="flex justify-center">
                <AdsGroupLogo height={45} />
              </div>
              
              {/* Login Form Card */}
              <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10 space-y-6">
                {/* Mobile title */}
                <div className="md:hidden text-center space-y-2 pb-4">
                  <h1 className="text-3xl font-bold text-foreground">
                    La nouvelle ère
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Agents intelligents pour renforcer la performance
                  </p>
                </div>

                {step === 'email' ? (
                  <form onSubmit={handleEmailSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label 
                        htmlFor="email" 
                        className="text-sm font-medium text-foreground"
                      >
                        Adresse e-mail professionnelle
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="prenom.nom@adsgroup-security.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                        data-testid="input-email"
                        className="h-12 text-base"
                      />
                      <p className="text-xs text-muted-foreground">
                        Seules les adresses @adsgroup-security.com sont autorisées
                      </p>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 bg-[#1e3a5f] hover:bg-[#2d4a6f] text-white font-medium"
                      disabled={isLoading}
                      data-testid="button-continue"
                    >
                      Continuer
                    </Button>

                    <button
                      type="button"
                      className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setLocation('/forgot-password')}
                      disabled={isLoading}
                      data-testid="link-forgot-password"
                    >
                      Mot de passe oublié ?
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handlePasswordSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label 
                        htmlFor="email-display" 
                        className="text-sm font-medium text-foreground"
                      >
                        Adresse e-mail professionnelle
                      </label>
                      <div className="h-12 px-3 flex items-center bg-muted rounded-md text-sm text-muted-foreground">
                        {email}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label 
                        htmlFor="password" 
                        className="text-sm font-medium text-foreground"
                      >
                        Mot de passe
                      </label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Entrez votre mot de passe"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                        data-testid="input-password"
                        className="h-12 text-base"
                        autoFocus
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="rememberMe"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        disabled={isLoading}
                        data-testid="checkbox-remember-me"
                        className="h-4 w-4 rounded border-gray-300 text-[#1e3a5f] focus:ring-[#1e3a5f]"
                      />
                      <label 
                        htmlFor="rememberMe" 
                        className="text-sm text-foreground cursor-pointer select-none"
                      >
                        Rester connecté (30 jours)
                      </label>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 bg-[#1e3a5f] hover:bg-[#2d4a6f] text-white font-medium"
                      disabled={isLoading}
                      data-testid="button-login"
                    >
                      {isLoading ? "Connexion..." : "Se connecter"}
                    </Button>

                    <button
                      type="button"
                      className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                      onClick={handleBack}
                      disabled={isLoading}
                      data-testid="button-back"
                    >
                      Retour
                    </button>
                  </form>
                )}

                {/* Help Text */}
                <div className="pt-4 border-t border-border text-center space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Vous ne pouvez pas vous connecter ?
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Contactez votre administrateur{" "}
                    <span className="font-medium">ADS GROUP SECURITY</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Modern AI Visual */}
            <div className="hidden md:flex flex-col justify-center space-y-6">
              <div className="space-y-4 text-white">
                <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                  La nouvelle ère
                </h1>
                <p className="text-lg text-white/90 leading-relaxed">
                  Découvrez nos agents intelligents,<br />
                  créés pour renforcer la performance<br />
                  et sécuriser le futur.
                </p>
              </div>
              <div className="relative">
                <img 
                  src={aiHandImage} 
                  alt="AI Technology" 
                  className="w-full h-auto rounded-2xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
