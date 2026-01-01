import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Bot } from "lucide-react";
import hectorAvatar from "@assets/image_1761123466101.png";
import { apiRequest } from "@/lib/queryClient";

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Extract token from URL query parameters
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      toast({
        variant: "destructive",
        title: "Lien invalide",
        description: "Aucun token de réinitialisation trouvé",
      });
      setLocation('/login');
    }
  }, [setLocation, toast]);

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
        title: "Mot de passe trop court",
        description: "Le mot de passe doit contenir au moins 8 caractères",
      });
      return;
    }

    setIsLoading(true);

    try {
      await apiRequest('POST', '/api/auth/reset-password', { token, password });
      
      toast({
        title: "Mot de passe réinitialisé",
        description: "Tu peux maintenant te connecter avec ton nouveau mot de passe",
      });

      // Redirect to login
      setTimeout(() => {
        setLocation('/login');
      }, 1500);
    } catch (error: any) {
      console.error('Reset password error:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Lien invalide ou expiré",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <Avatar className="h-20 w-20">
              <AvatarImage src={hectorAvatar} alt="Hector" />
              <AvatarFallback>
                <Bot className="h-12 w-12" />
              </AvatarFallback>
            </Avatar>
          </div>
          <div>
            <CardTitle className="text-2xl">Nouveau mot de passe</CardTitle>
            <CardDescription>
              Choisis un nouveau mot de passe sécurisé
            </CardDescription>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nouveau mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="Au moins 8 caractères"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                disabled={isLoading}
                data-testid="input-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Retape ton mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                disabled={isLoading}
                data-testid="input-confirm-password"
              />
            </div>
          </CardContent>

          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              data-testid="button-submit"
            >
              {isLoading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
