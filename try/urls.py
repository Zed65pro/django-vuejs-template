from django.contrib import admin
from django.urls import path, include
from todo.views import *

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', mainView, name="home"),
    path('dummy/', dummyView, name="dummy"),
    path('extra/', extraView, name="extra"),
    path('chart/', chartView, name="chart"),
    path('api/v1/', include('api.urls'))
]
