let mocha = require('mocha');
let context = require('../context.js');
let webdriver = require('selenium-webdriver');
let assert = require('assert');


mocha.describe('Filelisting', function () {
    this.timeout(0);

    it('Filelisting tree', async function () {
        let driver = await context.getDriver();
        await context.openFile('filelisting/subdir/subsubdir/5.py', driver);
        await driver.wait(webdriver.until.elementLocated(webdriver.By.css('a[href="/server/file/code/filelisting/subdir/subsubdir/5.py"]')), 1000);
        await driver.quit();
    });

});
