from django.shortcuts import render
from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import TournamentBracket
from .serializers import TournamentBracketSerializer
from tournament.models import Tournament

# Create your views here.

class TournamentBracketView(generics.GenericAPIView):
    serializer_class = TournamentBracketSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self, tournament_id):
        return TournamentBracket.objects.filter(tournament_id=tournament_id).first()

    def get(self, request, tournament_id):
        bracket = self.get_object(tournament_id)
        if bracket:
            serializer = self.get_serializer(bracket)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response({'detail': 'Bracket not found.'}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request, tournament_id):
        tournament = Tournament.objects.filter(id=tournament_id).first()
        if not tournament:
            return Response({'detail': 'Tournament not found.'}, status=status.HTTP_404_NOT_FOUND)
        # If bracket already exists, update it
        bracket = self.get_object(tournament_id)
        data = request.data.copy()
        data['tournament'] = tournament_id
        if bracket:
            serializer = self.get_serializer(bracket, data=data, partial=True)
        else:
            serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
