import requests
from bs4 import BeautifulSoup
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