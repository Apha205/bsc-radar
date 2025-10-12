import requests
import json

def test_token_info():
    url = "http://localhost:8000/api/token-info"
    address = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"  # WBNB test address

    payload = {"address": address}
    headers = {"Content-Type": "application/json"}

    response = requests.post(url, data=json.dumps(payload), headers=headers)

    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print("Response:", json.dumps(data, indent=2))
        if data.get("success"):
            print("API returned valid data!")
        else:
            print("API returned error:", data.get("message"))
    else:
        print("Error:", response.text)

if __name__ == "__main__":
    test_token_info()