const { joinAndRecord } = require('../voiceRecorder');
const { transcribeAudio } = require('../transcribe');

test('joinAndRecord is a function', () => {
  expect(typeof joinAndRecord).toBe('function');
});

test('transcribeAudio is a function', () => {
  expect(typeof transcribeAudio).toBe('function');
});
