const {
  joinVoiceChannel,
  getVoiceConnection,
  createAudioResource,
  EndBehaviorType,
  VoiceReceiver
} = require('@discordjs/voice');

const fs = require('fs');
const prism = require('prism-media');
const ffmpeg = require('fluent-ffmpeg');
const { createWriteStream } = require('fs');
const { PassThrough } = require('stream');

function joinAndRecord(channel) {
  const connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: channel.guild.id,
    adapterCreator: channel.guild.voiceAdapterCreator,
  });

  const receiver = connection.receiver;

  channel.members.forEach(member => {
    if (member.user.bot) return;

    const userId = member.id;
    const audioStream = receiver.subscribe(userId, {
      end: {
        behavior: EndBehaviorType.AfterSilence,
        duration: 1000,
      },
    });

    const outputStream = new PassThrough();
    const fileName = `./recordings/${userId}-${Date.now()}.pcm`;
    const writeStream = fs.createWriteStream(fileName);

    const ffmpegProcess = ffmpeg(audioStream)
      .inputFormat('s16le')
      .audioFrequency(48000)
      .audioChannels(2)
      .format('wav')
      .on('error', console.error)
      .pipe(writeStream);

    console.log(`Recording ${member.user.username}...`);
  });
}

module.exports = { joinAndRecord };
