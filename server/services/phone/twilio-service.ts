import twilio, { Twilio } from 'twilio';
import { db } from '../../db';
import { phoneConfigurations } from '../../../shared/schema';
import { eq } from 'drizzle-orm';
import { encryptionService } from './encryption-service';

/**
 * Service Twilio pour gestion appels multi-entity
 * 
 * Gère 3 comptes Twilio (France, Luxembourg, Belgique)
 * avec cache clients et chiffrement credentials
 */

interface TwilioCallOptions {
  to: string;                      // +33123456789
  from: string;                    // Numéro Twilio (+33...)
  statusCallback: string;          // URL webhook status
  statusCallbackEvent: string[];   // ['initiated', 'ringing', 'answered', 'completed']
  record: boolean;                 // Enregistrer l'appel
  recordingStatusCallback: string; // URL webhook recording
}

export class TwilioService {
  private clients: Map<string, Twilio> = new Map();

  /**
   * Invalider cache client Twilio
   * @param entity - Entity spécifique (optionnel) ou tous si non fourni
   */
  public clearCache(entity?: string): void {
    if (entity) {
      this.clients.delete(entity);
      console.log(`🗑️ Cache Twilio invalidé pour ${entity}`);
    } else {
      this.clients.clear();
      console.log(`🗑️ Cache Twilio complet invalidé`);
    }
  }

  /**
   * Récupère client Twilio pour une entity (avec cache)
   * @param entity - 'france' | 'luxembourg' | 'belgique'
   * @returns Client Twilio configuré
   */
  async getClient(entity: string): Promise<Twilio> {
    // Vérifier cache
    if (this.clients.has(entity)) {
      return this.clients.get(entity)!;
    }

    // Import isNull ici pour éviter circular dependency
    const { and, isNull } = await import('drizzle-orm');

    // Récupérer config active et non supprimée
    const config = await db.query.phoneConfigurations.findFirst({
      where: and(
        eq(phoneConfigurations.entity, entity),
        eq(phoneConfigurations.isActive, true),
        isNull(phoneConfigurations.deletedAt)
      ),
      orderBy: (table, { desc, asc }) => [
        desc(table.isPrimary),  // Prioriser numéros primaires
        asc(table.rotationPriority),  // Puis par priorité
      ],
    });

    if (!config) {
      throw new Error(`❌ Aucune configuration Twilio active pour entity: ${entity}`);
    }

    // Déchiffrer Auth Token
    let authToken: string;
    try {
      authToken = encryptionService.decrypt(config.twilioAuthTokenEncrypted);
    } catch (error) {
      console.error(`❌ Erreur déchiffrement token Twilio ${entity}:`, error);
      throw new Error(`Token Twilio invalide pour ${entity} - vérifier ENCRYPTION_KEY/IV`);
    }

    // Créer client Twilio
    const client = twilio(config.twilioAccountSid, authToken);
    this.clients.set(entity, client);

    console.log(`✅ Client Twilio créé et mis en cache pour ${entity}`);
    return client;
  }

  /**
   * Démarrer un appel sortant
   * @param entity - Entity (france/luxembourg/belgique)
   * @param options - Options appel
   * @returns Call object Twilio
   */
  async initiateCall(entity: string, options: TwilioCallOptions) {
    const client = await this.getClient(entity);

    try {
      const call = await client.calls.create({
        to: options.to,
        from: options.from,
        url: `${process.env.REPLIT_DOMAINS?.split(',')[0] || 'https://hector-sales-ai-adsgroup.replit.app'}/api/phone/twiml/connect`,
        statusCallback: options.statusCallback,
        statusCallbackEvent: options.statusCallbackEvent,
        record: options.record,
        recordingStatusCallback: options.recordingStatusCallback,
        recordingStatusCallbackEvent: ['completed'],
        timeout: 60, // 60 secondes avant timeout
      });

      console.log(`📞 Appel Twilio initié: ${call.sid} (${entity})`);
      return call;
    } catch (error: any) {
      console.error(`❌ Erreur initiation appel Twilio ${entity}:`, error);
      throw error;
    }
  }

  /**
   * Terminer un appel en cours
   * @param entity - Entity
   * @param callSid - SID Twilio de l'appel
   */
  async endCall(entity: string, callSid: string): Promise<void> {
    const client = await this.getClient(entity);

    try {
      await client.calls(callSid).update({ status: 'completed' });
      console.log(`✅ Appel terminé: ${callSid} (${entity})`);
    } catch (error: any) {
      console.error(`❌ Erreur fin appel ${callSid}:`, error);
      throw error;
    }
  }

  /**
   * Récupérer le numéro Twilio intelligent basé sur l'agence du commercial
   * 
   * Sélection intelligente basée sur :
   * 1. Agence du commercial (si définie)
   * 2. Département du prospect (optionnel)
   * 3. Rotation stable sur numéros actifs
   * 
   * @param entity - Entity (france/luxembourg/belgique)
   * @param userId - ID du commercial
   * @param prospectDepartment - Code département prospect (optionnel)
   * @returns Numéro de téléphone Twilio (+33...)
   */
  async getPhoneNumber(
    entity: string,
    userId?: string,
    prospectDepartment?: string
  ): Promise<string> {
    // Import users ici pour éviter circular dependency
    const { users } = await import('../../../shared/schema');
    const { and, isNull } = await import('drizzle-orm');
    
    // 1. Récupérer user avec son agence (si userId fourni)
    let user = null;
    if (userId) {
      user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });
    }
    
    // 2. Si user a une agence, prioriser numéros de son agence
    let configs: any[] = [];
    
    if (user?.agencyLocation) {
      configs = await db.query.phoneConfigurations.findMany({
        where: and(
          eq(phoneConfigurations.entity, entity),
          eq(phoneConfigurations.agencyLocation, user.agencyLocation),
          eq(phoneConfigurations.isActive, true),
          isNull(phoneConfigurations.deletedAt)
        ),
        orderBy: (table, { asc }) => [asc(table.rotationPriority)],
      });
    }
    
    // 3. Si aucun numéro pour cette agence, fallback sur numéros entity
    if (configs.length === 0) {
      configs = await db.query.phoneConfigurations.findMany({
        where: and(
          eq(phoneConfigurations.entity, entity),
          eq(phoneConfigurations.isActive, true),
          isNull(phoneConfigurations.deletedAt)
        ),
        orderBy: (table, { asc }) => [asc(table.rotationPriority)],
      });
    }
    
    // 4. Si toujours aucun numéro actif, erreur
    if (configs.length === 0) {
      throw new Error(
        `❌ Aucun numéro actif pour ${user?.agencyLocation || entity}. ` +
        `Contactez l'administrateur pour activer un numéro.`
      );
    }
    
    // 5. Si département prospect fourni, chercher numéro couvrant ce département
    if (prospectDepartment) {
      const configWithCoverage = configs.find(c =>
        c.coverageArea && Array.isArray(c.coverageArea) &&
        c.coverageArea.includes(prospectDepartment)
      );
      
      if (configWithCoverage) {
        return configWithCoverage.twilioPhoneNumber;
      }
    }
    
    // 6. Rotation stable basée sur hash userId (ou premier numéro si pas d'userId)
    if (userId) {
      const crypto = require('crypto');
      const hash = crypto.createHash('md5').update(userId).digest('hex');
      const index = parseInt(hash.substring(0, 8), 16) % configs.length;
      return configs[index].twilioPhoneNumber;
    }
    
    // Fallback: premier numéro par priorité
    return configs[0].twilioPhoneNumber;
  }

  /**
   * Tester la connexion Twilio d'une entity
   * @param entity - Entity à tester
   * @returns Résultat du test
   */
  async testConnection(entity: string): Promise<{ 
    success: boolean; 
    message: string; 
    details?: any 
  }> {
    try {
      const client = await this.getClient(entity);
      
      // Récupérer config
      const config = await db.query.phoneConfigurations.findFirst({
        where: eq(phoneConfigurations.entity, entity),
      });

      if (!config) {
        return { success: false, message: 'Configuration non trouvée' };
      }

      // Test 1: Vérifier account Twilio
      const account = await client.api.accounts(config.twilioAccountSid).fetch();
      
      // Test 2: Vérifier numéro de téléphone
      const phoneNumbers = await client.incomingPhoneNumbers.list({
        phoneNumber: config.twilioPhoneNumber,
        limit: 1,
      });

      if (phoneNumbers.length === 0) {
        return {
          success: false,
          message: `Numéro ${config.twilioPhoneNumber} non trouvé dans compte Twilio`,
        };
      }

      // Test 3: Vérifier TwiML App (si configuré)
      let appDetails = null;
      if (config.twilioTwimlAppSid) {
        try {
          const app = await client.applications(config.twilioTwimlAppSid).fetch();
          appDetails = {
            name: app.friendlyName,
            sid: app.sid,
          };
        } catch (error) {
          console.warn(`⚠️ TwiML App non trouvé: ${config.twilioTwimlAppSid}`);
        }
      }

      console.log(`✅ Test connexion Twilio OK pour ${entity}`);

      return {
        success: true,
        message: 'Connexion Twilio validée avec succès',
        details: {
          accountStatus: account.status,
          accountSid: config.twilioAccountSid,
          phoneNumber: phoneNumbers[0].phoneNumber,
          phoneNumberCapabilities: phoneNumbers[0].capabilities,
          twimlApp: appDetails,
          entity,
        },
      };
    } catch (error: any) {
      console.error(`❌ Test connexion Twilio échoué ${entity}:`, error);
      
      return {
        success: false,
        message: error.message || 'Erreur inconnue lors du test',
        details: {
          code: error.code,
          status: error.status,
          moreInfo: error.moreInfo,
        },
      };
    }
  }

  /**
   * Récupérer les features activées pour une entity
   * @param entity - Entity
   * @returns Features config
   */
  async getFeatures(entity: string): Promise<{
    recordingEnabled: boolean;
    transcriptionEnabled: boolean;
    aiAnalysisEnabled: boolean;
  }> {
    const config = await db.query.phoneConfigurations.findFirst({
      where: eq(phoneConfigurations.entity, entity),
    });

    if (!config) {
      throw new Error(`❌ Configuration manquante pour ${entity}`);
    }

    return {
      recordingEnabled: config.recordingEnabled,
      transcriptionEnabled: config.transcriptionEnabled,
      aiAnalysisEnabled: config.aiAnalysisEnabled,
    };
  }
}

// Instance singleton
export const twilioService = new TwilioService();
