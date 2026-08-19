import argparse
import asyncio
import getpass
import re
import sys

from database import users_collection
from security import get_password_hash

EMAIL_PATTERN = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"

async def create_admin(name: str, email: str, password: str):
    name = name.strip()
    email = email.strip().lower()

    if not (2 <= len(name) <= 50):
        sys.exit("Name must be between 2 and 50 characters.")
    if not (5 <= len(email) <= 254) or not re.match(EMAIL_PATTERN, email):
        sys.exit("Invalid email.")
    if not (8 <= len(password) <= 72):
        sys.exit("Password must be between 8 and 72 characters.")

    existing = await users_collection.find_one({"email": email})
    if existing:
        sys.exit(f"An account with email {email} already exists (role: {existing.get('role')}).")

    hashed_password = get_password_hash(password)
    await users_collection.insert_one({
        "name": name,
        "email": email,
        "password": hashed_password,
        "role": "Admin",
        "email_notifications": True,
    })
    print(f"Admin account created for {email}.")

def main():
    parser = argparse.ArgumentParser(description="Create an admin account.")
    parser.add_argument("--name")
    parser.add_argument("--email")
    parser.add_argument("--password")
    args = parser.parse_args()

    name = args.name or input("Name: ")
    email = args.email or input("Email: ")
    password = args.password or getpass.getpass("Password: ")

    asyncio.run(create_admin(name, email, password))

if __name__ == "__main__":
    main()