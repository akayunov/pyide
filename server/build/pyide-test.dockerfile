FROM registry.hub.docker.com/akayunov/pyide:0.1

USER root

RUN apt-get install -y \
    libxtst6 \
    libxrender1 \
    libfreetype6 \
    git

RUN pip install \
    coverage==4.5.3 \
    coveralls==1.7.0 \
    pycodestyle==2.5.0 \
    pyflakes==2.1.1 \
    pylint==2.3.1 \
    pytest==4.4.1 \
    pytest-cov==2.6.1 \
    requests==2.21.0

USER pyide

#docker build -f pyide-test.dockerfile  -t akayunov/pyide-test:0.1 .
