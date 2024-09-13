from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404

from rest_framework import permissions, viewsets,  status
from rest_framework.response import Response
from rest_framework.decorators import authentication_classes, permission_classes, api_view
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework.authtoken.models import Token


from . serializers import UserSerializer, GameSerializer
from . models import Game
from . permissions import IsOwner, IsOngoing


# Create your views here.
@authentication_classes([SessionAuthentication, TokenAuthentication])
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'put', 'delete']

@authentication_classes([SessionAuthentication, TokenAuthentication])    
class GameViewSet(viewsets.ModelViewSet):
    queryset = Game.objects.all()
    serializer_class = GameSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner, IsOngoing]
    http_method_names = ['get', 'put', 'post']
    
    def get_permissions(self):
        
        if self.action in ['list', 'create']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = self.permission_classes
            
        return [permission() for permission in permission_classes]
    
    def create(self, request, *args, **kwargs):
        game = Game(player=request.user)

        game.save()
        serializer = GameSerializer(game)
    
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        

# @api_view(['GET'])
# @permission_classes([permissions.IsAuthenticated])
# def get_user(request):
#     return Response(request.user, status=status.HTTP_200_OK)

@api_view(['POST'])
def login(request):
    user = get_object_or_404(User, username=request.data['username'])
    if not user.check_password(request.data['password']):
        return Response({
            "detail": "Not Found."
        }, status=status.HTTP_404_NOT_FOUND)
    token, created = Token.objects.get_or_create(user=user)
    serializer = UserSerializer(instance=user)
    return Response({
        "token": token.key,
        "user": serializer.data
    })

@api_view(['POST'])
def signup(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        user = User.objects.get(username=request.data['username'])
        token = Token.objects.create(user=user)
        user.set_password(request.data['password'])
        user.save()
        return Response({
            "token": token.key,
            "user": serializer.data
        })
        
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
