FROM node:alpine
ENV CHROME_BIN="/usr/bin/chromium-browser"
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD="true"
RUN set -x && apk update && apk upgrade && apk add --no-cache udev ttf-freefont chromium ca-certificates && update-ca-certificates && mkdir -p /usr/cck-hrpms
WORKDIR /usr/cck-hrpms
COPY . .
VOLUME ["/usr/cck-hrpms/resources/logs", "/usr/cck-hrpms/resources/uploads"]
RUN npm install
EXPOSE 3000
CMD ["node", "index.js"]

