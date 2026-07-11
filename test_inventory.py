import requests

data = {
    "batch_id": "TW100",
    "fabric_type": "Cotton",
    "source": "Factory A",
    "quantity": 500,
    "color": "Blue",
    "condition": "Good",
    "collection_date": "2026-07-11"
}

response = requests.post(
    "http://127.0.0.1:5000/add_inventory",
    json=data
)

print(response.status_code)
print(response.text)