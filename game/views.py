
from django.shortcuts import render, redirect

def index(request):
    return render(request, 'main.html', {})

def dungeon(request):
    return redirect("/")

def gameplay(request):
    return redirect("/")