import requests
import os
from typing import Dict, Any, List
from datetime import datetime

DEXSCREENER_BASE_URL = "https://api.dexscreener.com/latest/dex/tokens/"
BSCSCAN_BASE_URL = "https://api.bscscan.com/api"

# Assume API key is set in env
BSCSCAN_API_KEY = os.getenv("BSCSCAN_API_KEY", "YourApiKeyToken")  # Replace with actual key

def fetch_from_dexscreener_sync(address: str) -> Dict[str, Any]:
    url = f"{DEXSCREENER_BASE_URL}{address}"
    response = requests.get(url, timeout=10)
    response.raise_for_status()
    data = response.json()

    if not data.get('pairs'):
        return {}

    # Take the first pair, assuming it's the main one
    pair = data['pairs'][0]
    return {
        'name': pair.get('baseToken', {}).get('name', ''),
        'symbol': pair.get('baseToken', {}).get('symbol', ''),
        'liquidity': pair.get('liquidity', {}).get('usd', ''),
        'volume': pair.get('volume', {}).get('h24', ''),
        'market_cap': pair.get('marketCap', ''),
        'holders': '',  # Will be fetched from BscScan
        'pair_address': pair.get('pairAddress', ''),
    }

async def fetch_from_bscscan(address: str) -> Dict[str, Any]:
    # Fetch token info
    params = {
        'module': 'token',
        'action': 'tokeninfo',
        'contractaddress': address,
        'apikey': BSCSCAN_API_KEY
    }
    async with httpx.AsyncClient() as client:
        response = await client.get(BSCSCAN_BASE_URL, params=params)
        response.raise_for_status()
        data = response.json()

    if data.get('status') != '1':
        return {}

    result = data['result'][0] if data['result'] else {}
    return {
        'name': result.get('tokenName', ''),
        'symbol': result.get('symbol', ''),
        'total_supply': result.get('totalSupply', ''),
        'holders': result.get('holderCount', ''),
        'website': result.get('website', ''),
        'socials': {
            'twitter': result.get('twitter', ''),
            'telegram': result.get('telegram', ''),
        },
        'verified': result.get('isContractVerified', 'false') == 'true',  # Assuming field exists
    }

async def fetch_contract_creation(address: str) -> Dict[str, str]:
    params = {
        'module': 'contract',
        'action': 'getcontractcreation',
        'contractaddresses': address,
        'apikey': BSCSCAN_API_KEY
    }
    async with httpx.AsyncClient() as client:
        response = await client.get(BSCSCAN_BASE_URL, params=params)
        response.raise_for_status()
        data = response.json()

    result = {'creator': 'Unknown', 'creation_date': 'Unknown'}
    if data.get('status') == '1' and data.get('result'):
        contract_data = data['result'][0]
        result['creator'] = contract_data.get('contractCreator', 'Unknown')
        tx_hash = contract_data.get('txHash')
        if tx_hash:
            # Fetch tx details for timestamp
            tx_params = {
                'module': 'proxy',
                'action': 'eth_getTransactionByHash',
                'txhash': tx_hash,
                'apikey': BSCSCAN_API_KEY
            }
            tx_response = await client.get(BSCSCAN_BASE_URL, params=tx_params)
            tx_data = tx_response.json()
            if tx_data.get('result'):
                timestamp_hex = tx_data['result'].get('timestamp', '0x0')
                timestamp = int(timestamp_hex, 16)
                dt = datetime.fromtimestamp(timestamp)
                result['creation_date'] = dt.strftime('%Y-%m-%d')
    return result

async def fetch_top_holders(address: str) -> List[Dict[str, Any]]:
    params = {
        'module': 'token',
        'action': 'tokenholderlist',
        'contractaddress': address,
        'page': 1,
        'offset': 5,  # Top 5
        'apikey': BSCSCAN_API_KEY
    }
    async with httpx.AsyncClient() as client:
        response = await client.get(BSCSCAN_BASE_URL, params=params)
        response.raise_for_status()
        data = response.json()

    holders = []
    if data.get('status') == '1' and data.get('result'):
        total_supply = 0  # Would need to get from elsewhere, but for % assume we have it
        for holder in data['result'][:5]:
            holders.append({
                'address': holder.get('TokenHolderAddress', ''),
                'amount': holder.get('TokenHolderQuantity', ''),
                'percentage': 'N/A'  # Calculate if total_supply known
            })
    return holders

async def check_liquidity_lock(address: str) -> str:
    # Placeholder: In real implementation, check liquidity pair and lock status
    # For now, return 'Unknown'
    return 'Unknown'