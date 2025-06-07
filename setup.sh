#!/bin/sh
# Install project dependencies for discord-bot-builder

if [ ! -f package.json ]; then
  npm init -y
fi

npm install
