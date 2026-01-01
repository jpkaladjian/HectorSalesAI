import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Bot, ArrowLeft } from "lucide-react";
import hectorAvatar from "@assets/image_1761123466101.png";
import { apiRequest } from "@/lib/queryClient";

export default function ForgotPassword() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);

    try {
      await apiRequest('POST', '/api/auth/forgot-password', { email });
      setIsSuccess(true);
      toast({
        title: "Email envoyé",
        description: "Si cet email existe, un lien de réinitialisation a été envoyé",
      });
    } catch (error: any) {
      console.error('Forgot password error:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
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
              <CardTitle className="text-2xl">Email envoyé</CardTitle>
              <CardDescription>
                Vérifie ta boîte mail
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              Si un compte existe avec l'email <strong>{email}</strong>, tu recevras un lien de réinitialisation dans quelques minutes.
            </p>
          </CardContent>

          <CardFooter>
            <Button
              className="w-full"
              onClick={() => setLocation('/login')}
              data-testid="button-back-to-login"
            >
              Retour à la connexion
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

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
            <CardTitle className="text-2xl">Mot de passe oublié</CardTitle>
            <CardDescription>
              Entre ton email pour recevoir un lien de réinitialisation
            </CardDescription>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email professionnel</Label>
              <Input
                id="email"
                type="email"
                placeholder="prenom.nom@adsgroup-security.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                data-testid="input-email"
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              data-testid="button-submit"
            >
              {isLoading ? "Envoi..." : "Envoyer le lien"}
            </Button>

            <button
              type="button"
              className="w-full text-sm text-primary hover:underline flex items-center justify-center gap-2"
              onClick={() => setLocation('/login')}
              disabled={isLoading}
              data-testid="link-back-to-login"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à la connexion
            </button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
