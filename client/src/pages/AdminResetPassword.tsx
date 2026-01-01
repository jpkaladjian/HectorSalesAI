import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function AdminResetPassword() {
  const [email, setEmail] = useState("kaladjian@adsgroup-security.com");
  const [password, setPassword] = useState("Hector2025!");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleReset = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/admin/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          new_password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "✅ Mot de passe réinitialisé !",
          description: `Vous pouvez maintenant vous connecter avec ${email}`,
        });
      } else {
        toast({
          title: "Erreur",
          description: data.detail || "Impossible de réinitialiser le mot de passe",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur réseau",
        description: "Impossible de contacter le serveur",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>⚙️ Réinitialisation Admin</CardTitle>
          <CardDescription>
            Page temporaire pour réinitialiser votre mot de passe
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              data-testid="input-admin-email"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Nouveau mot de passe</label>
            <Input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              data-testid="input-admin-password"
            />
          </div>

          <Button
            className="w-full"
            onClick={handleReset}
            disabled={isLoading}
            data-testid="button-admin-reset"
          >
            {isLoading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
          </Button>

          <div className="text-sm text-muted-foreground text-center">
            ⚠️ Cette page est temporaire et sera supprimée
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
