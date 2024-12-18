from notifications.models import Notification
from users.utils import Util


def send_notification(content_type, object_id, subject, message, to):
    """
    This function will create a notificaion then send email to the user
    """
    Notification.objects.create(
        content_type=content_type,
        object_id=object_id,
        subject=subject,
        message=message,
        to=to,
    )

    data = {"subject": subject, "body": message, "to_email": to.email}
    Util.send_email(data)
