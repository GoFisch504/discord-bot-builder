jest.mock('fs');
jest.mock('../voiceRecorder', () => ({ joinAndRecord: jest.fn(), stopRecording: jest.fn() }));
jest.mock('../transcribe', () => ({ transcribeAudio: jest.fn().mockResolvedValue('text') }));

jest.mock('discord.js', () => {
  const onceMock = jest.fn();
  const onMock = jest.fn();
  const loginMock = jest.fn();
  return {
    Client: jest.fn(() => ({
      once: onceMock,
      on: onMock,
      login: loginMock,
      user: { tag: 'bot' },
    })),
    GatewayIntentBits: {
      Guilds: 1,
      GuildVoiceStates: 2,
      GuildMessages: 3,
      MessageContent: 4,
    },
    __mocks: { onceMock, onMock, loginMock }
  };
});

let joinAndRecord, stopRecording, transcribeAudio;
let Client, GatewayIntentBits, __mocks, onceMock, onMock, loginMock;
({ Client, GatewayIntentBits, __mocks } = require('discord.js'));
({ onceMock, onMock, loginMock } = __mocks);
({ joinAndRecord, stopRecording } = require('../voiceRecorder'));
({ transcribeAudio } = require('../transcribe'));

let fs = require('fs');
const path = require('path');

describe('index', () => {
  beforeEach(() => {
    jest.resetModules();
    ({ Client, GatewayIntentBits, __mocks } = require('discord.js'));
    ({ onceMock, onMock, loginMock } = __mocks);
    ({ joinAndRecord, stopRecording } = require('../voiceRecorder'));
    ({ transcribeAudio } = require('../transcribe'));
    fs = require('fs');
    jest.clearAllMocks();
  });

  test('initializes discord client', () => {
    require('../index');
    expect(Client).toHaveBeenCalledWith({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });
    expect(onceMock).toHaveBeenCalledWith('ready', expect.any(Function));
    expect(onMock).toHaveBeenCalledWith('messageCreate', expect.any(Function));
    expect(loginMock).toHaveBeenCalled();
  });

  test('handles !record command', async () => {
    require('../index');
    const handler = onMock.mock.calls.find(c => c[0] === 'messageCreate')[1];
    const channel = {};
    const reply = jest.fn();
    const msg = { content: '!record', author: { bot: false }, member: { voice: { channel } }, reply };

    await handler(msg);

    expect(joinAndRecord).toHaveBeenCalledWith(channel);
    expect(reply).toHaveBeenCalledWith('Recording started.');
  });

  test('handles !transcribe command', async () => {
    fs.readdirSync.mockReturnValue(['user-1.wav']);
    fs.statSync.mockReturnValue({ mtime: new Date() });
    require('../index');
    const handler = onMock.mock.calls.find(c => c[0] === 'messageCreate')[1];
    const reply = jest.fn();
    const msg = { content: '!transcribe', author: { bot: false, id: 'user' }, reply, member: {} };
    await handler(msg);
    const expectedPath = path.join(__dirname, '..', 'recordings', 'user-1.wav');
    expect(transcribeAudio).toHaveBeenCalledWith(expectedPath);
    expect(reply).toHaveBeenCalledWith('Transcription: text');
  });

  test('handles !stop command', async () => {
    require('../index');
    const handler = onMock.mock.calls.find(c => c[0] === 'messageCreate')[1];
    const reply = jest.fn();
    const msg = { content: '!stop', author: { bot: false }, reply, member: {} };

    await handler(msg);

    expect(stopRecording).toHaveBeenCalled();
    expect(reply).toHaveBeenCalledWith('Recording stopped.');
  });
});
