FROM python:3.11-slim

RUN apt update && apt-get install -y ca-certificates \
	&& apt install -y libpq-dev && apt install -y gcc make  

RUN apt install -y --no-install-recommends && \
	apt install -y nginx

RUN	rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY app .

RUN pip install --upgrade pip --root-user-action=ignore && pip  install -r requirements.txt --root-user-action=ignore

COPY scripts/buildApp.sh /

RUN chmod 777 /buildApp.sh


CMD ["/buildApp.sh"]
