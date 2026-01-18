# Firebase Cloud Functions

Backend serverless functions for the LetItRip.in platform.

## Overview

This directory contains Firebase Cloud Functions that handle server-side operations, scheduled tasks, and background processing for the platform.

## Setup

```bash
cd functions
npm install
```

## Development

```bash
# Serve functions locally
npm run serve

# Deploy functions
npm run deploy
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

## Structure

```
functions/
├── src/               # Function source code
├── package.json       # Dependencies
└── tsconfig.json      # TypeScript config
```

## Available Functions

Functions are defined in the `src/` directory and automatically deployed based on their exports.

## Testing

```bash
npm test
```

## Deployment

```bash
# Deploy all functions
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:functionName
```

## Learn More

- [Firebase Cloud Functions Documentation](https://firebase.google.com/docs/functions)
- [TypeScript for Cloud Functions](https://firebase.google.com/docs/functions/typescript)
