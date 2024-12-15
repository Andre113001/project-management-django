from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from django.shortcuts import get_object_or_404
from django.db import models
from .models import User, Project, Task, Comment, Notification
from .serializers import ProjectSerializer, TaskSerializer, CommentSerializer, UserSerializer, UserUpdateSerializer, PasswordChangeSerializer, NotificationSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Q
from rest_framework.exceptions import PermissionDenied
from django.contrib.auth.hashers import check_password
from django.db.models import Count, F


@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    # Check for existing username and email
    username = request.data.get('username')
    email = request.data.get('email')
    
    if User.objects.filter(username=username).exists():
        return Response(
            {'error': 'Username already exists'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if User.objects.filter(email=email).exists():
        return Response(
            {'error': 'Email already exists'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = User.objects.create_user(
            username=serializer.validated_data['username'],
            email=serializer.validated_data['email'],
            password=request.data['password'],
            role=request.data.get('role', 'TEAM_MEMBER'),
            is_approved=False
        )
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    access_key = request.data.get('username')  # This could be email or username
    password = request.data.get('password')
    
    # Try to find user by username or email
    try:
        user = User.objects.get(Q(username=access_key) | Q(email=access_key))
    except User.DoesNotExist:
        return Response(
            {'error': 'Email/Username or Password is incorrect'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )

    if not user.is_approved:
        return Response(
            {'error': 'User account is not approved'}, 
            status=status.HTTP_403_FORBIDDEN
        )

    if not user.check_password(password):
        return Response(
            {'error': 'Email/Username or Password is incorrect'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )

    refresh = RefreshToken.for_user(user)
    serialized_user = UserSerializer(user).data
    
    return Response({
        'user': serialized_user,
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_user(request):
    try:
        refresh_token = request.data.get('refresh')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'detail': 'Successfully logged out.'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Refresh token is required.'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    @action(detail=True, methods=['patch'])
    def update_profile(self, request, pk=None):
        user = self.get_object()
        serializer = UserUpdateSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    
    @action(detail=True, methods=['post'])
    def change_password(self, request, pk=None):
        user = self.get_object()
        serializer = PasswordChangeSerializer(data=request.data)
        if serializer.is_valid():
            if user.check_password(serializer.data['old_password']):
                user.set_password(serializer.data['new_password'])
                user.save()
                return Response({'status': 'password changed'})
            return Response({'error': 'wrong password'}, status=400)
        return Response(serializer.errors, status=400)

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Project.objects.filter(
            models.Q(members=self.request.user) | 
            models.Q(owner=self.request.user)
        ).distinct()

    def perform_create(self, serializer):
        members_data = self.request.data.get('members', [])
        project = serializer.save(owner=self.request.user)
        
        # Add members to the project
        if members_data:
            members = User.objects.filter(id__in=members_data)
            project.members.set(members)
            
            # Create notifications for all members
            for member in members:
                if member != self.request.user:  # Don't notify the creator
                    Notification.objects.create(
                        user=member,
                        type='project',
                        title=f'New Project: {project.title}',
                        message=f'You have been added to project "{project.title}"'
                    )
    
    def destroy(self, request, *args, **kwargs):
        project = self.get_object()
        if project.owner != request.user:
            return Response(
                {'error': 'Only project owner can delete the project'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        project = self.get_object()
        if project.owner != request.user:
            return Response(
                {'error': 'Only project owner can update the project'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)

    @action(detail=True, methods=['post'])
    def add_member(self, request, pk=None):
        project = self.get_object()
        user_id = request.data.get('user_id')
        if not user_id:
            return Response({'error': 'user_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        user = get_object_or_404(User, pk=user_id)
        project.members.add(user)
        return Response({'status': 'member added'})

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        project = self.get_object()
        new_status = request.data.get('status')
        if new_status in dict(Project.STATUS_CHOICES):
            project.status = new_status
            project.save()
            return Response({'status': 'updated'})
        return Response({'error': 'invalid status'}, status=400)
    
    @action(detail=True, methods=['post'])
    def remove_member(self, request, pk=None):
        project = self.get_object()
        user_id = request.data.get('user_id')
        if user_id:
            project.members.remove(user_id)
            return Response({'status': 'member removed'})
        return Response({'error': 'user_id required'}, status=400)

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return Task.objects.all()
        return Task.objects.filter(assigned_to=user)

    @action(detail=True, methods=['PATCH'])
    def update_status(self, request, pk=None):
        task = self.get_object()
        user = request.user
        
        # Check if user is admin or the assigned team member
        if user.role != 'ADMIN' and task.assigned_to != user:
            raise PermissionDenied("You don't have permission to modify this task's status.")
            
        new_status = request.data.get('status')
        if new_status not in [status[0] for status in Task.STATUS_CHOICES]:
            return Response({'error': 'Invalid status'}, status=400)
            
        task.status = new_status
        task.save()
        
        return Response(TaskSerializer(task).data)

    @action(detail=False, methods=['GET'], url_path='my-tasks/(?P<user_id>[^/.]+)?')
    def my_tasks(self, request, user_id=None):
        tasks = Task.objects.filter(assigned_to=request.user)
        serializer = self.get_serializer(tasks, many=True)
        return Response({
            'results': serializer.data
        })

    def perform_create(self, serializer):
        task = serializer.save()
        # Create notification for assigned user
        if task.assigned_to and task.assigned_to != self.request.user:
            Notification.objects.create(
                user=task.assigned_to,
                type='task',
                title=f'New Task: {task.title}',
                message=f'You have been assigned to task "{task.title}"'
            )

    def update(self, request, *args, **kwargs):
        task = self.get_object()
        if task.project.owner != request.user and request.user not in task.project.members.all():
            return Response(
                {'error': 'You don\'t have permission to update this task'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        task = self.get_object()
        if task.project.owner != request.user:
            return Response(
                {'error': 'Only project owner can delete tasks'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
    
    def get_queryset(self):
        return Comment.objects.filter(task__project__members=self.request.user) | \
               Comment.objects.filter(task__project__owner=self.request.user)

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'patch']  # Only allow GET and PATCH methods
    
    def get_queryset(self):
        if self.request.user.role == 'TEAM_MEMBER':
            return Notification.objects.filter(user=self.request.user).order_by('-created_at')
        return Notification.objects.none()
    
    @action(detail=True, methods=['patch'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'status': 'marked as read'})

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_member_approval(request, user_id):
    try:
        user = User.objects.get(id=user_id)
        user.is_approved = request.data.get('is_approved', False)
        user.save()
        return Response({
            'message': f"User {user.username}'s approval status updated",
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_team_member(request, user_id):
    try:
        user = User.objects.get(id=user_id)
        username = user.username
        user.delete()
        return Response({
            'message': f"User {username} has been deleted"
        }, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_users_by_status(request):
    approved_users = User.objects.filter(is_approved=True).exclude(role='ADMIN')
    pending_users = User.objects.filter(is_approved=False)
    
    return Response({
        'approved_users': UserSerializer(approved_users, many=True).data,
        'pending_users': UserSerializer(pending_users, many=True).data
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_team_members(request):
    team_members = User.objects.filter(
        is_approved=True,
        role='TEAM_MEMBER'
    )
    return Response(UserSerializer(team_members, many=True).data)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_user_email(request, user_id):
    try:
        user = User.objects.get(id=user_id)
        
        # Check if user is updating their own email
        if request.user.id != user_id:
            return Response(
                {'error': 'You can only update your own email'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if email already exists
        new_email = request.data.get('email')
        if User.objects.filter(email=new_email).exclude(id=user_id).exists():
            return Response(
                {'error': 'Email already exists'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.email = new_email
        user.save()
        
        return Response({'message': 'Email updated successfully'})
    
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def change_user_password(request, user_id):
    try:
        user = User.objects.get(id=user_id)
        
        # Check if user is changing their own password
        if request.user.id != user_id:
            return Response(
                {'error': 'You can only change your own password'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        
        # Verify old password
        if not check_password(old_password, user.password):
            return Response(
                {'error': 'Current password is incorrect'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.set_password(new_password)
        user.save()
        
        return Response({'message': 'Password changed successfully'})
    
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    user = request.user
    
    if user.role == 'ADMIN':
        tasks = Task.objects.all()
        projects = Project.objects.all()
        
        # Get only team members (excluding admins)
        team_members = User.objects.filter(is_approved=True, role='TEAM_MEMBER')
        team_efficiency = []
        
        for member in team_members:
            member_tasks = Task.objects.filter(assigned_to=member)
            team_efficiency.append({
                'name': member.username,
                'tasksCompleted': member_tasks.filter(status='DONE').count(),
                'totalTasks': member_tasks.count(),
                'efficiency': calculate_user_efficiency(member, member_tasks),
                'onTime': member_tasks.filter(status='DONE', due_date__gte=F('updated_at')).count(),
                'delayed': member_tasks.filter(status='DONE', due_date__lt=F('updated_at')).count()
            })
    else:
        # Team member sees only their own tasks and stats
        tasks = Task.objects.filter(assigned_to=user).distinct()
        projects = Project.objects.filter(
            models.Q(members=user) |
            models.Q(owner=user)
        ).distinct()
        
        team_efficiency = [{
            'name': user.username,
            'tasksCompleted': tasks.filter(status='DONE').count(),
            'totalTasks': tasks.count(),
            'efficiency': calculate_user_efficiency(user, tasks),
            'onTime': tasks.filter(status='DONE', due_date__gte=F('updated_at')).count(),
            'delayed': tasks.filter(status='DONE', due_date__lt=F('updated_at')).count()
        }]

    # Task statistics
    task_stats = {
        'todo': tasks.filter(status='TODO').count(),
        'in_progress': tasks.filter(status='IN_PROGRESS').count(),
        'done': tasks.filter(status='DONE').count(),
    }

    # Timeline data (Gantt chart)
    timeline_data = {
        'data': [
            {
                'id': task.id,
                'text': task.title,
                'start_date': task.created_at.strftime('%Y-%m-%d'),
                'duration': calculate_duration(task.created_at.date(), task.due_date),
                'progress': 1 if task.status == 'DONE' else 0.5 if task.status == 'IN_PROGRESS' else 0,
                'project': task.project.title if task.project else 'No Project'
            }
            for task in tasks if task.due_date  # Only include tasks with due dates
        ]
    }

    return Response({
        'taskStats': task_stats,
        'teamEfficiency': team_efficiency,
        'timelineData': timeline_data
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, notification_id):
    try:
        notification = Notification.objects.get(id=notification_id, user=request.user)
        notification.is_read = True
        notification.save()
        return Response({'status': 'marked as read'})
    except Notification.DoesNotExist:
        return Response({'error': 'Notification not found'}, status=404)
def calculate_user_efficiency(user, tasks):
    total_tasks = tasks.filter(assigned_to=user).count()
    if total_tasks == 0:
        return 0
        
    completed_tasks = tasks.filter(
        assigned_to=user,
        status='DONE'
    ).count()
    
    on_time_tasks = tasks.filter(
        assigned_to=user,
        status='DONE',
        due_date__gte=F('updated_at')
    ).count()
    
    if completed_tasks == 0:
        return 0
        
    efficiency = (on_time_tasks / completed_tasks) * 100
    return round(efficiency, 1)

def calculate_team_efficiency(tasks):
    team_members = User.objects.filter(role='TEAM_MEMBER', is_approved=True)
    team_stats = []
    
    for member in team_members:
        member_tasks = tasks.filter(assigned_to=member)
        team_stats.append({
            'name': member.username,
            'tasksCompleted': member_tasks.filter(status='DONE').count(),
            'totalTasks': member_tasks.count(),
            'efficiency': calculate_user_efficiency(member, member_tasks),
            'onTime': member_tasks.filter(status='DONE', due_date__gte=F('updated_at')).count(),
            'delayed': member_tasks.filter(status='DONE', due_date__lt=F('updated_at')).count()
        })
    
    return team_stats

def calculate_duration(start_date, end_date):
    if not end_date:
        return 1  # Default duration if no end date
    duration = (end_date - start_date).days
    return max(duration, 1)  # Minimum duration of 1 day

