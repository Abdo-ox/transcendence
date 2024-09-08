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

        ssl_certificate $PATH_CRT/my.crt;
        ssl_certificate_key $PATH_CRT/my.key;
        location /user {
            add_header 'Access-Control-Allow-Origin' 'https://localhost:8000' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type' always;
            add_header 'Access-Control-Allow-Credentials' 'true' always;
            root  /usr/share/nginx/html;
            index home.html;

            if (\$request_method = OPTIONS) {
                add_header 'Access-Control-Allow-Origin' 'https://localhost';
                add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
                add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type';
                add_header 'Access-Control-Allow-Credentials' 'true';
                return 204;
            }
        }
        
        location /chat {
            alias /usr/share/nginx/html/chat/;
            index index.html;
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
