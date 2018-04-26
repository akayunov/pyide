import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as ec
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys


def test_go_to_def_attribute(driver_ff_function, pyide_base_url):
    driver_ff_function.get(pyide_base_url)
    WebDriverWait(driver_ff_function, 5).until(ec.presence_of_element_located((By.PARTIAL_LINK_TEXT, 'testmodule1'))).click()

    WebDriverWait(driver_ff_function, 5).until(ec.presence_of_element_located((By.CSS_SELECTOR, '[tabindex="60"]')))

    ActionChains(driver_ff_function).send_keys(Keys.PAGE_DOWN * 2).perform()

    attribute_coordinate = driver_ff_function.execute_script(''' return document.querySelector('[tabindex="60"]').children[1].getBoundingClientRect() ''')

    ActionChains(driver_ff_function).move_by_offset(xoffset=attribute_coordinate['x'] + 2, yoffset=attribute_coordinate['y'] + 2).perform()

    time.sleep(1)
    ActionChains(driver_ff_function).key_down(Keys.CONTROL).click().key_up(Keys.CONTROL).perform()
    time.sleep(1)

    assert '    def repeate(self):' == driver_ff_function.execute_script(''' return document.querySelector('.cursor').parentElement.parentElement''').text

    # click again don't do go to definition, ctrl clearing is works
    attribute = driver_ff_function.execute_script(''' return document.querySelector('[tabindex="60"]').children[1] ''')
    ActionChains(driver_ff_function).send_keys(Keys.PAGE_DOWN * 2).perform()
    time.sleep(1)
    ActionChains(driver_ff_function).move_to_element(attribute).perform()

    time.sleep(1)
    ActionChains(driver_ff_function).click().perform()
    time.sleep(1)

    assert 'Tratata.repeate(1)' == driver_ff_function.execute_script(''' return document.querySelector('.cursor').parentElement.parentElement''').text


def test_go_to_def_class(driver_ff_function, pyide_base_url):
    driver_ff_function.get(pyide_base_url)
    WebDriverWait(driver_ff_function, 5).until(ec.presence_of_element_located((By.PARTIAL_LINK_TEXT, 'testmodule1'))).click()

    WebDriverWait(driver_ff_function, 5).until(ec.presence_of_element_located((By.CSS_SELECTOR, '[tabindex="60"]')))

    ActionChains(driver_ff_function).send_keys(Keys.PAGE_DOWN * 2).perform()

    attribute = driver_ff_function.execute_script(''' return document.querySelector('[tabindex="60"]').children[0].getBoundingClientRect() ''')

    ActionChains(driver_ff_function).move_by_offset(xoffset=attribute['x'] + 2, yoffset=attribute['y'] + 2).click().perform()

    time.sleep(1)
    ActionChains(driver_ff_function).key_down(Keys.CONTROL).click().key_up(Keys.CONTROL).perform()
    time.sleep(1)

    assert 'class Tratata(object):' == driver_ff_function.execute_script(''' return document.querySelector('.cursor').parentElement.parentElement ''').text
