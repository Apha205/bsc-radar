from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, validator
import httpx
import asyncio
from cachetools import TTLCache
from datetime import datetime
from services.api_service import fetch_from_dexscreener, fetch_from_bscscan, fetch_contract_creation, fetch_top_holders, check_liquidity_lock
from services.scraping_service import scrape_additional_data
import re

app = FastAPI(title="BSC Token Insight API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory cache with 30s TTL
cache = TTLCache(maxsize=100, ttl=30)

class TokenRequest(BaseModel):
    address: str

    @validator('address')
    def validate_address(cls, v):
        if not re.match(r'^0x[a-fA-F0-9]{40}$', v):
            raise ValueError('Invalid BSC contract address')
        return v

class TokenResponse(BaseModel):
    success: bool
    message: str
    data: dict = None

@app.post("/api/token-info", response_model=TokenResponse)
async def get_token_info(request: TokenRequest):
    address = request.address.lower()

    # Check cache
    if address in cache:
        cached_data = cache[address]
        cached_data['updated_at'] = datetime.utcnow().isoformat()
        return TokenResponse(success=True, message="Data fetched from cache", data=cached_data)

    try:
        # Fetch from APIs concurrently - optimize by skipping slow calls for speed
        dexscreener_data, bscscan_data = await asyncio.gather(
            fetch_from_dexscreener(address),
            fetch_from_bscscan(address)
        )
        # Skip slow calls for now to improve speed
        top_holders = []
        liquidity_lock = 'Unknown'
        contract_info = {'creator': 'Unknown', 'creation_date': 'Unknown'}

        # Combine data
        combined_data = {
            'name': bscscan_data.get('name', dexscreener_data.get('name', '')),
            'symbol': bscscan_data.get('symbol', dexscreener_data.get('symbol', '')),
            'contract_address': address,
            'verified': bscscan_data.get('verified', False),
            'liquidity': dexscreener_data.get('liquidity', ''),
            'volume': dexscreener_data.get('volume', ''),
            'market_cap': dexscreener_data.get('market_cap', ''),
            'holders': bscscan_data.get('holders', ''),
            'liquidity_lock': liquidity_lock,
            'website': bscscan_data.get('website', ''),
            'socials': bscscan_data.get('socials', {}),
            'creator': contract_info.get('creator', 'Unknown'),
            'creation_date': contract_info.get('creation_date', 'Unknown'),
            'top_holders': top_holders,
            'pair_address': dexscreener_data.get('pair_address', ''),
        }

        # If missing socials, scrape
        if not combined_data.get('socials'):
            scraped_data = scrape_additional_data(address)
            combined_data['socials'] = scraped_data.get('socials', {})

        combined_data['updated_at'] = datetime.utcnow().isoformat()

        # Cache the result
        cache[address] = combined_data

        return TokenResponse(success=True, message="Data fetched successfully", data=combined_data)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)