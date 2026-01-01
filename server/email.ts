import { Resend } from 'resend';

// Bug Fix #4: Vérification RESEND_API_KEY
if (!process.env.RESEND_API_KEY) {
  console.error('[Email] ⚠️ RESEND_API_KEY is not configured! Email functionality will fail.');
}

const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendPasswordResetEmailParams {
  to: string;
  resetToken: string;
  firstName?: string;
}

export async function sendPasswordResetEmail({
  to,
  resetToken,
  firstName
}: SendPasswordResetEmailParams): Promise<void> {
  // Bug Fix: Check API key before sending
  if (!process.env.RESEND_API_KEY) {
    console.error('[Email] Cannot send email: RESEND_API_KEY not configured');
    throw new Error('Service email non configuré');
  }

  const resetUrl = `${process.env.REPLIT_DOMAINS?.split(',')[0] || 'http://localhost:5000'}/reset-password?token=${resetToken}`;
  
  const userName = firstName || to.split('@')[0];

  try {
    await resend.emails.send({
      from: 'Hector - ADS GROUP SECURITY <onboarding@resend.dev>',
      to: [to],
      subject: 'Réinitialisation de ton mot de passe - Hector',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #1e293b;
                background-color: #f8fafc;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 40px auto;
                background-color: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
              }
              .header {
                background-color: #1e3a5f;
                color: #ffffff;
                padding: 32px 24px;
                text-align: center;
              }
              .header h1 {
                margin: 0;
                font-size: 24px;
                font-weight: 600;
              }
              .content {
                padding: 32px 24px;
              }
              .greeting {
                font-size: 16px;
                margin-bottom: 16px;
              }
              .message {
                font-size: 15px;
                color: #475569;
                margin-bottom: 24px;
              }
              .button-container {
                text-align: center;
                margin: 32px 0;
              }
              .button {
                display: inline-block;
                background-color: #1e3a5f;
                color: #ffffff;
                text-decoration: none;
                padding: 14px 32px;
                border-radius: 6px;
                font-weight: 600;
                font-size: 15px;
              }
              .button:hover {
                background-color: #2d4a6f;
              }
              .alternative {
                margin-top: 24px;
                padding: 16px;
                background-color: #f1f5f9;
                border-radius: 6px;
                font-size: 13px;
                color: #64748b;
                word-break: break-all;
              }
              .footer {
                padding: 24px;
                text-align: center;
                font-size: 13px;
                color: #94a3b8;
                border-top: 1px solid #e2e8f0;
              }
              .warning {
                margin-top: 24px;
                padding: 16px;
                background-color: #fef3c7;
                border-left: 4px solid #f59e0b;
                border-radius: 4px;
                font-size: 14px;
                color: #92400e;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🤖 Hector - ADS GROUP SECURITY</h1>
              </div>
              <div class="content">
                <div class="greeting">
                  Bonjour ${userName},
                </div>
                <div class="message">
                  Tu as demandé la réinitialisation de ton mot de passe pour accéder à Hector, ton assistant commercial IA.
                </div>
                <div class="message">
                  Clique sur le bouton ci-dessous pour créer un nouveau mot de passe :
                </div>
                <div class="button-container">
                  <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
                </div>
                <div class="alternative">
                  <strong>Le bouton ne fonctionne pas ?</strong><br>
                  Copie et colle ce lien dans ton navigateur :<br>
                  ${resetUrl}
                </div>
                <div class="warning">
                  <strong>⏱️ Important :</strong> Ce lien est valable pendant 1 heure seulement. Après ce délai, tu devras refaire une demande de réinitialisation.
                </div>
                <div class="message" style="margin-top: 24px;">
                  Si tu n'as pas demandé cette réinitialisation, tu peux ignorer cet email en toute sécurité.
                </div>
              </div>
              <div class="footer">
                Cet email a été envoyé par Hector, l'assistant commercial IA d'ADS GROUP SECURITY.<br>
                Pour toute question, contacte ton administrateur.
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
Bonjour ${userName},

Tu as demandé la réinitialisation de ton mot de passe pour accéder à Hector, ton assistant commercial IA.

Pour créer un nouveau mot de passe, clique sur ce lien :
${resetUrl}

⏱️ Important : Ce lien est valable pendant 1 heure seulement.

Si tu n'as pas demandé cette réinitialisation, tu peux ignorer cet email en toute sécurité.

---
Hector - ADS GROUP SECURITY
      `.trim()
    });

    console.log(`[Email] Password reset email sent to ${to}`);
  } catch (error) {
    console.error('[Email] Error sending password reset email:', error);
    throw new Error('Impossible d\'envoyer l\'email de réinitialisation');
  }
}

export interface SendWelcomeEmailParams {
  to: string;
  firstName?: string;
  temporaryPassword: string;
}

export async function sendWelcomeEmail({
  to,
  firstName,
  temporaryPassword
}: SendWelcomeEmailParams): Promise<void> {
  // Bug Fix: Check API key before sending
  if (!process.env.RESEND_API_KEY) {
    console.error('[Email] Cannot send email: RESEND_API_KEY not configured');
    throw new Error('Service email non configuré');
  }

  const loginUrl = `${process.env.REPLIT_DOMAINS?.split(',')[0] || 'http://localhost:5000'}/login`;
  const userName = firstName || to.split('@')[0];

  try {
    await resend.emails.send({
      from: 'Hector - ADS GROUP SECURITY <onboarding@resend.dev>',
      to: [to],
      subject: 'Bienvenue sur Hector - Ton assistant commercial IA',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #1e293b;
                background-color: #f8fafc;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 40px auto;
                background-color: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
              }
              .header {
                background-color: #1e3a5f;
                color: #ffffff;
                padding: 32px 24px;
                text-align: center;
              }
              .header h1 {
                margin: 0;
                font-size: 24px;
                font-weight: 600;
              }
              .content {
                padding: 32px 24px;
              }
              .greeting {
                font-size: 16px;
                margin-bottom: 16px;
              }
              .message {
                font-size: 15px;
                color: #475569;
                margin-bottom: 24px;
              }
              .credentials {
                background-color: #f1f5f9;
                padding: 20px;
                border-radius: 6px;
                margin: 24px 0;
              }
              .credentials-item {
                margin-bottom: 12px;
              }
              .credentials-label {
                font-size: 13px;
                color: #64748b;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }
              .credentials-value {
                font-size: 16px;
                color: #1e293b;
                font-family: 'Courier New', monospace;
                margin-top: 4px;
                padding: 8px;
                background-color: #ffffff;
                border-radius: 4px;
                border: 1px solid #e2e8f0;
              }
              .button-container {
                text-align: center;
                margin: 32px 0;
              }
              .button {
                display: inline-block;
                background-color: #1e3a5f;
                color: #ffffff;
                text-decoration: none;
                padding: 14px 32px;
                border-radius: 6px;
                font-weight: 600;
                font-size: 15px;
              }
              .features {
                margin-top: 32px;
              }
              .feature {
                margin-bottom: 16px;
                padding-left: 28px;
                position: relative;
              }
              .feature:before {
                content: "✓";
                position: absolute;
                left: 0;
                color: #10b981;
                font-weight: bold;
                font-size: 18px;
              }
              .footer {
                padding: 24px;
                text-align: center;
                font-size: 13px;
                color: #94a3b8;
                border-top: 1px solid #e2e8f0;
              }
              .warning {
                margin-top: 24px;
                padding: 16px;
                background-color: #fef3c7;
                border-left: 4px solid #f59e0b;
                border-radius: 4px;
                font-size: 14px;
                color: #92400e;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🤖 Bienvenue sur Hector !</h1>
              </div>
              <div class="content">
                <div class="greeting">
                  Bonjour ${userName},
                </div>
                <div class="message">
                  Ton compte Hector a été créé avec succès ! Tu peux maintenant accéder à ton assistant commercial IA personnalisé.
                </div>
                
                <div class="credentials">
                  <div class="credentials-item">
                    <div class="credentials-label">Email de connexion</div>
                    <div class="credentials-value">${to}</div>
                  </div>
                  <div class="credentials-item">
                    <div class="credentials-label">Mot de passe temporaire</div>
                    <div class="credentials-value">${temporaryPassword}</div>
                  </div>
                </div>

                <div class="warning">
                  <strong>🔒 Sécurité :</strong> Change ton mot de passe temporaire dès ta première connexion pour protéger ton compte.
                </div>

                <div class="button-container">
                  <a href="${loginUrl}" class="button">Me connecter à Hector</a>
                </div>

                <div class="features">
                  <div class="message"><strong>Avec Hector, tu peux :</strong></div>
                  <div class="feature">Obtenir des réponses à tes questions commerciales</div>
                  <div class="feature">Structurer tes réunions de management</div>
                  <div class="feature">Accéder à des formations commerciales personnalisées</div>
                  <div class="feature">Générer des arguments de vente percutants</div>
                </div>
              </div>
              <div class="footer">
                Cet email a été envoyé par Hector, l'assistant commercial IA d'ADS GROUP SECURITY.<br>
                Pour toute question, contacte ton administrateur.
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
Bonjour ${userName},

Ton compte Hector a été créé avec succès !

IDENTIFIANTS DE CONNEXION
--------------------------
Email : ${to}
Mot de passe temporaire : ${temporaryPassword}

🔒 Sécurité : Change ton mot de passe temporaire dès ta première connexion.

Pour te connecter : ${loginUrl}

AVEC HECTOR, TU PEUX :
✓ Obtenir des réponses à tes questions commerciales
✓ Structurer tes réunions de management
✓ Accéder à des formations commerciales personnalisées
✓ Générer des arguments de vente percutants

---
Hector - ADS GROUP SECURITY
      `.trim()
    });

    console.log(`[Email] Welcome email sent to ${to}`);
  } catch (error) {
    console.error('[Email] Error sending welcome email:', error);
    throw new Error('Impossible d\'envoyer l\'email de bienvenue');
  }
}

export interface SendInvitationEmailParams {
  to: string;
  inviteUrl: string;
  role: string;
  invitedByName?: string;
}

export async function sendInvitationEmail({
  to,
  inviteUrl,
  role,
  invitedByName
}: SendInvitationEmailParams): Promise<void> {
  // Bug Fix: Check API key before sending
  if (!process.env.RESEND_API_KEY) {
    console.error('[Email] Cannot send email: RESEND_API_KEY not configured');
    throw new Error('Service email non configuré');
  }

  const userName = to.split('@')[0];
  const roleLabel = role === 'admin' ? 'Administrateur' : 'Commercial';
  const inviter = invitedByName || 'ton administrateur';

  try {
    await resend.emails.send({
      from: 'Hector - ADS GROUP SECURITY <onboarding@resend.dev>',
      to: [to],
      subject: 'Invitation à rejoindre Hector - ADS GROUP SECURITY',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #1e293b;
                background-color: #f8fafc;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 40px auto;
                background-color: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
              }
              .header {
                background-color: #1e3a5f;
                color: #ffffff;
                padding: 32px 24px;
                text-align: center;
              }
              .header h1 {
                margin: 0;
                font-size: 24px;
                font-weight: 600;
              }
              .content {
                padding: 32px 24px;
              }
              .greeting {
                font-size: 16px;
                margin-bottom: 16px;
              }
              .message {
                font-size: 15px;
                color: #475569;
                margin-bottom: 24px;
              }
              .role-badge {
                display: inline-block;
                background-color: #dbeafe;
                color: #1e40af;
                padding: 6px 12px;
                border-radius: 4px;
                font-size: 13px;
                font-weight: 600;
                margin: 8px 0;
              }
              .button-container {
                text-align: center;
                margin: 32px 0;
              }
              .button {
                display: inline-block;
                background-color: #1e3a5f;
                color: #ffffff;
                text-decoration: none;
                padding: 14px 32px;
                border-radius: 6px;
                font-weight: 600;
                font-size: 15px;
              }
              .button:hover {
                background-color: #2d4a6f;
              }
              .alternative {
                margin-top: 24px;
                padding: 16px;
                background-color: #f1f5f9;
                border-radius: 6px;
                font-size: 13px;
                color: #64748b;
                word-break: break-all;
              }
              .footer {
                padding: 24px;
                text-align: center;
                font-size: 13px;
                color: #94a3b8;
                border-top: 1px solid #e2e8f0;
              }
              .warning {
                margin-top: 24px;
                padding: 16px;
                background-color: #fef3c7;
                border-left: 4px solid #f59e0b;
                border-radius: 4px;
                font-size: 14px;
                color: #92400e;
              }
              .features {
                margin-top: 32px;
              }
              .feature {
                margin-bottom: 16px;
                padding-left: 28px;
                position: relative;
              }
              .feature:before {
                content: "✓";
                position: absolute;
                left: 0;
                color: #10b981;
                font-weight: bold;
                font-size: 18px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🤖 Bienvenue dans l'équipe Hector !</h1>
              </div>
              <div class="content">
                <div class="greeting">
                  Bonjour ${userName},
                </div>
                <div class="message">
                  ${inviter} t'invite à rejoindre Hector, l'assistant commercial IA d'ADS GROUP SECURITY.
                </div>
                <div class="message">
                  Tu as été invité avec le rôle :<br>
                  <span class="role-badge">👤 ${roleLabel}</span>
                </div>
                <div class="message">
                  Clique sur le bouton ci-dessous pour créer ton compte et choisir ton mot de passe :
                </div>
                <div class="button-container">
                  <a href="${inviteUrl}" class="button">Créer mon compte</a>
                </div>
                <div class="alternative">
                  <strong>Le bouton ne fonctionne pas ?</strong><br>
                  Copie et colle ce lien dans ton navigateur :<br>
                  ${inviteUrl}
                </div>
                <div class="warning">
                  <strong>⏱️ Important :</strong> Ce lien d'invitation est valable pendant 7 jours. Après ce délai, tu devras demander une nouvelle invitation.
                </div>
                <div class="features">
                  <div class="message"><strong>Avec Hector, tu pourras :</strong></div>
                  <div class="feature">Obtenir des réponses à tes questions commerciales</div>
                  <div class="feature">Structurer tes réunions de management</div>
                  <div class="feature">Accéder à des formations commerciales personnalisées</div>
                  <div class="feature">Générer des arguments de vente percutants</div>
                  <div class="feature">Gérer tes prospects et opportunités avec un CRM intégré</div>
                </div>
              </div>
              <div class="footer">
                Cet email a été envoyé par Hector, l'assistant commercial IA d'ADS GROUP SECURITY.<br>
                Pour toute question, contacte ton administrateur.
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
Bonjour ${userName},

${inviter} t'invite à rejoindre Hector, l'assistant commercial IA d'ADS GROUP SECURITY.

Rôle : ${roleLabel}

Pour créer ton compte et choisir ton mot de passe, clique sur ce lien :
${inviteUrl}

⏱️ Important : Ce lien d'invitation est valable pendant 7 jours.

AVEC HECTOR, TU POURRAS :
✓ Obtenir des réponses à tes questions commerciales
✓ Structurer tes réunions de management
✓ Accéder à des formations commerciales personnalisées
✓ Générer des arguments de vente percutants
✓ Gérer tes prospects et opportunités avec un CRM intégré

---
Hector - ADS GROUP SECURITY
      `.trim()
    });

    console.log(`[Email] Invitation email sent to ${to}`);
  } catch (error) {
    console.error('[Email] Error sending invitation email:', error);
    throw new Error('Impossible d\'envoyer l\'email d\'invitation');
  }
}
