const fs = require('fs');

jest.mock('fs');

const ffmpeg = require('fluent-ffmpeg');
const { joinVoiceChannel, EndBehaviorType } = require('@discordjs/voice');

jest.mock('fluent-ffmpeg', () => {
  const fn = jest.fn(() => ({
    inputFormat: jest.fn().mockReturnThis(),
    audioFrequency: jest.fn().mockReturnThis(),
    audioChannels: jest.fn().mockReturnThis(),
    format: jest.fn().mockReturnThis(),
    on: jest.fn().mockReturnThis(),
    pipe: jest.fn().mockReturnThis(),
  }));
  fn.setFfmpegPath = jest.fn();
  return fn;
});

jest.mock('ffmpeg-static', () => '/path/ffmpeg');

jest.mock('@discordjs/voice', () => ({
  joinVoiceChannel: jest.fn(),
  EndBehaviorType: { AfterSilence: 'AfterSilence' },
}));

const { joinAndRecord, stopRecording } = require('../voiceRecorder');

describe('joinAndRecord', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('joins channel and records non-bot members', () => {
    const subscribe = jest.fn(() => 'stream');
    joinVoiceChannel.mockReturnValue({ receiver: { subscribe }, destroy: jest.fn() });

    fs.existsSync.mockReturnValue(false);
    fs.mkdirSync.mockReturnValue();
    fs.createWriteStream.mockReturnValue({ on: jest.fn() });

    const member = { id: '1', user: { bot: false, username: 'user' } };
    const channel = {
      id: 'c1',
      guild: { id: 'g1', voiceAdapterCreator: 'adapter' },
      members: { forEach: (cb) => cb(member) },
    };

    joinAndRecord(channel);

    expect(joinVoiceChannel).toHaveBeenCalledWith({
      channelId: 'c1',
      guildId: 'g1',
      adapterCreator: 'adapter',
    });
    expect(subscribe).toHaveBeenCalledWith('1', {
      end: { behavior: 'AfterSilence', duration: 1000 },
    });
    expect(ffmpeg).toHaveBeenCalledWith('stream');
  });

  test('stopRecording destroys connection', () => {
    const subscribe = jest.fn(() => 'stream');
    const destroy = jest.fn();
    joinVoiceChannel.mockReturnValue({ receiver: { subscribe }, destroy });

    fs.existsSync.mockReturnValue(false);
    fs.mkdirSync.mockReturnValue();
    fs.createWriteStream.mockReturnValue({ on: jest.fn() });

    const member = { id: '1', user: { bot: false, username: 'user' } };
    const channel = {
      id: 'c1',
      guild: { id: 'g1', voiceAdapterCreator: 'adapter' },
      members: { forEach: (cb) => cb(member) },
    };

    joinAndRecord(channel);
    stopRecording();

    expect(destroy).toHaveBeenCalled();
  });
});
