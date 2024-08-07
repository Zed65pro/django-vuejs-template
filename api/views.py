import random

from django.utils import timezone
from django.utils.timezone import now
from rest_framework import status, generics
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.utils import json
from rest_framework.views import APIView

from .serializers import TaskSerializer, DummySerializer, TicketReplySerializer, \
    CreateTicketSerializer, TicketSerializer, TicketCloseSerializer
from todo.models import Task, Ticket, TicketType, TicketTemplate, TicketSubject
from django.http import JsonResponse, Http404, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import TemplateView, View
from django.http import JsonResponse
from dummy.models import State
from rest_framework.generics import GenericAPIView
from rest_framework.pagination import PageNumberPagination


@api_view(['GET'])
def dummy_accounting_api(request):
    # Define realistic ranges for download and upload speeds
    # Values are in bytes per second (B/s)
    download_ranges = [
        (50_000, 1_000_000),  # 50 KB/s to 1 MB/s
        (1_000_000, 10_000_000),  # 1 MB/s to 10 MB/s
        (10_000_000, 100_000_000),  # 10 MB/s to 100 MB/s
    ]

    upload_ranges = [
        (10_000, 500_000),  # 10 KB/s to 500 KB/s
        (500_000, 5_000_000),  # 500 KB/s to 5 MB/s
        (5_000_000, 20_000_000),  # 5 MB/s to 20 MB/s
    ]

    # Randomly choose a range and generate a value within that range
    download_range = random.choice(download_ranges)
    upload_range = random.choice(upload_ranges)

    download = random.randint(*download_range)
    upload = random.randint(*upload_range)

    # Occasionally add some jitter to simulate network fluctuations
    if random.random() < 0.2:  # 20% chance of jitter
        jitter_factor = random.uniform(0.8, 1.2)
        download = int(download * jitter_factor)
        upload = int(upload * jitter_factor)

    return JsonResponse({
        'download': download,
        'upload': upload
    })


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


class CustomPagination(PageNumberPagination):
    page_size = 10  # Default page size
    page_size_query_param = 'page_size'
    max_page_size = 100  # Maximum page size that can be requested

    def get_paginated_response(self, data):
        return Response({
            'count': self.page.paginator.count,
            'total_pages': self.page.paginator.num_pages,
            'current_page': self.page.number,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'results': data
        })


class TicketListView(generics.ListAPIView):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    pagination_class = CustomPagination


class TicketCreateView(generics.CreateAPIView):
    queryset = Ticket.objects
    serializer_class = CreateTicketSerializer

    def create(self, request, *args, **kwargs):
        # Use CreateTicketSerializer for deserialization
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        # Use TicketSerializer for the response
        ticket_serializer = TicketSerializer(serializer.instance)
        headers = self.get_success_headers(ticket_serializer.data)
        return Response(ticket_serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class TicketReplyCreateView(APIView):

    def post(self, request, pk):
        ticket = Ticket.objects.get(pk=pk)
        request.data['ticket'] = pk
        serializer = TicketReplySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(ticket=ticket)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TicketCloseView(APIView):

    def post(self, request, pk):
        ticket = Ticket.objects.get(pk=pk)
        ticket.closed_on = timezone.now()
        ticket.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class TicketTransferView(APIView):

    def post(self, request, pk):
        ticket = Ticket.objects.get(pk=pk)
        ticket.transfered_on = timezone.now()
        ticket.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class LoadSubjectsView(View):
    def get(self, request, *args, **kwargs):
        subjects = TicketSubject.objects.all()
        subjects_list = list(subjects.values('id', 'subject', 'type__id'))
        return JsonResponse(subjects_list, safe=False)


class LoadTemplateView(View):
    def get(self, request, *args, **kwargs):
        type_id = kwargs.get('typeId')
        subject_id = kwargs.get('subjectId')
        if type_id and subject_id:
            try:
                template = TicketTemplate.objects.get(type_id=type_id, subject_id=subject_id)
                if not template.template or not template.is_form:
                    return JsonResponse({'id': template.id})
                return JsonResponse({'id': template.id, 'template': template.template})
            except TicketTemplate.DoesNotExist:
                return JsonResponse({'error': 'No template found for given type and subject'}, status=404)
        return JsonResponse({'error': 'Invalid type_id or subject_id'}, status=400)


class LoadTypesView(View):
    def get(self, request, *args, **kwargs):
        types = TicketType.objects.all()
        types_list = list(types.values('id', 'type'))
        return JsonResponse(types_list, safe=False)


class TicketCloseApiView(APIView):
    def patch(self, request, pk, format=None):
        try:
            ticket = Ticket.objects.get(pk=pk)
        except Ticket.DoesNotExist:
            return Response({'error': 'Ticket not found'}, status=status.HTTP_404_NOT_FOUND)

        # Update the `closed_on` field to the current time and set `status` to false
        ticket.closed_on = now()
        ticket.status = False  # Assuming 'status' is a boolean field
        ticket.save()

        serializer = TicketCloseSerializer(ticket)
        return Response(serializer.data, status=status.HTTP_200_OK)
