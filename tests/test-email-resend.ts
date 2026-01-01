import { sendEmail } from '../server/services/email/resend-client';
import { prospectionEmailTemplate } from '../server/services/email/templates';

async function testEmail() {
  console.log('🧪 Test envoi email Resend...\n');
  
  const html = prospectionEmailTemplate({
    prenom: 'Jean-Pierre',
    entreprise: 'ADS GROUP SECURITY TEST',
    message: 'Bonjour,\n\nCeci est un message de test pour valider l\'intégration Resend dans le module Prospection LinkedIn.\n\nNous testons l\'envoi d\'emails automatisés via notre système CRON.\n\nMerci de vérifier la réception de cet email.',
    signature: 'Cordialement,\n\nL\'équipe Hector - ADS GROUP SECURITY\ncontact@adsgroup-security.com',
    unsubscribeUrl: 'http://localhost:5000/unsubscribe'
  });
  
  try {
    const result = await sendEmail({
      to: 'kaladjian@adsgroup-security.com', // Email de test
      subject: '[TEST] Email Prospection - Intégration Resend',
      html: html,
      tags: [
        { name: 'test', value: 'true' },
        { name: 'module', value: 'prospection_linkedin' }
      ]
    });
    
    console.log('\n📊 Résultat:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('\n✅ TEST RÉUSSI !');
      console.log(`   Message ID: ${result.messageId}`);
      console.log(`   Provider: ${result.provider}`);
      console.log(`\n📧 Vérifiez votre boîte mail: kaladjian@adsgroup-security.com`);
    } else {
      console.log('\n❌ TEST ÉCHOUÉ');
      console.log(`   Erreur: ${result.error}`);
    }
  } catch (error: any) {
    console.error('\n❌ EXCEPTION:', error.message);
  }
}

testEmail().then(() => {
  console.log('\n✅ Test terminé');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Erreur fatale:', error);
  process.exit(1);
});
