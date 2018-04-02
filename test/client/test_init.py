# from selenium.webdriver.common.by import By
# from selenium.webdriver.common.keys import Keys


def test_init(driver_ff):
    driver_ff.get('http://pyide:31415/server/code/resourses/testmodule1.py')
    assert 'i' == driver_ff.execute_script('''return document.getElementsByClassName('cursor')[0]''').text
