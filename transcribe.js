const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

async function transcribeAudio(filePath) {
  const formData = new FormData();
  formData.append('file', fs.createReadStream(filePath));
  formData.append('model', 'whisper-1');

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          ...formData.getHeaders(),
        },
      }
    );

    return response.data.text;
  } catch (err) {
    const msg = err.response?.data || err.message || err;
    console.error('Failed to transcribe audio:', msg);
    throw new Error('Transcription API request failed');
  }
}

module.exports = { transcribeAudio };
