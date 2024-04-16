from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
import uuid


class UserManager(BaseUserManager):
    def create_user(self, username, password, **other_fields):
        if not username:
            raise ValueError('Users must have a username')
        user = self.model(username=self.model.normalize_username(username), **other_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, username, password, **other_fields):
        other_fields.setdefault('is_staff', True)
        other_fields.setdefault('is_superuser', True)

        if other_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True')
        if other_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True')

        return self.create_user(username, password, **other_fields)


class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = models.CharField(max_length=30, unique=True)
    #  password is already defined in AbstractBaseUser

    games_won = models.IntegerField(default=0)
    games_lost = models.IntegerField(default=0)
    games_played = models.IntegerField(default=0, editable=False)

    is_superuser = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)

    friends = models.ManyToManyField('self', through='Friendship', symmetrical=False, related_name='friends_of')
    image = models.ImageField(default='profile_img.png')

    is_42 = models.BooleanField(default=True)

    STATUS_CHOICES = [
        ('ON', 'online'),
        ('OFF', 'offline'),
        ('GAME', 'in_game'),
    ]
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='offline')

    LANGUAGES = [
        ('fr', 'fr'),
        ('it', 'it'),
        ('en', 'en'),
    ]
    language = models.CharField(max_length=10, choices=LANGUAGES, default='en')

    objects = UserManager()

    USERNAME_FIELD = 'username'

    def __str__(self):
        return self.username

    def save(self, *args, **kwargs):
        self.games_played = int(self.games_won) + int(self.games_lost)
        super().save(*args, **kwargs)


class Friendship(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    from_user = models.ForeignKey(User, related_name='friendships', on_delete=models.CASCADE)
    to_user = models.ForeignKey(User, related_name='friend_requests', on_delete=models.CASCADE)
    is_accepted = models.BooleanField(default=False)


class Game(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    date = models.DateTimeField(auto_now_add=True)
    score_user1 = models.IntegerField()
    score_user2 = models.IntegerField()
    user1 = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='games_as_player1')
    user2 = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='games_as_player2')
    winner = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    quickplay = models.BooleanField(default=True)
# remove null=True, blank=Tru when available


class UserTournament(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nickname = models.CharField(max_length=30, null=True, blank=True)
    # user is null if not logged
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)


class GameTournament(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user1 = models.ForeignKey(UserTournament, on_delete=models.CASCADE, related_name='games_as_player1', null=True, blank=True, default=None)
    user2 = models.ForeignKey(UserTournament, on_delete=models.CASCADE, related_name='games_as_player2', null=True, blank=True, default=None)
    winner = models.ForeignKey(UserTournament, on_delete=models.CASCADE, related_name='won_games', null=True, blank=True)
    score_user1 = models.IntegerField(null=True, blank=True)
    score_user2 = models.IntegerField(null=True, blank=True)
    ended = models.BooleanField(default=False)
    game_number = models.IntegerField(null=True, blank=True)


class Tournament(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=30, null=True, blank=True, default="tournament")
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_tournaments')
    
    winner = models.ForeignKey(UserTournament, on_delete=models.CASCADE, related_name='won_tournaments', null=True, blank=True)
    games = models.ManyToManyField(GameTournament, related_name='tournament_games', blank=True)
    users = models.ManyToManyField(UserTournament, related_name='tournaments', blank=True)

    ongoingGame = models.IntegerField(default=0, blank=True)
    ended = models.BooleanField(default=False, blank=True)
    is_sent_to_blockchain =  models.BooleanField(default=False, blank=True)
    
