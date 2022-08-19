import qrcode from 'qrcode-terminal';

import { Client, LocalAuth } from 'whatsapp-web.js';
import { API } from './utils';

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: __dirname })
});

client.on('qr', (qr) => {
  qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
  console.log('Client is ready!');
});

client.on('message', async (message) => {
  if (message.type !== 'chat') {
    message.reply('Lo siento solo puedo responder mensajes de texto.');
    return;
  }

  const [fromNumber] = message.from.split('@');  
  const user = await API.getUser(fromNumber);
  let reply = 'Hola es un gusto saludarte!';
  if (user) {
    reply = `Hola ${user.name}, es un gusto saludarte!`;
  }
  reply = `🤖 - ${reply} 
  Por favor elige una opcion:
  1. Ver Productos.
  2. Hacer un pedido.
  3. Chatear con alguien
  `;
  client.sendMessage(message.from, reply);
});


client.initialize();
