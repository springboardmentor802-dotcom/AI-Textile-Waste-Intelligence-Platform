from pathlib import Path
import sys
import requests


# ==========================================================
# CONFIGURATION
# ==========================================================

BASE_URL = "http://127.0.0.1:8000"

ADMIN_USERNAME = "admin"

ADMIN_PASSWORD = input(
    "Enter admin password: "
).strip()


# ==========================================================
# TEST COUNTERS
# ==========================================================

passed = 0
failed = 0

token = None
upload_id = None


# ==========================================================
# RESULT HELPER
# ==========================================================

def record(
    test_name,
    expected,
    actual,
    response_body=None,
):

    global passed, failed

    if actual == expected:

        passed += 1

        print(
            f"[PASS] "
            f"{test_name:<52} "
            f"Expected {expected} | Got {actual}"
        )

    else:

        failed += 1

        print(
            f"[FAIL] "
            f"{test_name:<52} "
            f"Expected {expected} | Got {actual}"
        )

        if response_body:

            print(
                "       Response:",
                str(response_body)[:500]
            )


# ==========================================================
# BOOLEAN ASSERTION HELPER
# ==========================================================

def check(
    test_name,
    condition,
    expected_description="True",
    actual_description=None,
):

    global passed, failed

    if condition:

        passed += 1

        print(
            f"[PASS] "
            f"{test_name:<52} "
            f"{expected_description}"
        )

    else:

        failed += 1

        print(
            f"[FAIL] "
            f"{test_name:<52} "
            f"Expected {expected_description}"
        )

        if actual_description is not None:

            print(
                "       Actual:",
                actual_description
            )


# ==========================================================
# AUTH HEADER
# ==========================================================

def auth_headers():

    return {
        "Authorization":
            f"Bearer {token}"
    }


# ==========================================================
# FIND A REAL IMAGE
# ==========================================================

def find_test_image():

    allowed_extensions = {
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
    }

    search_locations = [
        Path("temp_uploads"),
        Path("../datasets"),
        Path("../models"),
        Path("../Project-screenshots"),
    ]

    for location in search_locations:

        if not location.exists():

            continue

        for file_path in location.rglob("*"):

            if (
                file_path.is_file()
                and
                file_path.suffix.lower()
                in allowed_extensions
            ):

                return file_path

    return None


# ==========================================================
# HEADER
# ==========================================================

print()
print("=" * 88)
print("AI TEXTILE WASTE INTELLIGENCE PLATFORM")
print("M4 END-TO-END INTEGRATION TEST")
print("=" * 88)


# ==========================================================
# TEST 1 - BACKEND HEALTH
# ==========================================================

print()
print("BACKEND")
print("-" * 88)

response = requests.get(
    f"{BASE_URL}/health",
    timeout=10,
)

record(
    "Backend health endpoint",
    200,
    response.status_code,
    response.text,
)


# ==========================================================
# TEST 2 - ADMIN LOGIN
# ==========================================================

print()
print("AUTHENTICATION")
print("-" * 88)

response = requests.post(
    f"{BASE_URL}/auth/login",
    data={
        "username":
            ADMIN_USERNAME,

        "password":
            ADMIN_PASSWORD,
    },
    timeout=10,
)

record(
    "Admin login",
    200,
    response.status_code,
    response.text,
)

if response.status_code != 200:

    print()
    print(
        "[STOP] Admin authentication failed."
    )

    sys.exit(1)


login_data = response.json()

token = login_data.get(
    "access_token"
)

check(
    "JWT token returned",
    bool(token),
    "JWT token exists",
)


# ==========================================================
# TEST IMAGE
# ==========================================================

print()
print("TEST IMAGE")
print("-" * 88)

test_image = find_test_image()

if test_image is None:

    print(
        "[STOP] No JPG/JPEG/PNG/WebP image "
        "was found in temp_uploads, datasets, "
        "models or Project-screenshots."
    )

    print()
    print(
        "Put one textile image inside "
        "backend/temp_uploads and run again."
    )

    sys.exit(1)


print(
    "[OK] Using image:",
    test_image
)


# ==========================================================
# TEST 3 - REJECT ZERO WEIGHT
# ==========================================================

print()
print("PREDICTION VALIDATION")
print("-" * 88)

with open(
    test_image,
    "rb",
) as image_file:

    files = {
        "file": (
            test_image.name,
            image_file,
            "image/jpeg",
        )
    }

    data = {
        "weight": 0
    }

    response = requests.post(
        f"{BASE_URL}/prediction/",
        headers=auth_headers(),
        files=files,
        data=data,
        timeout=120,
    )


record(
    "Prediction rejects zero weight",
    400,
    response.status_code,
    response.text,
)


# ==========================================================
# TEST 4 - VALID PREDICTION
# ==========================================================

print()
print("AI TEXTILE ANALYSIS")
print("-" * 88)

with open(
    test_image,
    "rb",
) as image_file:

    suffix = (
        test_image
        .suffix
        .lower()
    )

    content_type_map = {
        ".jpg":
            "image/jpeg",

        ".jpeg":
            "image/jpeg",

        ".png":
            "image/png",

        ".webp":
            "image/webp",
    }

    content_type = (
        content_type_map.get(
            suffix,
            "image/jpeg",
        )
    )

    files = {
        "file": (
            test_image.name,
            image_file,
            content_type,
        )
    }

    data = {
        "weight": 10
    }

    response = requests.post(
        f"{BASE_URL}/prediction/",
        headers=auth_headers(),
        files=files,
        data=data,
        timeout=180,
    )


record(
    "Valid textile image analysis",
    200,
    response.status_code,
    response.text,
)


if response.status_code != 200:

    print()
    print(
        "[STOP] Prediction pipeline failed. "
        "Cannot continue material confirmation."
    )

    sys.exit(1)


prediction_data = response.json()

upload_id = prediction_data.get(
    "upload_id"
)


check(
    "Prediction returned upload ID",
    isinstance(
        upload_id,
        int,
    ),
    "upload_id is integer",
    upload_id,
)


# ==========================================================
# TEST 5 - FABRIC PREDICTION EXISTS
# ==========================================================

fabric_prediction = (
    prediction_data.get(
        "fabric_prediction",
        {}
    )
)


check(
    "Fabric prediction returned",
    bool(
        fabric_prediction
    ),
    "fabric_prediction exists",
)


check(
    "CNN class returned",
    bool(
        fabric_prediction.get(
            "class_id"
        )
    ),
    "class_id exists",
    fabric_prediction,
)


confidence = (
    fabric_prediction.get(
        "confidence"
    )
)


check(
    "Prediction confidence returned",
    confidence is not None,
    "confidence exists",
    confidence,
)


# ==========================================================
# TEST 6 - CONDITION ANALYSIS
# ==========================================================

condition_analysis = (
    prediction_data.get(
        "condition_analysis",
        {}
    )
)


check(
    "Condition analysis returned",
    bool(
        condition_analysis.get(
            "condition"
        )
    ),
    "condition exists",
    condition_analysis,
)


check(
    "Contamination result returned",
    bool(
        condition_analysis.get(
            "contamination"
        )
    ),
    "contamination exists",
    condition_analysis,
)


# ==========================================================
# TEST 7 - PROVISIONAL DECISION
# ==========================================================

stored_assessment = (
    prediction_data.get(
        "stored_assessment",
        {}
    )
)


check(
    "Initial assessment is provisional",
    stored_assessment.get(
        "assessment_status"
    )
    ==
    "Provisional",
    "assessment_status = Provisional",
    stored_assessment.get(
        "assessment_status"
    ),
)


check(
    "Initial result requires manual review",
    stored_assessment.get(
        "requires_manual_review"
    )
    is True,
    "requires_manual_review = True",
    stored_assessment.get(
        "requires_manual_review"
    ),
)


# ==========================================================
# TEST 8 - GET SINGLE ANALYSIS
# ==========================================================

print()
print("PERSISTENCE")
print("-" * 88)

response = requests.get(
    f"{BASE_URL}/prediction/{upload_id}",
    headers=auth_headers(),
    timeout=30,
)


record(
    "Fetch stored textile analysis",
    200,
    response.status_code,
    response.text,
)


if response.status_code == 200:

    stored_data = (
        response
        .json()
        .get(
            "analysis",
            {}
        )
    )

    check(
        "Stored upload ID matches",
        stored_data.get(
            "upload_id"
        )
        ==
        upload_id,
        f"upload_id = {upload_id}",
        stored_data.get(
            "upload_id"
        ),
    )


# ==========================================================
# TEST 9 - UNSUPPORTED MATERIAL
# ==========================================================

print()
print("MATERIAL CONFIRMATION")
print("-" * 88)

response = requests.patch(
    (
        f"{BASE_URL}"
        f"/prediction/"
        f"{upload_id}"
        f"/material"
    ),
    headers={
        **auth_headers(),
        "Content-Type":
            "application/json",
    },
    json={
        "material":
            "Unobtainium"
    },
    timeout=60,
)


record(
    "Reject unsupported material",
    400,
    response.status_code,
    response.text,
)


# ==========================================================
# TEST 10 - CONFIRM COTTON
# ==========================================================

response = requests.patch(
    (
        f"{BASE_URL}"
        f"/prediction/"
        f"{upload_id}"
        f"/material"
    ),
    headers={
        **auth_headers(),
        "Content-Type":
            "application/json",
    },
    json={
        "material":
            "Cotton"
    },
    timeout=120,
)


record(
    "Confirm textile material",
    200,
    response.status_code,
    response.text,
)


if response.status_code != 200:

    print()
    print(
        "[STOP] Material confirmation failed."
    )

    sys.exit(1)


confirmation = response.json()


# ==========================================================
# TEST 11 - MATERIAL VERIFIED
# ==========================================================

verification = (
    confirmation.get(
        "material_verification",
        {}
    )
)


check(
    "Material marked verified",
    verification.get(
        "verified"
    )
    is True,
    "verified = True",
    verification,
)


check(
    "Material source user verified",
    verification.get(
        "source"
    )
    ==
    "user_verified",
    "source = user_verified",
    verification,
)


check(
    "Confirmed material stored as Cotton",
    verification.get(
        "material"
    )
    ==
    "Cotton",
    "material = Cotton",
    verification,
)


# ==========================================================
# TEST 12 - DECISION ENGINE
# ==========================================================

decision_analysis = (
    confirmation.get(
        "decision_analysis",
        {}
    )
)

decision = (
    decision_analysis.get(
        "decision",
        {}
    )
)


check(
    "Decision engine produced recommendation",
    bool(
        decision.get(
            "recommendation"
        )
    ),
    "recommendation exists",
    decision,
)


check(
    "Decision rule returned",
    bool(
        decision.get(
            "rule_name"
        )
    ),
    "rule_name exists",
    decision,
)


check(
    "Recovery category returned",
    bool(
        decision.get(
            "recovery_category"
        )
    ),
    "recovery_category exists",
    decision,
)


# ==========================================================
# TEST 13 - SUSTAINABILITY ENGINE
# ==========================================================

sustainability = (
    confirmation.get(
        "sustainability_analysis",
        {}
    )
)


check(
    "Sustainability score calculated",
    sustainability.get(
        "sustainability_score"
    )
    is not None,
    "sustainability_score exists",
    sustainability,
)


check(
    "Reuse score calculated",
    sustainability.get(
        "reuse_score"
    )
    is not None,
    "reuse_score exists",
    sustainability,
)


check(
    "Recovery score calculated",
    sustainability.get(
        "recovery_score"
    )
    is not None,
    "recovery_score exists",
    sustainability,
)


check(
    "Circularity level calculated",
    bool(
        sustainability.get(
            "circularity_level"
        )
    ),
    "circularity_level exists",
    sustainability,
)


# ==========================================================
# TEST 14 - STORED VERIFIED ASSESSMENT
# ==========================================================

stored = (
    confirmation.get(
        "stored_assessment",
        {}
    )
)


check(
    "Stored material updated",
    stored.get(
        "material"
    )
    ==
    "Cotton",
    "material = Cotton",
    stored,
)


check(
    "Stored final decision exists",
    bool(
        stored.get(
            "final_decision"
        )
    ),
    "final_decision exists",
    stored,
)


check(
    "Stored recovery pathway exists",
    bool(
        stored.get(
            "recovery_path"
        )
    ),
    "recovery_path exists",
    stored,
)


# ==========================================================
# TEST 15 - HISTORY
# ==========================================================

print()
print("HISTORY")
print("-" * 88)

response = requests.get(
    f"{BASE_URL}/prediction/history",
    headers=auth_headers(),
    timeout=60,
)


record(
    "Prediction history endpoint",
    200,
    response.status_code,
    response.text,
)


if response.status_code == 200:

    history_data = response.json()

    history_uploads = (
        history_data.get(
            "uploads",
            []
        )
    )

    found = any(
        item.get(
            "upload_id"
        )
        ==
        upload_id

        for item in history_uploads
    )

    check(
        "New analysis appears in history",
        found,
        f"upload_id {upload_id} found",
    )


# ==========================================================
# TEST 16 - NOTIFICATIONS
# ==========================================================

print()
print("NOTIFICATIONS")
print("-" * 88)

response = requests.get(
    f"{BASE_URL}/notifications/",
    headers=auth_headers(),
    timeout=30,
)


record(
    "Notification endpoint after analysis",
    200,
    response.status_code,
    response.text,
)


if response.status_code == 200:

    notifications = response.json()

    related_notifications = [
        n
        for n in notifications
        if (
            n.get(
                "related_entity_type"
            )
            ==
            "waste_upload"

            and

            n.get(
                "related_entity_id"
            )
            ==
            upload_id
        )
    ]

    if related_notifications:

        passed += 1

        print(
            f"[PASS] "
            f"{'Analysis notification generated':<52} "
            f"{len(related_notifications)} notification(s)"
        )

    else:

        print(
            "[INFO] No notification was generated "
            "for this analysis."
        )

        print(
            "       This may be valid if the "
            "result did not satisfy an alert rule."
        )


# ==========================================================
# TEST 17 - ANALYTICS
# ==========================================================

print()
print("ANALYTICS")
print("-" * 88)

response = requests.get(
    f"{BASE_URL}/analytics/",
    headers=auth_headers(),
    timeout=60,
)


record(
    "Analytics endpoint",
    200,
    response.status_code,
    response.text,
)


# ==========================================================
# TEST 18 - FINAL STORED RECORD
# ==========================================================

response = requests.get(
    f"{BASE_URL}/prediction/{upload_id}",
    headers=auth_headers(),
    timeout=30,
)


record(
    "Fetch analysis after material verification",
    200,
    response.status_code,
    response.text,
)


if response.status_code == 200:

    final_analysis = (
        response
        .json()
        .get(
            "analysis",
            {}
        )
    )

    check(
        "Final record material is Cotton",
        final_analysis.get(
            "material"
        )
        ==
        "Cotton",
        "material = Cotton",
        final_analysis.get(
            "material"
        ),
    )

    check(
        "Final record material is verified",
        final_analysis.get(
            "material_known"
        )
        is True,
        "material_known = True",
        final_analysis.get(
            "material_known"
        ),
    )

    check(
        "Final record has sustainability score",
        final_analysis.get(
            "sustainability_score"
        )
        is not None,
        "sustainability_score exists",
        final_analysis.get(
            "sustainability_score"
        ),
    )

    check(
        "Final record has recovery decision",
        bool(
            final_analysis.get(
                "final_decision"
            )
        ),
        "final_decision exists",
        final_analysis.get(
            "final_decision"
        ),
    )


# ==========================================================
# FINAL SUMMARY
# ==========================================================

total = passed + failed


print()
print("=" * 88)
print("M4 END-TO-END INTEGRATION TEST SUMMARY")
print("=" * 88)

print(
    f"Upload ID tested : "
    f"{upload_id}"
)

print(
    f"Passed           : "
    f"{passed}"
)

print(
    f"Failed           : "
    f"{failed}"
)

print(
    f"Total            : "
    f"{total}"
)

print()


if failed == 0:

    print(
        "RESULT : END-TO-END "
        "INTEGRATION TEST PASSED"
    )

else:

    print(
        "RESULT : ONE OR MORE "
        "INTEGRATION TESTS FAILED"
    )


print("=" * 88)