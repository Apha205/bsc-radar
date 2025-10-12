import requests
from bs4 import BeautifulSoup
import json
from typing import Dict, Any

def scrape_additional_data(address: str) -> Dict[str, Any]:
    url = f"https://bscscan.com/token/{address}"
    data = {}

    try:
        response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')

        # Scrape socials - look for token-specific links, not BscScan's
        socials = {}
        for link in soup.find_all('a', href=True):
            href = link['href']
            if 'twitter.com' in href and 'bscscan' not in href.lower():
                socials['twitter'] = href
            elif 't.me' in href:
                socials['telegram'] = href

        # If no Twitter found, try to find in token info section
        if not socials.get('twitter'):
            token_info = soup.find('div', class_='card-body')
            if token_info:
                for link in token_info.find_all('a', href=True):
                    href = link['href']
                    if 'twitter.com' in href and 'bscscan' not in href.lower():
                        socials['twitter'] = href
                        break

        if socials:
            data['socials'] = socials

    except Exception as e:
        print(f"Scraping error: {e}")

    return data

def scrape_dexscreener_data(address: str) -> Dict[str, Any]:
    url = f"https://dexscreener.com/bsc/{address}"
    data = {}

    try:
        response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')

        # Extract token info from JSON-LD or meta tags
        scripts = soup.find_all('script', type='application/ld+json')
        for script in scripts:
            try:
                json_data = json.loads(script.string)
                if isinstance(json_data, dict) and json_data.get('@type') == 'Cryptocurrency':
                    data.update({
                        'name': json_data.get('name', ''),
                        'symbol': json_data.get('tickerSymbol', ''),
                        'description': json_data.get('description', ''),
                        'image': json_data.get('image', ''),
                    })
            except:
                pass

        # Scrape additional trader-relevant data
        # Price
        price_elem = soup.find('span', class_='price')
        if price_elem:
            data['price'] = price_elem.text.strip()

        # Market stats
        stat_elements = soup.find_all('div', class_='stat')
        for stat in stat_elements:
            label_elem = stat.find('div', class_='label')
            value_elem = stat.find('div', class_='value')
            if label_elem and value_elem:
                key = label_elem.text.lower().replace(' ', '_').replace('$', '').replace('24h', '24h')
                data[key] = value_elem.text.strip()

        # Social links
        socials = {}
        social_links = soup.find_all('a', href=True)
        for link in social_links:
            href = link['href']
            if 'twitter.com' in href or 'x.com' in href:
                socials['twitter'] = href
            elif 't.me' in href:
                socials['telegram'] = href
            elif 'discord.gg' in href:
                socials['discord'] = href
            elif 'medium.com' in href:
                socials['medium'] = href

        if socials:
            data['socials'] = socials

        # Contract address
        contract_elem = soup.find('a', href=lambda x: x and 'bscscan.com' in x and 'token' in x)
        if contract_elem:
            data['contract_address'] = contract_elem.text.strip()

        # Additional metadata useful for traders
        # Market cap, fully diluted valuation, etc.
        market_data = soup.find('div', class_='market-data')
        if market_data:
            for item in market_data.find_all('div', class_='item'):
                label = item.find('span', class_='label')
                value = item.find('span', class_='value')
                if label and value:
                    key = label.text.lower().replace(' ', '_').replace('$', '')
                    data[key] = value.text.strip()

        # Token info section
        token_info = soup.find('div', class_='token-info')
        if token_info:
            for info_item in token_info.find_all('div', class_='info-item'):
                label = info_item.find('div', class_='label')
                value = info_item.find('div', class_='value')
                if label and value:
                    key = label.text.lower().replace(' ', '_')
                    data[key] = value.text.strip()

    except Exception as e:
        print(f"DexScreener scraping error: {e}")

    return data

def scrape_bubblemaps_data(address: str) -> str:
    url = f"https://v2.bubblemaps.io/token/{address}"
    try:
        response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})
        response.raise_for_status()
        # Return the URL for embedding, since it's a chart page
        return url
    except Exception as e:
        print(f"Bubblemaps scraping error: {e}")
        return ""