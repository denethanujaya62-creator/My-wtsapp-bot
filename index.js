const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require('@whiskeysockets/baileys');

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
  
  const sock = makeWASocket({
    auth: state,
    // මේ කොටස එකතු කරන්න
sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) {
        console.log("QR Code received, please scan it: ", qr);
    }
    // ඉතුරු ටික කලින් තිබුණ විදිහටම තියන්න...
});
  });

  sock.ev.on('creds.update', saveCreds);
  
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      console.log('Connection closed. Reconnecting...');
      connectToWhatsApp();
    } else if (connection === 'open') {
      console.log('Opened connection');
    }
  });
}

connectToWhatsApp();
