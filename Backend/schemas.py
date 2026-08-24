from pydantic import BaseModel, EmailStr
from typing import Literal, Optional
from datetime import date, datetime

# USER / AUTHENTICATION

# All four roles that exist in the `users.role` column.
# Used for reading/returning user data (e.g. GET /admin/users).
UserRole = Literal[
    "recycling_facility_operator",
    "sustainability_manager",
    "textile_manufacturer",
    "administrator",
]

# Roles a person is allowed to request for THEMSELVES via public
# /register. "administrator" is deliberately excluded here so that
# even if a caller sends role="administrator" in the request body,
# FastAPI/Pydantic rejects it with a 422 before it ever reaches the
# route handler. This is a second, independent layer of defense on
# top of routes/auth.py ignoring request.role entirely.
SelfRegisterableRole = Literal[
    "recycling_facility_operator",
    "sustainability_manager",
    "textile_manufacturer",
]


class RegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str

    # Public registration defaults to Recycling Facility Operator.
    # The register() route also ignores this value and always creates
    # a recycling_facility_operator — see routes/auth.py for why.
    role: SelfRegisterableRole = "recycling_facility_operator"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True


# PROFILE UPDATE (PUT /auth/me)
#
# Deliberately has NO `role` field. This is not just a UI convention --
# Pydantic will reject any `role` key sent in the request body with a
# 422 (extra fields forbidden) before the route handler ever runs,
# because model_config below sets extra="forbid". That is the second,
# independent layer (on top of the route never reading a role from
# this schema) that makes self-elevation through this endpoint
# structurally impossible, matching the same defense-in-depth pattern
# already used for SelfRegisterableRole above.
class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None

    model_config = {"extra": "forbid"}


# CHANGE PASSWORD (POST /auth/change-password)
#
# Requires the caller's current password so this can never be used
# to silently take over an account even if a token is compromised
# in-flight -- the route verifies current_password with the existing
# verify_password() helper before accepting new_password.
class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


# Used by GET /admin/users. Deliberately the same "safe" shape as
# UserResponse (no password_hash, no token) -- kept as a separate
# name so the admin listing endpoint's contract can evolve
# independently of the registration response in the future.
class AdminUserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True


# PLATFORM ANALYTICS (Administrator only)
#
# All fields below are calculated aggregates over real PostgreSQL rows
# (User, Inventory, Prediction) - see routes/admin.py. Nothing here is
# a placeholder or invented statistic.

class RoleCount(BaseModel):
    role: str
    count: int


class FabricCount(BaseModel):
    fabric_type: str
    count: int


class WasteCategoryCount(BaseModel):
    waste_category: str
    count: int


class RecyclabilityCount(BaseModel):
    recyclability: str
    count: int


class PredictionTrendPoint(BaseModel):
    day: str
    count: int


class PlatformAnalyticsResponse(BaseModel):
    # Users
    total_users: int
    users_by_role: list[RoleCount]

    # Inventory (platform-wide, not scoped to any one user)
    total_inventory_items: int
    total_textile_quantity: float
    fabric_distribution: list[FabricCount]

    # Predictions (platform-wide, unlike GET /dashboard/stats which is
    # scoped to current_user only)
    total_predictions: int
    waste_category_distribution: list[WasteCategoryCount]
    recyclability_distribution: list[RecyclabilityCount]
    # None when no prediction has a circularity_score yet -- never a
    # misleading 0.
    average_circularity_score: Optional[float]
    # None when there are no predictions yet, same "never a fake 0"
    # rule as average_circularity_score above. Added so the
    # Administrator report can show a real platform-wide confidence
    # KPI instead of an undefined value -- computed the same way
    # GET /dashboard/stats already does per-user in predict.py, just
    # without the user_id filter.
    average_confidence: Optional[float]
    prediction_trend: list[PredictionTrendPoint]

# INVENTORY

# What POST /inventory expects to receive
class InventoryCreate(BaseModel):
    batch_id: str
    fabric_type: str
    source: Optional[str] = None
    quantity: float
    color: Optional[str] = None
    condition: Optional[str] = None
    collection_date: Optional[date] = None


# What PUT /inventory/{id} expects
# All fields are optional because the user may update only one field.
class InventoryUpdate(BaseModel):
    fabric_type: Optional[str] = None
    source: Optional[str] = None
    quantity: Optional[float] = None
    color: Optional[str] = None
    condition: Optional[str] = None
    collection_date: Optional[date] = None


# What the API returns
class InventoryResponse(BaseModel):
    id: int
    user_id: int
    batch_id: str
    fabric_type: str
    source: Optional[str] = None
    quantity: float
    color: Optional[str] = None
    condition: Optional[str] = None
    collection_date: Optional[date] = None

    class Config:
        from_attributes = True


# NOTIFICATIONS

NotificationType = Literal[
    "waste_collection",
    "recycling_opportunity",
    "sustainability_milestone",
    "inventory_warning",
    "platform_announcement",
    "ai_prediction",
]

NotificationSeverity = Literal["info", "success", "warning", "critical"]


# What GET /notifications returns, one item per notification.
class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    notification_type: NotificationType
    severity: NotificationSeverity
    is_read: bool
    created_at: datetime
    related_entity_type: Optional[str] = None
    related_entity_id: Optional[int] = None

    class Config:
        from_attributes = True


# What GET /notifications/unread-count returns.
class UnreadCountResponse(BaseModel):
    unread_count: int


# What an Administrator sends to POST /notifications/announcement.
# Only title/message/severity are caller-controlled; notification_type
# is always forced to "platform_announcement" server-side (see
# routes/notifications.py) so this endpoint can never be used to spoof
# a different notification type.
class AnnouncementCreate(BaseModel):
    title: str
    message: str
    severity: NotificationSeverity = "info"