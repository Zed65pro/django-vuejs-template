from rest_framework import serializers

from dummy.models import State
from todo.models import Task


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'


class DummySerializer(serializers.ModelSerializer):
    class Meta:
        model = State
        fields = '__all__'
