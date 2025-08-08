import express from 'express';
// import { ethers } from 'ethers';
// import CoinFlipABI from './src/contracts/CoinFlip.json';

const app = express();
const port = process.env.PORT || 3000;

// const CONTRACT_ADDRESS = '0x52540bEa8EdBD8DF057d097E4535ad884bB38a4B';
// const RPC_URL = 'https://testnet-rpc.monad.xyz';

// Initialize provider - uncomment when needed
// const provider = new ethers.JsonRpcProvider(RPC_URL);
// const contract = new ethers.Contract(CONTRACT_ADDRESS, CoinFlipABI, provider);

// Set Cross-Origin-Opener-Policy header
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
  next();
});

// Serve static files
app.use(express.static('dist'));

// Frame metadata endpoint
app.get('/frame', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>CoinFlip</title>
        <meta property="og:title" content="CoinFlip" />
        <meta property="og:image" content="https://your-domain.com/coinflip-preview.png" />
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="https://your-domain.com/coinflip-preview.png" />
        <meta property="fc:frame:button:1" content="Bet 1 MON" />
        <meta property="fc:frame:button:2" content="Bet 10 MON" />
        <meta property="fc:frame:button:3" content="Bet 100 MON" />
        <meta property="fc:frame:post_url" content="https://your-domain.com/flip" />
      </head>
      <body>
        <h1>CoinFlip</h1>
      </body>
    </html>
  `);
});

// Handle flip requests
app.post('/flip', async (req, res) => {
  // const { amount } = req.body; // Uncomment when implementing flip logic
  
  try {
    // Here you would implement the logic to handle the flip
    // This would typically involve:
    // 1. Verifying the user's wallet
    // 2. Processing the transaction
    // 3. Returning the result
    
    res.json({
      success: true,
      message: 'Flip processed successfully'
    });
  } catch (error) {
    console.error('Error processing flip:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing flip'
    });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});