#!/bin/bash

sudo apt-get install python3-venv
/opt/python3/bin/python3 -m venv v
v/bin/pip3 install -U pip
v/bin/pip3 install -r requirement.txt