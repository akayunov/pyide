let mocha = require('mocha');
let context = require('../../context.js');
let webdriver = require('selenium-webdriver');
let assert = require('assert');


//TODO move it to separate files

mocha.describe('Page up', function () {
    this.timeout(0);

    it('Page Up to start of file + qwe', async function () {
        let driver = await context.getDriver();
        await context.openFile('cursor/cursor-many-row.txt', driver);
        let el = await driver.findElement(webdriver.By.id('code'));
        await el.sendKeys(
            ...Array(1).fill(webdriver.Key.PAGE_UP),
            'qwe'
        );
        let els = await driver.findElements(webdriver.By.className('content-line'));
        assert.strictEqual(await els[0].getAttribute('textContent'), "qwe1 123\n");
        await driver.quit();
    });
});
