import type { Company } from "@shared/schema";

export interface WorkflowCreationProps {
  cardData?: {
    nom?: string;
    prenom?: string;
    entreprise?: string;
    email?: string;
    telephone?: string;
    secteur?: string;
    poste?: string;
    adresse1?: string;
    adresse2?: string;
    codePostal?: string;
    ville?: string;
    pays?: string;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export interface WorkflowResult {
  success: boolean;
  created: {
    prospect?: { nom: string; id?: string };
    opportunity?: { nom: string; id?: string };
    rdv?: { titre: string; id?: string };
    action?: { titre: string; id?: string };
  };
  documents?: {
    pdf_generated?: boolean;
    ical_generated?: boolean;
    email_sent?: boolean;
  };
  errors?: string[];
}

export interface CompetitorData {
  concurrentId: string;
  contractEndDate: string;
  monthlyAmount?: number;
  notes?: string;
  solutionsInstalled?: string[];
  subscriptionType?: string;
  numberOfSites?: number;
  avgContractDurationMonths?: number;
  satisfactionLevel?: string;
  satisfactionNotes?: string;
}

export interface ProspectSectionProps {
  form: any;
  concurrents: any[];
  onCompanyEnriched: (company: Company) => void;
}

export interface OpportunitySectionProps {
  form: any;
}

export interface RdvSectionProps {
  form: any;
}

export interface ActionSectionProps {
  form: any;
}

export interface CompetitorSectionProps {
  form: any;
  concurrents: any[];
}

export interface WorkflowOptionsProps {
  form: any;
}

export interface WorkflowResultProps {
  result: WorkflowResult;
}
