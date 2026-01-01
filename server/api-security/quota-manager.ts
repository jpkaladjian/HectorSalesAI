import { pool } from '../db';
import { sendQuotaAlert } from '../utils/email-alerts';

interface ApiQuota {
  api_source: string;
  quota_jour: number;
  quota_heure: number;
  quota_minute: number;
  seuil_alerte: number;
  compteur_jour: number;
  compteur_heure: number;
  compteur_minute: number;
  last_reset_jour: Date;
  last_reset_heure: Date;
  last_reset_minute: Date;
  status: 'ok' | 'warning' | 'critical' | 'blocked';
}

export class QuotaManager {
  private static instance: QuotaManager;
  private alertsSent: Set<string> = new Set(); // Pour éviter les doublons

  private constructor() {}

  static getInstance(): QuotaManager {
    if (!QuotaManager.instance) {
      QuotaManager.instance = new QuotaManager();
    }
    return QuotaManager.instance;
  }

  async checkQuota(apiSource: string): Promise<{ allowed: boolean; reason?: string }> {
    const quota = await this.getQuota(apiSource);
    
    if (!quota) {
      console.warn(`Quota non configuré pour ${apiSource}`);
      return { allowed: true };
    }

    // Réinitialiser compteurs si nécessaire
    await this.resetCountersIfNeeded(quota);

    // Vérifier limites
    if (quota.compteur_minute >= quota.quota_minute) {
      await this.updateStatus(apiSource, 'blocked');
      await this.logIncident(apiSource, 'minute_limit', 'CRITICAL');
      return { allowed: false, reason: 'Limite minute dépassée' };
    }

    if (quota.compteur_heure >= quota.quota_heure) {
      await this.updateStatus(apiSource, 'blocked');
      await this.logIncident(apiSource, 'hour_limit', 'CRITICAL');
      return { allowed: false, reason: 'Limite heure dépassée' };
    }

    if (quota.compteur_jour >= quota.quota_jour) {
      await this.updateStatus(apiSource, 'critical');
      await this.logIncident(apiSource, 'day_limit', 'CRITICAL');
      return { allowed: false, reason: 'Limite journalière dépassée' };
    }

    // Vérifier seuil d'alerte et envoyer emails
    const usagePercent = (quota.compteur_jour / quota.quota_jour) * 100;
    if (usagePercent >= 95) {
      await this.updateStatus(apiSource, 'critical');
      await this.logIncident(apiSource, 'threshold_critical', 'CRITICAL', 
        `${usagePercent.toFixed(0)}% du quota journalier utilisé`);
      await this.sendEmailAlertIfNeeded(apiSource, quota.compteur_jour, quota.quota_jour, Math.round(usagePercent), 'CRITICAL');
    } else if (usagePercent >= quota.seuil_alerte) {
      await this.updateStatus(apiSource, 'warning');
      await this.logIncident(apiSource, 'threshold_warning', 'WARNING', 
        `${usagePercent.toFixed(0)}% du quota journalier utilisé`);
      await this.sendEmailAlertIfNeeded(apiSource, quota.compteur_jour, quota.quota_jour, Math.round(usagePercent), 'WARNING');
    } else if (quota.status !== 'ok') {
      await this.updateStatus(apiSource, 'ok');
      // Nettoyer l'historique des alertes quand le statut redevient OK
      this.alertsSent.delete(`${apiSource}_WARNING`);
      this.alertsSent.delete(`${apiSource}_CRITICAL`);
      this.alertsSent.delete(`${apiSource}_BLOCKED`);
    }

    return { allowed: true };
  }

  private async sendEmailAlertIfNeeded(
    apiSource: string,
    currentUsage: number,
    quota: number,
    usagePercent: number,
    severity: 'WARNING' | 'CRITICAL' | 'BLOCKED'
  ): Promise<void> {
    const alertKey = `${apiSource}_${severity}`;
    
    // Éviter d'envoyer des doublons (une seule alerte par niveau par jour)
    if (this.alertsSent.has(alertKey)) {
      return;
    }
    
    try {
      await sendQuotaAlert({
        apiSource,
        currentUsage,
        quota,
        usagePercent,
        severity
      });
      
      this.alertsSent.add(alertKey);
      console.log(`[QUOTA MANAGER] Alerte ${severity} envoyée pour ${apiSource}`);
    } catch (error) {
      console.error(`[QUOTA MANAGER] Erreur envoi alerte ${severity} pour ${apiSource}:`, error);
    }
  }

  async incrementCounter(apiSource: string): Promise<void> {
    await pool.query(
      `UPDATE api_quotas 
       SET compteur_minute = compteur_minute + 1,
           compteur_heure = compteur_heure + 1,
           compteur_jour = compteur_jour + 1,
           updated_at = NOW()
       WHERE api_source = $1`,
      [apiSource]
    );
  }

  async getQuota(apiSource: string): Promise<ApiQuota | null> {
    const result = await pool.query(
      'SELECT * FROM api_quotas WHERE api_source = $1',
      [apiSource]
    );
    return result.rows[0] || null;
  }

  private async resetCountersIfNeeded(quota: ApiQuota): Promise<void> {
    const now = new Date();
    const updates: string[] = [];

    // Reset minute (chaque minute)
    const lastResetMinute = new Date(quota.last_reset_minute);
    if (now.getTime() - lastResetMinute.getTime() >= 60000) {
      updates.push('compteur_minute = 0, last_reset_minute = NOW()');
    }

    // Reset heure (chaque heure)
    const lastResetHeure = new Date(quota.last_reset_heure);
    if (now.getTime() - lastResetHeure.getTime() >= 3600000) {
      updates.push('compteur_heure = 0, last_reset_heure = NOW()');
    }

    // Reset jour (chaque jour)
    const lastResetJour = new Date(quota.last_reset_jour);
    if (now.getTime() - lastResetJour.getTime() >= 86400000) {
      updates.push('compteur_jour = 0, last_reset_jour = NOW(), status = \'ok\'');
    }

    if (updates.length > 0) {
      await pool.query(
        `UPDATE api_quotas SET ${updates.join(', ')} WHERE api_source = $1`,
        [quota.api_source]
      );
    }
  }

  private async updateStatus(apiSource: string, status: string): Promise<void> {
    await pool.query(
      'UPDATE api_quotas SET status = $1, updated_at = NOW() WHERE api_source = $2',
      [status, apiSource]
    );
  }

  private async logIncident(apiSource: string, type: string, severity: string, message?: string): Promise<void> {
    await pool.query(
      `INSERT INTO api_security_log (api_source, incident_type, severity, error_message, timestamp)
       VALUES ($1, $2, $3, $4, NOW())`,
      [apiSource, type, severity, message || `Incident ${type} détecté`]
    );
  }

  async getRetryAfter(apiSource: string): Promise<number> {
    const quota = await this.getQuota(apiSource);
    if (!quota) return 60;

    const now = new Date().getTime();
    const lastResetMinute = new Date(quota.last_reset_minute).getTime();
    const nextReset = lastResetMinute + 60000;
    
    return Math.max(0, Math.ceil((nextReset - now) / 1000));
  }

  async getAllQuotas(): Promise<ApiQuota[]> {
    const result = await pool.query('SELECT * FROM api_quotas ORDER BY api_source');
    return result.rows;
  }
}

export const quotaManager = QuotaManager.getInstance();
