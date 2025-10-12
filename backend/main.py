from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, validator
import requests
from cachetools import TTLCache
from datetime import datetime
from services.api_service import fetch_from_dexscreener_sync
import re
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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
        logger.info(f"Validating address: {v}")
        if not re.match(r'^0x[a-fA-F0-9]{40}$', v):
            logger.warning(f"Invalid BSC address provided: {v}")
            raise ValueError('Invalid BSC address. Enter a valid BSC address')
        return v

class TokenResponse(BaseModel):
    success: bool
    message: str
    data: dict = None

@app.post("/api/token-info", response_model=TokenResponse)
def get_token_info(request: TokenRequest):
    start_time = datetime.utcnow()
    address = request.address.lower()

    # Check cache
    if address in cache:
        logger.info(f"Cache hit for address: {address}")
        cached_data = cache[address]
        cached_data['updated_at'] = datetime.utcnow().isoformat()
        return TokenResponse(success=True, message="Data fetched from cache", data=cached_data)

    try:
        # Fetch only from DexScreener for speed
        dexscreener_data = fetch_from_dexscreener_sync(address)

        # Combine data - ensure all values are strings
        combined_data = {
            'name': str(dexscreener_data.get('name', '')),
            'symbol': str(dexscreener_data.get('symbol', '')),
            'contract_address': address,
            'liquidity': str(dexscreener_data.get('liquidity', '')),
            'volume': str(dexscreener_data.get('volume', '')),
            'holders': str(dexscreener_data.get('holders', '')),
            'pair_address': str(dexscreener_data.get('pair_address', '')),
        }

        # Get Bubblemaps URL
        combined_data['bubblemaps_url'] = f"https://v2.bubblemaps.io/token/{address}"

        combined_data['updated_at'] = datetime.utcnow().isoformat()

        # Ensure serializable data
        for key in combined_data:
            if isinstance(combined_data[key], (dict, list)):
                combined_data[key] = str(combined_data[key])

        # Cache the result
        cache[address] = combined_data

        end_time = datetime.utcnow()
        response_time = (end_time - start_time).total_seconds()
        logger.info(f"Successfully fetched data for token: {combined_data.get('name', 'Unknown')} ({address}) in {response_time:.2f}s")
        try:
            response = TokenResponse(success=True, message="Data fetched successfully", data=combined_data)
            return response
        except Exception as resp_err:
            logger.error(f"TokenResponse creation error: {resp_err}")
            raise

    except Exception as e:
        logger.error(f"Error in get_token_info for {address}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)