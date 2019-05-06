let mocha = require('mocha');
let context = require('../../context.js');
let webdriver = require('selenium-webdriver');
let assert = require('assert');


mocha.describe('Move down', function () {
    this.timeout(0);

    it('Save position on move down', async function () {
        let driver = await context.getDriver();
        let el = await context.openFile('cursor/cursor.py', driver);
        // TODO
        // let el = await driver.findElement(webdriver.By.id('code'));
        // await el.sendKeys(
        //     ...Array(8).fill(webdriver.Key.ARROW_RIGHT),
        //     'qwe'
        // );
        // let els = await driver.findElements(webdriver.By.className('content-line'));
        // assert.strictEqual(await els[1].getAttribute('textContent'), "qwe\n");
        await driver.quit();
    });

});
