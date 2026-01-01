import 'express-session';

/**
 * Augmentation du type SessionData d'express-session
 * pour Hector CRM - ADS GROUP Security
 * 
 * Ce fichier définit les champs personnalisés stockés dans req.session
 * pour éliminer les erreurs TypeScript et améliorer l'autocomplétion IDE.
 * 
 * @author Jean-Pierre Kaladjian
 * @date 31 Octobre 2025
 */
declare module 'express-session' {
  interface SessionData {
    // ============================================
    // AUTHENTIFICATION
    // ============================================
    
    /** ID unique utilisateur (UUID Supabase) */
    userId?: string;
    
    /** Email utilisateur */
    email?: string;
    
    /** Prénom utilisateur */
    firstName?: string;
    
    /** Nom utilisateur */
    lastName?: string;
    
    /** Rôle: 'admin' | 'direction' | 'chef_ventes' | 'sdr' | 'bd' | 'ic' */
    role?: 'admin' | 'direction' | 'chef_ventes' | 'sdr' | 'bd' | 'ic';
    
    /** Entité: 'France' | 'Luxembourg' | 'Belgique' */
    entity?: 'France' | 'Luxembourg' | 'Belgique';
    
    /** Secteur utilisateur (ex: "Grand Ouest") */
    secteur?: string;
    
    // ============================================
    // WORKFLOW TEMPORAIRE
    // ============================================
    
    /** ID prospect créé dans workflow (avant validation) */
    workflowProspectId?: string;
    
    /** ID opportunité créée dans workflow */
    workflowOpportunityId?: string;
    
    /** ID RDV créé dans workflow */
    workflowRdvId?: string;
    
    /** Données formulaire partiel (si multi-step) */
    workflowFormData?: Record<string, any>;
    
    // ============================================
    // OAUTH / SSO
    // ============================================
    
    /** State OAuth pour CSRF protection */
    oauthState?: string;
    
    /** Provider OAuth: 'google' | 'microsoft' */
    oauthProvider?: 'google' | 'microsoft';
    
    /** Token OAuth temporaire */
    oauthToken?: string;
    
    // ============================================
    // SÉCURITÉ & MONITORING
    // ============================================
    
    /** Dernière activité utilisateur (pour timeout session) */
    lastActivity?: Date;
    
    /** Nombre tentatives login (anti brute-force) */
    loginAttempts?: number;
    
    /** IP utilisateur (pour audit) */
    ipAddress?: string;
    
    /** User-Agent (pour détection device) */
    userAgent?: string;
    
    // ============================================
    // NAVIGATION & UX
    // ============================================
    
    /** URL de redirection après login */
    redirectAfterLogin?: string;
    
    /** Toast message à afficher après redirect */
    flashMessage?: {
      type: 'success' | 'error' | 'info' | 'warning';
      message: string;
    };
    
    // ============================================
    // BUSINESS LOGIC
    // ============================================
    
    /** Prospect en cours de qualification */
    qualificationProspectId?: string;
    
    /** Filtre pipeline actif (persisté entre pages) */
    pipelineFilters?: {
      canal?: string;
      secteur?: string;
      montantMin?: number;
      montantMax?: number;
    };
    
    /** Préférences utilisateur UI */
    preferences?: {
      theme?: 'light' | 'dark';
      notificationsEnabled?: boolean;
      defaultView?: 'kanban' | 'liste';
    };
  }
}
