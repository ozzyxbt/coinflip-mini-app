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
  res.setHeader('X-Frame-Options', 'ALLOWALL'); // Allow embedding in frames
  next();
});

// Serve static files from public directory first (for images)
app.use(express.static('public'));
// Serve static files from dist directory (for built app)
app.use(express.static('dist'));

// Get the base URL from environment or use default
const BASE_URL = process.env.BASE_URL || `http://localhost:${port}`;

// Frame metadata endpoint for root
app.get('/', (req, res, next) => {
  // Check if this is a frame request (from Farcaster)
  const userAgent = req.headers['user-agent'] || '';
  const isFrameRequest = userAgent.toLowerCase().includes('farcaster') || 
                         req.headers['fc-host-url'] || 
                         req.query.frame === 'true';
  
  if (isFrameRequest) {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>CoinFlip - Double or Nothing</title>
          <meta property="og:title" content="CoinFlip - Double or Nothing" />
          <meta property="og:description" content="A simple coin flip game on Monad Testnet" />
          <meta property="og:image" content="${BASE_URL}/coinflip-preview.png" />
          <meta property="og:type" content="website" />
          
          <!-- Farcaster Frame Tags -->
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="${BASE_URL}/coinflip-preview.png" />
          <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
          <meta property="fc:frame:button:1" content="Play CoinFlip 🎲" />
          <meta property="fc:frame:button:1:action" content="launch_frame" />
          <meta property="fc:frame:button:1:target" content="${BASE_URL}" />
          
          <!-- Farcaster Mini App Config -->
          <meta name="fc:frame:web-embed:version" content="1" />
          <meta name="fc:frame:web-embed:url" content="${BASE_URL}" />
        </head>
        <body style="margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: linear-gradient(135deg, #200052 0%, #836EF9 50%, #A0055D 100%);">
          <div style="text-align: center; color: white; font-family: system-ui, -apple-system, sans-serif;">
            <h1 style="font-size: 3rem; margin-bottom: 1rem;">🪙 CoinFlip</h1>
            <p style="font-size: 1.5rem; opacity: 0.9;">Double or nothing on Monad Testnet</p>
            <p style="font-size: 1rem; margin-top: 2rem; opacity: 0.7;">Click "Play CoinFlip" to launch the mini app</p>
          </div>
        </body>
      </html>
    `);
  } else {
    // Serve the regular app for non-frame requests
    next();
  }
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