from django.shortcuts import render

# Create your views here.

def mainView(request): 
    return render(request, 'home.html')


def dummyView(request):
    return render(request, 'dummy.html')


def extraView(request):
    return render(request, 'extra.html')