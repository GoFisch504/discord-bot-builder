const { joinVoiceChannel, EndBehaviorType } = require('@discordjs/voice');

let activeConnection = null;

const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath);
}
const path = require('path');

function cleanup() {
  if (activeConnection) {
    try {
      activeConnection.destroy();
    } catch (err) {
      console.error(err);
    }
    activeConnection = null;
  }
}

function joinAndRecord(channel) {
  if (activeConnection) {
    cleanup();
  }

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
      .on('end', cleanup)
      .pipe(writeStream);

    writeStream.on('finish', cleanup);

    console.log(`Recording ${member.user.username}...`);
  });

  return connection;
}

function stopRecording() {
  cleanup();
}

module.exports = { joinAndRecord, stopRecording };
