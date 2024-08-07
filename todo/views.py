import random

from django.shortcuts import render

from todo.forms import TicketForm
from todo.models import Task


# Create your views here.

def mainView(request):
    return render(request, 'home.html')


def dummyView(request):
    return render(request, 'dummy.html')


def extraView(request):
    return render(request, 'extra.html')


def chartView(request):
    # Generate random usage data
    radius_usage = {
        'current': {
            'download': random.randint(100000, 5000000),  # Random download in bytes
            'upload': random.randint(50000, 2000000)  # Random upload in bytes
        },
        'one': {
            'download': random.randint(100000, 5000000),  # Random download in bytes
            'upload': random.randint(50000, 2000000)  # Random upload in bytes
        },
        'two': {
            'download': random.randint(100000, 5000000),  # Random download in bytes
            'upload': random.randint(50000, 2000000)  # Random upload in bytes
        }
    }
    return render(request, 'accounting.html', {'radius_usage': radius_usage})


def tickets_view(request):
    return render(request, 'tickets.html', {'ticket_form': TicketForm})
