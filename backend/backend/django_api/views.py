from django.http import JsonResponse, FileResponse
from django.views.decorators.csrf import (csrf_protect, csrf_exempt)
from django.contrib.auth import authenticate, login, update_session_auth_hash
from django.contrib.auth.hashers import make_password, check_password
from django.core.exceptions import ObjectDoesNotExist
from django.core.files.base import ContentFile
from django.shortcuts import get_object_or_404, render, redirect
from django.db.models import Q
from django.conf import settings
from django.utils.crypto import get_random_string

from django.contrib.auth import get_user_model
from oauthlib.oauth2 import BackendApplicationClient
from requests_oauthlib import OAuth2Session

from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes, api_view
from rest_framework.authtoken.models import Token

from rest_framework.settings import api_settings
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.state import token_backend

from web3 import Web3, HTTPProvider
from web3.gas_strategies.time_based import fast_gas_price_strategy

import requests
import json
import logging
import secrets
import os
import imghdr
from urllib.parse import urlparse, parse_qs, urlencode



from .models import User, Game, Friendship, UserTournament, GameTournament, Tournament
from .serializers import UserSerializer
from .serializers import GameSerializer
from .serializers import UserTournamentSerializer, GameTournamentSerializer, TournamentSerializer

# Get a logger
logger = logging.getLogger(__name__)

@csrf_protect
@api_view(['POST'])
def register(request):
    try:
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data.get('username')
            password = serializer.validated_data.get('password')

            if len(password) < 6:
                return JsonResponse({'status': 'error', 'message': 'Password is too small'}, status=status.HTTP_400_BAD_REQUEST)
            if len(password) > 30:
                return JsonResponse({'status': 'error', 'message': 'Password is too long'}, status=status.HTTP_400_BAD_REQUEST)
            if len(username) >= 20:
                return JsonResponse({'status': 'error', 'message': 'Username is too long'}, status=status.HTTP_400_BAD_REQUEST)
            if len(username) >= 3:
                if username[-3] == '@' and username[-2] == '4' and username[-1] == '2':
                    return JsonResponse({'status': 'error', 'message': 'Username can\'t end with @42'}, status=status.HTTP_400_BAD_REQUEST)

            username = username.upper()

            if User.objects.filter(username=username):
                return JsonResponse({'status': 'error', 'message': 'Username is already taken'}, status=status.HTTP_400_BAD_REQUEST) 

            # Create a new user with the hashed password
            user = User.objects.create_user(username=username, password=password, is_42=False)
            user.save()

            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            # Include the username in the response
            return Response({'status': 'success', 'message': 'User registered successfully', 'token': str(refresh.access_token), 'username': username, 'games_played': 0, 'games_won': 0, 'games_lost': 0}, status=status.HTTP_201_CREATED)
        else:
            return JsonResponse(serializer.errors, status=400)

    except Exception as e:
        # Log any exceptions
        logger.error(f"An error occurred: {str(e)}")
        # Send back a JSON response with a generic error message
        return Response({'status': 'error', 'message': 'An error occurred during registration'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@csrf_protect
@api_view(['POST'])
def loginUser(request):
    try:
        data = request.data
        username = data.get("username")
        password = data.get("password")
        username = username.upper()
        user = authenticate(request, username=username, password=password)
        if user is not None:
            django_request = request._request
            login(django_request, user)

            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            return Response({'status': 'success', 'message': 'User logged in successfully', 'token': str(refresh.access_token), 'username': username, 'games_played': user.games_played, 'games_won': user.games_won, 'games_lost': user.games_lost, 'language': user.language}, status=status.HTTP_200_OK)
        else:
            return JsonResponse({'status': 'error', 'message': 'Invalid username or password'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
       logger.error(f"An error occurred during login: {str(e)}")
       return Response({'status': 'error', 'message': 'An error occurred during login'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_protect
@api_view(['POST'])
def loginGame(request):
    try:
        data = request.data
        username = data.get("username")
        password = data.get("password")
        if request.user.username == username:
            return JsonResponse({'status': 'error', 'message': 'P2_me'}, status=status.HTTP_400_BAD_REQUEST)
        logger.info(f"Attempting to authenticate user: {username}")
        username = username.upper()
        user = authenticate(request, username=username, password=password)
        if user is not None:
            return Response({'status': 'success', 'message': 'User logged in successfully', 'username': username}, status=status.HTTP_200_OK)
        else:
            logger.warning(f"Failed authentication attempt for user: {username}")
            return JsonResponse({'status': 'error', 'message': 'P2_not_found'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
       logger.error(f"An error occurred during login: {str(e)}")
       return Response({'status': 'error', 'message': 'An error occurred during login'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['GET'])
@csrf_exempt
def authorize(request):
    global redirect_uri 
    try:
        client_id = os.getenv('CLIENT_ID')
        # Retrieve the domain name from the query parameters
        domain_name = request.GET.get('domain', '')
        redirect_uri = "https://" + domain_name + ":4430/api/callback"
        authorization_base_url = 'https://api.intra.42.fr/oauth/authorize'

        oauth = OAuth2Session(client_id, redirect_uri=redirect_uri)
        authorization_url, state = oauth.authorization_url(authorization_base_url)
        request.session['oauth_state'] = state
        return redirect(authorization_url)
    except Exception as e:
        return Response(str(e), status=500)

@api_view(['GET'])
@csrf_exempt
def callback(request):
    try:
        client_id = os.getenv('CLIENT_ID')
        client_secret = os.environ.get('CLIENT_SECRET')
        token_url = 'https://api.intra.42.fr/oauth/token'
        user_info_url = 'https://api.intra.42.fr/v2/me'

        callback_url = request.build_absolute_uri()
        parsed_url = urlparse(callback_url)
        query_params = parse_qs(parsed_url.query)
        authorization_code = query_params.get('code', [None])[0]

        if not authorization_code:
            return redirect('/index')

        oauth = OAuth2Session(client_id, redirect_uri=redirect_uri, state=request.session.get('oauth_state'))

        token = oauth.fetch_token(token_url, code=authorization_code, client_secret=client_secret)

        del request.session['oauth_state']

        user_info = oauth.get(user_info_url).json()

        User = get_user_model()
        username = user_info['login'].upper() + '@42'
        user, created = User.objects.get_or_create(username=username)
        if created:
            # Generate a random password
            password = get_random_string(12)
            # Hash and set the generated password
            user.set_password(password)
            # Download and save the profile picture
            image_url = user_info['image']['link']
            response = requests.get(image_url)
            if response.status_code == 200:
                image_path = os.path.join(settings.MEDIA_ROOT, f"{user.username}.png")
                with open(image_path, 'wb') as image_file:
                    image_file.write(response.content)
                # Update the user's image field
                user.image.name = image_path
                user.save()

        login(request, user)

        refresh = RefreshToken.for_user(user)

        # Prepare the data to be passed as query parameters
        data = {
            'status': 'success',
            'message': 'User logged in successfully',
            'token': str(refresh.access_token),
            'username': user.username,
            'language': user.language,
        }

        # Encode the data into a query string
        query_string = urlencode(data)

        # Redirect to the index page with the query string
        return redirect(f'/callback?{query_string}')
    except Exception as e:
        return Response(str(e), status=500)

@csrf_exempt
@api_view(['GET'])
def verify_token(request):
    try:
        auth_header = request.META['HTTP_AUTHORIZATION']
        token = auth_header.split(' ')[1]
        data = token_backend.decode(token)
        return Response({'status': 'success', 'message': 'Token is valid'}, status=status.HTTP_200_OK)
    except KeyError:
        return Response({'status': 'error', 'message': 'Authorization header is missing'}, status=status.HTTP_401_UNAUTHORIZED)
    except TokenError as e:
        logger.error(f"TokenError occurred: {str(e)}")
        return Response({'status': 'error', 'message': 'Token is invalid or expired'}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
       return Response({'status': 'error', 'message': 'An error occurred during get'}, status=status.HTTP_401_UNAUTHORIZED)


@csrf_exempt
@permission_classes([IsAuthenticated])
@api_view(['GET'])
def getCurrentUser(request):
    user = request.user
    return Response({'id': user.id, 'username': user.username}, status=200)


@csrf_protect
@permission_classes([IsAuthenticated])
@api_view(['GET'])
def getUserByUsername(request, username):
    try:
        user = User.objects.get(username=username)
        user_dict = {
            'id': user.id,
            'username': user.username,
            'games_won': user.games_won,
            'games_lost': user.games_lost,
            'games_played': user.games_played,
        }
        return JsonResponse(user_dict)
    except ObjectDoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)


@csrf_protect
@permission_classes([IsAuthenticated])
@api_view(['GET'])
def getOtherUser(request, username):
    try:
        user = User.objects.get(username=username)
        if user == request.user:
            return JsonResponse({"status": "error400", "message": "User is yourself"}, status=400)
        user_dict = {
            'status': 'success',
            'id': user.id,
            'username': user.username,
            'games_won': user.games_won,
            'games_lost': user.games_lost,
            'games_played': user.games_played,
        }
        return JsonResponse(user_dict)
    except ObjectDoesNotExist:
        return JsonResponse({"status": "error", "message": "User not found"}, status=404)


@csrf_protect
@api_view(['POST'])
def save_game(request):
    try:
        serializer = GameSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=status.HTTP_201_CREATED)
        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        return Response({'status': 'error', 'error': str(e)}, status=400)


@csrf_protect
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def updateUser(request):
    try:
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data.get('username')

            if len(username) >= 20:
                return JsonResponse({'status': 'error', 'message': 'Username is too long'}, status=status.HTTP_400_BAD_REQUEST)
            if len(username) >= 3:
                if username[-3] == '@' and username[-2] == '4' and username[-1] == '2':
                    return JsonResponse({'status': 'error', 'message': 'Username can\'t end with @42'}, status=status.HTTP_400_BAD_REQUEST)
            
            username = username.upper()

            user = request.user
            if User.objects.filter(username=username):
                return JsonResponse({'status': 'error', 'message': 'user-taken'}, status=status.HTTP_400_BAD_REQUEST)
            User.objects.filter(username=user.username).update(username=username, password=user.password)
            return JsonResponse(serializer.data, status=200)

        return JsonResponse({'status': 'error', 'message': 'user-taken'}, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        logger.error(f"An error occurred: {str(e)}")
        return JsonResponse({'status': 'error', 'message': 'An error occurred during update'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@csrf_protect
@permission_classes([IsAuthenticated])
@api_view(['GET'])
def friends_list(request):
    try:
        user = request.user
        friends = Friendship.objects.filter((Q(to_user=user.id) | Q(from_user=user.id)), is_accepted=True)
        friends_data = []
        for friend in friends:
            friend_username = friend.to_user.username if friend.to_user.id != user.id else friend.from_user.username
            friends_data.append({'username': friend_username})
        return Response({'friends': friends_data}, status=200)
    
    except Exception as e:
        return Response({'status': 'error', 'error': str(e)}, status=400)


@csrf_protect
@permission_classes([IsAuthenticated])
@api_view(['GET'])
def requests_list(request):
    try:
        requests = Friendship.objects.filter(to_user=request.user, is_accepted=False)
        requests_list = [{'from_user': request.from_user.username, 'id': request.id} for request in requests]
        return Response({'requests': requests_list}, status=200)
    
    except Exception as e:
        return Response({'status': 'error', 'error': str(e)}, status=400)


@csrf_protect
@permission_classes([IsAuthenticated])
@api_view(['POST'])
def send_friend_request(request, friend_id):
    try:
        current_user = request.user
        friend = User.objects.get(id=friend_id)
        if Friendship.objects.filter(from_user=current_user, to_user=friend).exists() or \
            Friendship.objects.filter(from_user=friend, to_user=current_user).exists():
            return JsonResponse({'status': 'error', 'message': 'Friend request already exist'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            Friendship.objects.create(from_user=current_user, to_user=friend)
            return JsonResponse({'status': 'success', 'message': 'Friend request send'}, status=200)

    except Exception as e:
        return JsonResponse({'status': 'error', 'message': 'Friend id doesn\'t exist'}, status=400)


@csrf_protect
@permission_classes([IsAuthenticated])
@api_view(['POST'])
def accept_friend_request(request, request_id):
    try:
        Friendship.objects.filter(id=request_id).update(is_accepted=True)
        return JsonResponse({'status': 'success', 'message': 'Friend request accepted'}, status=200)

    except Exception as e:
        return JsonResponse({'status': 'error', 'message': 'Request id doesn\'t exist'}, status=400)


@csrf_protect
@permission_classes([IsAuthenticated])
@api_view(['POST'])
def refuse_friend_request(request, request_id):
    try:
        friendship_request = Friendship.objects.get(id=request_id)
        friendship_request.delete()
        return JsonResponse({'status': 'success', 'message': 'Friend request refused'}, status=200)

    except Exception as e:
        return JsonResponse({'status': 'error', 'message': 'Request id doesn\'t exist'}, status=400)


@csrf_protect
@permission_classes([IsAuthenticated])
@api_view(['POST'])
def remove_friend(request, username):
    try:
        user = request.user
        friend = User.objects.get(username=username)
        friendship_request = Friendship.objects.filter((Q(to_user=user.id, from_user=friend.id) | Q(to_user=friend.id, from_user=user.id)))
        friendship_request.delete()
        return JsonResponse({'status': 'success', 'message': 'Friend deleted'}, status=200)

    except Exception as e:
        return JsonResponse({'status': 'error', 'message': 'Friend username doesn\'t exist'}, status=400)

@csrf_protect
@permission_classes([IsAuthenticated])
@api_view(['POST'])
def send_text_to_blockchain(request):
    try:
        # Fetch the latest tournament instance created by the user based on the id
        tournament = Tournament.objects.filter(creator=request.user).latest('id')

        tournament.is_sent_to_blockchain = True
        tournament.save()
        # Initialize web3
        web3 = Web3(HTTPProvider('https://rpc2.sepolia.org'))
        # Private key and contract setup
        private_key = os.environ.get('PRIVATE_KEY')
        if private_key is None:
            return JsonResponse({'error': 'Private key not found'}, status=500)
        account = web3.eth.account.from_key(private_key)
        
        contract_address = os.getenv('CONTRACT_ADDRESS')
        contract_abi = [
        	{
        		"inputs": [
        			{
        				"internalType": "string",
        				"name": "data",
        				"type": "string"
        			}
        		],
        		"name": "setTournamentData",
        		"outputs": [],
        		"stateMutability": "nonpayable",
        		"type": "function"
        	},
        	{
        		"anonymous": False,
        		"inputs": [
        			{
        				"indexed": False,
        				"internalType": "string",
        				"name": "newTournamentData",
        				"type": "string"
        			}
        		],
        		"name": "TournamentDataSet",
        		"type": "event"
        	},
        	{
        		"inputs": [],
        		"name": "getTournamentData",
        		"outputs": [
        			{
        				"internalType": "string",
        				"name": "",
        				"type": "string"
        			}
        		],
        		"stateMutability": "view",
        		"type": "function"
        	}
        ]
        contract = web3.eth.contract(address=contract_address, abi=contract_abi)

        # Construct the tournament result string
        tournament_result = f"Tournament {tournament.name}"

        # Sort games by ID before processing
        sorted_games = sorted(tournament.games.all(), key=lambda game: game.id)

        count = 0
        for game in sorted_games:
            if game.ended:
                if count <= 3: # Assuming 4 games in Quarter
                    tournament_result += "\nQUARTER:\n"
                elif count <= 5: # Assuming 2 games in Semi
                    tournament_result += "\nSEMI:\n"
                else: # Final
                    tournament_result += "\nFINAL:\n"
                tournament_result += f"{game.user1.nickname} vs {game.user2.nickname} : {game.score_user1} - {game.score_user2}\n"
                tournament_result += f"winner : {game.winner.nickname}\n"
            count += 1

        tournament_result += f"\nTOURNAMENT WINNER : {tournament.winner.nickname}"

        # Estimate gas and send transaction
        nonce = web3.eth.get_transaction_count(account.address, 'pending') 
        
        tx_data = contract.encodeABI(fn_name="setTournamentData", args=[tournament_result])

        gas_limit = web3.eth.estimate_gas({
            'to': contract_address,
            'from': account.address,
            'data': tx_data,
        })

        maxFeePerGas = web3.to_wei('200', 'gwei')
        maxPriorityFeePerGas = web3.to_wei('10', 'gwei')

        # Construct the transaction
        tx = {
            'from': account.address,
            'to': contract_address,
            'data': tx_data,
            'gas': gas_limit,
            'maxFeePerGas': maxFeePerGas,
            'maxPriorityFeePerGas': maxPriorityFeePerGas,
            'nonce': nonce,
            'chainId': 11155111 # Sepolia chain ID
        }

        # Sign the transaction
        signed_tx = web3.eth.account.sign_transaction(tx, private_key)
        
        # Send the raw transaction
        tx_hash = web3.eth.send_raw_transaction(signed_tx.rawTransaction)
        
        # Wait for the transaction receipt
        tx_receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
        
        # Construct the transaction URL
        explorer_url = 'https://sepolia.etherscan.io/tx/' + tx_receipt['transactionHash'].hex()
        
        return JsonResponse({'status': 'success', 'transaction_url': explorer_url}, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@permission_classes([IsAuthenticated])
@api_view(['GET'])
def getProfileImg(request):
    try:
        user = request.user

        image_path = os.path.join(settings.MEDIA_ROOT, user.image.name)
        if not os.path.exists(image_path):
            User.objects.filter(username=user.username).update(image="profile_img.png")
            user = User.objects.get(username=user.username)
            image_path = os.path.join(settings.MEDIA_ROOT, user.image.name)

        content_type = 'image/jpeg'
        if user.image.name.lower().endswith('.png'):
            content_type = 'image/png'

        img = open(image_path, 'rb')
        response = FileResponse(img, content_type=content_type)
        return response

    except Exception as e:
        return Response({'status': 'error', 'error': str(e)}, status=400)


@csrf_exempt
@permission_classes([IsAuthenticated])
@api_view(['GET'])
def deleteProfileImg(request):
    try:
        user = request.user
        current_image_path = os.path.join(settings.MEDIA_ROOT, user.image.name)
        if user.image.name == 'profile_img.png':
            return JsonResponse({'status': 'error', 'message': "pdp-no"}, status=200)
        if os.path.exists(current_image_path) and current_image_path != "/app/backend/media_back/profile_img.png":
            os.remove(current_image_path)
        User.objects.filter(username=user.username).update(image="profile_img.png")

        return JsonResponse({'status': 'success', 'message': 'Profile picture deleted'}, status=200)

    except Exception as e:
        return Response({'status': 'error', 'error': str(e)}, status=400)


@csrf_protect
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_pdp(request):
    try:
        if 'new_pdp' not in request.FILES:
            return Response({'status': 'error', 'message': 'No file uploaded'}, status=400)

        new_pdp = request.FILES['new_pdp']

        if not 'image' in new_pdp.content_type:
            return Response({'status': 'error', 'message': 'File is not an image'}, status=400)

        if new_pdp.size > 1024 * 1024:
            return Response({'status': 'error', 'message': 'File too big'}, status=400)

        if not new_pdp.name.lower().endswith('.jpeg') and not new_pdp.name.lower().endswith('.png') and not new_pdp.name.lower().endswith('.jpg'):
            return Response({'status': 'error', 'message': 'File extension is wrong'}, status=400)
        
        user = request.user
        current_image_path = os.path.join(settings.MEDIA_ROOT, user.image.name)

        content_type = '.jpeg'
        if new_pdp.name.lower().endswith('.png'):
            content_type = '.png'

        base_path = 'media_back/'
        copy_path = os.path.join(base_path, user.username + content_type)
        
        os.makedirs(base_path, exist_ok=True)

        image_type = imghdr.what(new_pdp)
        if image_type is None:
            return Response({'status': 'error', 'message': 'pdp-incorrect'}, status=400)

        with open(copy_path, 'wb') as dst:
            for chunk in new_pdp.chunks():
                dst.write(chunk)

        User.objects.filter(username=user.username).update(image=user.username + content_type)
        new_path = os.path.join(settings.MEDIA_ROOT, user.image.name)

        if os.path.exists(current_image_path) and current_image_path != "/app/backend/media_back/profile_img.png" and current_image_path != new_path:
            os.remove(current_image_path)

        return Response("Success", status=200)

    except Exception as e:
        logger.error(f"An error occurred: {str(e)}")
        return Response({'status': 'error', 'message': 'An error occurred during update'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@csrf_exempt
@permission_classes([IsAuthenticated])
@api_view(['GET'])
def getFriendImg(request, username):
    try:
        user = User.objects.get(username=username)
        image_path = os.path.join(settings.MEDIA_ROOT, user.image.name)

        content_type = 'image/jpeg'
        if user.image.name.lower().endswith('.png'):
            content_type = 'image/png'

        img = open(image_path, 'rb')
        response = FileResponse(img, content_type='content_type')
    
        return response

    except Exception as e:
        return JsonResponse({'status': 'error', 'message': 'Friend username doesn\'t exist'}, status=400)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
@csrf_protect
def getHistory(request, username):
    try:
        user = User.objects.get(username=username)
        games = Game.objects.filter(Q(user1=user) | Q(user2=user)).order_by('-date')[:15]
        games_data = []
        for game in games:
            advers = '-1'
            if game.quickplay:
                advers = '0'
            if game.user2:
                advers = game.user2.username
            score_player = game.score_user1
            score_advers = game.score_user2
            if game.user1 == user:
                win = 'True' if game.winner == game.user1 else 'False'
            else:
                win = 'True' if game.winner == game.user2 else 'False'
            games_data.append({
                'id': game.id, 
                'date': game.date.strftime("%m-%d %H:%M"), 
                'player': game.user1.username, 
                'advers': advers, 
                'score_player': score_player, 
                'score_advers': score_advers, 
                'win': win
            })

        # Blockchain interaction starts here
        web3 = Web3(HTTPProvider('https://rpc2.sepolia.org'))
        contract_address = os.environ.get('CONTRACT_ADDRESS')
        contract_abi = [
            {
                "inputs": [
                    {
                        "internalType": "string",
                        "name": "data",
                        "type": "string"
                    }
                ],
                "name": "setTournamentData",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "anonymous": False,
                "inputs": [
                    {
                        "indexed": False,
                        "internalType": "string",
                        "name": "newTournamentData",
                        "type": "string"
                    }
                ],
                "name": "TournamentDataSet",
                "type": "event"
            },
            {
                "inputs": [],
                "name": "getTournamentData",
                "outputs": [
                    {
                        "internalType": "string",
                        "name": "",
                        "type": "string"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            }
        ]

        contract = web3.eth.contract(address=contract_address, abi=contract_abi)
        # Fetch all past TournamentDataSet events
        tournament_events = contract.events.TournamentDataSet().get_logs(fromBlock=5661626, toBlock='latest')
        # Extract tournament data from events
        tournaments = [event['args']['newTournamentData'] for event in tournament_events]
        return Response({
            'games': games_data,
            'tournaments': tournaments,
        }, status=200)

    except User.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Username doesn\'t exist'}, status=404)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)



@csrf_protect
@permission_classes([IsAuthenticated])
@api_view(['GET'])
def user_status(request, username):
    try:
        user = User.objects.get(username=username)
        return JsonResponse({'status': user.status})
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)



@csrf_protect
@permission_classes([IsAuthenticated])
@api_view(['POST'])
def create_player_tournament(request):
    try:
        serializer = UserTournamentSerializer(data=request.data)
        if serializer.is_valid():
            nickname = serializer.validated_data.get('nickname')
            nickname = nickname.upper()

            serializer.save()
            return JsonResponse(serializer.data, status=status.HTTP_201_CREATED)
        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"An error occurred: {str(e)}")
        return Response({'status': 'error', 'message': 'An error occurred during creation'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@csrf_protect
@permission_classes([IsAuthenticated])
@api_view(['POST'])
def create_game_tournament(request):
    try:
        logger.info(request.data);
        serializer = GameTournamentSerializer(data=request.data)
        if serializer.is_valid():

            serializer.save()
            return JsonResponse(serializer.data, status=status.HTTP_201_CREATED)
        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"An error occurred: {str(e)}")
        return Response({'status': 'error', 'message': 'An error occurred during creation'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@csrf_protect
@permission_classes([IsAuthenticated])
@api_view(['POST'])
def create_tournament(request):
    try:
        serializer = TournamentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=status.HTTP_201_CREATED)
        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"An error occurred: {str(e)}")
        return Response({'status': 'error', 'message': 'An error occurred during creation'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@csrf_protect
@permission_classes([IsAuthenticated])
@api_view(['GET'])
def check_tournament(request, creator_id):
    try:
        # check if the tournament is already created
        tournament = Tournament.objects.get(creator=creator_id, ended=False)
        serializer = TournamentSerializer(tournament)
        return JsonResponse({'exist': True}, status=200)
    except Tournament.DoesNotExist:
        return JsonResponse({'exist': False}, status=200)


@csrf_protect
@permission_classes([IsAuthenticated])
@api_view(['GET'])
def get_tournament(request, creator_id):
    try:
        # check if the tournament is already created
        tournament = Tournament.objects.get(creator=creator_id, ended=False)
        serializer = TournamentSerializer(tournament)
        return JsonResponse(serializer.data, status=200)
    except Tournament.DoesNotExist:
        return JsonResponse({'error': 'No ongoing tournament found'}, status=404)


@csrf_protect
@permission_classes([IsAuthenticated])
@api_view(['GET'])
def get_user_tournament(request, pk):
    try:
        user = UserTournament.objects.get(pk=pk)
        serializer = UserTournamentSerializer(user)
        return JsonResponse(serializer.data, status=200)
    except UserTournament.DoesNotExist:
        return JsonResponse({'error': 'Game not found'}, status=404)


@csrf_protect
@permission_classes([IsAuthenticated])
@api_view(['GET'])
def get_game_tournament(request, pk):
    try:
        game = GameTournament.objects.get(pk=pk)
        serializer = GameTournamentSerializer(game)
        return JsonResponse(serializer.data, status=200)
    except GameTournament.DoesNotExist:
        return JsonResponse({'error': 'Game not found'}, status=404)


@csrf_protect
@permission_classes([IsAuthenticated])
@api_view(['GET'])
def get_current_game_tournament(request, pkTournament):
    try:
        tournament = Tournament.objects.get(pk=pkTournament)
        first_unfinished_game = tournament.games.filter(ended=False).order_by('game_number').first()
        serializer = GameTournamentSerializer(first_unfinished_game)
        return JsonResponse(serializer.data, status=200)
    except GameTournament.DoesNotExist:
        return JsonResponse({'error': 'Game not found'}, status=404)


@csrf_protect
@permission_classes([IsAuthenticated])
@api_view(['PATCH'])
def update_game_tournament(request, pk):
    try:
        game = GameTournament.objects.get(pk=pk)
    except GameTournament.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    serializer = GameTournamentSerializer(game, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@csrf_protect
@permission_classes([IsAuthenticated])
@api_view(['PATCH'])
def update_ongoing_game_tournament(request, pk):
    try:
        tournament = Tournament.objects.get(pk=pk)
        tournament.ongoingGame += 1
        if tournament.ongoingGame == 7:
            seventh_game = tournament.games.order_by('game_number')[6]
            tournament.winner = seventh_game.winner
        tournament.save()
    except Tournament.DoesNotExist:
        return Response({'error': 'Tournament not found'}, status=status.HTTP_404_NOT_FOUND)
    serializer = TournamentSerializer(tournament)
    return JsonResponse(serializer.data, status=200)


@csrf_protect
@permission_classes([IsAuthenticated])
@api_view(['PATCH'])
def update_tournament(request, pk):
    try:
        tournament = Tournament.objects.get(pk=pk)
    except Tournament.DoesNotExist:
        return Response({'error': 'Tournament not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = TournamentSerializer(tournament, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    
@csrf_protect
@api_view(['POST'])
def update_status(request, status):
    try:
        user = request.user
        User.objects.filter(username=user.username).update(status=status)
        return Response({'status': 'succes', 'message': 'Status updated'}, status=200)

    except Exception as e:
        logger.error(f"An error occurred: {str(e)}")
        return Response({'status': 'error', 'message': 'An error occurred during update'}, status=400)


@csrf_protect
@api_view(['POST'])
def set_offline(request, username):
    try:
        User.objects.filter(username=username).update(status='offline')
        return Response({'status': 'succes', 'message': 'Status updated'}, status=200)

    except Exception as e:
        logger.error(f"An error occurred: {str(e)}")
        return Response({'status': 'error', 'message': 'An error occurred during update'}, status=400)


@csrf_protect
@permission_classes([IsAuthenticated])
@api_view(['GET'])
def user_42(request):
    try:
        user = request.user
        return JsonResponse({'is_42': user.is_42})

    except Exception as e:
        return Response({'status': 'error', 'error': str(e)}, status=400)


@csrf_protect
@permission_classes([IsAuthenticated])
@api_view(['POST'])
def check_password(request):
    try:
        data = request.data
        username = data.get("username")
        password = data.get("password")
        user = authenticate(request, username=username, password=password)
        if user is not None:
            return JsonResponse({'status': 'success', 'message': 'Password is correct'})
        else:
            return JsonResponse({'status': 'error', 'message': 'Password is incorrect'}, status=400)

    except Exception as e:
        return Response({'status': 'error', 'error': str(e)}, status=400)


@csrf_protect
@permission_classes([IsAuthenticated])
@api_view(['POST'])
def change_password(request):
    try:
        data = request.data
        old_pass = data.get('old_pass')
        conf_pass = data.get('conf_pass')
        password = data.get("password")
        if conf_pass != password:
            return JsonResponse({'status': 'error', 'message': 'New passwords are not the same'}, status=400)
        user = authenticate(request, username=request.user.username, password=old_pass)
        if user is None:
            return JsonResponse({'status': 'error', 'message': 'Old Password is incorrect'}, status=400)
        if len(password) < 6:
            return JsonResponse({'status': 'error', 'message': 'Password is too small'}, status=400)
        request.user.set_password(password)
        request.user.save()
        update_session_auth_hash(request, request.user)
        return JsonResponse({'status': 'success', 'message': 'Password changed successfully'}, status=200)

    except Exception as e:
        return Response({'status': 'error', 'error': str(e)}, status=400)


@csrf_protect
@permission_classes([IsAuthenticated])
@api_view(['PATCH'])
def update_game_won(request, pk):
    try:
        user = User.objects.get(pk=pk)
        user.games_won += 1
        user.games_played += 1
        user.save()
        return JsonResponse({'status': 'success', 'message': 'Game won updated', 'games_played': user.games_played, 'games_won': user.games_won, 'games_lost': user.games_lost}, status=200)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_protect
@permission_classes([IsAuthenticated])
@api_view(['PATCH'])
def update_game_lost(request, pk):
    try:
        user = User.objects.get(pk=pk)
        user.games_lost += 1
        user.games_played += 1
        user.save()
        return JsonResponse({'status': 'success', 'message': 'Game lost updated', 'games_played': user.games_played, 'games_won': user.games_won, 'games_lost': user.games_lost}, status=200)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_protect
@permission_classes([IsAuthenticated])
@api_view(['GET'])
def is_username_available(request, username):
    try:
        user = User.objects.get(username=username)
        return JsonResponse({'available': False}, status=200)
    except User.DoesNotExist:
        return JsonResponse({'available': True}, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_protect
@permission_classes([IsAuthenticated])
@api_view(['PATCH'])
def update_user_language(request):
    try:
        username = request.data.get('username')
        language = request.data.get('language')

        user = User.objects.get(username=username)
        user.language = language
        user.save()
        return JsonResponse({'status': 'success', 'message': 'Language updated'}, status=200)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)