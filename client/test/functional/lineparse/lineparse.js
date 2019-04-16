let mocha = require('mocha');
let context = require('../../context.js');
let webdriver = require('selenium-webdriver');
let assert = require('assert');


mocha.describe('Line parse', function () {
    this.timeout(0);

    it('Empty py file', async function () {
        let driver = await context.getDriver();
        let codeElement = await context.openFile('lineparse/empty.py', driver);
        await codeElement.sendKeys(
            'class',
            webdriver.Key.SPACE,
            'Empty'
        );
        let els = await driver.wait(webdriver.until.elementLocated(webdriver.By.className('keyword')), 1000);
        console.log(els[0]);
        // await driver.quit();
    });

});
