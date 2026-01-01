import express from 'express';
import type { Request, Response } from 'express';
import { storage } from '../storage';
import { sql } from 'drizzle-orm';

const router = express.Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const event = req.body;
    console.log('📱 [WEBHOOK TWILIO]:', event.MessageStatus || event.SmsStatus);
    
    // Le prospectId est passé en query param (pas dans body Twilio)
    const prospectId = req.query.prospectId as string;
    
    if (!prospectId) {
      console.warn('⚠️ [WEBHOOK TWILIO] Pas de prospectId dans la query');
      return res.status(200).send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
    }
    
    const status = event.MessageStatus || event.SmsStatus;
    
    switch (status) {
      case 'delivered':
        await handleSMSDelivered(prospectId, event);
        break;
      case 'failed':
      case 'undelivered':
        await handleSMSFailed(prospectId, event);
        break;
    }
    
    return res.status(200).send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
    
  } catch (error: any) {
    console.error('❌ [WEBHOOK TWILIO] Erreur:', error);
    return res.status(500).json({ error: error.message });
  }
});

async function handleSMSDelivered(prospectId: string, data: any) {
  console.log(`✅ [WEBHOOK] SMS délivré à prospect ${prospectId}`);
  
  await storage.createInteraction({
    prospectEnProspectionId: prospectId,
    canal: 'sms',
    typeInteraction: 'delivered',
    metadata: { delivered_at: new Date().toISOString() }
  });
  
  await storage.updateProspectEnProspection(prospectId, '', {
    scoreEngagement: sql`score_engagement + 3` as any
  });
}

async function handleSMSFailed(prospectId: string, data: any) {
  console.log(`❌ [WEBHOOK] SMS échoué pour prospect ${prospectId}`);
  
  await storage.createInteraction({
    prospectEnProspectionId: prospectId,
    canal: 'sms',
    typeInteraction: 'error',
    metadata: { 
      error: data.ErrorCode || 'Unknown',
      error_message: data.ErrorMessage || 'SMS delivery failed'
    }
  });
}

export default router;
