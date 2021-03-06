let mocha = require('mocha');
let context = require('../../context.js');
let webdriver = require('selenium-webdriver');
let assert = require('assert');


//TODO move it to separate files

mocha.describe('Page down', function () {
    this.timeout(0);

    it('Page Down to end of file + qwe', async function () {
        let driver = await context.getDriver();
        await context.openFile('cursor/cursor-many-row.txt', driver);
        let el = await driver.findElement(webdriver.By.id('code'));
        await el.sendKeys(
            ...Array(10).fill(webdriver.Key.PAGE_DOWN),
            'qwe'
        );
        let els = await driver.findElements(webdriver.By.className('content-line'));
        assert.strictEqual(await els[170].getAttribute('textContent'), "qwe0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 df");
        await driver.quit();
    });
});
