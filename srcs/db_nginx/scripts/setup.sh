#!/bin/bash

chown -R postgres:postgres /var/lib/postgresql/15/main
chown -R postgres:postgres /etc/postgresql/15/main
chown -R postgres:postgres /var/log/postgresql
service postgresql start 
psql -U $DB_USER -c "create database $DB_NAME;"
if [ $? -eq 0 ];then
    echo "enter"
    psql -U $DB_USER -c "alter user $DB_USER with password '${DB_PASS}'"
fi
sed -i "s/localhost/$IP/g" /usr/share/nginx/html/html/*.html
sed -i "s/localhost/$IP/g" /usr/share/nginx/html/script/*

cat << EOF > /etc/nginx/nginx.conf
user www-data;
worker_processes auto;
pid /run/nginx.pid;
error_log /var/log/nginx/error.log;
events {}


http {
    include       /etc/nginx/mime.types;
    server {
        listen 443 ssl;
        server_name localhost $IP;
        
        root /usr/share/nginx/html/;
        try_files /html/SPA.html =404;

        ssl_certificate $PATH_CRT/crt.crt;
        ssl_certificate_key $PATH_CRT/crt.key;

        location ~* ^/(landingpage|register|login|home|confirmationMail|profile|settings|2faa|resetpassword|reset|chat|game|multi|local|tournament|remotetournament|fr-tournament)$ {
            add_header 'Access-Control-Allow-Origin' '*' always; 
            root /usr/share/nginx/html/;
            try_files /html/SPA.html =404;
        }
        location ~ \.html$ {
            add_header 'Access-Control-Allow-Origin' '*' always; 
            root  /usr/share/nginx/html/html;
        }
        location ~ \.css$ {
            add_header 'Access-Control-Allow-Origin' '*' always; 
            root  /usr/share/nginx/html/style;
        }
        location ~ \.js$ {
            add_header 'Access-Control-Allow-Origin' '*' always; 
            root  /usr/share/nginx/html/script;
        }
        location /images {
            add_header 'Access-Control-Allow-Origin' '*' always; 
            alias  /usr/share/nginx/html/images;
        }
        location /loading {
            add_header 'Access-Control-Allow-Origin' '*' always; 
            alias  /usr/share/nginx/html/html;
            index loading.html;
        }
    }
    server {
        listen 80;
        server_name localhost;

        location / {
            return 301 https://\$host\$request_uri;
        }
    }
}
EOF

nginx -g "daemon off;"