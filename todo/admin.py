from django.contrib import admin
from .models import *

# Register your models here.

admin.site.register(Task)
admin.site.register(Ticket)
admin.site.register(TicketType)
admin.site.register(TicketSubject)
admin.site.register(TicketTemplate)