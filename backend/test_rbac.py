import requests
from getpass import getpass


BASE_URL = "http://127.0.0.1:8000"


# ==========================================================
# EXPECTED RBAC
# ==========================================================

EXPECTED = {
    "ADMIN": {
        "/analytics/": 200,
        "/analytics/dataset": 200,
        "/users/": 200,
    },

    "NGO": {
        "/analytics/": 200,
        "/analytics/dataset": 200,
        "/users/": 403,
    },

    "INDUSTRY": {
        "/analytics/": 403,
        "/analytics/dataset": 403,
        "/users/": 403,
    },

    "RECYCLER": {
        "/analytics/": 403,
        "/analytics/dataset": 403,
        "/users/": 403,
    },
}


# ==========================================================
# LOGIN
# ==========================================================

def login(username, password):
    url = f"{BASE_URL}/auth/login"

    response = requests.post(
        url,
        data={
            "username": username,
            "password": password,
        },
        timeout=10,
    )

    if response.status_code != 200:
        print(
            f"LOGIN FAILED -> "
            f"{response.status_code}"
        )

        try:
            print(response.json())
        except Exception:
            print(response.text)

        return None

    data = response.json()

    token = (
        data.get("access_token")
        or data.get("token")
    )

    if not token:
        print(
            "LOGIN FAILED -> "
            "No access token returned"
        )

        print(data)

        return None

    return token


# ==========================================================
# TEST ONE ENDPOINT
# ==========================================================

def test_endpoint(
    role,
    token,
    endpoint,
    expected_status,
):
    url = f"{BASE_URL}{endpoint}"

    try:
        response = requests.get(
            url,
            headers={
                "Authorization":
                    f"Bearer {token}"
            },
            timeout=15,
        )

        actual = response.status_code

        passed = (
            actual == expected_status
        )

        symbol = (
            "PASS"
            if passed
            else "FAIL"
        )

        print(
            f"{symbol:<5} | "
            f"{role:<8} | "
            f"{endpoint:<22} | "
            f"expected={expected_status} "
            f"actual={actual}"
        )

        if not passed:
            try:
                print(
                    "       Response:",
                    response.json(),
                )
            except Exception:
                print(
                    "       Response:",
                    response.text[:300],
                )

        return passed

    except requests.RequestException as exc:
        print(
            f"ERROR | "
            f"{role:<8} | "
            f"{endpoint:<22} | "
            f"{exc}"
        )

        return False


# ==========================================================
# MAIN
# ==========================================================

def main():
    print()
    print("=" * 74)
    print("AI TEXTILE PLATFORM - AUTOMATED RBAC TEST")
    print("=" * 74)

    print(
        "\nMake sure FastAPI is running at:"
    )

    print(BASE_URL)

    print(
        "\nEnter credentials for the "
        "four test accounts."
    )

    print(
        "Passwords will not be displayed."
    )

    credentials = {}

    for role in EXPECTED:
        print()
        print(
            f"--- {role} ACCOUNT ---"
        )

        username = input(
            "Username: "
        ).strip()

        password = getpass(
            "Password: "
        )

        credentials[role] = (
            username,
            password,
        )

    print()
    print("=" * 74)
    print("RUNNING TESTS")
    print("=" * 74)
    print()

    total = 0
    passed = 0

    for role, tests in EXPECTED.items():

        username, password = (
            credentials[role]
        )

        print()
        print(
            f"Logging in as {role} "
            f"({username})..."
        )

        token = login(
            username,
            password,
        )

        if not token:
            print(
                f"Skipping {role} tests."
            )

            total += len(tests)

            continue

        print(
            f"{role} login successful."
        )

        for endpoint, expected in tests.items():

            total += 1

            result = test_endpoint(
                role,
                token,
                endpoint,
                expected,
            )

            if result:
                passed += 1

    failed = total - passed

    print()
    print("=" * 74)
    print("FINAL RESULT")
    print("=" * 74)

    print(
        f"Passed : {passed}/{total}"
    )

    print(
        f"Failed : {failed}/{total}"
    )

    if failed == 0:
        print()
        print(
            "RBAC BACKEND TEST: "
            "ALL TESTS PASSED"
        )

    else:
        print()
        print(
            "RBAC BACKEND TEST: "
            "SOME TESTS FAILED"
        )

    print("=" * 74)


if __name__ == "__main__":
    main()