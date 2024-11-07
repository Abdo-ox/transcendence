FROM python:3.11-slim

RUN apt update && apt-get install -y ca-certificates \
	&& apt install -y libpq-dev && apt install -y gcc make  

RUN apt update && apt install -y --no-install-recommends && \
	apt install -y nginx && apt update && apt install -y curl

RUN	rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY certs certs

COPY user_management/app/requirements.txt .

RUN pip install --upgrade pip --root-user-action=ignore && pip  install -r requirements.txt --root-user-action=ignore

COPY user_management/app .

COPY user_management/scripts/buildApp.sh /

RUN chmod 777 /buildApp.sh


CMD ["/buildApp.sh"]