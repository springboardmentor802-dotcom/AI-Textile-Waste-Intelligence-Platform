import requests
import sys
import uuid

BASE_URL = "http://127.0.0.1:8000"

ADMIN_USERNAME = "admin"

# Enter your current admin password here
ADMIN_PASSWORD = input("Enter admin password: ").strip()

passed = 0
failed = 0
created_inventory_id = None
created_notification_id = None

unique = uuid.uuid4().hex[:8].upper()
test_batch_id = f"M4-AUTO-{unique}"


def result(name, expected, actual, body=None):
    global passed, failed

    if actual == expected:
        passed += 1
        print(f"[PASS] {name:<42} Expected {expected} | Got {actual}")
    else:
        failed += 1
        print(f"[FAIL] {name:<42} Expected {expected} | Got {actual}")
        if body is not None:
            print("       Response:", body)


def auth_headers(token):
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }


print()
print("=" * 75)
print("AI TEXTILE WASTE INTELLIGENCE PLATFORM")
print("M4 AUTOMATED BACKEND VALIDATION")
print("=" * 75)


# ==========================================================
# LOGIN
# ==========================================================

login_response = requests.post(
    f"{BASE_URL}/auth/login",
    data={
        "username": ADMIN_USERNAME,
        "password": ADMIN_PASSWORD
    },
    timeout=10
)

if login_response.status_code != 200:
    print()
    print("[STOP] Admin login failed.")
    print("Status:", login_response.status_code)
    print("Response:", login_response.text)
    sys.exit(1)

login_data = login_response.json()
token = login_data["access_token"]

headers = auth_headers(token)

print()
print("[OK] Admin authentication successful.")
print()


# ==========================================================
# T16 - UNAUTHENTICATED PROTECTED REQUEST
# ==========================================================

response = requests.get(
    f"{BASE_URL}/notifications/",
    timeout=10
)

result(
    "Protected endpoint without token",
    401,
    response.status_code,
    response.text
)


# ==========================================================
# T17 - UPDATE NONEXISTENT INVENTORY
# ==========================================================

valid_body = {
    "batch_id": f"M4-NOTFOUND-{unique}",
    "material_profile": "Cotton",
    "waste_origin": "Manufacturing",
    "condition_grade": "Good",
    "recovery_potential": "High",
    "processing_status": "Pending",
    "waste_weight": 50
}

response = requests.put(
    f"{BASE_URL}/inventory/999999",
    headers=headers,
    json=valid_body,
    timeout=10
)

result(
    "Update nonexistent inventory",
    404,
    response.status_code,
    response.text
)


# ==========================================================
# T18 - CREATE TEMPORARY VALID INVENTORY
# ==========================================================

create_body = {
    "batch_id": test_batch_id,
    "material_profile": "Cotton",
    "waste_origin": "Manufacturing",
    "condition_grade": "Good",
    "recovery_potential": "High",
    "processing_status": "Pending",
    "waste_weight": 25
}

response = requests.post(
    f"{BASE_URL}/inventory/",
    headers=headers,
    json=create_body,
    timeout=10
)

result(
    "Create temporary inventory",
    200,
    response.status_code,
    response.text
)

if response.status_code == 200:
    created_inventory_id = response.json().get("textile_id")


# ==========================================================
# T19 - UPDATE WITH NEGATIVE WEIGHT
# ==========================================================

if created_inventory_id:

    invalid_weight_body = {
        "batch_id": test_batch_id,
        "material_profile": "Cotton",
        "waste_origin": "Manufacturing",
        "condition_grade": "Good",
        "recovery_potential": "High",
        "processing_status": "Pending",
        "waste_weight": -20
    }

    response = requests.put(
        f"{BASE_URL}/inventory/{created_inventory_id}",
        headers=headers,
        json=invalid_weight_body,
        timeout=10
    )

    result(
        "Reject negative update weight",
        422,
        response.status_code,
        response.text
    )


# ==========================================================
# T20 - DUPLICATE BATCH ID
# ==========================================================

duplicate_body = {
    "batch_id": test_batch_id,
    "material_profile": "Polyester",
    "waste_origin": "Retail",
    "condition_grade": "Fair",
    "recovery_potential": "Medium",
    "processing_status": "Pending",
    "waste_weight": 30
}

response = requests.post(
    f"{BASE_URL}/inventory/",
    headers=headers,
    json=duplicate_body,
    timeout=10
)

result(
    "Reject duplicate batch ID",
    409,
    response.status_code,
    response.text
)


# ==========================================================
# T21 - GET NOTIFICATIONS
# ==========================================================

response = requests.get(
    f"{BASE_URL}/notifications/",
    headers=headers,
    timeout=10
)

result(
    "Get notifications",
    200,
    response.status_code,
    response.text
)

notifications = []

if response.status_code == 200:
    notifications = response.json()


# ==========================================================
# T22 - MARK ONE NOTIFICATION READ
# ==========================================================

if notifications:

    unread = next(
        (
            n for n in notifications
            if not n.get("is_read")
        ),
        None
    )

    if unread:

        created_notification_id = unread["notification_id"]

        response = requests.patch(
            f"{BASE_URL}/notifications/{created_notification_id}/read",
            headers=headers,
            timeout=10
        )

        result(
            "Mark one notification as read",
            200,
            response.status_code,
            response.text
        )

        if response.status_code == 200:

            is_read = response.json().get("is_read")

            if is_read is True:
                global_message = "[PASS] Notification state changed to read"
                passed += 1
            else:
                global_message = "[FAIL] Notification remained unread"
                failed += 1

            print(global_message)

    else:
        print("[INFO] No unread notification available for single-read test.")

else:
    print("[INFO] No notifications available for single-read test.")


# ==========================================================
# T23 - MARK ALL NOTIFICATIONS READ
# ==========================================================

response = requests.patch(
    f"{BASE_URL}/notifications/read-all",
    headers=headers,
    timeout=10
)

result(
    "Mark all notifications as read",
    200,
    response.status_code,
    response.text
)


# ==========================================================
# T24 - VERIFY UNREAD COUNT = 0
# ==========================================================

response = requests.get(
    f"{BASE_URL}/notifications/unread-count",
    headers=headers,
    timeout=10
)

result(
    "Get unread notification count",
    200,
    response.status_code,
    response.text
)

if response.status_code == 200:

    unread_count = response.json().get("unread_count")

    if unread_count == 0:
        passed += 1
        print(
            f"[PASS] {'Unread count becomes zero':<42} "
            f"Expected 0 | Got {unread_count}"
        )
    else:
        failed += 1
        print(
            f"[FAIL] {'Unread count becomes zero':<42} "
            f"Expected 0 | Got {unread_count}"
        )


# ==========================================================
# T25 - CLEANUP TEMPORARY INVENTORY
# ==========================================================

if created_inventory_id:

    response = requests.delete(
        f"{BASE_URL}/inventory/{created_inventory_id}",
        headers=headers,
        timeout=10
    )

    result(
        "Cleanup temporary inventory",
        200,
        response.status_code,
        response.text
    )


# ==========================================================
# FINAL RESULT
# ==========================================================

total = passed + failed

print()
print("=" * 75)
print("M4 AUTOMATED TEST SUMMARY")
print("=" * 75)

print(f"Passed : {passed}")
print(f"Failed : {failed}")
print(f"Total  : {total}")

if failed == 0:
    print()
    print("RESULT : ALL AUTOMATED TESTS PASSED")
else:
    print()
    print("RESULT : SOME TESTS FAILED - REVIEW REQUIRED")

print("=" * 75)