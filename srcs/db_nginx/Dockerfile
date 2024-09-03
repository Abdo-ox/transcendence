FROM debian:12

ARG CRT_PATH

RUN apt update && apt install -y  nginx &&\
    apt install -y postgresql-15 &&\
    apt install -y systemd

COPY ./scripts/setup.sh .

COPY ./scripts/pg_hba.conf /etc/postgresql/15/main
COPY ./scripts/postgresql.conf /etc/postgresql/15/main

RUN chmod 777 setup.sh

RUN apt update && apt install openssl > /dev/null 2>&1 
RUN mkdir -p $CRT_PATH

RUN openssl genpkey -algorithm RSA -out $CRT_PATH/my.key > /dev/null 2>&1 
RUN openssl req -new -key $CRT_PATH/my.key -out $CRT_PATH/my.csr -subj "/CN=localhost" > /dev/null 2>&1 
RUN openssl x509 -req -days 365 -in $CRT_PATH/my.csr -signkey $CRT_PATH/my.key -out $CRT_PATH/my.crt > /dev/null 2>&1 

CMD ["/setup.sh"]