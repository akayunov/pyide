# from selenium.webdriver.common.by import By
import pytest
from selenium.webdriver.common.keys import Keys
from selenium.common.exceptions import NoSuchElementException


def test_init(driver_ff, code_base_url):
    driver_ff.get(code_base_url + 'resourses/testmodule1.py')
    assert 'i' == driver_ff.find_element_by_class_name('cursor').text


def test_empty(driver_ff, code_base_url):
    driver_ff.get(code_base_url + 'resourses/empty.py')
    assert ' ' == driver_ff.find_element_by_class_name('cursor').text
    assert ' ' == driver_ff.find_element_by_id('to-remove').text


@pytest.mark.xfail
def test_without_new_line_at_the_end(driver_ff, code_base_url):
    driver_ff.get(code_base_url + 'resourses/onelinewithoutnewline.py')
    element = driver_ff.find_element_by_css_selector('[tabindex="1"]')
    element.send_keys(Keys.END)
    assert ' ' == driver_ff.find_element_by_class_name('cursor').text
    assert ' ' == driver_ff.find_element_by_id('to-remove').text


def test_move_left(driver_ff, code_base_url):
    driver_ff.get(code_base_url + 'resourses/testmodule1.py')
    element = driver_ff.find_element_by_css_selector('[tabindex="1"]')
    element.send_keys(Keys.ARROW_RIGHT * 31)
    assert 'h' == driver_ff.find_element_by_class_name('cursor').text
    with pytest.raises(NoSuchElementException, message='Message: Unable to locate element: [id="to-remove"]'):
        driver_ff.find_element_by_id('to-remove').text
    element.send_keys(Keys.ARROW_RIGHT)
    assert ' ' == driver_ff.find_element_by_class_name('cursor').text
    assert ' ' == driver_ff.find_element_by_id('to-remove').text
    element.send_keys(Keys.ARROW_RIGHT)
    # assert '2' == driver_ff.execute_script('''return document.getElementsByClassName('cursor')[0].parentNode.parentNode.attributes.tabIndex.nodeValue''')
    qwe = driver_ff.execute_script('''return document.getElementsByClassName('cursor')[0].parentNode.parentNode.attributes.tabIndex''')
    # import pdb;pdb.set_trace()
    assert '2' == driver_ff.execute_script('''return document.getElementsByClassName('cursor')[0].parentNode''').get_attribute('tabIndex')