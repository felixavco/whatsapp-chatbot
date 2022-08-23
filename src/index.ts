import { Bot } from './bot';
import { createClient } from 'redis';
import cron from 'node-cron';

function clearSessions() {
  const redis = createClient();
  redis.connect();
  redis.on('error', () => console.error('Redis Error'));
  redis.flushDb();
  console.log('Sessions cleared!')
}

cron.schedule('59 23 * * *', clearSessions); // Clears sessions every day at 11:59 pm

const bot = new Bot()
bot.start();