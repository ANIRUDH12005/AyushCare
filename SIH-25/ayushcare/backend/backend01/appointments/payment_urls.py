from django.urls import path
from .payment_views import CreatePaymentOrderView, VerifyPaymentView

urlpatterns = [
    path("create-order/", CreatePaymentOrderView.as_view()),
    path("verify/", VerifyPaymentView.as_view()),
]

