"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include, path
from django_api import views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from django.conf.urls.static import static
from django.conf import settings
from django.http import HttpResponse

urlpatterns = [
    path('o/', include('oauth2_provider.urls', namespace='oauth2_provider')),
    path('api/register', views.register, name='register'),
    path('api/is_username_available/<str:username>/', views.is_username_available, name='is_username_available'),
    path('api/login', views.loginUser, name='loginUser'),
    path('api/loginGame', views.loginGame, name='loginGame'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/verify_token', views.verify_token, name='verify_token'),
    path('api/getCurrentUser', views.getCurrentUser, name='getCurrentUser'),
    path('api/getUserByUsername/<str:username>/', views.getUserByUsername, name='getUserByUsername'),
    path('api/getOtherUser/<str:username>/', views.getOtherUser, name='getOtherUser'),
    path('api/updateUser/', views.updateUser, name='updateUser'),
    path('api/friends/', views.friends_list, name='friends_list'),
    path('api/send_friend_request/<uuid:friend_id>/', views.send_friend_request, name='send_friend_request'),
    path('api/accept_friend_request/<uuid:request_id>/', views.accept_friend_request, name='accept_friend_request'),
    path('api/refuse_friend_request/<uuid:request_id>/', views.refuse_friend_request, name='refuse_friend_request'),
    path('api/remove_friend/<str:username>/', views.remove_friend, name='remove_friend'),
    path('api/requests_list/', views.requests_list, name='requests_list'),
    path('api/getProfileImg/', views.getProfileImg, name='getProfileImg'),
    path('api/update_pdp/', views.update_pdp, name='update_pdp'),
    path('api/deleteProfileImg/', views.deleteProfileImg, name='deleteProfileImg'),
    path('api/send_text_to_blockchain/', views.send_text_to_blockchain, name='send_text_to_blockchain'),
    path('api/getFriendImg/<str:username>', views.getFriendImg, name='getFriendImg'),
    path('api/getHistory/<str:username>', views.getHistory, name='getHistory'),
    path('api/authorize', views.authorize, name='authorize'),
    path('api/callback', views.callback, name='callback'),
    path('api/user_status/<str:username>/', views.user_status, name='user_status'),
    path('api/update_status/<str:status>/', views.update_status, name='update_status'),
    path('api/set_offline/<str:username>/', views.set_offline, name='set_offline'),
    path('api/user_42/', views.user_42, name='user_42'),
    path('api/check_password/', views.check_password, name='check_password'),
    path('api/change_password/', views.change_password, name='change_password'),
    path('api/update_game_won/<uuid:pk>', views.update_game_won, name='update_game_won'),
    path('api/update_game_lost/<uuid:pk>', views.update_game_lost, name='update_game_lost'),
    path('api/update_user_language/', views.update_user_language, name='update_user_language'),

  path('api/create_player_tournament', views.create_player_tournament),
  path('api/get_user_tournament/<uuid:pk>', views.get_user_tournament),

  path('api/save_game', views.save_game),
  path('api/create_game_tournament', views.create_game_tournament),
  path('api/get_game_tournament/<uuid:pk>', views.get_game_tournament),
  path('api/get_current_game_tournament/<uuid:pkTournament>', views.get_current_game_tournament),
  path('api/update_game_tournament/<uuid:pk>', views.update_game_tournament),

  path('api/create_tournament', views.create_tournament),
  path('api/get_tournament/<uuid:creator_id>', views.get_tournament),
  path('api/check_tournament/<uuid:creator_id>', views.check_tournament),
  path('api/update_ongoing_game_tournament/<uuid:pk>', views.update_ongoing_game_tournament),
  path('api/update_tournament/<uuid:pk>', views.update_tournament),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
