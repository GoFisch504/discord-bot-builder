const { joinVoiceChannel, EndBehaviorType } = require('@discordjs/voice');

const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath);
}
const path = require('path');

let activeConnection = null;

function joinAndRecord(channel) {
  const connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: channel.guild.id,
    adapterCreator: channel.guild.voiceAdapterCreator,
  });

  activeConnection = connection;

  const receiver = connection.receiver;

  const recordingsDir = path.join(__dirname, 'recordings');
  if (!fs.existsSync(recordingsDir)) {
    fs.mkdirSync(recordingsDir, { recursive: true });
  }

  channel.members.forEach(member => {
    if (member.user.bot) return;

    const userId = member.id;
    const audioStream = receiver.subscribe(userId, {
      end: {
        behavior: EndBehaviorType.AfterSilence,
        duration: 1000,
      },
    });

    const fileName = path.join(recordingsDir, `${userId}-${Date.now()}.wav`);
    const writeStream = fs.createWriteStream(fileName);

    ffmpeg(audioStream)
      .inputFormat('s16le')
      .audioFrequency(48000)
      .audioChannels(2)
      .format('wav')
      .on('error', console.error)
      .pipe(writeStream);

    console.log(`Recording ${member.user.username}...`);
  });
}

function stopRecording() {
  if (activeConnection) {
    activeConnection.destroy();
    activeConnection = null;
  }
}

module.exports = { joinAndRecord, stopRecording };
