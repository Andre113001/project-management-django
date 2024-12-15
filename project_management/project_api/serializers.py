from rest_framework import serializers
from .models import User, Project, Task, Comment, Notification

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 
            'username', 
            'email', 
            'first_name', 
            'last_name',
            'role',
            'is_approved',
            'tasks_completed',
            'tasks_on_time',
            'tasks_delayed',
            'efficiency'
        ]

class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'task', 'author', 'content', 'created_at', 'updated_at']
        read_only_fields = ['author']

class TaskSerializer(serializers.ModelSerializer):
    assigned_to = UserSerializer(read_only=True)
    assigned_to_id = serializers.IntegerField(write_only=True)
    project_title = serializers.CharField(source='project.title', read_only=True)

    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'project', 'project_title',
            'assigned_to', 'assigned_to_id', 'status', 'priority', 
            'due_date', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def create(self, validated_data):
        assigned_to_id = validated_data.pop('assigned_to_id')
        assigned_to = User.objects.get(id=assigned_to_id)
        task = Task.objects.create(**validated_data, assigned_to=assigned_to)
        return task

class ProjectSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    members = UserSerializer(many=True, read_only=True)
    member_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
        default=list
    )
    tasks = TaskSerializer(many=True, read_only=True, required=False)

    class Meta:
        model = Project
        fields = ['id', 'title', 'description', 'status', 'start_date', 
                 'deadline', 'created_at', 'updated_at', 'owner', 
                 'members', 'member_ids', 'tasks']
        read_only_fields = ['created_at', 'updated_at', 'tasks']

    def create(self, validated_data):
        member_ids = validated_data.pop('member_ids', [])
        project = Project.objects.create(**validated_data)
        if member_ids:
            project.members.set(User.objects.filter(id__in=member_ids))
        return project

    def update(self, instance, validated_data):
        member_ids = validated_data.pop('member_ids', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if member_ids is not None:
            instance.members.set(User.objects.filter(id__in=member_ids))
        return instance

class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name']

class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'type', 'title', 'message', 'is_read', 'created_at'] 