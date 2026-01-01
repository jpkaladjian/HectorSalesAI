import { Building2, Edit, Trash2, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import type { Organization } from '@/types/admin';

interface OrganizationCardProps {
  organization: Organization;
  onEdit: (organization: Organization) => void;
  onDelete: (organization: Organization) => void;
}

export function OrganizationCard({ organization, onEdit, onDelete }: OrganizationCardProps) {
  const getLevelBadge = (level: number) => {
    const levels = {
      0: { label: 'Holding', color: 'bg-purple-100 text-purple-800' },
      1: { label: 'Filiale', color: 'bg-blue-100 text-blue-800' },
      2: { label: 'Sous-filiale', color: 'bg-green-100 text-green-800' },
    };
    return levels[level as keyof typeof levels] || levels[1];
  };

  const levelBadge = getLevelBadge(organization.level);

  return (
    <div
      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
      data-testid={`organization-card-${organization.id}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1">
          <div className="flex-shrink-0">
            {organization.flagEmoji ? (
              <span className="text-4xl" role="img" aria-label={organization.countryName || 'flag'}>
                {organization.flagEmoji}
              </span>
            ) : (
              <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-indigo-600" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate" data-testid="text-organization-name">
                {organization.entityName}
              </h3>
              <Badge className={`${levelBadge.color} border-0`} data-testid="badge-level">
                {levelBadge.label}
              </Badge>
              <Badge
                variant={organization.isActive ? 'default' : 'secondary'}
                className={organization.isActive ? 'bg-green-100 text-green-800 border-0' : ''}
                data-testid="badge-status"
              >
                {organization.isActive ? 'Actif' : 'Inactif'}
              </Badge>
            </div>

            {organization.entityNameFull && (
              <p className="text-sm text-gray-600 mb-2">{organization.entityNameFull}</p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <strong>Code:</strong> {organization.entityCode}
              </span>
              {organization.countryName && (
                <span className="flex items-center gap-1">
                  <strong>Pays:</strong> {organization.countryName}
                </span>
              )}
              {organization.parentEntityCode && (
                <span className="flex items-center gap-1">
                  <strong>Parent:</strong> {organization.parentEntityCode}
                </span>
              )}
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" data-testid="button-menu">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(organization)} data-testid="menu-edit">
              <Edit className="w-4 h-4 mr-2" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(organization)}
              className="text-red-600"
              data-testid="menu-delete"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
