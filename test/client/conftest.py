import os
import sys
import pytest

from selenium.webdriver.firefox.firefox_binary import FirefoxBinary
from selenium import webdriver


@pytest.fixture(scope='module')
def driver_ff():
    binary = FirefoxBinary('/opt/firefox/firefox-bin', log_file=sys.stdout)
    return webdriver.Firefox(firefox_binary=binary, log_path=os.path.join('/', os.path.dirname(__file__), '..', '..', 'tmp', 'geckodriver.log'))
