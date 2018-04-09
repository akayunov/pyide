import os
import sys
import pytest

from selenium.webdriver.firefox.firefox_binary import FirefoxBinary
from selenium.webdriver.firefox.options import Options
from selenium import webdriver


@pytest.fixture(scope='session')
def code_base_url():
    return 'http://pyide:31415/server/code/'


@pytest.fixture(scope='function')
def driver_ff_function():
    binary = FirefoxBinary('/opt/firefox/firefox-bin', log_file=sys.stdout)
    options = Options()
    options.set_headless()
    _webdriver = webdriver.Firefox(
        firefox_binary=binary,
        log_path=os.path.join('/', os.path.dirname(__file__), '..', '..', 'tmp', 'geckodriver.log'),
        options=options,
        executable_path='/opt/geckodriver/geckodriver'
    )
    yield _webdriver
    _webdriver.close()
