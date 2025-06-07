# discord-bot-builder

This project is a simple Discord bot built with Node.js.

## Setup

Run the included setup script to install dependencies:

```sh
./setup.sh
```

The script calls `npm install` (and will create `package.json` if it doesn't exist).

After installing dependencies, copy `.env.example` to `.env` and set your bot token:

```sh
DISCORD_TOKEN=YOUR_TOKEN_HERE
```

The app uses [dotenv](https://github.com/motdotla/dotenv) to load environment variables automatically when `index.js` runs.
