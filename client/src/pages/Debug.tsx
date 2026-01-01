import { useAuth } from "@/hooks/useAuth";
import { getAccessToken, getRefreshToken } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function Debug() {
  const { user, isLoading, isAuthenticated, isUnauthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">🔍 Page de Diagnostic</h1>
        
        <div className="bg-card p-6 rounded-lg border space-y-4">
          <h2 className="text-xl font-semibold">État de l'authentification</h2>
          
          <div className="space-y-2 font-mono text-sm">
            <p><strong>isLoading:</strong> {isLoading ? "✅ true" : "❌ false"}</p>
            <p><strong>isAuthenticated:</strong> {isAuthenticated ? "✅ true" : "❌ false"}</p>
            <p><strong>isUnauthenticated:</strong> {isUnauthenticated ? "✅ true" : "❌ false"}</p>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border space-y-4">
          <h2 className="text-xl font-semibold">Tokens localStorage</h2>
          
          <div className="space-y-2">
            <p className="font-mono text-sm break-all">
              <strong>Access Token:</strong><br />
              {accessToken || "❌ Aucun token"}
            </p>
            <p className="font-mono text-sm break-all">
              <strong>Refresh Token:</strong><br />
              {refreshToken || "❌ Aucun token"}
            </p>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border space-y-4">
          <h2 className="text-xl font-semibold">Données utilisateur</h2>
          
          <pre className="bg-muted p-4 rounded text-sm overflow-auto">
            {user ? JSON.stringify(user, null, 2) : "❌ Aucun utilisateur"}
          </pre>
        </div>

        <div className="flex gap-4">
          <Button onClick={() => setLocation("/login")}>
            Retour au Login
          </Button>
          <Button onClick={() => setLocation("/")}>
            Aller à l'accueil
          </Button>
          <Button 
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            variant="destructive"
          >
            Vider localStorage
          </Button>
        </div>
      </div>
    </div>
  );
}
