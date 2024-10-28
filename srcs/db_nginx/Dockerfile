FROM debian:12

ARG CRT_PATH

RUN apt update && apt install -y  nginx  &&\
    apt install -y postgresql-15 &&\
    apt install -y systemd

    
COPY ./db_nginx/scripts/pg_hba.conf /etc/postgresql/15/main
COPY ./db_nginx/scripts/postgresql.conf /etc/postgresql/15/main


RUN mkdir -p $CRT_PATH

COPY ./db_nginx/scripts/setup.sh .
COPY certs/ $CRT_PATH

RUN chmod 777 setup.sh

CMD ["/setup.sh"]