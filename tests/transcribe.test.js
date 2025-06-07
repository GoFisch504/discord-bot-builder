const fs = require('fs');
const path = require('path');
const axios = require('axios');

jest.mock('axios');

const { transcribeAudio } = require('../transcribe');

describe('transcribeAudio', () => {
  test('sends file to OpenAI API and returns text', async () => {
    const file = path.join(__dirname, 'temp.wav');
    fs.writeFileSync(file, 'data');
    axios.post.mockResolvedValue({ data: { text: 'hello' } });
    process.env.OPENAI_API_KEY = 'test';

    const text = await transcribeAudio(file);

    expect(axios.post).toHaveBeenCalled();
    const [url, formData, options] = axios.post.mock.calls[0];
    expect(url).toBe('https://api.openai.com/v1/audio/transcriptions');
    expect(options.headers.Authorization).toBe('Bearer test');
    expect(typeof formData.getHeaders).toBe('function');
    expect(text).toBe('hello');

    fs.unlinkSync(file);
  });

  test('throws an error when API request fails', async () => {
    const file = path.join(__dirname, 'temp.wav');
    fs.writeFileSync(file, 'data');
    axios.post.mockRejectedValue(new Error('network'));

    await expect(transcribeAudio(file)).rejects.toThrow('Transcription API request failed');

    fs.unlinkSync(file);
  });
});
