import resend
from uuid import UUID
from resend.exceptions import ResendError
from zoneinfo import ZoneInfo
from dotenv import load_dotenv
import os

from app.db import Event, User



resend_key = os.getenv("RESEND_API_KEY")
base_url = os.getenv("FRONTEND_URL")

if not resend_key:
    raise EnvironmentError("The RESEND_API_KEY environment variable is not given.")

if not base_url:
    raise EnvironmentError("The FRONTEND_URL environment variable is not given.")

resend.api_key = resend_key


async def send_download_reminder(event: Event, user: User):
    """
    Sends email reminder for an event that has pending media uploads expiring soon.

    Args:
        event (Event): The Event object containing event details.
        user (User): The User object containing user details.

    Returns:
        None
    """
 
    email_url = f"{base_url}/dashboard/event/{event.search_id}"

    media_count = len(
        [media for media in event.media if media.status == "complete"]
    )

    event_timezone = ZoneInfo(event.timezone)
    expires_at = event.delete_date.astimezone(event_timezone).strftime("%B %d, %Y at %I:%M %p")

    html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Download Your Event Photos</title>
        </head>

        <body style="
            margin: 0;
            padding: 0;
            background-color: #f5f0e8;
            font-family: Arial, Helvetica, sans-serif;
            color: #54483f;
        ">
            <div style="
                width: 100%;
                padding: 40px 0;
                background-color: #f5f0e8;
            ">
                <div style="
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    border: 1px solid #c9c1b8;
                    border-radius: 12px;
                    overflow: hidden;
                ">

                    <!-- Header -->
                    <div style="
                        padding: 28px 32px;
                        background-color: #5f6f62;
                        text-align: center;
                    ">
                        <h1 style="
                            margin: 0;
                            color: #ffffff;
                            font-size: 26px;
                            font-weight: 600;
                        ">
                            MementoCloud
                        </h1>
                    </div>

                    <!-- Content -->
                    <div style="padding: 32px;">

                        <h2 style="
                            margin: 0 0 16px 0;
                            color: #54483f;
                            font-size: 24px;
                            font-weight: 600;
                        ">
                            Don't forget your memories!
                        </h2>

                        <p style="
                            margin: 0 0 24px 0;
                            color: #54483f;
                            font-size: 16px;
                            line-height: 1.6;
                        ">
                            Hello,
                        </p>

                        <p style="
                            margin: 0 0 24px 0;
                            color: #54483f;
                            font-size: 16px;
                            line-height: 1.6;
                        ">
                            This is a friendly reminder that your event
                            <strong>{event.event_name}</strong> is coming up
                            for deletion. Please download your memories before
                            they expire.
                        </p>

                        <!-- Event Details -->
                        <div style="
                            margin: 24px 0;
                            padding: 20px;
                            background-color: #f5f0e8;
                            border: 1px solid #c9c1b8;
                            border-radius: 8px;
                        ">
                            <p style="
                                margin: 0 0 10px 0;
                                color: #54483f;
                                font-size: 15px;
                            ">
                                <strong>Event:</strong> {event.event_name}
                            </p>

                            <p style="
                                margin: 0 0 10px 0;
                                color: #54483f;
                                font-size: 15px;
                            ">
                                <strong>Date:</strong>
                                {event.event_date.strftime("%B %d, %Y")}
                            </p>

                            <p style="
                                margin: 0;
                                color: #54483f;
                                font-size: 15px;
                            ">
                                <strong>Photos & videos:</strong> {media_count}
                            </p>
                        </div>

                        <p style="
                            margin: 0 0 24px 0;
                            color: #54483f;
                            font-size: 16px;
                            line-height: 1.6;
                        ">
                            Your files will be permanently deleted on
                            <strong>{expires_at}</strong>.
                        </p>

                        <!-- CTA -->
                        <div style="
                            margin: 32px 0;
                            text-align: center;
                        ">
                            <a href="{email_url}" style="
                                display: inline-block;
                                padding: 14px 28px;
                                background-color: #5f6f62;
                                color: #ffffff;
                                text-decoration: none;
                                border-radius: 6px;
                                font-size: 16px;
                                font-weight: 600;
                            ">
                                Download Your Memories
                            </a>
                        </div>

                        <p style="
                            margin: 0;
                            color: #9b9a86;
                            font-size: 14px;
                            line-height: 1.6;
                        ">
                            Please make sure to save your photos and videos
                            somewhere safe before the expiration date.
                        </p>

                    </div>

                    <!-- Footer -->
                    <div style="
                        padding: 24px 32px;
                        border-top: 1px solid #c9c1b8;
                        background-color: #ffffff;
                        text-align: center;
                    ">
                        <p style="
                            margin: 0;
                            color: #9b9a86;
                            font-size: 13px;
                        ">
                            Thank you for using MementoCloud.
                        </p>

                        <p style="
                            margin: 8px 0 0 0;
                            color: #9b9a86;
                            font-size: 13px;
                        ">
                            MementoCloud Team
                        </p>
                    </div>

                </div>
            </div>
        </body>
        </html>
    """

    text_body = f"""
        Hello!

        This is a friendly reminder that your event "{event.event_name}" is
        coming up for deletion.

        Event: {event.event_name}
        Date: {event.event_date.strftime("%B %d, %Y")}
        Photos & videos: {media_count}

        Your files will be permanently deleted on {expires_at}.

        Download your memories here:
        {email_url}

        Please make sure to save your photos and videos somewhere safe before
        the expiration date.

        Thank you for using MementoCloud!

        MementoCloud Team
    """

    params: resend.Emails.SendParams = {
        "from": "MementoCloud <onboarding@resend.dev>",
        "to": user.email,
        "subject": f"Reminder: Download your images for '{event.event_name}'",
        "html": html_body,
        "text": text_body
    }

    try:
        email = resend.Emails.send(params)
        print(f"Email sent for event {event.id}")

    except ResendError as e:
        print(f"Failed to send email reminder for event {event.id}: {e}")

