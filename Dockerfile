FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Custom nginx config to serve static site and return a fun message for curl/wget/httpie.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Site assets (explicit allowlist so repo/config files are never served)
COPY index.html styles.css script.js ./
COPY public ./public
