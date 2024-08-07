from django.contrib.auth.models import User
from django.db import models
from django.utils import timezone
from ckeditor.fields import RichTextField


class Task(models.Model):
    title = models.CharField(max_length=200)
    completed = models.BooleanField(default=False, blank=True, null=True)
    created_on = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_on']  # Default ordering by created_on descending


class TicketType(models.Model):
    created_on = models.DateTimeField(auto_now_add=True)
    updated_on = models.DateTimeField(auto_now=True)
    type = models.CharField(max_length=255)

    def __str__(self):
        return self.type


class TicketSubject(models.Model):
    created_on = models.DateTimeField(auto_now_add=True)
    updated_on = models.DateTimeField(auto_now=True)
    type = models.ForeignKey(TicketType, on_delete=models.CASCADE, related_name='subjects')
    subject = models.CharField(max_length=255)

    def __str__(self):
        return self.subject


class TicketTemplate(models.Model):
    subject = models.OneToOneField(TicketSubject, on_delete=models.CASCADE)
    type = models.ForeignKey(TicketType, on_delete=models.CASCADE)
    template = models.TextField(blank=True, null= True)
    is_form = models.BooleanField(default=False)
    created_on = models.DateTimeField(auto_now_add=True)
    updated_on = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('type', 'subject')

    def __str__(self):
        return self.template


class Ticket(models.Model):
    created_on = models.DateTimeField(auto_now_add=True)
    updated_on = models.DateTimeField(auto_now=True)
    closed_on = models.DateTimeField(null=True, blank=True)
    transfered_on = models.DateTimeField(null=True, blank=True)
    status = models.BooleanField(default=True)
    content = RichTextField(config_name='default')
    subject = models.ForeignKey(TicketSubject, on_delete=models.SET_NULL, null=True, blank=True)
    type = models.ForeignKey(TicketType, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return str(self.subject)

    class Meta:
        ordering = ['-created_on']


class TicketReply(models.Model):
    ticket = models.ForeignKey(Ticket, related_name='replies', on_delete=models.CASCADE)
    content = models.TextField()
    created_on = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Reply to {self.ticket.subject}"
