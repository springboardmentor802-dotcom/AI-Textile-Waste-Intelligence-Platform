from app.utils.jwt import create_access_token, verify_access_token

token = create_access_token(
    {
        "sub": "anuja@gmail.com",
        "role": "administrator"
    }
)

print("Generated Token:\n")
print(token)

print("\nDecoded Payload:\n")

print(
    verify_access_token(token)
)