from pathlib import Path
from statistics import mean, median
from time import perf_counter

import requests


# ==========================================================
# CONFIGURATION
# ==========================================================

BASE_URL = "http://127.0.0.1:8000"

ADMIN_USERNAME = "admin"

ADMIN_PASSWORD = input(
    "Enter admin password: "
).strip()

REPEAT_API_TESTS = 10
REPEAT_PREDICTION_TESTS = 3

REQUEST_TIMEOUT = 30
PREDICTION_TIMEOUT = 180


# ==========================================================
# RESULTS
# ==========================================================

passed = 0
failed = 0

token = None


# ==========================================================
# HELPERS
# ==========================================================

def record(
    name,
    passed_condition,
    details=""
):
    global passed, failed

    if passed_condition:
        passed += 1
        print(
            f"[PASS] {name:<48} {details}"
        )
    else:
        failed += 1
        print(
            f"[FAIL] {name:<48} {details}"
        )


def auth_headers():
    return {
        "Authorization":
            f"Bearer {token}"
    }


def measure_request(
    method,
    url,
    **kwargs
):
    start = perf_counter()

    response = requests.request(
        method,
        url,
        **kwargs
    )

    # Force response body consumption.
    _ = response.content

    end = perf_counter()

    elapsed_ms = (
        end - start
    ) * 1000

    return response, elapsed_ms


def show_stats(
    label,
    values
):
    if not values:
        print(
            f"{label}: no successful samples"
        )
        return

    print(
        f"{label:<35}"
        f"Avg: {mean(values):8.2f} ms | "
        f"Median: {median(values):8.2f} ms | "
        f"Min: {min(values):8.2f} ms | "
        f"Max: {max(values):8.2f} ms"
    )


def find_test_image():
    allowed_extensions = {
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
    }

    locations = [
        Path("temp_uploads"),
        Path("../datasets"),
        Path("../Project-screenshots"),
    ]

    for location in locations:

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
print("=" * 92)
print("AI TEXTILE WASTE INTELLIGENCE PLATFORM")
print("M4 PERFORMANCE VALIDATION")
print("=" * 92)


# ==========================================================
# LOGIN
# ==========================================================

print()
print("AUTHENTICATION")
print("-" * 92)

response, login_time = measure_request(
    "POST",
    f"{BASE_URL}/auth/login",
    data={
        "username":
            ADMIN_USERNAME,
        "password":
            ADMIN_PASSWORD,
    },
    timeout=REQUEST_TIMEOUT,
)

record(
    "Admin login",
    response.status_code == 200,
    (
        f"Status {response.status_code} | "
        f"{login_time:.2f} ms"
    ),
)

if response.status_code != 200:
    print(
        "\n[STOP] Login failed."
    )
    raise SystemExit(1)

token = response.json().get(
    "access_token"
)

record(
    "JWT token returned",
    bool(token),
)


# ==========================================================
# HEALTH ENDPOINT PERFORMANCE
# ==========================================================

print()
print("HEALTH ENDPOINT")
print("-" * 92)

health_times = []

for index in range(
    REPEAT_API_TESTS
):
    response, elapsed = measure_request(
        "GET",
        f"{BASE_URL}/health",
        timeout=REQUEST_TIMEOUT,
    )

    if response.status_code == 200:
        health_times.append(
            elapsed
        )

show_stats(
    "GET /health",
    health_times
)

record(
    "Health repeated requests",
    len(health_times)
    ==
    REPEAT_API_TESTS,
    (
        f"{len(health_times)}/"
        f"{REPEAT_API_TESTS} successful"
    ),
)


# ==========================================================
# INVENTORY ENDPOINT PERFORMANCE
# ==========================================================

print()
print("INVENTORY ENDPOINT")
print("-" * 92)

inventory_times = []

for index in range(
    REPEAT_API_TESTS
):
    response, elapsed = measure_request(
        "GET",
        f"{BASE_URL}/inventory/",
        headers=auth_headers(),
        timeout=REQUEST_TIMEOUT,
    )

    if response.status_code == 200:
        inventory_times.append(
            elapsed
        )

show_stats(
    "GET /inventory/",
    inventory_times
)

record(
    "Inventory repeated requests",
    len(inventory_times)
    ==
    REPEAT_API_TESTS,
    (
        f"{len(inventory_times)}/"
        f"{REPEAT_API_TESTS} successful"
    ),
)


# ==========================================================
# NOTIFICATIONS ENDPOINT PERFORMANCE
# ==========================================================

print()
print("NOTIFICATION ENDPOINT")
print("-" * 92)

notification_times = []

for index in range(
    REPEAT_API_TESTS
):
    response, elapsed = measure_request(
        "GET",
        f"{BASE_URL}/notifications/",
        headers=auth_headers(),
        timeout=REQUEST_TIMEOUT,
    )

    if response.status_code == 200:
        notification_times.append(
            elapsed
        )

show_stats(
    "GET /notifications/",
    notification_times
)

record(
    "Notification repeated requests",
    len(notification_times)
    ==
    REPEAT_API_TESTS,
    (
        f"{len(notification_times)}/"
        f"{REPEAT_API_TESTS} successful"
    ),
)


# ==========================================================
# ANALYTICS ENDPOINT PERFORMANCE
# ==========================================================

print()
print("ANALYTICS ENDPOINT")
print("-" * 92)

analytics_times = []

for index in range(
    REPEAT_API_TESTS
):
    response, elapsed = measure_request(
        "GET",
        f"{BASE_URL}/analytics/",
        headers=auth_headers(),
        timeout=REQUEST_TIMEOUT,
    )

    if response.status_code == 200:
        analytics_times.append(
            elapsed
        )

show_stats(
    "GET /analytics/",
    analytics_times
)

record(
    "Analytics repeated requests",
    len(analytics_times)
    ==
    REPEAT_API_TESTS,
    (
        f"{len(analytics_times)}/"
        f"{REPEAT_API_TESTS} successful"
    ),
)


# ==========================================================
# PREDICTION PERFORMANCE
# ==========================================================

print()
print("AI PREDICTION PERFORMANCE")
print("-" * 92)

test_image = find_test_image()

prediction_times = []

prediction_ids = []

if test_image is None:

    print(
        "[INFO] No textile image found. "
        "Prediction timing skipped."
    )

else:

    print(
        "[OK] Using:",
        test_image
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
            test_image
            .suffix
            .lower(),
            "image/jpeg",
        )
    )

    for index in range(
        REPEAT_PREDICTION_TESTS
    ):

        with open(
            test_image,
            "rb",
        ) as image_file:

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

            response, elapsed = (
                measure_request(
                    "POST",
                    f"{BASE_URL}/prediction/",
                    headers=auth_headers(),
                    files=files,
                    data=data,
                    timeout=PREDICTION_TIMEOUT,
                )
            )

        if response.status_code == 200:

            prediction_times.append(
                elapsed
            )

            try:
                upload_id = (
                    response
                    .json()
                    .get(
                        "upload_id"
                    )
                )

                if upload_id:
                    prediction_ids.append(
                        upload_id
                    )

            except ValueError:
                pass

            print(
                f"Prediction {index + 1}: "
                f"{elapsed:.2f} ms"
            )

        else:

            print(
                f"Prediction {index + 1}: "
                f"FAILED "
                f"({response.status_code})"
            )


    show_stats(
        "POST /prediction/",
        prediction_times
    )

    record(
        "Prediction repeated requests",
        len(prediction_times)
        ==
        REPEAT_PREDICTION_TESTS,
        (
            f"{len(prediction_times)}/"
            f"{REPEAT_PREDICTION_TESTS} successful"
        ),
    )


# ==========================================================
# API STABILITY CHECK
# ==========================================================

print()
print("STABILITY")
print("-" * 92)

all_regular_samples = (
    health_times
    +
    inventory_times
    +
    notification_times
    +
    analytics_times
)

expected_regular_samples = (
    REPEAT_API_TESTS
    *
    4
)

record(
    "Repeated API stability",
    len(all_regular_samples)
    ==
    expected_regular_samples,
    (
        f"{len(all_regular_samples)}/"
        f"{expected_regular_samples} "
        f"successful requests"
    ),
)


# ==========================================================
# SIMPLE PERFORMANCE CLASSIFICATION
# ==========================================================

print()
print("PERFORMANCE INTERPRETATION")
print("-" * 92)

if all_regular_samples:

    regular_average = mean(
        all_regular_samples
    )

    print(
        "Average regular API response time:",
        f"{regular_average:.2f} ms"
    )

    if regular_average < 200:

        print(
            "Regular API performance:"
            " FAST for local development"
        )

    elif regular_average < 500:

        print(
            "Regular API performance:"
            " ACCEPTABLE for local development"
        )

    else:

        print(
            "Regular API performance:"
            " REVIEW RECOMMENDED"
        )


if prediction_times:

    prediction_average = mean(
        prediction_times
    )

    print(
        "Average end-to-end AI prediction time:",
        f"{prediction_average:.2f} ms"
    )

    print(
        "Note: prediction timing includes "
        "HTTP upload, image validation, CNN "
        "inference, condition analysis, decision "
        "logic, sustainability logic and DB storage."
    )


# ==========================================================
# TEST RECORD INFORMATION
# ==========================================================

if prediction_ids:

    print()
    print("PERFORMANCE TEST ANALYSIS RECORDS")
    print("-" * 92)

    print(
        "Created upload IDs:",
        ", ".join(
            str(value)
            for value
            in prediction_ids
        )
    )

    print(
        "These are real provisional analysis "
        "records created for performance testing."
    )


# ==========================================================
# FINAL SUMMARY
# ==========================================================

total = passed + failed

print()
print("=" * 92)
print("M4 PERFORMANCE TEST SUMMARY")
print("=" * 92)

print(
    f"Passed : {passed}"
)

print(
    f"Failed : {failed}"
)

print(
    f"Total  : {total}"
)

if failed == 0:

    print(
        "\nRESULT : PERFORMANCE "
        "VALIDATION PASSED"
    )

else:

    print(
        "\nRESULT : PERFORMANCE "
        "VALIDATION REQUIRES REVIEW"
    )

print("=" * 92)