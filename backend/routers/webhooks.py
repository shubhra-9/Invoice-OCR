import os
from fastapi import APIRouter, Request, HTTPException, Depends
from svix.webhooks import Webhook
from sqlalchemy.orm import Session
from db.database import get_db
import db.models as models

router = APIRouter()

@router.post("/clerk")
async def clerk_webhook(request: Request, db: Session = Depends(get_db)):
    secret = os.getenv("CLERK_WEBHOOK_SECRET")
    if not secret:
        raise HTTPException(status_code=500, detail="CLERK_WEBHOOK_SECRET is not configured")

    payload = await request.body()
    headers = dict(request.headers)

    # Need svix-Signature, svix-Id, svix-Timestamp
    if not ("svix-id" in headers and "svix-timestamp" in headers and "svix-signature" in headers):
        raise HTTPException(status_code=400, detail="Missing Svix headers")

    wh = Webhook(secret)
    try:
        event = wh.verify(payload, headers)
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid webhook signature")

    event_type = event.get("type")
    data = event.get("data", {})

    if event_type in ["user.created", "user.updated"]:
        clerk_id = data.get("id")
        
        # Determine email
        email = ""
        email_addresses = data.get("email_addresses", [])
        if email_addresses:
            primary_email_id = data.get("primary_email_address_id")
            primary = next((e for e in email_addresses if e.get("id") == primary_email_id), None)
            if primary:
                email = primary.get("email_address")
            else:
                email = email_addresses[0].get("email_address")
                
        if clerk_id and email:
            user = db.query(models.User).filter(models.User.clerk_id == clerk_id).first()
            if not user:
                user = models.User(clerk_id=clerk_id, email=email)
                db.add(user)
            else:
                user.email = email
            db.commit()

    elif event_type == "user.deleted":
        clerk_id = data.get("id")
        if clerk_id:
            db.query(models.User).filter(models.User.clerk_id == clerk_id).delete()
            db.commit()

    return {"success": True}
