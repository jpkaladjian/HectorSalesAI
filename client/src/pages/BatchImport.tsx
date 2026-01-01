/**
 * Page Import Batch CSV - Module P3.2
 * Hector CRM - ADS GROUP
 * 
 * Upload CSV massif avec:
 * - Preview et mapping colonnes
 * - Déduplication automatique
 * - Enrichissement CASCADE optionnel
 * - Monitoring progression temps réel
 */

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Upload, FileSpreadsheet, CheckCircle, XCircle, AlertCircle, Download, Loader2, Info, ArrowRight } from 'lucide-react';
import Papa from 'papaparse';

// Mapping colonnes CSV → DB
const AVAILABLE_FIELDS = [
  { value: 'entreprise', label: 'Entreprise' },
  { value: 'siren', label: 'SIREN' },
  { value: 'siret', label: 'SIRET' },
  { value: 'nom', label: 'Nom contact' },
  { value: 'prenom', label: 'Prénom contact' },
  { value: 'email', label: 'Email' },
  { value: 'telephone', label: 'Téléphone' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'fonction', label: 'Fonction' },
  { value: 'adresse', label: 'Adresse' },
  { value: 'codePostal', label: 'Code postal' },
  { value: 'ville', label: 'Ville' },
  { value: 'pays', label: 'Pays' },
  { value: 'secteurActivite', label: 'Secteur' },
  { value: 'effectif', label: 'Effectif' },
  { value: 'chiffreAffaires', label: 'CA' },
  { value: 'notes', label: 'Notes' },
];

interface CSVPreview {
  headers: string[];
  rows: any[];
  totalRows: number;
}

interface ImportOptions {
  autoEnrich: boolean;
  deduplicate: boolean;
  skipDuplicates: boolean;
}

interface BatchImportStatus {
  id: string;
  filename: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  totalRows: number;
  processedRows: number;
  successCount: number;
  errorCount: number;
  duplicateCount: number;
  errors?: Array<{ row: number; error: string; data: any }>;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

interface HistoryData {
  history: BatchImportStatus[];
}

export default function BatchImport() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // États
  const [csvFile, setCSVFile] = useState<File | null>(null);
  const [csvPreview, setCSVPreview] = useState<CSVPreview | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [options, setOptions] = useState<ImportOptions>({
    autoEnrich: true,
    deduplicate: true,
    skipDuplicates: true,
  });
  const [currentBatchId, setCurrentBatchId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('upload');

  // Query historique
  const { data: historyData } = useQuery({
    queryKey: ['/api/batch-import/history'],
    refetchInterval: currentBatchId ? 3000 : false, // Poll si import en cours
  });

  // Query statut import en cours
  const { data: statusData } = useQuery({
    queryKey: ['/api/batch-import', currentBatchId, 'status'],
    enabled: !!currentBatchId,
    refetchInterval: 2000, // Poll toutes les 2s
  });

  // Mutation upload
  const uploadMutation = useMutation({
    mutationFn: async ({ file, mapping, options }: { file: File; mapping: Record<string, string>; options: ImportOptions }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('mapping', JSON.stringify(mapping));
      formData.append('options', JSON.stringify(options));

      const response = await fetch('/api/batch-import/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur upload');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Import démarré',
        description: data.message,
      });
      
      setCurrentBatchId(data.batchId);
      setActiveTab('monitoring');
      queryClient.invalidateQueries({ queryKey: ['/api/batch-import/history'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur import',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Handler upload fichier
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Fichier trop volumineux',
        description: 'Maximum 5 MB',
        variant: 'destructive',
      });
      return;
    }

    setCSVFile(file);
    
    // Parser preview
    Papa.parse(file, {
      header: true,
      preview: 10,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        const rows = results.data;
        
        setCSVPreview({
          headers,
          rows,
          totalRows: rows.length,
        });

        // Auto-mapping basique
        const autoMapping: Record<string, string> = {};
        headers.forEach((header) => {
          const normalized = header.toLowerCase().trim();
          
          if (normalized.includes('entreprise') || normalized.includes('societe')) {
            autoMapping[header] = 'entreprise';
          } else if (normalized.includes('siren') && !normalized.includes('siret')) {
            autoMapping[header] = 'siren';
          } else if (normalized.includes('siret')) {
            autoMapping[header] = 'siret';
          } else if (normalized.includes('email') || normalized.includes('mail')) {
            autoMapping[header] = 'email';
          } else if (normalized.includes('tel') || normalized.includes('phone')) {
            autoMapping[header] = 'telephone';
          } else if (normalized.includes('nom') && !normalized.includes('prenom')) {
            autoMapping[header] = 'nom';
          } else if (normalized.includes('prenom')) {
            autoMapping[header] = 'prenom';
          } else if (normalized.includes('ville')) {
            autoMapping[header] = 'ville';
          }
        });
        
        setMapping(autoMapping);
        setActiveTab('mapping');
      },
      error: (error) => {
        toast({
          title: 'Erreur parsing CSV',
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  // Handler lancement import
  const handleStartImport = () => {
    if (!csvFile) {
      toast({
        title: 'Aucun fichier',
        description: 'Veuillez sélectionner un fichier CSV',
        variant: 'destructive',
      });
      return;
    }

    if (Object.keys(mapping).length === 0) {
      toast({
        title: 'Mapping requis',
        description: 'Veuillez mapper au moins une colonne',
        variant: 'destructive',
      });
      return;
    }

    uploadMutation.mutate({ file: csvFile, mapping, options });
  };

  // Détection fin import
  useEffect(() => {
    if (statusData?.status === 'completed' || statusData?.status === 'failed') {
      queryClient.invalidateQueries({ queryKey: ['/api/batch-import/history'] });
      
      if (statusData.status === 'completed') {
        toast({
          title: 'Import terminé',
          description: `${statusData.successCount} prospects créés`,
        });
      }
    }
  }, [statusData?.status]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-batch-import-title">
              Import Batch CSV
            </h1>
            <p className="text-muted-foreground">
              Importez jusqu'à 1000 prospects en une fois avec enrichissement automatique
            </p>
          </div>
          
          <Button
            variant="outline"
            onClick={() => {
              setCSVFile(null);
              setCSVPreview(null);
              setMapping({});
              setCurrentBatchId(null);
              setActiveTab('upload');
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
            data-testid="button-reset-import"
          >
            Nouvel import
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upload" data-testid="tab-upload">
              1. Upload
            </TabsTrigger>
            <TabsTrigger value="mapping" disabled={!csvPreview} data-testid="tab-mapping">
              2. Mapping
            </TabsTrigger>
            <TabsTrigger value="options" disabled={!csvPreview} data-testid="tab-options">
              3. Options
            </TabsTrigger>
            <TabsTrigger value="monitoring" disabled={!currentBatchId} data-testid="tab-monitoring">
              4. Monitoring
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Upload */}
          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sélectionner un fichier CSV</CardTitle>
                <CardDescription>
                  Formats acceptés: .csv, .txt (max 5 MB, 1000 lignes)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center border-2 border-dashed rounded-lg p-12">
                  <div className="text-center space-y-4">
                    <FileSpreadsheet className="mx-auto h-12 w-12 text-muted-foreground" />
                    
                    <div>
                      <Input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.txt"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="csv-upload"
                        data-testid="input-csv-file"
                      />
                      <Label htmlFor="csv-upload">
                        <Button variant="default" asChild data-testid="button-select-file">
                          <span>
                            <Upload className="mr-2 h-4 w-4" />
                            Sélectionner un fichier
                          </span>
                        </Button>
                      </Label>
                    </div>
                    
                    {csvFile && (
                      <div className="text-sm text-muted-foreground">
                        Fichier: <strong>{csvFile.name}</strong> ({(csvFile.size / 1024).toFixed(1)} KB)
                      </div>
                    )}
                  </div>
                </div>

                {csvPreview && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <strong>{csvPreview.totalRows} lignes</strong> détectées dans le fichier.
                      Passez à l'étape suivante pour mapper les colonnes.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {csvPreview && (
              <Card>
                <CardHeader>
                  <CardTitle>Aperçu des données</CardTitle>
                  <CardDescription>Premières lignes du fichier</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {csvPreview.headers.map((header) => (
                            <TableHead key={header}>{header}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {csvPreview.rows.slice(0, 5).map((row, idx) => (
                          <TableRow key={idx}>
                            {csvPreview.headers.map((header) => (
                              <TableCell key={header} className="max-w-xs truncate">
                                {row[header]}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* TAB 2: Mapping */}
          <TabsContent value="mapping" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mapper les colonnes</CardTitle>
                <CardDescription>
                  Associez chaque colonne CSV à un champ Hector CRM
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {csvPreview?.headers.map((header) => (
                  <div key={header} className="flex items-center gap-4">
                    <div className="flex-1">
                      <Label className="font-mono text-sm">{header}</Label>
                    </div>
                    
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    
                    <div className="flex-1">
                      <Select
                        value={mapping[header] || ''}
                        onValueChange={(value) => {
                          if (value === 'skip') {
                            const newMapping = { ...mapping };
                            delete newMapping[header];
                            setMapping(newMapping);
                          } else {
                            setMapping({ ...mapping, [header]: value });
                          }
                        }}
                      >
                        <SelectTrigger data-testid={`select-mapping-${header}`}>
                          <SelectValue placeholder="Ignorer cette colonne" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="skip">Ignorer</SelectItem>
                          {AVAILABLE_FIELDS.map((field) => (
                            <SelectItem key={field.value} value={field.value}>
                              {field.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {Object.keys(mapping).length} colonnes mappées
                  </div>
                  
                  <Button
                    onClick={() => setActiveTab('options')}
                    disabled={Object.keys(mapping).length === 0}
                    data-testid="button-next-options"
                  >
                    Suivant: Options
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: Options */}
          <TabsContent value="options" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Options d'import</CardTitle>
                <CardDescription>
                  Configurez le comportement de l'import
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="auto-enrich">Enrichissement automatique CASCADE</Label>
                    <p className="text-sm text-muted-foreground">
                      Enrichir via INSEE/Pappers si SIREN présent
                    </p>
                  </div>
                  <Switch
                    id="auto-enrich"
                    checked={options.autoEnrich}
                    onCheckedChange={(checked) => setOptions({ ...options, autoEnrich: checked })}
                    data-testid="switch-auto-enrich"
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="deduplicate">Détecter les doublons</Label>
                    <p className="text-sm text-muted-foreground">
                      Vérifier SIREN, email, téléphone existants
                    </p>
                  </div>
                  <Switch
                    id="deduplicate"
                    checked={options.deduplicate}
                    onCheckedChange={(checked) => setOptions({ ...options, deduplicate: checked })}
                    data-testid="switch-deduplicate"
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="skip-duplicates">Ignorer les doublons</Label>
                    <p className="text-sm text-muted-foreground">
                      Ne pas créer si prospect déjà existant
                    </p>
                  </div>
                  <Switch
                    id="skip-duplicates"
                    checked={options.skipDuplicates}
                    onCheckedChange={(checked) => setOptions({ ...options, skipDuplicates: checked })}
                    disabled={!options.deduplicate}
                    data-testid="switch-skip-duplicates"
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <strong>{csvPreview?.totalRows || 0} prospects</strong> à importer
                  </div>
                  
                  <Button
                    onClick={handleStartImport}
                    disabled={uploadMutation.isPending}
                    data-testid="button-start-import"
                  >
                    {uploadMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Démarrage...
                      </>
                    ) : (
                      <>
                        Lancer l'import
                        <CheckCircle className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4: Monitoring */}
          <TabsContent value="monitoring" className="space-y-6">
            {statusData && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Import en cours</CardTitle>
                      <CardDescription>{statusData.filename}</CardDescription>
                    </div>
                    
                    <Badge variant={
                      statusData.status === 'completed' ? 'default' :
                      statusData.status === 'failed' ? 'destructive' :
                      statusData.status === 'processing' ? 'secondary' :
                      'outline'
                    }>
                      {statusData.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Progression</span>
                      <span className="text-sm font-medium">{statusData.progress}%</span>
                    </div>
                    <Progress value={statusData.progress} data-testid="progress-import" />
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{statusData.totalRows}</div>
                      <div className="text-sm text-muted-foreground">Total</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{statusData.successCount}</div>
                      <div className="text-sm text-muted-foreground">Succès</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{statusData.errorCount}</div>
                      <div className="text-sm text-muted-foreground">Erreurs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{statusData.duplicateCount}</div>
                      <div className="text-sm text-muted-foreground">Doublons</div>
                    </div>
                  </div>

                  {statusData.errors && statusData.errors.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Erreurs détectées</h4>
                      <div className="max-h-60 overflow-y-auto space-y-2">
                        {statusData.errors.slice(0, 10).map((err: any, idx: number) => (
                          <Alert key={idx} variant="destructive">
                            <AlertDescription>
                              <strong>Ligne {err.row}:</strong> {err.error}
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Historique */}
            <Card>
              <CardHeader>
                <CardTitle>Historique des imports</CardTitle>
                <CardDescription>20 derniers imports batch</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fichier</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Succès</TableHead>
                      <TableHead className="text-right">Erreurs</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historyData?.history?.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.filename}</TableCell>
                        <TableCell>{new Date(item.createdAt).toLocaleDateString('fr-FR')}</TableCell>
                        <TableCell>
                          <Badge variant={
                            item.status === 'completed' ? 'default' :
                            item.status === 'failed' ? 'destructive' :
                            item.status === 'processing' ? 'secondary' :
                            'outline'
                          }>
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{item.totalRows}</TableCell>
                        <TableCell className="text-right text-green-600">{item.successCount}</TableCell>
                        <TableCell className="text-right text-red-600">{item.errorCount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
