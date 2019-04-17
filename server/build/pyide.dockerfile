FROM debian:buster-slim

ENV DEBIAN_FRONTEND=noninteractive
ARG UNAME=pyide

RUN apt-get update && apt-get install -y \
    apt-utils

RUN apt-get update && apt-get -y install \
    python3=3.7.2-1 \
    python3-pip=18.1-5

RUN pip3 install -U \
    pip

#RUN pip install tornado aiohttp

RUN pip install \
    aiohttp==3.5.4 \
    asn1crypto==0.24.0 \
    async-timeout==3.0.1 \
    attrs==19.1.0 \
    chardet==3.0.4 \
    cryptography==2.6.1 \
    entrypoints==0.3 \
    idna==2.8 \
    keyring==17.1.1 \
    keyrings.alt==3.1.1 \
    multidict==4.5.2 \
    pip==19.0.3 \
    pycrypto==2.6.1 \
    pyxdg==0.25 \
    SecretStorage==2.3.1 \
    setuptools==40.8.0 \
    six==1.12.0 \
    tornado==6.0.2 \
    wheel==0.32.3 \
    yarl==1.3.0
    #PyGObject==3.30.4

RUN useradd -m -s /bin/bash $UNAME
USER $UNAME
WORKDIR /home/$UNAME

#docker build -f pyide.dockerfile  -t akayunov/pyide:0.1 .
