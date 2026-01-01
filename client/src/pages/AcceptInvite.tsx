import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AdsGroupLogo } from "@/components/AdsGroupLogo";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default function AcceptInvite() {
  const [, setLocation] = useLocation();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Extract token from URL
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    if (urlToken) {
      setToken(urlToken);
      setIsValid(true);
    } else {
      setIsValid(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
      });
      return;
    }

    if (password.length < 8) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 8 caractères",
      });
      return;
    }

    setIsLoading(true);

    try {
      await apiRequest('POST', '/api/auth/accept-invite', {
        token,
        password,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
      });

      toast({
        title: "Compte créé",
        description: "Ton compte a été créé avec succès. Connexion en cours...",
      });

      // Redirect to home after successful account creation
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);

    } catch (error: any) {
      console.error('Accept invite error:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de créer le compte. Le lien a peut-être expiré.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValid) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0A1628]">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md mx-auto space-y-8">
            <div className="flex justify-center">
              <AdsGroupLogo height={45} />
            </div>
            
            <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10 text-center space-y-4">
              <div className="flex justify-center">
                <AlertCircle className="h-16 w-16 text-destructive" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                Lien invalide
              </h1>
              <p className="text-muted-foreground">
                Ce lien d'invitation est invalide ou a expiré.
              </p>
              <p className="text-sm text-muted-foreground">
                Contacte ton administrateur pour recevoir une nouvelle invitation.
              </p>
              <Button
                onClick={() => setLocation('/login')}
                className="w-full"
                data-testid="button-back-to-login"
              >
                Retour à la connexion
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0A1628]">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md mx-auto space-y-8">
          <div className="flex justify-center">
            <AdsGroupLogo height={45} />
          </div>
          
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10 space-y-6">
            <div className="text-center space-y-2 pb-4">
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="h-16 w-16 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">
                Bienvenue dans l'équipe !
              </h1>
              <p className="text-sm text-muted-foreground">
                Crée ton compte pour accéder à Hector
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Jean"
                    disabled={isLoading}
                    data-testid="input-first-name"
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Dupont"
                    disabled={isLoading}
                    data-testid="input-last-name"
                    className="h-12 text-base"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe *</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Au moins 8 caractères"
                  required
                  minLength={8}
                  disabled={isLoading}
                  data-testid="input-password"
                  className="h-12 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Répète ton mot de passe"
                  required
                  minLength={8}
                  disabled={isLoading}
                  data-testid="input-confirm-password"
                  className="h-12 text-base"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-[#1e3a5f] hover:bg-[#2d4a6f] text-white font-medium"
                disabled={isLoading}
                data-testid="button-create-account"
              >
                {isLoading ? "Création du compte..." : "Créer mon compte"}
              </Button>
            </form>

            <div className="pt-4 border-t border-border text-center">
              <p className="text-xs text-muted-foreground">
                En créant ton compte, tu rejoins Hector, l'assistant commercial IA d'ADS GROUP
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
