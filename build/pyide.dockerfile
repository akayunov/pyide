FROM debian:buster-slim

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get -y install python3 python3-pip
RUN pip3 install -U pip

COPY requirement-dev.txt /tmp
RUN pip install -r /tmp/requirement-dev.txt

ENV PYTHONPATH=/opt/pyide/src
CMD 'python3' '-m' 'pyide'
