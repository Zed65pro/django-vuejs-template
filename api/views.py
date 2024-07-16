from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.utils import json

from .serializers import TaskSerializer, DummySerializer
from todo.models import Task
from django.http import JsonResponse, Http404, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import TemplateView, View
from django.http import JsonResponse
from dummy.models import State
from rest_framework.generics import GenericAPIView
from rest_framework.pagination import PageNumberPagination


@api_view(['GET'])
def task_list(request):
    search_query = request.GET.get('search', '')
    completed_filter = request.GET.get('completed', None)  # Filter by completed status
    page_number = request.GET.get('page', 1)

    tasks = Task.objects.all()

    # Filter tasks by search query
    if search_query:
        tasks = tasks.filter(title__icontains=search_query)

    # Filter tasks by completed status
    if completed_filter is not None:
        completed_status = bool(completed_filter.lower() == 'true')
        tasks = tasks.filter(completed=completed_status)

    # Pagination
    paginator = PageNumberPagination()
    paginator.page_size = 10  # Number of tasks per page
    paginated_tasks = paginator.paginate_queryset(tasks, request)

    serializer = TaskSerializer(paginated_tasks, many=True)
    return paginator.get_paginated_response(serializer.data)


@api_view(['GET'])
def get_task(request, id):
    try:
        task = Task.objects.get(id=id)
    except Exception as e:
        raise Http404
    tSerializer = TaskSerializer(task)
    return Response(tSerializer.data)


@api_view(['POST'])
def createTask(request):
    serializer = TaskSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    else:
        return HttpResponse('Some Error Occured')


@api_view(['PUT'])
def updateTask(request, id):
    task = Task.objects.get(id=id)
    # print(task)
    serializer = TaskSerializer(instance=task, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
    else:
        return HttpResponse('Some Error Occured')
    return Response(serializer.data)


@api_view(['DELETE'])
def deleteTask(request, id):
    task = Task.objects.get(id=id)
    try:
        task.delete()
    except Exception as e:
        Response("Unable to Delete Task!")
    return Response("Task Deleted Sucessfully")


class StateListView(TemplateView):
    template_name = 'randomapp/states_list.html'


class StateAPI(GenericAPIView):
    serializer_class = DummySerializer
    queryset = State.objects.all()

    def get(self, request):
        states = self.get_queryset()
        serializer = self.get_serializer(states, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response({'message': 'State deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
