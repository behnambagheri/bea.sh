FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Custom nginx config to serve the static site and the Markdown profile to curl/wget/httpie.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Site assets (explicit allowlist so repo/config files are never served)
COPY index.html styles.css script.js llms.txt robots.txt sitemap.xml ./
COPY public ./public
