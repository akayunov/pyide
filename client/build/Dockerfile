FROM debian:buster-slim

ENV DEBIAN_FRONTEND=noninteractive
ENV NODE_PATH=/usr/lib/node_modules

ARG UNAME=pyide

RUN apt-get update && apt-get install -y \
    apt-utils

RUN apt-get update && apt-get install -y \
    wget \
    git

RUN wget -q -O - https://deb.nodesource.com/setup_10.x | bash -
RUN apt-get install -y nodejs=10.15.3-1nodesource1

RUN npm install -g \
    typescript@3.4.1 \
    webpack@4.29.6 \
    webpack-cli@3.3.0 \
    awesome-typescript-loader@5.2.1 \
    source-map-loader@0.2.4 \
    mocha@6.0.2 selenium-webdriver@3.6.0

RUN npm install -g  --unsafe-perm=true --allow-root  --save-dev \
    chromedriver@2.46.0

RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN echo 'deb http://dl.google.com/linux/chrome/deb/ stable main' >> /etc/apt/sources.list

RUN apt-get update && apt-get install -y \
    google-chrome-stable=73.0.3683.103-1

RUN useradd -m -s /bin/bash $UNAME
USER $UNAME
WORKDIR /home/$UNAME

#docker build -f Dockerfile  -t akayunov/pyide-client-test:0.1 .
