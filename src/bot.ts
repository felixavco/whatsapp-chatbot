import qrcode from 'qrcode-terminal';
import WAWebJS, { Client, LocalAuth } from 'whatsapp-web.js';
import { API, setExpiration } from './utils';
import { createClient } from 'redis';
import { ChatSession } from './utils/interfaces';

export class Bot {
  private redis;
  private client;
  private optionsMessage = `Por favor elige una opcion:
  1. Ver Productos.
  2. Hacer un pedido.
  3. Chatear con alguien`

  constructor () {
    this.onMessage = this.onMessage.bind(this);
    this.getSession = this.getSession.bind(this);
    this.setSession = this.setSession.bind(this);
    this.redis = createClient();
    this.client = new Client({
      authStrategy: new LocalAuth({ dataPath: __dirname }),
    });
  }
  
  async start() {
    this.redis.connect();
    this.redis.on('error', (error) => {
      console.error('Redis Error', error);
    });

    this.client.on('qr', (qr) => {
      qrcode.generate(qr, {small: true});
    });

    this.client.on('ready', () => {
      console.log('Client is ready!');
    });

    this.client.on('message', this.onMessage);
    this.client.initialize();
  }

  private async onMessage(message: WAWebJS.Message) {
    let reply = '';
    const fromNumber = this.getNumber(message);  
    const chatSession = await this.getSession(fromNumber);
    const currentTime = new Date().getTime() ;

    if (message.type !== 'chat') {
      message.reply('Lo siento solo puedo responder mensajes de texto.');
      return;
    }

    if (
        chatSession && 
        Object.keys(chatSession).length && 
        currentTime < chatSession.expiration
      ) {
      if (chatSession.isCompleted) {
        return;
      }
      if (chatSession.retries >= 3) {
        await this.setSession(fromNumber, { isCompleted: true });
        reply = 'Lo sentimos, esa opcion no esta disponible, por favor chatea con uno de nuestros representantes';
        this.client.sendMessage(message.from, reply);
        return
      } 
      reply = this.selection(message);
    } else {
      const user = await API.getUser(fromNumber);
      const data = {
        id: user?.id,
        phone: fromNumber,
        name: user?.name,
        expiration: setExpiration(),
        retries: 0,
      };
      await this.setSession(fromNumber, data);
      reply = this.initialReply(user?.name);
    }
    this.client.sendMessage(message.from, reply);
  }

  private  selection(message: WAWebJS.Message) {
    const from = this.getNumber(message); 
    switch (message.body.trim()) {
      case '1':
        return 'Productos....';
      case '2':
        return 'Hacer pedido......';
      case '3': 
        this.setSession(from, { isCompleted: true });
        return 'En este momento te tranferimos con un representante';
      default:
        this.setSession(from, (data: ChatSession) => ({
          ...data,
          retries: data.retries + 1,
        }));
        return this.optionsMessage;
    }
  }

  private initialReply(name?: string) {
    let reply = 'Hola es un gusto saludarte!';
    if (name) {
      reply = `Hola ${name}, es un gusto saludarte!`;
    }
    return `🤖 - ${reply} ${this.optionsMessage}`;
  }

  private getNumber(message: WAWebJS.Message) {
    return message.from.split('@')[0];
  }

  private async getSession(from: string): Promise<ChatSession | undefined> {
    const session = await this.redis.get(from);
    if (session) {
      return JSON.parse(session);
    }
  }

  private async setSession(from: string, data: {[key: string]: any} | Function) {
    const session = await this.getSession(from);
    let updated;
    if (typeof data === 'function') {
       updated = data(session) 
    } else {
      updated = {
        ...(session ? session : {}),
        ...data,
      }
    }
    await this.redis.set(from, JSON.stringify(updated));
  }
}