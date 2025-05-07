
from django.shortcuts import render

def index(request):
    return render(request, 'main.html', {})

def dungeon(request):
    return render(request, 'dungeon.html', {})

def gameplay(request):
    return render(request, 'gameplay.html', {})