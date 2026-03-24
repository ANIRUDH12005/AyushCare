from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
import hmac
import hashlib
from .models import Invoice

# Try to import razorpay, make it optional
try:
    import razorpay
    RAZORPAY_AVAILABLE = True
    # Initialize Razorpay client
    razorpay_client = razorpay.Client(
        auth=(getattr(settings, 'RAZORPAY_KEY_ID', ''), getattr(settings, 'RAZORPAY_KEY_SECRET', ''))
    )
except ImportError:
    RAZORPAY_AVAILABLE = False
    razorpay_client = None


class CreatePaymentOrderView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Create a payment order with Razorpay"""
        if not RAZORPAY_AVAILABLE:
            return Response({
                "success": False,
                "message": "Payment gateway not configured. Please install razorpay package."
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        
        data = request.data
        invoice_id = data.get('invoiceId')
        amount = data.get('amount')
        currency = data.get('currency', 'INR')
        
        if not invoice_id or not amount:
            return Response({
                "success": False,
                "message": "Invoice ID and amount are required"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            invoice = Invoice.objects.get(id=invoice_id, patient=request.user)
        except Invoice.DoesNotExist:
            return Response({
                "success": False,
                "message": "Invoice not found"
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Convert amount to paise (Razorpay uses smallest currency unit)
        amount_in_paise = int(float(amount) * 100)
        
        # Create Razorpay order
        try:
            order_data = {
                'amount': amount_in_paise,
                'currency': currency,
                'receipt': f'invoice_{invoice_id}',
                'notes': {
                    'invoice_id': invoice_id,
                    'user_id': request.user.id
                }
            }
            
            razorpay_order = razorpay_client.order.create(data=order_data)
            
            return Response({
                "success": True,
                "orderId": razorpay_order['id'],
                "amount": amount_in_paise,
                "currency": currency,
                "key": getattr(settings, 'RAZORPAY_KEY_ID', ''),
                "invoice_id": invoice_id
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                "success": False,
                "message": f"Failed to create payment order: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class VerifyPaymentView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Verify payment signature and update invoice status"""
        if not RAZORPAY_AVAILABLE:
            return Response({
                "success": False,
                "message": "Payment gateway not configured. Please install razorpay package."
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        
        data = request.data
        razorpay_order_id = data.get('razorpay_order_id')
        razorpay_payment_id = data.get('razorpay_payment_id')
        razorpay_signature = data.get('razorpay_signature')
        invoice_id = data.get('invoice_id')
        
        if not all([razorpay_order_id, razorpay_payment_id, razorpay_signature, invoice_id]):
            return Response({
                "success": False,
                "message": "Missing payment verification data"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            invoice = Invoice.objects.get(id=invoice_id, patient=request.user)
        except Invoice.DoesNotExist:
            return Response({
                "success": False,
                "message": "Invoice not found"
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Verify signature
        secret = getattr(settings, 'RAZORPAY_KEY_SECRET', '')
        message = f"{razorpay_order_id}|{razorpay_payment_id}"
        generated_signature = hmac.new(
            secret.encode(),
            message.encode(),
            hashlib.sha256
        ).hexdigest()
        
        if generated_signature != razorpay_signature:
            return Response({
                "success": False,
                "message": "Invalid payment signature"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify payment with Razorpay
        try:
            payment = razorpay_client.payment.fetch(razorpay_payment_id)
            
            if payment['status'] == 'authorized' or payment['status'] == 'captured':
                # Update invoice status
                invoice.payment_status = 'paid'
                invoice.paid_amount = invoice.total_amount
                invoice.save()
                
                return Response({
                    "success": True,
                    "message": "Payment verified and invoice updated successfully",
                    "payment_id": razorpay_payment_id,
                    "order_id": razorpay_order_id
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    "success": False,
                    "message": f"Payment status is {payment['status']}"
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({
                "success": False,
                "message": f"Payment verification failed: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

