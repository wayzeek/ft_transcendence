from rest_framework import serializers

from .models import User
from .models import Game
from .models import UserTournament, GameTournament, Tournament


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'password', 'language', 'games_played', 'games_won', 'games_lost', 'is_superuser', 'is_staff']


class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = ['date', 'score_user1', 'score_user2', 'user1', 'user2', 'winner', 'quickplay']


class UserTournamentSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserTournament
        fields = '__all__'


class GameTournamentSerializer(serializers.ModelSerializer):
    user1 = serializers.PrimaryKeyRelatedField(queryset=UserTournament.objects.all(), allow_null=True, required=False)
    user2 = serializers.PrimaryKeyRelatedField(queryset=UserTournament.objects.all(), allow_null=True, required=False)
    winner = serializers.PrimaryKeyRelatedField(queryset=UserTournament.objects.all(), allow_null=True, required=False)

    class Meta:
        model = GameTournament
        fields = ['id', 'user1', 'user2', 'winner', 'score_user1', 'score_user2', 'ended', 'game_number']
        # not required during updates

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret['user1'] = UserTournamentSerializer(instance.user1).data
        ret['user2'] = UserTournamentSerializer(instance.user2).data
        if instance.winner:
            ret['winner'] = UserTournamentSerializer(instance.winner).data
        return ret


class TournamentSerializer(serializers.ModelSerializer):
    games = serializers.PrimaryKeyRelatedField(many=True, queryset=GameTournament.objects.all(), required=False)
    users = serializers.PrimaryKeyRelatedField(many=True, queryset=UserTournament.objects.all(), required=False)
    winner = serializers.PrimaryKeyRelatedField(queryset=UserTournament.objects.all(), allow_null=True, required=False)

    class Meta:
        model = Tournament
        fields = '__all__'

    # def create(self, validated_data):
    #     games_data = validated_data.pop('games', [])
    #     users_data = validated_data.pop('users', [])
    #     tournament = Tournament.objects.create(**validated_data)
    #     tournament.games.set(games_data)
    #     tournament.users.set(users_data)
    #     return tournament

    # customize the representation of the games and users
    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret['games'] = GameTournamentSerializer(instance.games.all().order_by('id'), many=True).data
        ret['users'] = UserTournamentSerializer(instance.users.all(), many=True).data
        if instance.winner:
            ret['winner'] = UserTournamentSerializer(instance.winner).data
        return ret
