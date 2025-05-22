# CoinFlip - Farcaster Mini App

A simple coin flip game built as a Farcaster Mini App on Monad Testnet.

## Features

- Connect with Farcaster
- Place bets using MON tokens
- Double or nothing gameplay
- Real-time results
- Beautiful UI with animations

## Tech Stack

- React + TypeScript
- Vite
- TailwindCSS
- Farcaster Auth Kit
- ethers.js
- Monad Testnet

## Prerequisites

- Node.js 18+
- npm or yarn
- MetaMask or compatible Web3 wallet
- Farcaster account

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/coinflip.git
cd coinflip
```

2. Install dependencies:
```bash
npm install
```

3. Generate assets:
```bash
npm run generate-icon
npm run generate-preview
```

4. Start the development server:
```bash
npm run dev
```

## Building for Production

```bash
npm run build
```

## Deployment

1. Build the project:
```bash
npm run build
```

2. Deploy the `dist` directory to your hosting service (e.g., Vercel, Netlify)

3. Update the `url` and `domain` in `farcaster.json` with your deployment URL

## Smart Contract

The game uses a smart contract deployed on Monad Testnet:
- Address: `0x52540bEa8EdBD8DF057d097E4535ad884bB38a4B`
- Chain ID: 10143

## License

MIT 