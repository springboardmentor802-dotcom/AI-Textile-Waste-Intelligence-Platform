from datetime import datetime
from typing import Optional, List, Literal
from pydantic import BaseModel, Field

NotificationType = Literal[
    "inventory_warning",
    "waste_collection",
    "recycling_opportunity",
    "sustainability_milestone",
    "platform_announcement",
    "admin_broadcast",
    "user_registered",
    "report_generated",
    "inventory_created",
    "analysis_completion"
]

NotificationSeverity = Literal["info", "warning", "critical", "success"]

class NotificationCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=150)
    message: str = Field(..., min_length=1, max_length=1000)
    type: NotificationType
    severity: NotificationSeverity = "info"
    target_role: Optional[str] = None  
    target_user_email: Optional[str] = None  
    link: Optional[str] = None

class NotificationInDB(NotificationCreate):
    id: str
    read: bool = False
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    read_at: Optional[str] = None

class BroadcastRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=150)
    message: str = Field(..., min_length=1, max_length=1000)
    severity: NotificationSeverity = "info"
    target_role: Optional[str] = None
    link: Optional[str] = None

class NotificationPreferences(BaseModel):
    email_notifications: bool