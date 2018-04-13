from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as ec
from selenium.webdriver.support.ui import WebDriverWait


def test_init(driver_ff_function, pyide_base_url):
    driver_ff_function.get(pyide_base_url)
    package1 = WebDriverWait(driver_ff_function, 5).until(ec.presence_of_element_located((By.PARTIAL_LINK_TEXT, 'package1')))
    package1.click()

    folder_links = driver_ff_function.find_elements_by_class_name('folderlink')
    assert 'package1\n  package1_1\n  __init__.py' == folder_links[0].text
    assert '  package1_1' == folder_links[1].text
    assert 'package2' == folder_links[2].text
