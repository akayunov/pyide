FROM registry.hub.docker.com/akayunov/pyide:0.1

USER root

RUN apt-get install -y \
    libxtst6 \
    libxrender1 \
    libfreetype6 \
    git \
    telnet

RUN pip install \
    aiohttp==3.5.4 \
    argh==0.26.2 \
    asn1crypto==0.24.0 \
    astroid==2.2.5 \
    async-timeout==3.0.1 \
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
    multidict==4.5.2 \
    pathtools==0.1.2 \
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
    PyYAML==5.1 \
    requests==2.21.0 \
    SecretStorage==2.3.1 \
    setuptools==40.8.0 \
    six==1.12.0 \
    tornado==6.0.2 \
    typed-ast==1.3.4 \
    urllib3==1.24.2 \
    watchdog==0.9.0 \
    wheel==0.32.3 \
    wrapt==1.11.1 \
    yarl==1.3.0
    #PyGObject==3.30.4

USER pyide

#docker build -f pyide-test.dockerfile  -t akayunov/pyide-test:0.1 .
