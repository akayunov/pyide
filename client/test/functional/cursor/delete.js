let mocha = require('mocha');
let context = require('../../context.js');
let webdriver = require('selenium-webdriver');
let assert = require('assert');


mocha.describe('Delete tests', function () {
    this.timeout(0);
    it('Delete at start of file', async function () {
        let driver = await context.getDriver();
        await context.openFile('cursor/cursor.txt', driver);
        let el = await driver.findElement(webdriver.By.id('code'));
        await el.sendKeys(
            ...Array(5).fill(webdriver.Key.DELETE),
            'qwe'
        );
        let els = await driver.findElements(webdriver.By.className('content-line'));
        assert.strictEqual(await els[0].getAttribute('textContent'), "qweta\n");
        await driver.quit();
    });

    it('Delete at end of file', async function () {
        let driver = await context.getDriver();
        await context.openFile('cursor/cursor.txt', driver);
        let el = await driver.findElement(webdriver.By.id('code'));
        await el.sendKeys(
            webdriver.Key.PAGE_DOWN,
            webdriver.Key.END,
            ...Array(5).fill(webdriver.Key.DELETE),
            'qwe'
        );
        let els = await driver.findElements(webdriver.By.className('content-line'));
        assert.strictEqual(await els[3].getAttribute('textContent'), "приветqwe");
        await driver.quit();
    });

    it('Delete at start of node', async function () {
        let driver = await context.getDriver();
        await context.openFile('cursor/cursor.py', driver);
        let el = await driver.findElement(webdriver.By.id('code'));
        await el.sendKeys(
            ...Array(8).fill(webdriver.Key.ARROW_RIGHT),
            webdriver.Key.ARROW_LEFT,
            webdriver.Key.DELETE,
            webdriver.Key.DELETE,
            'qwe'
        );
        let els = await driver.findElements(webdriver.By.className('content-line'));
        assert.strictEqual(await els[0].getAttribute('textContent'), "import qwe\n");
        await driver.quit();
    });
});
