# discord-bot-builder

This project is a simple Discord bot built with Node.js.

## Setup

Run the following script from the project root to install all dependencies:

```sh
./setup.sh
```

The repository includes a `package.json` file, so the script simply runs
`npm install` (and will create one if it doesn't exist).

Create a `.env` file (you can copy `.env.example`) and set `DISCORD_TOKEN` to your bot token. The application uses [dotenv](https://github.com/motdotla/dotenv) to load environment variables automatically when `index.js` runs.
