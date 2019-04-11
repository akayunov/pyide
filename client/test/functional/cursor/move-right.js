let mocha = require('mocha');
let context = require('../../context.js');
let webdriver = require('selenium-webdriver');
let assert = require('assert');


mocha.describe('Move right', function () {
    this.timeout(0);

    it('Change line by move right + qwe for txt', async function () {
        let driver = await context.getDriver();
        await context.openFile('cursor/cursor.txt', driver);
        let el = await driver.findElement(webdriver.By.id('code'));
        await el.sendKeys(
            ...Array(8).fill(webdriver.Key.ARROW_RIGHT),
            'qwe'
        );
        let els = await driver.findElements(webdriver.By.className('content-line'));
        assert.strictEqual(await els[1].getAttribute('textContent'), "qwe\n");
        await driver.quit();
    });
    it('Change line by move right + qwe for py code', async function () {
        let driver = await context.getDriver();
        await context.openFile('cursor/cursor.py', driver);
        let el = await driver.findElement(webdriver.By.id('code'));
        await el.sendKeys(
            ...Array(10).fill(webdriver.Key.ARROW_RIGHT),
            'qwe'
        );
        let els = await driver.findElements(webdriver.By.className('content-line'));
        assert.strictEqual(await els[1].getAttribute('textContent'), "qwe\n");
        await driver.quit();
    });
    it('Move to the end of file and father for py code', async function () {
        let driver = await context.getDriver();
        await context.openFile('cursor/cursor.py', driver);
        let el = await driver.findElement(webdriver.By.id('code'));
        await el.sendKeys(
            ...Array(6).fill(webdriver.Key.ARROW_DOWN),
            ...Array(100).fill(webdriver.Key.ARROW_RIGHT),
            webdriver.Key.ENTER,
            'qwe'
        );
        let els = await driver.findElements(webdriver.By.className('content-line'));
        assert.strictEqual(await els[7].getAttribute('textContent'), "qwe\n");
        await driver.quit();
    });
    it.skip('Move by multiline string for py code', async function () {
        //TODO split multi line in different div elements
        let driver = await context.getDriver();
        await context.openFile('cursor/cursor-multiline-string.py', driver);
        // let el = await driver.findElement(webdriver.By.id('code'));
        // await el.sendKeys(
        //     ...Array(6).fill(webdriver.Key.ARROW_DOWN),
        //     ...Array(100).fill(webdriver.Key.ARROW_RIGHT),
        //     webdriver.Key.ENTER,
        //     'qwe'
        // );
        // let els = await driver.findElements(webdriver.By.className('content-line'));
        // assert.strictEqual(await els[7].getAttribute('textContent'), "qwe\n");
        await driver.quit();
    });
    it.skip('Move by multiline code for py code', async function () {
        let driver = await context.getDriver();
        await context.openFile('cursor/cursor-multiline-code.py', driver);
        // let el = await driver.findElement(webdriver.By.id('code'));
        // await el.sendKeys(
        //     ...Array(6).fill(webdriver.Key.ARROW_DOWN),
        //     ...Array(100).fill(webdriver.Key.ARROW_RIGHT),
        //     webdriver.Key.ENTER,
        //     'qwe'
        // );
        // let els = await driver.findElements(webdriver.By.className('content-line'));
        // assert.strictEqual(await els[7].getAttribute('textContent'), "qwe\n");
        await driver.quit();
    });
});
