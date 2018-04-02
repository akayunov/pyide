FROM debian:buster-slim

ENV DEBIAN_FRONTEND=noninteractive

COPY requirement.txt /tmp
RUN apt-get update && apt-get -y install python3 python3-pip
RUN pip3 install -U pip
RUN pip install -r /tmp/requirement.txt

RUN apt-get -y install libgtk-3-0 libdbus-glib-1-2 libxt6
RUN mkdir -p /opt/geckodriver
ADD geckodriver-v0.20.0-linux64.tar.gz /opt/geckodriver
ADD firefox-59.0.2.tar.bz2 /opt

ENV PATH="/opt/geckodriver:${PATH}"
ENV MOZ_HEADLESS=1