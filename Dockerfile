FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Custom nginx config to serve static site and return a fun message for curl/wget/httpie.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Site assets
COPY . .
