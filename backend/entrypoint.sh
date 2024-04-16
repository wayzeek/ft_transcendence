#!/bin/ash
# exits if error happens
set -e

while ! nc -z $POSTGRES_HOST $POSTGRES_PORT
do
 echo 'Waiting for postgres...'
 sleep 0.5
done;

echo "cd into project directory"
cd backend
echo "Apply db migration"
python3 manage.py makemigrations django_api
python3 manage.py migrate

# exec replace the shell without creating a new process
# great to handle signals (docker stop)
# Use runserver_plus from django-extensions for HTTPS support
#exec python3 manage.py runserver_plus 0.0.0.0:8000 --cert-file /app/localhost.crt --key-file /app/localhost.key
exec gunicorn -b 0.0.0.0:8000 --certfile /app/localhost.crt --keyfile /app/localhost.key backend.wsgi:application
