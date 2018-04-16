import pytest
import time
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as ec
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains


def test_basic(driver_ff_function, pyide_base_url):
    driver_ff_function.get(pyide_base_url)
    testmodule1 = WebDriverWait(driver_ff_function, 5).until(ec.presence_of_element_located((By.PARTIAL_LINK_TEXT, 'testmodule1')))
    testmodule1.click()
    element = WebDriverWait(driver_ff_function, 5).until(ec.presence_of_element_located((By.CSS_SELECTOR, '[tabindex="22"]')))
    element.click()
    actions = ActionChains(driver_ff_function)
    actions.send_keys(Keys.ENTER + 'Tra')
    actions.perform()

    time.sleep(1)
    active_auc = WebDriverWait(driver_ff_function, 5).until(ec.presence_of_element_located((By.ID, 'active-autocomplete')))
    auc_postfix = WebDriverWait(driver_ff_function, 5).until(ec.presence_of_element_located((By.ID, 'autocomplete-postfix')))

    assert 'Tratata' == active_auc.text
    assert 'tata' == auc_postfix.text

    actions = ActionChains(driver_ff_function)
    actions.send_keys('tata')
    actions.perform()
    time.sleep(1)
    actions = ActionChains(driver_ff_function)
    actions.send_keys(Keys.SPACE)
    actions.perform()

    with pytest.raises(NoSuchElementException, message='Message: Unable to locate element: [id="active-autocomplete"]'):
        driver_ff_function.find_element_by_id('active-autocomplete')
