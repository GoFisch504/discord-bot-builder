const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { joinAndRecord, stopRecording } = require('./voiceRecorder');
const { transcribeAudio } = require('./transcribe');
require('dotenv').config();

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

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content === '!record') {
    if (!message.member.voice.channel) {
      return message.reply('Join a voice channel first.');
    }
    joinAndRecord(message.member.voice.channel);
    message.reply('Recording started.');
  }

  if (message.content === '!stop') {
    stopRecording();
    message.reply('Recording stopped.');
  }

  if (message.content === '!transcribe') {
    const recordingsDir = path.join(__dirname, 'recordings');
    const files = fs
      .readdirSync(recordingsDir)
      .filter((f) => f.startsWith(message.author.id) && f.endsWith('.wav'))
      .sort((a, b) =>
        fs.statSync(path.join(recordingsDir, b)).mtime -
        fs.statSync(path.join(recordingsDir, a)).mtime
      );

    if (!files.length) {
      return message.reply('No recordings found.');
    }

    const filePath = path.join(recordingsDir, files[0]);
    try {
      const text = await transcribeAudio(filePath);
      message.reply(`Transcription: ${text}`);
    } catch (err) {
      console.error(err);
      message.reply('Failed to transcribe recording.');
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
