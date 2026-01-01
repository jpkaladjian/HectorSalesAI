-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- MIGRATION 021 : TABLE ÉQUIPES COMMERCIALES
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identification
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Rattachement
  entity VARCHAR(50) NOT NULL REFERENCES organization_entities(entity_code),
  
  -- Hiérarchie
  manager_id VARCHAR REFERENCES users(id) ON DELETE SET NULL,
  parent_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  
  -- Objectifs
  monthly_target_ca DECIMAL(15,2),
  monthly_target_meetings INTEGER,
  monthly_target_signatures INTEGER,
  
  -- Configuration
  is_active BOOLEAN DEFAULT TRUE,
  color VARCHAR(7) DEFAULT '#3B82F6',
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by VARCHAR REFERENCES users(id),
  updated_by VARCHAR
);

-- Table de liaison many-to-many : users ↔ teams
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('manager', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  
  UNIQUE(team_id, user_id)
);

-- Index pour performance
CREATE INDEX idx_teams_entity ON teams(entity);
CREATE INDEX idx_teams_manager ON teams(manager_id);
CREATE INDEX idx_teams_active ON teams(is_active);
CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_team_members_user ON team_members(user_id);

-- RLS sur teams
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Policy : Voir les équipes de son entity
CREATE POLICY teams_select_own_entity ON teams
  FOR SELECT
  TO PUBLIC
  USING (entity = current_user_entity());

-- Policy : Admin Groupe voit tout
CREATE POLICY teams_select_admin_all ON teams
  FOR SELECT
  TO PUBLIC
  USING (current_user_role() = 'admin_groupe');

-- Policy : Créer/modifier ses équipes
CREATE POLICY teams_modify_own_entity ON teams
  FOR ALL
  TO PUBLIC
  USING (
    entity = current_user_entity()
    AND current_user_role() IN ('admin_groupe', 'admin_filiale', 'manager')
  );

-- RLS sur team_members
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY team_members_select ON team_members
  FOR SELECT
  TO PUBLIC
  USING (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = team_members.team_id
      AND (
        teams.entity = current_user_entity()
        OR current_user_role() = 'admin_groupe'
      )
    )
  );

COMMENT ON TABLE teams IS 'Équipes commerciales avec objectifs et hiérarchie';
COMMENT ON TABLE team_members IS 'Membres des équipes (relation many-to-many)';
