import resend
from resend.exceptions import ResendError
from zoneinfo import ZoneInfo
import os

from app.db import Event, User
from datetime import timezone




resend_key = os.getenv("RESEND_API_KEY")
base_url = os.getenv("FRONTEND_URL")
email_from = os.getenv("EMAIL_FROM")

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
    delete_date = event.delete_date
    if delete_date.tzinfo is None:
        delete_date = delete_date.replace(tzinfo=timezone.utc)
    expires_at = delete_date.astimezone(event_timezone).strftime("%B %d, %Y at %I:%M %p")
    
    html_body = f"""      
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Save Your Memories | MementoCloud</title>
        </head>
        <body style="margin:0; padding:0; background-color:#f5f0e8; color:#54483f; font-family:Arial, Helvetica, sans-serif;">

            <div style="display:none; max-height:0; overflow:hidden; opacity:0;">
                Save your memories before your MementoCloud album expires.
            </div>

            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f0e8;">
                <tr>
                    <td align="center" style="padding:40px 16px;">

                        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%; max-width:600px; background-color:#faf7f1; border:1px solid #c9c1b8; border-radius:12px; overflow:hidden;">

                            <tr>
                                <td align="center" style="padding:32px 24px 28px;">
                                    <h1 style="margin:0; color:#5f6f62; font-size:25px; font-weight:600; letter-spacing:-0.5px;">
                                        MementoCloud
                                    </h1>
                                    <p style="margin:8px 0 0; color:#9b9a86; font-size:12px; letter-spacing:1.2px;">
                                        REAL MOMENTS. LASTING MEMORIES.
                                    </p>
                                </td>
                            </tr>

                            <tr>
                                <td style="height:3px; background-color:#5f6f62; font-size:0; line-height:0;">&nbsp;</td>
                            </tr>

                            <tr>
                                <td style="padding:36px 32px;">

                                    <p style="margin:0 0 12px; color:#5f6f62; font-size:12px; font-weight:600; letter-spacing:1.5px;">
                                        A LITTLE REMINDER
                                    </p>

                                    <h2 style="margin:0 0 18px; color:#54483f; font-size:30px; line-height:1.3; font-weight:600; letter-spacing:-0.6px;">
                                        Your moments matter.
                                    </h2>

                                    <p style="margin:0 0 18px; font-size:16px; line-height:1.8;">
                                        Hello,
                                    </p>

                                    <p style="margin:0 0 24px; font-size:16px; line-height:1.8;">
                                        Every gathering holds memories worth keeping. Your album for
                                        <strong>{event.event_name}</strong> will soon be permanently deleted.
                                        Take a moment to save the media you want to keep.
                                    </p>

                                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f0e8; border:1px solid #c9c1b8; border-radius:8px;">
                                        <tr>
                                            <td style="padding:24px;">

                                                <p style="margin:0 0 18px; color:#9b9a86; font-size:12px; font-weight:600; letter-spacing:1.2px;">
                                                    YOUR ALBUM
                                                </p>

                                                <p style="margin:0 0 16px; color:#54483f; font-size:18px; line-height:1.5; font-weight:600;">
                                                    {event.event_name}
                                                </p>

                                                <p style="margin:0 0 12px; font-size:14px; line-height:1.7;">
                                                    <span style="color:#9b9a86;">Event date</span><br>
                                                    {event.event_date.strftime("%B %d, %Y")}
                                                </p>

                                                <p style="margin:0 0 12px; font-size:14px; line-height:1.7;">
                                                    <span style="color:#9b9a86;">Photos and videos</span><br>
                                                    {media_count}
                                                </p>

                                                <p style="margin:0; font-size:14px; line-height:1.7;">
                                                    <span style="color:#9b9a86;">Permanent deletion</span><br>
                                                    <strong>{expires_at}</strong>
                                                </p>

                                            </td>
                                        </tr>
                                    </table>

                                    <p style="margin:24px 0; font-size:15px; line-height:1.8;">
                                        MementoCloud albums are temporary by design. Download your memories before the deadline to keep them somewhere safe.
                                    </p>

                                    <table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0" style="margin:28px auto;">
                                        <tr>
                                            <td align="center" bgcolor="#5f6f62" style="border-radius:6px;">
                                                <a href="{email_url}" target="_blank" style="display:inline-block; padding:15px 30px; color:#ffffff; font-size:15px; font-weight:600; text-decoration:none; border-radius:6px;">
                                                    Save Your Memories
                                                </a>
                                            </td>
                                        </tr>
                                    </table>

                                    <p style="margin:0; color:#9b9a86; font-size:13px; line-height:1.8; text-align:center;">
                                        Your memories stay private. Only you can manage your event album.
                                    </p>

                                    <p style="margin:24px 0 0; color:#9b9a86; font-size:12px; line-height:1.7; overflow-wrap:anywhere;">
                                        Button not working? Copy this link into your browser:<br>
                                        <a href="{email_url}" style="color:#5f6f62; text-decoration:underline;">{email_url}</a>
                                    </p>

                                </td>
                            </tr>

                            <tr>
                                <td align="center" style="padding:24px; border-top:1px solid #c9c1b8; background-color:#f5f0e8;">
                                    <p style="margin:0 0 8px; color:#54483f; font-size:14px; line-height:1.6;">
                                        Shared with love, kept private.
                                    </p>
                                    <p style="margin:0; color:#9b9a86; font-size:12px;">
                                        MementoCloud
                                    </p>
                                </td>
                            </tr>

                        </table>

                    </td>
                </tr>
            </table>

        </body>
        </html>
    """

    text_body = f"""
        Hello!

        We wanted to let you know that the memories from "{event.event_name}" are scheduled for permanent deletion soon.

        Event: {event.event_name}
        Event date: {event.event_date.strftime("%B %d, %Y")}
        Photos and videos saved: {media_count}

        Deletion date: {expires_at}

        To keep your memories, visit your event album and download your media:
        {email_url}

        Once the deletion date passes, your media will no longer be available through MementoCloud. Please save anything you want to keep before then.

        Thank you for trusting MementoCloud with your memories!

        MementoCloud
        Your moments. Forever.
    """

    params: resend.Emails.SendParams = {
        "from": f"MementoCloud <{email_from}>",
        "to": user.email,
        "subject": f"Reminder: Download your images for '{event.event_name}'",
        "html": html_body,
        "text": text_body
    }

    try:
        resend.Emails.send(params)
        print(f"Email sent for event {event.id}")

    except ResendError as e:
        print(f"Failed to send email reminder for event {event.id}: {e}")

