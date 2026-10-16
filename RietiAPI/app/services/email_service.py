import smtplib
import ssl
from email.message import EmailMessage
from app.core.config import settings


class EmailNotSent(Exception):
    """No se pudo entregar el correo al servidor SMTP"""


def send_mail(*, destiny: str, theme: str, content: str, html: str | None = None) -> None:
    """Envía un correo por SMTP."""
    if not settings.SMTP_HOST or not settings.SMTP_FROM:
        raise EmailNotSent("Falta configurar SMTP_HOST o SMTP_FROM")

    try:
        message = EmailMessage()
        message["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM}>"
        message["To"] = destiny
        message["Subject"] = theme
        message.set_content(content)
        if html:
            message.add_alternative(html, subtype="html")

        context = ssl.create_default_context()
        if settings.SMTP_PORT == 465:
            server = smtplib.SMTP_SSL(
                settings.SMTP_HOST, settings.SMTP_PORT, timeout=settings.SMTP_TIMEOUT, context=context
            )
        else:
            server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=settings.SMTP_TIMEOUT)

        with server:
            if settings.SMTP_USER:
                if settings.SMTP_PORT != 465:
                    server.starttls(context=context)
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(message)
    except (smtplib.SMTPException, OSError, ValueError) as error:
        raise EmailNotSent("No se pudo enviar el correo") from error
