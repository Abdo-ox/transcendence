import logging

logger = logging.getLogger(__name__)

class CsrfDebugMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Log CSRF cookie value if it exists
        csrf_cookie = request.COOKIES.get('csrftoken')
        csrf_header = request.META.get('HTTP_X_CSRFTOKEN')
        logger.debug(f'CSRF Cookie: {csrf_cookie}')
        logger.debug(f'CSRF Header: {csrf_header}')
        response = self.get_response(request)
        
        return response
