from rest_framework import serializers

from dummy.models import State
from todo.models import Task, Ticket, TicketReply, TicketSubject, TicketType


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'


class DummySerializer(serializers.ModelSerializer):
    class Meta:
        model = State
        fields = '__all__'


class TicketReplySerializer(serializers.ModelSerializer):
    class Meta:
        model = TicketReply
        fields = ['id', 'ticket', 'content', 'created_on']
        read_only_fields = ['created_on', 'id']


class TicketSubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = TicketSubject
        fields = ['id', 'subject']


class TicketTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TicketType
        fields = ['id', 'type']


class TicketSerializer(serializers.ModelSerializer):
    replies = TicketReplySerializer(many=True, read_only=True)
    subject = TicketSubjectSerializer(read_only=True)
    type = TicketTypeSerializer(read_only=True)

    class Meta:
        model = Ticket
        fields = ['content', 'subject', 'type', 'replies', 'id', 'created_on', 'transfered_on', 'closed_on', 'status']


class CreateTicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = ['content', 'subject', 'type']


class TicketCloseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = ['closed_on', 'status']
