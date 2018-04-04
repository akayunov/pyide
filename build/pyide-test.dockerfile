FROM registry.hub.docker.com/akayunov/pyide-test:firefox-59.0.2-geckodriver-v0.20.0-linux64

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get -y install python3 python3-pip
RUN pip3 install -U pip

COPY requirement-test.txt /tmp
RUN pip install -r /tmp/requirement-test.txt
