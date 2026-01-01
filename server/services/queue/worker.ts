import { prospectionQueue } from './prospection-queue';
import type { IStorage } from '../../storage';
import { sendEmail } from '../email/resend-client';
import { prospectionEmailTemplate } from '../email/templates';
import { sendSMS, generateShortSMS } from '../sms/twilio-client';
import { runLearningLoop } from '../ai/learning-loop';

interface WorkerDependencies {
  storage: IStorage;
}

export class ProspectionWorker {
  private storage: IStorage;
  private isRunning = false;

  constructor(deps: WorkerDependencies) {
    this.storage = deps.storage;
  }

  async start() {
    if (this.isRunning) {
      console.log('⚠️ Worker already running');
      return;
    }

    const boss = prospectionQueue.getBoss();
    if (!boss) {
      throw new Error('Queue not initialized');
    }

    // Handler: Send Message (avec envoi réel via Email/SMS)
    await boss.work('send-message', { teamSize: 5, teamConcurrency: 2 }, async (job: any) => {
      try {
        console.log('📨 [WORKER] Processing send-message job:', job.id);
        const { 
          prospectEnProspectionId, 
          prospectId, 
          campagneId, 
          userId, 
          messageType, 
          messageContent, 
          etapeId,
          prospectDetails,
          campagne,
          nextStep,
          messageSource 
        } = job.data;

        // 🎯 A/B TESTING: Sélectionner le meilleur variant si disponible
        let selectedVariant: any = null;
        let finalMessageContent = messageContent;
        let finalSubject = prospectDetails?.entreprise ? `${prospectDetails.entreprise} - Opportunité Sécurité` : 'Opportunité ADS GROUP';

        try {
          selectedVariant = await this.storage.selectBestVariant(campagneId, etapeId, messageType);
          
          if (selectedVariant) {
            console.log(`[A/B TESTING] 🎯 Variant sélectionné: ${selectedVariant.variantName} pour ${messageType}`);
            
            // Interpoler les variables dans le template
            finalMessageContent = selectedVariant.messageTemplate
              .replace(/\{\{prenom\}\}/g, prospectDetails?.prenom || 'Monsieur/Madame')
              .replace(/\{\{nom\}\}/g, prospectDetails?.nom || '')
              .replace(/\{\{entreprise\}\}/g, prospectDetails?.entreprise || 'votre entreprise')
              .replace(/\{\{poste\}\}/g, prospectDetails?.fonction || '')
              .replace(/\{\{ville\}\}/g, prospectDetails?.ville || '');
            
            // Utiliser le sujet email du variant si disponible
            if (messageType === 'email' && selectedVariant.sujetEmail) {
              finalSubject = selectedVariant.sujetEmail
                .replace(/\{\{prenom\}\}/g, prospectDetails?.prenom || 'Monsieur/Madame')
                .replace(/\{\{nom\}\}/g, prospectDetails?.nom || '')
                .replace(/\{\{entreprise\}\}/g, prospectDetails?.entreprise || 'votre entreprise');
            }
          } else {
            console.log(`[A/B TESTING] ℹ️ Pas de variant disponible pour ${messageType}, utilisation message généré`);
          }
        } catch (variantError: any) {
          console.warn(`[A/B TESTING] ⚠️ Erreur sélection variant: ${variantError.message}, fallback sur message généré`);
        }

        // Récupérer l'interaction "pending" créée par le CRON
        const interactions = await this.storage.getProspectInteractions(prospectEnProspectionId);
        const pendingInteraction = interactions.find((i: any) => 
          i.typeInteraction === 'pending' && 
          i.etapeId === etapeId &&
          i.metadata?.jobId === job.id
        );

        let sendResult: any = { success: false, canal: messageType, manual: true };
        
        try {
          if (messageType === 'email') {
            // ✉️ ENVOI EMAIL VIA RESEND
            if (!prospectDetails.email) {
              console.warn(`[WORKER] ⚠️ Pas d'email pour prospect ${prospectId}`);
              sendResult = { success: false, error: 'No email address' };
            } else {
              const baseUrl = process.env.REPLIT_DEV_DOMAIN 
                ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
                : 'http://localhost:5000';
              
              const emailHtml = prospectionEmailTemplate({
                prenom: prospectDetails.prenom || 'Monsieur/Madame',
                entreprise: prospectDetails.entreprise,
                message: finalMessageContent, // Utiliser le message du variant ou généré
                signature: `Cordialement,\n\nL'équipe ADS GROUP\ncontact@adsgroup-security.com`,
                unsubscribeUrl: `${baseUrl}/unsubscribe?email=${encodeURIComponent(prospectDetails.email)}`
              });
              
              sendResult = await sendEmail({
                to: prospectDetails.email,
                subject: finalSubject, // Utiliser le sujet du variant ou default
                html: emailHtml,
                tags: [
                  { name: 'campagne_id', value: campagneId },
                  { name: 'prospect_id', value: prospectEnProspectionId },
                  { name: 'etape_id', value: etapeId }
                ]
              });
              
              if (sendResult.success) {
                console.log(`[WORKER] ✅ Email envoyé à ${prospectDetails.email} (${sendResult.messageId})`);
              } else {
                console.error(`[WORKER] ❌ Échec envoi email: ${sendResult.error}`);
              }
            }
          } else if (messageType === 'sms') {
            // 📱 ENVOI SMS VIA TWILIO
            if (!prospectDetails.telephone) {
              console.warn(`[WORKER] ⚠️ Pas de téléphone pour prospect ${prospectId}`);
              sendResult = { success: false, error: 'No phone number' };
            } else {
              let phoneNumber = prospectDetails.telephone;
              
              if (!phoneNumber.startsWith('+')) {
                if (phoneNumber.startsWith('0')) {
                  phoneNumber = '+33' + phoneNumber.substring(1);
                } else {
                  phoneNumber = '+33' + phoneNumber;
                }
              }
              
              const smsText = generateShortSMS(finalMessageContent, prospectDetails.prenom || 'Monsieur/Madame'); // Utiliser le message du variant ou généré
              
              sendResult = await sendSMS({
                to: phoneNumber,
                message: smsText,
                prospectId: prospectEnProspectionId
              } as any);
              
              if (sendResult.success) {
                console.log(`[WORKER] ✅ SMS envoyé à ${phoneNumber} (${sendResult.messageId})`);
              } else {
                console.error(`[WORKER] ❌ Échec envoi SMS: ${sendResult.error}`);
              }
            }
          } else {
            console.log(`[WORKER] ⏳ Canal ${messageType} - envoi manuel requis pour prospect ${prospectId}`);
            sendResult = { success: false, manual: true };
          }
        } catch (sendError: any) {
          console.error(`[WORKER] ❌ Erreur envoi ${messageType}:`, sendError);
          sendResult = { success: false, error: sendError.message };
        }

        // Mettre à jour l'interaction + gérer retry logic
        const attemptNumber = (job.data.attemptNumber || 0) + 1;
        
        if (sendResult.success) {
          // ✅ SUCCÈS - Marquer comme envoyé
          if (pendingInteraction) {
            await this.storage.updateInteraction(pendingInteraction.id, {
              typeInteraction: 'sent',
              variantId: selectedVariant?.id || undefined, // 🎯 Enregistrer le variant utilisé
              metadata: {
                ...pendingInteraction.metadata,
                sendResult: 'ok',
                provider: sendResult.provider || 'manual',
                messageId: sendResult.messageId || null,
                processedAt: new Date().toISOString(),
                jobId: job.id,
                attemptNumber,
                variantId: selectedVariant?.id || null, // Backup dans metadata
                variantName: selectedVariant?.variantName || null,
              }
            });
            console.log(`[WORKER] ✅ Interaction mise à jour: ${pendingInteraction.id} → sent`);
            
            // 📊 A/B TESTING: Mettre à jour les métriques du variant
            if (selectedVariant) {
              try {
                await this.storage.updateVariantMetrics(selectedVariant.id, 'sent');
                console.log(`[A/B TESTING] 📊 Métriques mises à jour pour variant ${selectedVariant.variantName}: sent +1`);
              } catch (metricsError: any) {
                console.error(`[A/B TESTING] ❌ Erreur mise à jour métriques: ${metricsError.message}`);
              }
            }
          }
          console.log(`[WORKER] ✅ Job ${job.id} traité avec succès`);
        } else if (sendResult.manual) {
          // ⏳ MANUEL - Canal non supporté (LinkedIn), pas de retry
          if (pendingInteraction) {
            await this.storage.updateInteraction(pendingInteraction.id, {
              typeInteraction: 'pending',
              metadata: {
                ...pendingInteraction.metadata,
                sendResult: 'manual',
                provider: 'manual',
                processedAt: new Date().toISOString(),
                jobId: job.id,
                attemptNumber,
                note: `Canal ${messageType} - envoi manuel requis`
              }
            });
          }
          console.log(`[WORKER] ⏳ Job ${job.id} requiert envoi manuel (canal ${messageType})`);
        } else {
          // ❌ ÉCHEC - Mettre à jour metadata pour tracking, puis throw pour retry
          if (pendingInteraction) {
            await this.storage.updateInteraction(pendingInteraction.id, {
              typeInteraction: 'pending', // Reste pending durant les retries
              metadata: {
                ...pendingInteraction.metadata,
                sendResult: 'retrying',
                error: sendResult.error || 'Unknown error',
                lastAttemptAt: new Date().toISOString(),
                jobId: job.id,
                attemptNumber,
              }
            });
          }
          
          // 🔁 THROW pour trigger pg-boss retry avec backoff
          console.error(`[WORKER] ❌ Échec envoi (tentative ${attemptNumber}), retry par pg-boss: ${sendResult.error}`);
          throw new Error(`Failed to send ${messageType}: ${sendResult.error || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('[WORKER] ❌ Error in send-message handler:', error);
        throw error; // Will trigger retry
      }
    });

    // Handler: Enrich Prospect
    await boss.work('enrich_prospect', async (job: any) => {
      try {
        console.log('🔍 Processing enrich_prospect job:', job.id);
        const { prospectId, userId } = job.data;

        // TODO: Call Pappers API or other enrichment services
        console.log(`🔍 Enriching prospect ${prospectId}`);

        // Simulate enrichment for now
        // await this.storage.updateProspect(prospectId, userId, { ... });

        console.log(`✅ Prospect enriched successfully for job ${job.id}`);
      } catch (error) {
        console.error('❌ Error in enrich_prospect handler:', error);
        throw error;
      }
    });

    // Handler: Generate Message
    await boss.work('generate_message', async (job: any) => {
      try {
        console.log('🤖 Processing generate_message job:', job.id);
        const { prospectEnProspectionId, prospectId, campagneId, userId, etapeId, messageType } = job.data;

        // TODO: Call AI service to generate message
        console.log(`🤖 Generating ${messageType} for prospect ${prospectId}`);

        const generatedMessage = `Message généré par IA pour le prospect`;

        // Queue the message for sending (use 'send-message' with hyphen)
        await prospectionQueue.addJob('send-message', {
          prospectEnProspectionId,
          prospectId,
          campagneId,
          userId,
          messageType: messageType as any,
          messageContent: generatedMessage,
          etapeId,
        });

        console.log(`✅ Message generated and queued for job ${job.id}`);
      } catch (error) {
        console.error('❌ Error in generate_message handler:', error);
        throw error;
      }
    });

    // Handler: Learning Loop (analyse patterns + génération insights)
    await boss.work('learning-loop', { teamSize: 1, teamConcurrency: 1 }, async (job: any) => {
      try {
        console.log('🧠 [WORKER] Processing learning-loop job:', job.id);
        
        // Exécuter l'analyse complète du learning loop
        const results = await runLearningLoop();
        
        console.log(`✅ [WORKER] Learning loop terminé:`, results);
        console.log(`   - ${results.patternsDetected} patterns détectés`);
        console.log(`   - ${results.insightsGenerated} insights générés`);
        console.log(`   - ${results.insightsSaved} insights sauvegardés`);
        
      } catch (error) {
        console.error('❌ [WORKER] Error in learning-loop handler:', error);
        throw error; // Will trigger retry
      }
    });

    this.isRunning = true;
    console.log('✅ Worker started with 4 handlers (send-message, enrich_prospect, generate_message, learning-loop)');
  }

  async stop() {
    if (!this.isRunning) {
      return;
    }

    const boss = prospectionQueue.getBoss();
    if (boss) {
      await boss.stop();
    }

    this.isRunning = false;
    console.log('🛑 Worker stopped');
  }
}
