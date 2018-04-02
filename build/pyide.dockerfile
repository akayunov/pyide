FROM debian:buster-slim

ENV DEBIAN_FRONTEND=noninteractive

COPY requirement.txt /tmp
RUN apt-get update && apt-get -y install python3 python3-pip
RUN pip3 install -U pip
RUN pip install -r /tmp/requirement.txt

ENV PYTHONPATH=/opt/pyide/src

CMD 'python3' '-m' 'pyide'

