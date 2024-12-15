from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

router = DefaultRouter()
router.register(r'projects', views.ProjectViewSet)
router.register(r'tasks', views.TaskViewSet, basename='task')
router.register(r'comments', views.CommentViewSet)
router.register(r'notifications', views.NotificationViewSet, basename='notification')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', views.register_user, name='register'),
    path('login/', views.login_user, name='login'),
    path('logout/', views.logout_user, name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('users/status/', views.get_users_by_status, name='users-status'),
    path('users/<int:user_id>/approval/', views.update_member_approval, name='update-member-approval'),
    path('users/<int:user_id>/delete/', views.delete_team_member, name='delete-team-member'),
    path('team-members/', views.get_team_members, name='team-members'),
    path('users/<int:user_id>/update-email/', views.update_user_email, name='update_user_email'),
    path('users/<int:user_id>/change-password/', views.change_user_password, name='change_user_password'),
    path('tasks/<int:pk>/update-status/', views.TaskViewSet.as_view({'patch': 'update_status'}), name='update_task_status'),
    path('tasks/my-tasks/<int:user_id>/', views.TaskViewSet.as_view({'get': 'my_tasks'}), name='my-tasks'),
    path('tasks/<int:pk>/update_status/', views.TaskViewSet.as_view({'patch': 'update_status'}), name='update-task-status'),
    path('notifications/<int:pk>/mark_read/', views.NotificationViewSet.as_view({'patch': 'mark_read'}), name='mark-notification-read'),
    path('dashboard/stats/', views.dashboard_stats, name='dashboard-stats'),
] 