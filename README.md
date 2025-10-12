# BSC Token Insight

A modern web application for real-time BSC token analysis and insights.

## Features

- 🚀 Fast token information retrieval
- 📊 Real-time DexScreener charts
- 🫧 Holder distribution analysis (Bubblemaps)
- 💧 Liquidity and volume tracking
- ⚡ Optimized performance (~1 second response time)
- 🎨 Sleek dark UI with green accents

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: FastAPI, Python 3.13
- **APIs**: DexScreener, Bubblemaps
- **Deployment**: Vercel (Frontend), GitHub Actions CI/CD

## Local Development

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Deployment

### Automatic CI/CD
- Push to `main` branch triggers GitHub Actions
- Automatically deploys to Netlify
- Includes linting and build verification

### Manual Deployment
```bash
cd frontend
npm run build
npm run export
```

## Environment Variables

### Backend
- `BSCSCAN_API_KEY`: BscScan API key (optional, for enhanced features)

### Netlify (GitHub Secrets)
- `NETLIFY_AUTH_TOKEN`: Netlify authentication token
- `NETLIFY_SITE_ID`: Netlify site ID

## API Endpoints

### POST /api/token-info
Fetch token information by contract address.

**Request:**
```json
{
  "address": "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Data fetched successfully",
  "data": {
    "name": "Wrapped BNB",
    "symbol": "WBNB",
    "contract_address": "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
    "liquidity": "29971815.82",
    "volume": "1139193855.81",
    "pair_address": "0x172fcD41E0913e95784454622d1c3724f546f849",
    "bubblemaps_url": "https://v2.bubblemaps.io/token/0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
    "updated_at": "2025-10-12T13:38:22.943880"
  }
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details.
