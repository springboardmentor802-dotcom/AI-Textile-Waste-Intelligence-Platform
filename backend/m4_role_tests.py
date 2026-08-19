import requests
import uuid

BASE_URL = "http://127.0.0.1:8000"

ACCOUNTS = {
    "Admin": ("admin", "admin123"),
    "Industry": ("industry1", "industry123"),
    "Recycler": ("recycler1", "recycler123"),
    "NGO": ("ngo", "ngo123"),
}

passed = 0
failed = 0

tokens = {}

unique = uuid.uuid4().hex[:8].upper()


def record(test_name, expected, actual, body=""):
    global passed, failed

    if actual == expected:
        passed += 1
        print(
            f"[PASS] {test_name:<55} "
            f"Expected {expected} | Got {actual}"
        )
    else:
        failed += 1
        print(
            f"[FAIL] {test_name:<55} "
            f"Expected {expected} | Got {actual}"
        )

        if body:
            print("       Response:", body[:300])


def headers(role):
    return {
        "Authorization": f"Bearer {tokens[role]}",
        "Content-Type": "application/json",
    }


print()
print("=" * 85)
print("AI TEXTILE WASTE INTELLIGENCE PLATFORM")
print("M4 ROLE-BASED ACCESS CONTROL TESTS")
print("=" * 85)


# ==========================================================
# 1. LOGIN ALL ROLES
# ==========================================================

print()
print("AUTHENTICATION")
print("-" * 85)

for role, (username, password) in ACCOUNTS.items():

    response = requests.post(
        f"{BASE_URL}/auth/login",
        data={
            "username": username,
            "password": password,
        },
        timeout=10,
    )

    record(
        f"{role} login",
        200,
        response.status_code,
        response.text,
    )

    if response.status_code == 200:
        tokens[role] = response.json()["access_token"]


if len(tokens) != len(ACCOUNTS):
    print()
    print("[STOP] One or more accounts could not authenticate.")
    print("Fix authentication before continuing.")
    raise SystemExit(1)


# ==========================================================
# 2. VIEW INVENTORY
# All authenticated roles should be allowed
# ==========================================================

print()
print("VIEW INVENTORY")
print("-" * 85)

for role in ACCOUNTS:

    response = requests.get(
        f"{BASE_URL}/inventory/",
        headers=headers(role),
        timeout=10,
    )

    record(
        f"{role} -> GET /inventory/",
        200,
        response.status_code,
        response.text,
    )


# ==========================================================
# 3. CREATE INVENTORY
#
# Admin       -> 200
# Industry    -> 200
# Recycler    -> 403
# NGO         -> 403
# ==========================================================

print()
print("CREATE INVENTORY")
print("-" * 85)

created_ids = {}

create_expectations = {
    "Admin": 200,
    "Industry": 200,
    "Recycler": 403,
    "NGO": 403,
}

for role, expected in create_expectations.items():

    batch_id = f"M4-RBAC-{role.upper()}-{unique}"

    body = {
        "batch_id": batch_id,
        "material_profile": "Cotton",
        "waste_origin": "Manufacturing",
        "condition_grade": "Good",
        "recovery_potential": "High",
        "processing_status": "Pending",
        "waste_weight": 25,
    }

    response = requests.post(
        f"{BASE_URL}/inventory/",
        headers=headers(role),
        json=body,
        timeout=10,
    )

    record(
        f"{role} -> POST /inventory/",
        expected,
        response.status_code,
        response.text,
    )

    if response.status_code == 200:
        created_ids[role] = response.json().get("textile_id")


# ==========================================================
# 4. UPDATE INVENTORY
#
# We use the Admin-created temporary batch.
#
# Admin       -> 200
# Industry    -> 200
# Recycler    -> 403
# NGO         -> 403
# ==========================================================

print()
print("UPDATE INVENTORY")
print("-" * 85)

admin_test_id = created_ids.get("Admin")

update_expectations = {
    "Admin": 200,
    "Industry": 200,
    "Recycler": 403,
    "NGO": 403,
}

if admin_test_id:

    for role, expected in update_expectations.items():

        body = {
            "batch_id": f"M4-RBAC-ADMIN-{unique}",
            "material_profile": "Cotton",
            "waste_origin": "Manufacturing",
            "condition_grade": "Good",
            "recovery_potential": "High",
            "processing_status": "Pending",
            "waste_weight": 30,
        }

        response = requests.put(
            f"{BASE_URL}/inventory/{admin_test_id}",
            headers=headers(role),
            json=body,
            timeout=10,
        )

        record(
            f"{role} -> PUT /inventory/{{id}}",
            expected,
            response.status_code,
            response.text,
        )

else:
    print("[SKIP] Admin test inventory was not created.")


# ==========================================================
# 5. VIEW NOTIFICATIONS
#
# Every authenticated user should be able to view
# their own notifications.
# ==========================================================

print()
print("VIEW NOTIFICATIONS")
print("-" * 85)

for role in ACCOUNTS:

    response = requests.get(
        f"{BASE_URL}/notifications/",
        headers=headers(role),
        timeout=10,
    )

    record(
        f"{role} -> GET /notifications/",
        200,
        response.status_code,
        response.text,
    )


# ==========================================================
# 6. PLATFORM ANNOUNCEMENT
#
# Admin       -> 200
# Industry    -> 403
# Recycler    -> 403
# NGO         -> 403
# ==========================================================

print()
print("PLATFORM ANNOUNCEMENT")
print("-" * 85)

announcement_expectations = {
    "Admin": 200,
    "Industry": 403,
    "Recycler": 403,
    "NGO": 403,
}

for role, expected in announcement_expectations.items():

    body = {
        "title": f"M4 RBAC Test {unique}",
        "message": "Automated M4 role-based access control validation.",
        "severity": "info",
    }

    response = requests.post(
        f"{BASE_URL}/notifications/announcement",
        headers=headers(role),
        json=body,
        timeout=10,
    )

    record(
        f"{role} -> POST /notifications/announcement",
        expected,
        response.status_code,
        response.text,
    )


# ==========================================================
# 7. DELETE INVENTORY
#
# Only Admin should be allowed.
#
# IMPORTANT:
# Use Industry-created temporary inventory so that the
# Admin delete test does not remove the inventory used
# during the previous update tests.
# ==========================================================

print()
print("DELETE INVENTORY")
print("-" * 85)

industry_test_id = created_ids.get("Industry")

if industry_test_id:

    # First verify blocked roles.
    for role in ["Industry", "Recycler", "NGO"]:

        response = requests.delete(
            f"{BASE_URL}/inventory/{industry_test_id}",
            headers=headers(role),
            timeout=10,
        )

        record(
            f"{role} -> DELETE /inventory/{{id}}",
            403,
            response.status_code,
            response.text,
        )

    # Finally Admin should successfully delete it.
    response = requests.delete(
        f"{BASE_URL}/inventory/{industry_test_id}",
        headers=headers("Admin"),
        timeout=10,
    )

    record(
        "Admin -> DELETE /inventory/{id}",
        200,
        response.status_code,
        response.text,
    )

else:
    print("[SKIP] Industry test inventory was not created.")


# ==========================================================
# 8. CLEANUP ADMIN TEST INVENTORY
# ==========================================================

print()
print("CLEANUP")
print("-" * 85)

if admin_test_id:

    response = requests.delete(
        f"{BASE_URL}/inventory/{admin_test_id}",
        headers=headers("Admin"),
        timeout=10,
    )

    record(
        "Admin cleanup temporary RBAC inventory",
        200,
        response.status_code,
        response.text,
    )


# ==========================================================
# FINAL SUMMARY
# ==========================================================

total = passed + failed

print()
print("=" * 85)
print("M4 RBAC TEST SUMMARY")
print("=" * 85)

print(f"Passed : {passed}")
print(f"Failed : {failed}")
print(f"Total  : {total}")

print()

if failed == 0:
    print("RESULT : ALL RBAC TESTS PASSED")
else:
    print("RESULT : SOME RBAC TESTS FAILED")

print("=" * 85)