const {
  default: makeWASocket,
  useMultiFileAuthState
} = require('@whiskeysockets/baileys');

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
  
  const sock = makeWASocket({
    auth: state,
    browser: ['Chrome', 'Chrome', '144.0.0.0']
  });

  // Pairing Code එක එන කොටස මෙන්න මෙතන තියෙන්නේ
  if (!sock.authState.creds.registered) {
    const phoneNumber = "94756086474"; // මෙතනට ඔයාගේ WhatsApp නම්බර් එක (රටේ කෝඩ් එකත් එක්ක) දාන්න
    const code = await sock.requestPairingCode(phoneNumber);
    console.log("ඔයාගේ Pairing Code එක මෙන්න මේකයි: " + code);
  }

  sock.ev.on('creds.update', saveCreds);
  
  sock.ev.on('connection.update', (update) => {
    const { connection } = update;
    if (connection === 'close') {
      connectToWhatsApp();
    } else if (connection === 'open') {
      console.log('Opened connection');
    }
  });
}

connectToWhatsApp();
