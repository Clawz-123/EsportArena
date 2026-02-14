from django.urls import path

from . import views

urlpatterns = [
	path('create/', views.CreateResultView.as_view(), name='result-create'),
	path('match/<int:match_id>/', views.ListResultsByMatchView.as_view(), name='result-list-by-match'),
	path('organizer/', views.ListResultsByOrganizerView.as_view(), name='result-list-by-organizer'),
	path('update/<int:result_id>/', views.UpdateResultStatusView.as_view(), name='result-update'),
]
