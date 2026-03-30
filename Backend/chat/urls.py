from django.urls import path
from .views import (
    AdminBlockUserFromReportView,
    AdminCancelReportView,
    AdminReportedMessagesView,
    ChatMessageCheckView,
    ChatMessageDetailView,
    ReportChatMessageView,
    TournamentAnnouncementView,
    TournamentChatMessageView,
)


urlpatterns = [
    path("tournaments/<int:tournament_id>/messages/", TournamentChatMessageView.as_view(), name="chat-messages"),
    path("tournaments/<int:tournament_id>/announcements/", TournamentAnnouncementView.as_view(), name="chat-announcements"),
    path("check/", ChatMessageCheckView.as_view(), name="chat-message-check"),
    path("messages/<int:message_id>/report/", ReportChatMessageView.as_view(), name="chat-message-report"),
    path("messages/<int:message_id>/", ChatMessageDetailView.as_view(), name="chat-message-detail"),
    path("admin/reports/", AdminReportedMessagesView.as_view(), name="admin-chat-reports"),
    path("admin/reports/<int:report_id>/cancel/", AdminCancelReportView.as_view(), name="admin-chat-report-cancel"),
    path("admin/reports/<int:report_id>/block/", AdminBlockUserFromReportView.as_view(), name="admin-chat-report-block"),
]
