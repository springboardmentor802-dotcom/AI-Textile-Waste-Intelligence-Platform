import requests

data = {
    "full_name": "Dharani",
    "email": "dharani@test.com",
    "password": "123456",
    "role": "Admin"
}

response = requests.post(
    "http://127.0.0.1:5000/register",
    json=data
)

print("Status Code:", response.status_code)
print("Response:")
print(response.text)