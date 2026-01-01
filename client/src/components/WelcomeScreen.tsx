import { MessageSquare, Calendar, GraduationCap, Lightbulb, Camera, Video, CalendarCheck, FolderKanban, UserSearch, Target, Phone, ClipboardList, TrendingUp, Sparkles, Zap, Users, FileSpreadsheet } from "lucide-react";
import { FeatureType } from "@shared/schema";
import hectorHero from "@assets/image_1762359591054.png";
import { Link } from "wouter";

const features = [
  {
    type: "commercial" as FeatureType,
    icon: MessageSquare,
    title: "Questions Commerciales",
    description: "Réponses expertes à vos défis de vente et stratégies commerciales",
  },
  {
    type: "meeting" as FeatureType,
    icon: Calendar,
    title: "Structure de Réunion",
    description: "Créez des agendas structurés et productifs pour vos réunions managériales",
  },
  {
    type: "training" as FeatureType,
    icon: GraduationCap,
    title: "Formation Équipes",
    description: "Modules de formation et conseils pour développer vos compétences commerciales",
  },
  {
    type: "arguments" as FeatureType,
    icon: Lightbulb,
    title: "Arguments de Vente",
    description: "Générez des arguments percutants adaptés à votre contexte commercial",
  },
];

interface WelcomeScreenProps {
  onFeatureSelect?: (feature: FeatureType) => void;
  onCameraClick?: (mode: "photo" | "video") => void;
  onPatronSearchClick?: () => void;
}

export function WelcomeScreen({ onFeatureSelect, onCameraClick, onPatronSearchClick }: WelcomeScreenProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      {/* Hero Section - Image + Présentation optimisé mobile */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="w-full">
          <div className="flex flex-col lg:flex-row lg:items-center lg:max-w-7xl lg:mx-auto">
            {/* Image - Centrée sur mobile, alignée à gauche sur desktop */}
            <div className="w-full flex items-center justify-center p-3 sm:p-6 lg:py-8 lg:px-0 lg:pl-0 lg:justify-start lg:w-1/2">
              <img 
                src={hectorHero} 
                alt="Hector - Agent IA Business" 
                className="w-full max-w-[300px] sm:max-w-sm lg:max-w-lg object-contain mx-auto lg:mx-0"
              />
            </div>
            
            {/* Texte de présentation - Visible et lisible sur mobile */}
            <div className="w-full px-4 py-4 sm:px-6 sm:py-6 lg:py-12 lg:pl-6 lg:pr-12 lg:w-1/2">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 rounded-lg bg-cyan-500/20 backdrop-blur-sm border border-cyan-400/30">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                </div>
                <span className="text-xs font-medium text-cyan-300 uppercase tracking-wider">
                  Intelligence Artificielle
                </span>
              </div>
              
              <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 lg:mb-6 leading-tight">
                Bienvenue sur Hector
              </h1>
              
              <p className="text-sm sm:text-base lg:text-lg text-white leading-relaxed mb-3 sm:mb-4 lg:mb-6">
                Je suis <span className="font-bold text-cyan-300">Hector d'ADS GROUP SECURITY</span>, ton agent IA, pour t'aider à <span className="font-bold text-white">booster tes performances</span> !
              </p>
              
              <p className="text-xs sm:text-sm lg:text-base text-white/90 leading-relaxed">
                Je peux t'aider à <strong className="text-white">structurer tes réunions managériales</strong> et tes rituels, <strong className="text-white">te former et former tes équipes</strong>, dynamiser ta communication, trouver des <strong className="text-white">arguments percutants</strong>, créer de la valeur ajoutée avec toi !
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 md:px-12 lg:px-16 py-6 sm:py-8 max-w-7xl mx-auto space-y-8 sm:space-y-10">
        
        {/* Quick Stats - Optimisé mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-lg p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-3 rounded-lg bg-blue-500/20">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-foreground">24/7</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Assistant disponible</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-lg p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-3 rounded-lg bg-green-500/20">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-foreground">+35%</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Performance moyenne</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-lg p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-3 rounded-lg bg-purple-500/20">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-foreground">100%</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Équipe équipée</p>
              </div>
            </div>
          </div>
        </div>

        {/* 1. Gestion Terrain */}
        <div>
          <div className="mb-4 sm:mb-5">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2 flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-lg bg-blue-500/10">
                <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
              </div>
              Gestion Terrain
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Outils intelligents pour une efficacité maximale sur le terrain
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <button
              onClick={() => onCameraClick?.("photo")}
              className="flex items-start gap-3 sm:gap-4 p-4 sm:p-5 border rounded-lg hover-elevate active-elevate-2 transition-all bg-card group"
              data-testid="button-take-photo"
            >
              <div className="p-2 sm:p-3 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-sm sm:text-base font-semibold mb-1">Scanner carte de visite</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Digitalise et enregistre instantanément les contacts
                </p>
              </div>
            </button>

            <button
              onClick={() => onPatronSearchClick?.()}
              className="flex items-start gap-3 sm:gap-4 p-4 sm:p-5 border rounded-lg hover-elevate active-elevate-2 transition-all bg-card group"
              data-testid="button-patron-search"
            >
              <div className="p-2 sm:p-3 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                <UserSearch className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-sm sm:text-base font-semibold mb-1">Trouve-moi le patron</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Identifie rapidement les décideurs clés
                </p>
              </div>
            </button>

            <Link
              href="/crm/prospects-a-qualifier"
              className="flex items-start gap-3 sm:gap-4 p-4 sm:p-5 border rounded-lg hover-elevate active-elevate-2 transition-all bg-card group"
              data-testid="button-prospects-qualifier"
            >
              <div className="p-2 sm:p-3 rounded-lg bg-indigo-500/10 group-hover:bg-indigo-500/20 transition-colors">
                <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-sm sm:text-base font-semibold mb-1">Prospects à qualifier</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Validation et enrichissement post-terrain
                </p>
              </div>
            </Link>

            <Link
              href="/crm/batch-import"
              className="flex items-start gap-3 sm:gap-4 p-4 sm:p-5 border rounded-lg hover-elevate active-elevate-2 transition-all bg-card group"
              data-testid="button-batch-import"
            >
              <div className="p-2 sm:p-3 rounded-lg bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
                <FileSpreadsheet className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-sm sm:text-base font-semibold mb-1">Import CSV massif</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Importe jusqu'à 1000+ prospects en un clic
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* 2. Pipeline Commercial */}
        <div>
          <div className="mb-4 sm:mb-5">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2 flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-lg bg-green-500/10">
                <FolderKanban className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
              </div>
              Pipeline Commercial
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Pilote ton activité et maximise ton taux de conversion
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Link
              href="/crm/dashboard"
              className="flex flex-col gap-2 sm:gap-3 p-4 sm:p-5 border rounded-lg hover-elevate active-elevate-2 transition-all bg-card group"
              data-testid="button-view-crm"
            >
              <div className="p-2 sm:p-3 rounded-lg bg-primary/10 w-fit group-hover:bg-primary/20 transition-colors">
                <FolderKanban className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold mb-1">Pré-CRM</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Gestion complète de la relation client
                </p>
              </div>
            </Link>

            <Link
              href="/crm/rdvs"
              className="flex flex-col gap-2 sm:gap-3 p-4 sm:p-5 border rounded-lg hover-elevate active-elevate-2 transition-all bg-card group"
              data-testid="button-view-appointments"
            >
              <div className="p-2 sm:p-3 rounded-lg bg-green-500/10 w-fit group-hover:bg-green-500/20 transition-colors">
                <CalendarCheck className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold mb-1">Mes RDV</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Calendrier et préparation rendez-vous
                </p>
              </div>
            </Link>

            <Link
              href="/crm/opportunities-module"
              className="flex flex-col gap-2 sm:gap-3 p-4 sm:p-5 border rounded-lg hover-elevate active-elevate-2 transition-all bg-card group"
              data-testid="button-opportunities"
            >
              <div className="p-2 sm:p-3 rounded-lg bg-amber-500/10 w-fit group-hover:bg-amber-500/20 transition-colors">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold mb-1">Opportunités</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Scoring AI intelligent
                </p>
              </div>
            </Link>

            <button
              onClick={() => onCameraClick?.("video")}
              className="flex flex-col gap-2 sm:gap-3 p-4 sm:p-5 border rounded-lg hover-elevate active-elevate-2 transition-all bg-card group"
              data-testid="button-record-video"
            >
              <div className="p-2 sm:p-3 rounded-lg bg-red-500/10 w-fit group-hover:bg-red-500/20 transition-colors">
                <Video className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold mb-1">Vidéo pitch</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Enregistre tes argumentaires
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* 3. Prospection Active */}
        <div>
          <div className="mb-4 sm:mb-5">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2 flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-lg bg-orange-500/10">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
              </div>
              Prospection Active
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Automatise et amplifie ta génération de leads
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Link
              href="/prospection/campagnes"
              className="flex items-start gap-3 sm:gap-4 p-4 sm:p-5 border rounded-lg hover-elevate active-elevate-2 transition-all bg-card group"
              data-testid="button-prospection-linkedin"
            >
              <div className="p-2 sm:p-3 rounded-lg bg-cyan-500/10 group-hover:bg-cyan-500/20 transition-colors">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-500" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-sm sm:text-base font-semibold mb-1">Prospection LinkedIn</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Campagnes multi-canal automatisées avec AI
                </p>
              </div>
            </Link>

            <Link
              href="/phoning"
              className="flex items-start gap-3 sm:gap-4 p-4 sm:p-5 border rounded-lg hover-elevate active-elevate-2 transition-all bg-card group"
              data-testid="button-session-phoning"
            >
              <div className="p-2 sm:p-3 rounded-lg bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors">
                <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-sm sm:text-base font-semibold mb-1">Session phoning</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Appels commerciaux assistés par IA
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* 4. Intelligence Commerciale */}
        <div>
          <div className="mb-4 sm:mb-5">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2 flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10">
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              Intelligence Commerciale
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Ton cerveau augmenté pour toutes les situations de vente
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <button
                  key={feature.title}
                  onClick={() => onFeatureSelect?.(feature.type)}
                  className="text-left rounded-lg border bg-card p-4 sm:p-5 hover-elevate active-elevate-2 transition-all group"
                  data-testid={`card-welcome-feature-${feature.type}`}
                >
                  <div className="space-y-2 sm:space-y-3">
                    <div className="p-2 sm:p-3 rounded-lg bg-primary/10 w-fit group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                    <h3 className="text-sm sm:text-base font-semibold text-card-foreground">{feature.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-lg p-6 sm:p-8 text-center">
          <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">
            Prêt à transformer ta performance commerciale ?
          </h3>
          <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
            Sélectionne une fonctionnalité ci-dessus ou commence à discuter avec Hector pour obtenir des réponses instantanées.
          </p>
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
            <span>Propulsé par l'Intelligence Artificielle Claude</span>
          </div>
        </div>
      </div>
    </div>
  );
}
