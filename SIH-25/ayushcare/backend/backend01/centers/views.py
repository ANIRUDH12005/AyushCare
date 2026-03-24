from django.shortcuts import render
from rest_framework import generics, permissions
from rest_framework.response import Response
from clinic.models import Center
from .serializers import CenterSerializer

class CenterListView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    queryset = Center.objects.all().order_by("name")
    serializer_class = CenterSerializer
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        # Return as array directly for frontend compatibility
        return Response(serializer.data)
    
    def get_serializer_context(self):
        """Add request to context for building absolute URLs"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

class CenterDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.AllowAny]
    queryset = Center.objects.all()
    serializer_class = CenterSerializer
    
    def get_serializer_context(self):
        """Add request to context for building absolute URLs"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
