# discord-bot-builder

This project is a simple Discord bot built with Node.js.

## Setup

1. Copy `.env.example` to `.env` and fill in your `DISCORD_TOKEN` and `OPENAI_API_KEY`.
2. Install dependencies:
   ```sh
   ./setup.sh
   ```
3. Run the bot:
   ```sh
   node index.js
   ```

## Build
The CI workflow compiles the bot using webpack. To run the same step locally:
```sh
npm run build
```
The bundled file is output to the `dist/` directory.

