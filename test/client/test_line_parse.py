import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as ec
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains


def test_line_parse_basic(driver_ff_function, pyide_base_url):
    driver_ff_function.get(pyide_base_url)

    WebDriverWait(driver_ff_function, 5).until(ec.presence_of_element_located((By.PARTIAL_LINK_TEXT, 'testmodule1'))).click()

    WebDriverWait(driver_ff_function, 5).until(ec.presence_of_element_located((By.CSS_SELECTOR, '[tabindex="10"]'))).click()

    ActionChains(driver_ff_function).send_keys('pass' + Keys.SPACE).perform()

    time.sleep(1)
    assert 'pass' == driver_ff_function.execute_script(''' return document.querySelector('[tabindex="10"]').childNodes[0]''').text
    assert 'SPAN' == driver_ff_function.execute_script(''' return document.querySelector('[tabindex="10"]').childNodes[0].tagName''')
    assert 'keyword' == driver_ff_function.execute_script(''' return document.querySelector('[tabindex="10"]').childNodes[0].className''')

# тест на то что если после пробела быстро нажать еще букву то она после парсинга пропадет