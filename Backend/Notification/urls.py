from django.urls import path

from .views import (
    DeleteNotificationView,
    MarkAllNotificationsReadView,
    MarkNotificationReadView,
    NotificationListView,
    SendTestNotificationView,
)

urlpatterns = [
    path("list/", NotificationListView.as_view(), name="notification-list"),
    path("read/<int:notification_id>/", MarkNotificationReadView.as_view(), name="notification-read"),
    path("read-all/", MarkAllNotificationsReadView.as_view(), name="notification-read-all"),
    path("delete/<int:notification_id>/", DeleteNotificationView.as_view(), name="notification-delete"),
    path("test-send/", SendTestNotificationView.as_view(), name="notification-test-send"),
]
