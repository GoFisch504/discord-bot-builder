const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.login('YMTM3NDYyODE0OTg0MDcxMTc2MQ.GUyjcx.EeuAXIOnu680e40R2_v8lsQhRLxT8ykktTBprI');
