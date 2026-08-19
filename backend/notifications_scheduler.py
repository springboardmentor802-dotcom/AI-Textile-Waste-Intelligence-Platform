from typing import Optional
from apscheduler.schedulers.background import BackgroundScheduler
import asyncio
from datetime import datetime, timezone
from database import inventory_collection, waste_batches_collection
from notifications_service import dispatch_notification

async def trigger_inventory_warning_event(item_name: str, weight_kg: float, user_email: Optional[str] = None):
    try:
        if weight_kg > 500.0:
            title = "High Volume Inventory Warning (>500kg)"
            msg = f"Large inventory batch '{item_name}' registered ({weight_kg} kg). Immediate handling or storage required."
        elif weight_kg < 5.0:
            title = "Low Weight Inventory Warning (<5kg)"
            msg = f"Small inventory batch '{item_name}' registered ({weight_kg} kg). Below standard batch threshold."
        else:
            title = f"Inventory Status Alert: {item_name}"
            msg = f"Inventory batch '{item_name}' ({weight_kg} kg) updated."

        for role in ["Recycling Facilitator", "Sustainability Manager", "Manufacturer", "Admin"]:
            await dispatch_notification(
                title=title,
                message=msg,
                notification_type="inventory_warning",
                severity="warning",
                target_role=role,
                target_user_email=user_email,
                link=f"/dashboard/{role.lower().replace(' ', '-')}"
            )
    except Exception as exc:
        print(f"[notifications_scheduler] warning: failed to dispatch inventory warning: {exc}")

async def trigger_recycling_opportunity_event(
    material: str,
    quantity_kg: float,
    circularity_score: int,
    batch_id: Optional[str] = None
):
    """
    Dispatches a Recycling Opportunity Notification specifically targeting the Recycling Facilitator Dashboard.
    """
    try:
        title = f"Recycling Opportunity: Pure {material} ({quantity_kg}kg)"
        msg = (
            f"High-purity batch identified: {quantity_kg}kg of {material} "
            f"with a circularity index score of {circularity_score}/100. Ready for mechanical or chemical recycling allocation."
        )
        if batch_id:
            msg += f" (Batch ID: {batch_id})"
            
        await dispatch_notification(
            title=title,
            message=msg,
            notification_type="recycling_opportunity",
            severity="success",
            target_role="Recycling Facilitator",
            link="/dashboard/recycling-facilitator"
        )
    except Exception as exc:
        print(f"[notifications_scheduler] warning: failed to trigger recycling opportunity notification: {exc}")

async def trigger_sustainability_milestone_event(
    milestone_title: str,
    milestone_message: str,
    severity: str = "success"
):
    """
    Dispatches a Sustainability Milestone Alert specifically targeting the Sustainability Manager Dashboard.
    """
    try:
        await dispatch_notification(
            title=f"Sustainability Milestone: {milestone_title}",
            message=milestone_message,
            notification_type="sustainability_milestone",
            severity=severity,
            target_role="Sustainability Manager",
            link="/dashboard/sustainability-manager"
        )
    except Exception as exc:
        print(f"[notifications_scheduler] warning: failed to trigger sustainability milestone notification: {exc}")

async def trigger_platform_announcement_event(
    title: str,
    message: str,
    severity: str = "info",
    link: Optional[str] = None
):
    """
    Dispatches a Platform Announcement across all user dashboards.
    """
    try:
        await dispatch_notification(
            title=title,
            message=message,
            notification_type="platform_announcement",
            severity=severity,
            target_role=None,
            link=link or "/dashboard/admin"
        )
    except Exception as exc:
        print(f"[notifications_scheduler] warning: failed to trigger platform announcement: {exc}")

async def trigger_analysis_completion_event(
    label: str,
    weight_kg: float,
    scan_count: int,
    user_email: str,
    is_batch: bool = True,
    batch_id: Optional[str] = None,
    report_bytes: Optional[bytes] = None,
    report_filename: Optional[str] = None,
):
    scan_str = f"{scan_count} scan" if scan_count == 1 else f"{scan_count} scans"
    
    if weight_kg > 500.0:
        title = f"High Weight Analysis Alert ({scan_str})"
        msg = f"{'Batch' if is_batch else 'Scan'} analysis for '{label}' completed ({scan_str}, {weight_kg} kg). Total batch weight exceeds 500kg threshold."
        severity = "warning"
    elif weight_kg < 5.0:
        title = f"Low Weight Analysis Alert ({scan_str})"
        msg = f"{'Batch' if is_batch else 'Scan'} analysis for '{label}' completed ({scan_str}, {weight_kg} kg). Total batch weight is under 5kg threshold."
        severity = "warning"
    else:
        title = f"Analysis Completed ({scan_str})"
        msg = f"{'Batch' if is_batch else 'Scan'} analysis for '{label}' completed successfully ({scan_str}, {weight_kg} kg)."
        severity = "success"

    if report_bytes is not None:
        msg += "\n\nYour full scan report is attached to this email as a PDF."

    await dispatch_notification(
        title=title,
        message=msg,
        notification_type="analysis_completion",
        severity=severity,
        target_user_email=user_email,
        link="/dashboard/sustainability-manager" if is_batch else "/dashboard/recycling-facilitator",
        attachment_bytes=report_bytes,
        attachment_filename=report_filename,
    )

async def trigger_waste_collection_event(fabric_type: str, quantity_kg: float, source: str):
    try:
        for role in ["Recycling Facilitator", "Manufacturer", "Admin"]:
            await dispatch_notification(
                title="Waste Collection Alert",
                message=f"Collection intake from {source} recorded: {quantity_kg}kg of {fabric_type}.",
                notification_type="waste_collection",
                severity="info",
                target_role=role,
                link=f"/dashboard/{role.lower().replace(' ', '-')}"
            )
    except Exception as exc:
        print(f"[notifications_scheduler] warning: failed to dispatch waste collection event: {exc}")

async def trigger_user_registered_event(name: str, email: str, role: str):
    try:
        await dispatch_notification(
            title=f"New User Registered: {name}",
            message=f"A new user '{name}' ({email}) has registered on the platform with role '{role}'.",
            notification_type="user_registered",
            severity="info",
            target_role="Admin",
            link="/dashboard/admin"
        )
    except Exception as exc:
        print(f"[notifications_scheduler] warning: failed to notify admin of user registration: {exc}")

async def trigger_inventory_created_event(
    item_name: str,
    weight_kg: float,
    material_type: Optional[str] = None,
    user_email: Optional[str] = None,
    source: Optional[str] = None
):
    try:
        details = f"{weight_kg} kg"
        if material_type:
            details += f", Material: {material_type}"
        if source:
            details += f", Source: {source}"
        by_str = f" by {user_email}" if user_email else ""
        
        await dispatch_notification(
            title=f"New Inventory Created: {item_name}",
            message=f"New inventory item created: '{item_name}' ({details}){by_str}.",
            notification_type="inventory_created",
            severity="info",
            target_role="Admin",
            link="/dashboard/admin"
        )
    except Exception as exc:
        print(f"[notifications_scheduler] warning: failed to notify admin of inventory creation: {exc}")

async def trigger_report_generated_event(
    report_title: str,
    report_type: str,
    user_email: str,
    filename: Optional[str] = None
):
    try:
        file_str = f" ('{filename}')" if filename else ""
        await dispatch_notification(
            title=f"New Report Generated: {report_title}",
            message=f"A new {report_type} report{file_str} was generated by {user_email}.",
            notification_type="report_generated",
            severity="info",
            target_role="Admin",
            link="/dashboard/admin"
        )
    except Exception as exc:
        print(f"[notifications_scheduler] warning: failed to notify admin of report generation: {exc}")

def run_weekly_sustainability_summary():
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    async def _async_summary():
        total_batches = await waste_batches_collection.count_documents({})
        await dispatch_notification(
            title="Weekly Sustainability & Recycling Summary",
            message=f"Platform activity update: {total_batches} total active waste streams tracked to date. Review your circular economy metrics.",
            notification_type="sustainability_milestone",
            severity="success",
            link="/dashboard/sustainability-manager"
        )
    
    loop.run_until_complete(_async_summary())
    loop.close()

scheduler = BackgroundScheduler()
scheduler.add_job(run_weekly_sustainability_summary, "cron", day_of_week="mon", hour=8, minute=0)
scheduler.start()