async function debugTwilioConnector() {
  console.log('🔍 Diagnostic Twilio Connector\n');
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  console.log('📋 Variables d\'environnement:');
  console.log(`  REPLIT_CONNECTORS_HOSTNAME: ${hostname ? '✅ Défini' : '❌ Non défini'}`);
  console.log(`  REPL_IDENTITY: ${process.env.REPL_IDENTITY ? '✅ Défini' : '❌ Non défini'}`);
  console.log(`  WEB_REPL_RENEWAL: ${process.env.WEB_REPL_RENEWAL ? '✅ Défini' : '❌ Non défini'}`);
  console.log(`  X_REPLIT_TOKEN: ${xReplitToken ? '✅ Défini' : '❌ Non défini'}\n`);

  if (!xReplitToken) {
    console.error('❌ Aucun token Replit trouvé');
    return;
  }

  try {
    console.log('⏳ Récupération des settings Twilio...\n');
    
    const url = 'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=twilio';
    console.log(`📡 URL: ${url}\n`);
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    });
    
    console.log(`📊 Response Status: ${response.status} ${response.statusText}\n`);
    
    const data = await response.json();
    console.log('📦 Response Data:');
    console.log(JSON.stringify(data, null, 2));
    console.log();
    
    const connectionSettings = data.items?.[0];
    
    if (!connectionSettings) {
      console.error('❌ Aucune connexion Twilio trouvée dans items[0]');
      return;
    }
    
    console.log('✅ Connection Settings trouvé');
    console.log('📋 Settings disponibles:');
    console.log(`  account_sid: ${connectionSettings.settings?.account_sid ? '✅ Présent' : '❌ Manquant'}`);
    console.log(`  api_key: ${connectionSettings.settings?.api_key ? '✅ Présent' : '❌ Manquant'}`);
    console.log(`  api_key_secret: ${connectionSettings.settings?.api_key_secret ? '✅ Présent' : '❌ Manquant'}`);
    console.log(`  phone_number: ${connectionSettings.settings?.phone_number ? '✅ Présent' : '❌ Manquant'}`);
    
  } catch (error: any) {
    console.error('❌ Erreur lors de la récupération:', error.message);
    console.error(error);
  }
}

debugTwilioConnector();
