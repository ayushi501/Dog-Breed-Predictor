from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name = 'index'),
    path('api/know_more/<str:breed>/', views.know_more, name='know_more'),

]