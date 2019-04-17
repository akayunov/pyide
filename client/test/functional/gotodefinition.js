let mocha = require('mocha');
let context = require('../context.js');
let webdriver = require('selenium-webdriver');
let assert = require('assert');


mocha.describe('Go to definition', function () {
    this.timeout(0);

    it('Class name', async function () {
        let driver = await context.getDriver();
        let codeElement = await context.openFile('gotodefinition/gotodefinition.py', driver);
        let elms = await driver.findElements(webdriver.By.className('name'));
        console.log(await elms[1].getAttribute('textContent'));
        const actions = driver.actions();
        await actions
            .keyDown(webdriver.Key.CONTROL)
            .perform();

        elms[1].click();

        await actions
            .keyUp(webdriver.Key.CONTROL)
            .perform();

        await codeElement.sendKeys(
            'qwe'
        );

        let els = await driver.findElements(webdriver.By.className('content-line'));
        assert.strictEqual(await els[0].getAttribute('textContent'), "qweclass Tratata(object):\n");
        await driver.quit();
    });

});
