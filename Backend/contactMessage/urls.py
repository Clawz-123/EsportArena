from django.urls import path
from . import views

# All the urls for contact messages
urlpatterns = [
    path('create/', views.CreateContactMessageView.as_view(), name='contact-create'),
    path('list/', views.ListContactMessagesView.as_view(), name='contact-list'),
    path('delete/<int:pk>/', views.DeleteContactMessageView.as_view(), name='contact-delete'),
]
