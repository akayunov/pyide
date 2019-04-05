FROM debian:buster-slim

ENV DEBIAN_FRONTEND=noninteractive
ENV NODE_PATH=/usr/local/lib/node_modules

ARG UNAME=pyide

RUN apt-get update && apt-get install -y nodejs wget git
RUN apt-get update && apt-get install -y npm

RUN npm install -g typescript webpack webpack-cli awesome-typescript-loader source-map-loader mocha selenium-webdriver
RUN npm install -g  --unsafe-perm=true --allow-root  --save-dev  chromedriver

RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN echo 'deb http://dl.google.com/linux/chrome/deb/ stable main' >> /etc/apt/sources.list

RUN apt-get update && apt-get install -y google-chrome-stable

RUN useradd -m -s /bin/bash $UNAME
USER $UNAME
WORKDIR /home/$UNAME

#docker build -f Dockerfile  -t pyide-client-test .
