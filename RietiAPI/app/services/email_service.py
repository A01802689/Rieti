import html as html_lib
import smtplib
import ssl
from email.message import EmailMessage
from pathlib import Path
from string import Template

from app.core.config import settings

# Carpeta con las plantillas de los correos: app/templates/email/
TEMPLATES_DIR = Path(__file__).resolve().parent.parent / "templates" / "email"


class EmailNotSent(Exception):
    """No se pudo entregar el correo al servidor SMTP"""


def send_mail(*, destiny: str, theme: str, content: str, html: str | None = None) -> None:
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


def _render(template: str, **values: str) -> tuple[str, str]:
    values = {"app_name": settings.SMTP_FROM_NAME, **values}
    text = Template((TEMPLATES_DIR / f"{template}.txt").read_text(encoding="utf-8")).substitute(values)
    escaped = {key: html_lib.escape(value, quote=True) for key, value in values.items()}
    html = Template((TEMPLATES_DIR / f"{template}.html").read_text(encoding="utf-8")).substitute(escaped)
    return text, html


def send_recovery_code(*, destiny: str, code: str, minutes: int) -> None:
    text, html = _render("recovery_code", code=code, minutes=str(minutes))
    send_mail(destiny=destiny, theme="Tu código de recuperación", content=text, html=html)


def send_recovery_link(*, destiny: str, link: str, minutes: int) -> None:
    text, html = _render("recovery_link", link=link, minutes=str(minutes))
    send_mail(destiny=destiny, theme="Recupera tu contraseña", content=text, html=html)
