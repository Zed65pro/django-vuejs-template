from django.urls import path, include

from api import views
from api.views import TicketCloseApiView

urlpatterns = [
    path('list', views.task_list, name="tasks"),
    path('create', views.createTask, name="newTask"),
    path('<str:id>', views.get_task, name='get_task'),
    path('update/<str:id>', views.updateTask, name="update"),
    path('delete/<str:id>/', views.deleteTask, name="delete"),
    path('states/', views.StateAPI.as_view(), name='state_api'),
    path('states/<int:pk>/', views.StateAPI.as_view(), name='state_api_detail'),
    path('chart/accounting/', views.dummy_accounting_api, name='dummy_accounting'),
    path('tickets/', views.TicketListView.as_view(), name='ticket-list'),
    path('tickets/create', views.TicketCreateView.as_view(), name='ticket-create'),
    path('tickets/<int:pk>/reply/', views.TicketReplyCreateView.as_view(), name='ticket-reply-create'),
    path('tickets/<int:pk>/close/', views.TicketCloseView.as_view(), name='ticket-close'),
    path('tickets/<int:pk>/transfer/', views.TicketTransferView.as_view(), name='ticket-transfer'),
    path('tickets/types/', views.LoadTypesView.as_view(), name='get-ticket-types'),
    path('tickets/subjects/', views.LoadSubjectsView.as_view(), name='get-ticket-subjects'),
    path('tickets/template/<int:typeId>/<int:subjectId>/', views.LoadTemplateView.as_view(),
         name='get-ticket-template'),
    path('tickets/close/<int:pk>/', TicketCloseApiView.as_view(), name='ticket-close'),
]
