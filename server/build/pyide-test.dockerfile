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

RUN pip install \
    asn1crypto==0.24.0 \
    astroid==2.2.5 \
    atomicwrites==1.3.0 \
    attrs==19.1.0 \
    certifi==2019.3.9 \
    chardet==3.0.4 \
    coverage==4.5.3 \
    coveralls==1.7.0 \
    cryptography==2.6.1 \
    docopt==0.6.2 \
    entrypoints==0.3 \
    idna==2.8 \
    isort==4.3.17 \
    keyring==17.1.1 \
    keyrings.alt==3.1.1 \
    lazy-object-proxy==1.3.1 \
    mccabe==0.6.1 \
    more-itertools==7.0.0 \
    pip==19.0.3 \
    pluggy==0.9.0 \
    py==1.8.0 \
    pycodestyle==2.5.0 \
    pycrypto==2.6.1 \
    pyflakes==2.1.1 \
    pylint==2.3.1 \
    pytest==4.4.1 \
    pytest-cov==2.6.1 \
    pyxdg==0.25 \
    requests==2.21.0 \
    SecretStorage==2.3.1 \
    setuptools==40.8.0 \
    six==1.12.0 \
    typed-ast==1.3.1 \
    urllib3==1.24.1 \
    wheel==0.32.3 \
    wrapt==1.11.1
    #PyGObject==3.30.4

RUN useradd -m -s /bin/bash $UNAME
USER $UNAME
WORKDIR /home/$UNAME

#docker build -f pyide-test.dockerfile  -t akayunov/pyide-test:0.1 .
