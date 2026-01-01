import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface Script {
  id: string;
  prospectId: string;
  scriptContent: string;
  callObjective: string;
  discProfile: string | null;
  createdAt: string;
}

export function ScriptViewer({ prospectId }: { prospectId: string }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [callObjective, setCallObjective] = useState('Établir premier contact et qualifier le besoin');
  const { toast } = useToast();

  const { data, isLoading } = useQuery<{ success: boolean; data?: Script; error?: string }>({
    queryKey: [`/api/phone/scripts/${prospectId}`],
  });

  const handleGenerateScript = async () => {
    if (callObjective.length < 10) {
      toast({
        title: 'Objectif trop court',
        description: 'L\'objectif doit contenir au moins 10 caractères',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsGenerating(true);

      await apiRequest('POST', '/api/phone/scripts/generate', { 
        prospectId,
        callObjective
      });

      await queryClient.invalidateQueries({ 
        queryKey: [`/api/phone/scripts/${prospectId}`] 
      });

      toast({
        title: 'Script généré',
        description: 'Le script d\'appel a été créé avec succès',
      });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de générer le script',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return <ScriptViewerSkeleton />;
  }

  const latestScript = data?.success ? data.data : undefined;

  return (
    <Card data-testid="card-script-viewer">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Script d'appel IA
            </CardTitle>
            <CardDescription>
              Argumentaire personnalisé généré par Claude
            </CardDescription>
          </div>
          <Button
            onClick={handleGenerateScript}
            disabled={isGenerating}
            variant="outline"
            size="sm"
            data-testid="button-generate-script"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            {latestScript ? 'Régénérer' : 'Générer'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 space-y-2">
          <Label htmlFor="callObjective">Objectif de l'appel</Label>
          <Input
            id="callObjective"
            value={callObjective}
            onChange={(e) => setCallObjective(e.target.value)}
            placeholder="Ex: Établir premier contact et qualifier le besoin"
            disabled={isGenerating}
            data-testid="input-call-objective"
          />
          <p className="text-xs text-muted-foreground">
            Minimum 10 caractères pour générer un script personnalisé
          </p>
        </div>
        {!latestScript ? (
          <div className="text-center py-12" data-testid="empty-state">
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-muted-foreground/20" />
            <p className="text-sm text-muted-foreground mb-4">
              Aucun script généré pour ce prospect
            </p>
            <Button onClick={handleGenerateScript} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Générer un script
                </>
              )}
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="script" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="script" data-testid="tab-script">Script</TabsTrigger>
              <TabsTrigger value="points" data-testid="tab-points">Points clés</TabsTrigger>
              <TabsTrigger value="objections" data-testid="tab-objections">Objections</TabsTrigger>
            </TabsList>

            <TabsContent value="script" className="mt-4">
              <ScrollArea className="h-[400px]">
                <div className="prose prose-sm max-w-none" data-testid="script-content">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {latestScript.scriptContent}
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="points" className="mt-4">
              <ScrollArea className="h-[400px]">
                <div className="space-y-2 text-sm" data-testid="key-points">
                  <p className="font-medium">Objectif : {latestScript.callObjective}</p>
                  {latestScript.discProfile && (
                    <p className="text-muted-foreground">Profil DISC : {latestScript.discProfile}</p>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="objections" className="mt-4">
              <ScrollArea className="h-[400px]">
                <div className="text-sm text-muted-foreground p-4" data-testid="objections-list">
                  Les réponses aux objections sont intégrées dans le script d'appel
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}

export function ScriptViewerSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}
