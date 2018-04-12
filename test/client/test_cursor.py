import time
import pytest
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.support import expected_conditions as ec
from selenium.webdriver.support.ui import WebDriverWait


def test_init(driver_ff_function, pyide_base_url):
    driver_ff_function.get(pyide_base_url)
    testmodule1 = WebDriverWait(driver_ff_function, 5).until(ec.presence_of_element_located((By.PARTIAL_LINK_TEXT, 'testmodule1')))
    testmodule1.click()
    WebDriverWait(driver_ff_function, 5).until(ec.presence_of_element_located((By.CSS_SELECTOR, '[tabindex="2"]')))
    assert 'i' == driver_ff_function.find_element_by_class_name('cursor').text


def test_empty(driver_ff_function, pyide_base_url):
    driver_ff_function.get(pyide_base_url)
    empty_py = WebDriverWait(driver_ff_function, 5).until(ec.presence_of_element_located((By.PARTIAL_LINK_TEXT, 'empty')))
    empty_py.click()
    time.sleep(1)
    assert ' ' == driver_ff_function.find_element_by_class_name('cursor').text
    assert ' ' == driver_ff_function.find_element_by_id('to-remove').text


def test_new_line_at_the_end(driver_ff_function, pyide_base_url):
    driver_ff_function.get(pyide_base_url)
    onelinewithoutnewline = WebDriverWait(driver_ff_function, 5).until(ec.presence_of_element_located((By.PARTIAL_LINK_TEXT, 'onelinewithoutnewline')))
    onelinewithoutnewline.click()
    time.sleep(1)
    element = driver_ff_function.find_element_by_css_selector('[tabindex="1"]')
    element.send_keys(Keys.END)
    assert ' ' == driver_ff_function.find_element_by_class_name('cursor').text
    assert ' ' == driver_ff_function.find_element_by_id('to-remove').text


def test_move_right(driver_ff_function, pyide_base_url):
    driver_ff_function.get(pyide_base_url)
    testmodule1 = WebDriverWait(driver_ff_function, 5).until(ec.presence_of_element_located((By.PARTIAL_LINK_TEXT, 'testmodule1')))
    testmodule1.click()

    WebDriverWait(driver_ff_function, 5).until(ec.presence_of_element_located((By.CSS_SELECTOR, '[tabindex="2"]')))

    actions = ActionChains(driver_ff_function)
    actions.send_keys(Keys.ARROW_RIGHT * 31)
    actions.perform()
    assert 'h' == driver_ff_function.find_element_by_class_name('cursor').text

    with pytest.raises(NoSuchElementException, message='Message: Unable to locate element: [id="to-remove"]'):
        driver_ff_function.find_element_by_id('to-remove').text  # pylint: disable=expression-not-assigned

    actions = ActionChains(driver_ff_function)
    actions.send_keys(Keys.ARROW_RIGHT)
    actions.perform()
    assert ' ' == driver_ff_function.find_element_by_class_name('cursor').text
    assert ' ' == driver_ff_function.find_element_by_id('to-remove').text

    actions = ActionChains(driver_ff_function)
    actions.send_keys(Keys.ARROW_RIGHT)
    actions.perform()
    # cursor go on next line
    assert '2' == driver_ff_function.execute_script('''return document.getElementsByClassName('cursor')[0].parentNode.parentNode''').get_attribute('tabIndex')

    actions = ActionChains(driver_ff_function)
    actions.send_keys(Keys.ARROW_DOWN * 61)
    actions.perform()

    element_coordinates = driver_ff_function.execute_script(''' return document.querySelector('[tabindex="61"]').getBoundingClientRect() ''')
    actions = ActionChains(driver_ff_function)
    actions.move_by_offset(xoffset=element_coordinates['x'], yoffset=element_coordinates['y'])
    actions.click()
    actions.perform()

    actions = ActionChains(driver_ff_function)
    actions.send_keys(Keys.ARROW_RIGHT * 30)
    actions.perform()
    # cursor stay on last line = 61
    assert '61' == driver_ff_function.execute_script('''return document.getElementsByClassName('cursor')[0].parentNode''').get_attribute('tabIndex')


def test_move_left(driver_ff_function, pyide_base_url):
    driver_ff_function.get(pyide_base_url)
    testmodule1 = WebDriverWait(driver_ff_function, 5).until(ec.presence_of_element_located((By.PARTIAL_LINK_TEXT, 'testmodule1')))
    testmodule1.click()

    WebDriverWait(driver_ff_function, 5).until(ec.presence_of_element_located((By.CSS_SELECTOR, '[tabindex="2"]')))

    actions = ActionChains(driver_ff_function)
    actions.send_keys(Keys.ARROW_LEFT * 5)
    actions.perform()
    # cursor stay on first letter
    assert 'i' == driver_ff_function.find_element_by_class_name('cursor').text

    element_coordinates = driver_ff_function.execute_script(''' return document.querySelector('[tabindex="2"]').getBoundingClientRect() ''')
    actions = ActionChains(driver_ff_function)
    actions.move_by_offset(xoffset=element_coordinates['x'], yoffset=element_coordinates['top'] + 1)
    actions.click()
    actions.perform()
    assert 'f' == driver_ff_function.find_element_by_class_name('cursor').text

    actions = ActionChains(driver_ff_function)
    actions.send_keys(Keys.ARROW_LEFT)
    actions.perform()
    assert ' ' == driver_ff_function.find_element_by_class_name('cursor').text
    assert ' ' == driver_ff_function.find_element_by_id('to-remove').text
    # cursor go on prev line
    assert '1' == driver_ff_function.execute_script('''return document.getElementsByClassName('cursor')[0].parentNode''').get_attribute('tabIndex')

    actions = ActionChains(driver_ff_function)
    actions.send_keys(Keys.ARROW_LEFT)
    actions.perform()
    with pytest.raises(NoSuchElementException, message='Message: Unable to locate element: [id="to-remove"]'):
        driver_ff_function.find_element_by_id('to-remove').text  # pylint: disable=expression-not-assigned
    assert 'h' == driver_ff_function.find_element_by_class_name('cursor').text


def test_page_up_down(driver_ff_function, pyide_base_url):
    driver_ff_function.get(pyide_base_url)
    testmodule1 = WebDriverWait(driver_ff_function, 5).until(ec.presence_of_element_located((By.PARTIAL_LINK_TEXT, 'testmodule1')))
    testmodule1.click()

    WebDriverWait(driver_ff_function, 5).until(ec.presence_of_element_located((By.CSS_SELECTOR, '[tabindex="2"]')))

    actions = ActionChains(driver_ff_function)
    actions.send_keys(Keys.PAGE_UP)
    actions.perform()
    assert 'i' == driver_ff_function.find_element_by_class_name('cursor').text

    actions = ActionChains(driver_ff_function)
    actions.send_keys(Keys.PAGE_DOWN * 2)
    actions.perform()
    assert 'A' == driver_ff_function.find_element_by_class_name('cursor').text

    actions = ActionChains(driver_ff_function)
    actions.send_keys(Keys.PAGE_DOWN)
    actions.perform()
    assert 'A' == driver_ff_function.find_element_by_class_name('cursor').text

    actions = ActionChains(driver_ff_function)
    actions.send_keys(Keys.PAGE_UP * 2)
    actions.perform()
    assert 'i' == driver_ff_function.find_element_by_class_name('cursor').text


def test_enter(driver_ff_function, pyide_base_url):
    driver_ff_function.get(pyide_base_url)
    testmodule1 = WebDriverWait(driver_ff_function, 5).until(ec.presence_of_element_located((By.PARTIAL_LINK_TEXT, 'testmodule1')))
    testmodule1.click()

    WebDriverWait(driver_ff_function, 5).until(ec.presence_of_element_located((By.CSS_SELECTOR, '[tabindex="2"]')))

    text_first_line_before = driver_ff_function.execute_script(''' return document.querySelector('[tabindex="1"]').textContent ''')
    actions = ActionChains(driver_ff_function)
    actions.send_keys(Keys.ENTER)
    actions.perform()

    assert '\n' == driver_ff_function.execute_script(''' return document.querySelector('[tabindex="1"]').textContent ''')
    assert text_first_line_before == driver_ff_function.execute_script(''' return document.querySelector('[tabindex="2"]').textContent ''')


def test_backspace_delete(driver_ff_function, pyide_base_url):
    driver_ff_function.get(pyide_base_url)
    testmodule1 = WebDriverWait(driver_ff_function, 5).until(ec.presence_of_element_located((By.PARTIAL_LINK_TEXT, 'testmodule1')))
    testmodule1.click()

    WebDriverWait(driver_ff_function, 5).until(ec.presence_of_element_located((By.CSS_SELECTOR, '[tabindex="2"]')))

    text_first_line_before = driver_ff_function.execute_script(''' return document.querySelector('[tabindex="1"]').textContent ''')
    test_second_line_before = driver_ff_function.execute_script(''' return document.querySelector('[tabindex="2"]').textContent ''')
    test_third_line_before = driver_ff_function.execute_script(''' return document.querySelector('[tabindex="3"]').textContent ''')

    actions = ActionChains(driver_ff_function)
    actions.send_keys(Keys.DELETE)
    actions.perform()
    assert text_first_line_before[1:] == driver_ff_function.execute_script(''' return document.querySelector('[tabindex="1"]').textContent ''')

    actions = ActionChains(driver_ff_function)
    actions.send_keys(Keys.LEFT + Keys.BACKSPACE)
    actions.perform()
    assert text_first_line_before[2:] == driver_ff_function.execute_script(''' return document.querySelector('[tabindex="1"]').textContent ''')

    actions = ActionChains(driver_ff_function)
    actions.send_keys(Keys.END + Keys.DELETE)
    actions.perform()
    assert text_first_line_before[2:][:-1] + test_second_line_before.lstrip() == \
        driver_ff_function.execute_script(''' return document.querySelector('[tabindex="1"]').textContent ''')

    actions = ActionChains(driver_ff_function)
    actions.send_keys(Keys.ARROW_DOWN + Keys.HOME + Keys.BACKSPACE)
    actions.perform()
    assert text_first_line_before[2:][:-1] + test_second_line_before.lstrip()[:-1] + test_third_line_before.lstrip() == \
        driver_ff_function.execute_script(''' return document.querySelector('[tabindex="1"]').textContent ''')
