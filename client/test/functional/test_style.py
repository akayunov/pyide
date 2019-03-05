from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as ec
from selenium.webdriver.support.ui import WebDriverWait


def test_first_line_color(driver_ff_function, pyide_base_url):
    driver_ff_function.get(pyide_base_url)
    testmodule1 = WebDriverWait(driver_ff_function, 5).until(ec.presence_of_element_located((By.PARTIAL_LINK_TEXT, 'testmodule1')))
    testmodule1.click()
    third_element = WebDriverWait(driver_ff_function, 5).until(ec.presence_of_element_located((By.CSS_SELECTOR, '[tabindex="3"]')))
    fourth_element = WebDriverWait(driver_ff_function, 5).until(ec.presence_of_element_located((By.CSS_SELECTOR, '[tabindex="4"]')))
    assert 'rgb(240, 255, 239)' == third_element.value_of_css_property('background-color')
    assert 'rgb(249, 251, 255)' == fourth_element.value_of_css_property('background-color')
