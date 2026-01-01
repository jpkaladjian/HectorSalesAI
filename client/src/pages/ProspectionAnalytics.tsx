import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  ArrowLeft,
  Users,
  MessageSquare,
  CheckCircle2,
  TrendingUp,
  Target,
  Send,
  Mail,
  Linkedin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavigationBar } from "@/components/NavigationBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface GlobalStats {
  totalProspects: number;
  prospectsActifs: number;
  prospectsCompleted: number;
  totalInteractions: number;
  totalReponses: number;
  tauxReponse: number;
  campagnesActives: number;
  campagnesTotales: number;
}

interface FunnelData {
  etape: number;
  count: number;
}

interface TopMessage {
  message: string;
  canal: string;
  envois: number;
}

interface ABVariant {
  id: string;
  variantName: string;
  canal: string;
  metrics: {
    sent: number;
    opened: number;
    clicked: number;
    replied: number;
    accepted: number;
    rejected: number;
    bounced: number;
  };
  score: number;
  openRate: number;
  clickRate: number;
  replyRate: number;
}

export default function ProspectionAnalytics() {
  const { data: stats, isLoading: statsLoading } = useQuery<GlobalStats>({
    queryKey: ["/api/prospection/analytics/global-stats"],
  });

  const { data: funnelData = [], isLoading: funnelLoading } = useQuery<FunnelData[]>({
    queryKey: ["/api/prospection/analytics/conversion-funnel"],
  });

  const { data: topMessages = [], isLoading: messagesLoading } = useQuery<TopMessage[]>({
    queryKey: ["/api/prospection/analytics/top-messages"],
  });

  const { data: abVariants = [], isLoading: abLoading } = useQuery<ABVariant[]>({
    queryKey: ["/api/prospection/analytics/ab-variants"],
  });

  const getChannelIcon = (canal: string) => {
    switch (canal) {
      case 'linkedin':
        return <Linkedin className="h-4 w-4" />;
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'sms':
        return <Send className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getChannelBadgeVariant = (canal: string) => {
    switch (canal) {
      case 'linkedin':
        return 'default';
      case 'email':
        return 'secondary';
      case 'sms':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  // Préparer les données pour le funnel
  const funnelChartData = funnelData.map((item) => ({
    name: `Étape ${item.etape}`,
    prospects: item.count,
  }));

  const COLORS = ['#0ea5e9', '#06b6d4', '#14b8a6', '#10b981', '#22c55e'];

  if (statsLoading || funnelLoading || messagesLoading || abLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/prospection/campagnes">
              <Button variant="ghost" size="icon" data-testid="button-back">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold" data-testid="text-title">
                Analytics Prospection
              </h1>
              <p className="text-muted-foreground">
                Vue d'ensemble de vos performances
              </p>
            </div>
          </div>
          <NavigationBar showHomeButton={true} />
        </div>

        {/* Stats globales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total prospects</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-total-prospects">
                {stats?.totalProspects || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.prospectsActifs || 0} actifs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Interactions</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-total-interactions">
                {stats?.totalInteractions || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.totalReponses || 0} réponses
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taux de réponse</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-response-rate">
                {stats?.tauxReponse || 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Sur {stats?.totalInteractions || 0} envois
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Campagnes</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-total-campaigns">
                {stats?.campagnesTotales || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.campagnesActives || 0} actives
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Funnel de conversion */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Funnel de conversion
            </CardTitle>
          </CardHeader>
          <CardContent>
            {funnelChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={funnelChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="prospects" fill="#0ea5e9" radius={[8, 8, 0, 0]}>
                    {funnelChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Aucune donnée disponible pour le funnel
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top messages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Top messages performants
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topMessages.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Message</TableHead>
                    <TableHead>Canal</TableHead>
                    <TableHead className="text-right">Envois</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topMessages.map((msg, index) => (
                    <TableRow key={index} data-testid={`row-message-${index}`}>
                      <TableCell className="max-w-md truncate" data-testid={`text-message-${index}`}>
                        {msg.message}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getChannelBadgeVariant(msg.canal)}
                          className="gap-1"
                          data-testid={`badge-canal-${index}`}
                        >
                          {getChannelIcon(msg.canal)}
                          {msg.canal}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium" data-testid={`stat-envois-${index}`}>
                        {msg.envois}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Aucun message envoyé pour le moment
              </div>
            )}
          </CardContent>
        </Card>

        {/* A/B Testing Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              A/B Testing - Top Variants
            </CardTitle>
          </CardHeader>
          <CardContent>
            {abVariants.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Variant</TableHead>
                    <TableHead>Canal</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                    <TableHead className="text-right">Envois</TableHead>
                    <TableHead className="text-right">Taux ouverture</TableHead>
                    <TableHead className="text-right">Taux clic</TableHead>
                    <TableHead className="text-right">Taux réponse</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {abVariants.map((variant, index) => (
                    <TableRow key={variant.id} data-testid={`row-variant-${index}`}>
                      <TableCell className="font-medium" data-testid={`text-variant-name-${index}`}>
                        {variant.variantName}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getChannelBadgeVariant(variant.canal)}
                          className="gap-1"
                          data-testid={`badge-canal-${index}`}
                        >
                          {getChannelIcon(variant.canal)}
                          {variant.canal}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold" data-testid={`stat-score-${index}`}>
                        <Badge variant={variant.score > 0 ? "default" : "secondary"}>
                          {variant.score > 0 ? '+' : ''}{variant.score.toFixed(3)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right" data-testid={`stat-sent-${index}`}>
                        {variant.metrics.sent}
                      </TableCell>
                      <TableCell className="text-right" data-testid={`stat-open-rate-${index}`}>
                        <span className={variant.openRate > 20 ? "text-green-600 dark:text-green-400 font-medium" : ""}>
                          {variant.openRate}%
                        </span>
                      </TableCell>
                      <TableCell className="text-right" data-testid={`stat-click-rate-${index}`}>
                        <span className={variant.clickRate > 5 ? "text-green-600 dark:text-green-400 font-medium" : ""}>
                          {variant.clickRate}%
                        </span>
                      </TableCell>
                      <TableCell className="text-right" data-testid={`stat-reply-rate-${index}`}>
                        <span className={variant.replyRate > 10 ? "text-green-600 dark:text-green-400 font-medium" : ""}>
                          {variant.replyRate}%
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Aucun variant A/B testing disponible. Créez des variants pour comparer les performances de vos messages.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
