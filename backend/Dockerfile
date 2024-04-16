FROM python:alpine3.19

# prevent Python from writing .pyc files, output is sent directly to the terminal
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1

WORKDIR /app

RUN pip install --upgrade pip
COPY ./requirements.txt .
RUN apk update && \
    apk add git && \
    apk add --no-cache gcc musl-dev python3-dev && \
    pip install -r requirements.txt


COPY ./entrypoint.sh .

COPY ./certs/localhost.crt /app/localhost.crt
COPY ./certs/localhost.key /app/localhost.key


RUN chmod +x ./entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]
