from ckeditor.widgets import CKEditorWidget
from django import forms

from todo.models import Ticket, TicketSubject, TicketType


class TicketForm(forms.ModelForm):
    type = forms.ModelChoiceField(
        queryset=TicketType.objects.all(),
        empty_label="Select Type",
    )
    subject = forms.ModelChoiceField(
        queryset=TicketSubject.objects.none(),
        empty_label="Select Subject",
    )
    content = forms.CharField(widget=CKEditorWidget(config_name='default'))

    class Meta:
        model = Ticket
        fields = ['type', 'subject', 'content']
