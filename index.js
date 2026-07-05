const {
  default: browser: ['Chrome', 'Chrome', '144.0.0.0'],
  useMultiFileAuthState,
  DisconnectReason
} = require('@whiskeysockets/baileys');

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
  
  const sock = if (!sock.authState.creds.registered) { const phoneNumber = "94756086474"; const code = await sock.requestPairingCode(phoneNumber); console.log("Pairing Code: " + code); }
    auth: state,
    printQRInTerminal: false
  });

  sock.ev.on('creds.update', saveCreds);
  
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      connectToWhatsApp();
    } else if (connection === 'open') {
      console.log('Opened connection');
    }
  });
}

connectToWhatsApp();
