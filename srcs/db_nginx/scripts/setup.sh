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
        server_name localhost; 
        root /usr/share/nginx/html/;

        ssl_certificate $PATH_CRT/crt.crt;
        ssl_certificate_key $PATH_CRT/crt.key;
        location / {
            alias  /usr/share/nginx/html/;
            index home.html;
        }
        location /home {
            alias  /usr/share/nginx/html/user;
            index home.html;
        }
        location /login {
            alias  /usr/share/nginx/html/user;
            index login.html;
        }
        location /register {
            alias  /usr/share/nginx/html/user;
            index register.html;
        }
         location /2faa {
            alias  /usr/share/nginx/html/user;
            index 2faa.html;
        }
        location /settings {
            alias  /usr/share/nginx/html/user;
            index settings.html;
        }
        location /chat {
            alias /usr/share/nginx/html/chat/;
            index index.html;
        }
        location /game {
            alias /usr/share/nginx/html/game;
            index game.html;
        }
        location /multi {
            alias /usr/share/nginx/html/game;
            index multi.html;
        }
        location /local {
            alias /usr/share/nginx/html/game;
            index local.html;
        }
        location /profile {
            alias /usr/share/nginx/html/user;
            index profile.html;
        }
        location /landingpage {
            alias /usr/share/nginx/html/landingpage;
            index landingpage.html;
        }
        location /resetpassword {
            alias /usr/share/nginx/html/user;
            index resetpassword.html;
        }
        location /reset{
            alias /usr/share/nginx/html/user;
            index reset.html;
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
echo "database is ready"
touch /is_ready/user_management
nginx -g "daemon off;"
