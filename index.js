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
