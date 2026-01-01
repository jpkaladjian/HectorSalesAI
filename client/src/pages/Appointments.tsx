import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Calendar, Mail, Phone, Building, Trash2, Eye } from "lucide-react";
import { Link } from "wouter";
import { Appointment } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function Appointments() {
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const { toast } = useToast();

  const { data: appointments = [], isLoading } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
  });

  const deleteAppointmentMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/appointments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "RDV supprimé",
        description: "Le rendez-vous a été supprimé avec succès.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer le rendez-vous",
        variant: "destructive",
      });
    },
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "confirmed":
        return "default";
      case "pending":
        return "secondary";
      case "cancelled":
        return "destructive";
      case "completed":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Confirmé";
      case "pending":
        return "En attente";
      case "cancelled":
        return "Annulé";
      case "completed":
        return "Terminé";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/">
            <Button
              variant="ghost"
              size="icon"
              data-testid="button-back-home"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-primary">Mes Rendez-vous</h1>
            <p className="text-sm text-muted-foreground">
              {appointments.length} RDV au total
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2 mt-2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : appointments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Aucun rendez-vous</h3>
              <p className="text-muted-foreground mb-6 text-center">
                Vous n'avez pas encore de rendez-vous planifié.
                <br />
                Scannez une carte de visite pour créer un RDV.
              </p>
              <Link href="/">
                <Button data-testid="button-go-home">
                  Retour à l'accueil
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {appointments.map((appointment) => (
              <Card key={appointment.id} className="hover-elevate">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {appointment.contactName}
                      </CardTitle>
                      {appointment.company && (
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <Building className="h-3 w-3" />
                          {appointment.company}
                        </CardDescription>
                      )}
                    </div>
                    <Badge variant={getStatusBadgeVariant(appointment.status)}>
                      {getStatusLabel(appointment.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {appointment.contactEmail && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{appointment.contactEmail}</span>
                    </div>
                  )}
                  
                  {appointment.contactPhone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{appointment.contactPhone}</span>
                    </div>
                  )}

                  {appointment.appointmentDate && (
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>
                        {format(new Date(appointment.appointmentDate), "PPP 'à' p", {
                          locale: fr,
                        })}
                      </span>
                    </div>
                  )}

                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setSelectedAppointment(appointment)}
                      data-testid={`button-view-appointment-${appointment.id}`}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Détails
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteAppointmentMutation.mutate(appointment.id)}
                      disabled={deleteAppointmentMutation.isPending}
                      data-testid={`button-delete-appointment-${appointment.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Appointment Details Dialog */}
      <Dialog
        open={!!selectedAppointment}
        onOpenChange={() => setSelectedAppointment(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails du rendez-vous</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-1">
                  {selectedAppointment.contactName}
                </h3>
                {selectedAppointment.company && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Building className="h-3 w-3" />
                    {selectedAppointment.company}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                {selectedAppointment.contactEmail && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedAppointment.contactEmail}</span>
                  </div>
                )}
                
                {selectedAppointment.contactPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedAppointment.contactPhone}</span>
                  </div>
                )}

                {selectedAppointment.appointmentDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">
                      {format(new Date(selectedAppointment.appointmentDate), "PPPPp", {
                        locale: fr,
                      })}
                    </span>
                  </div>
                )}
              </div>

              {selectedAppointment.notes && (
                <div>
                  <h4 className="font-semibold mb-2">Notes</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedAppointment.notes}
                  </p>
                </div>
              )}

              {selectedAppointment.businessCardImageUrl && (
                <div>
                  <h4 className="font-semibold mb-2">Carte de visite</h4>
                  <img
                    src={selectedAppointment.businessCardImageUrl}
                    alt="Business card"
                    className="w-full rounded-lg border"
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">Statut:</span>
                <Badge variant={getStatusBadgeVariant(selectedAppointment.status)}>
                  {getStatusLabel(selectedAppointment.status)}
                </Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
