let mocha = require('mocha');
let context = require('../../context.js');
let webdriver = require('selenium-webdriver');
let assert = require('assert');


mocha.describe('End tests', function () {
    this.timeout(0);
    // txt file
    it('End on last line(without newline) for txt', async function () {
        let driver = await context.getDriver();
        await context.openFile('cursor/cursor.txt', driver);
        let el = await driver.findElement(webdriver.By.id('code'));
        await el.sendKeys(
            webdriver.Key.PAGE_DOWN,
            webdriver.Key.END,
            'qwe'
        );
        let els = await driver.findElements(webdriver.By.className('content-line'));
        assert.strictEqual(await els[3].getAttribute('textContent'), "приветqwe");
        await driver.quit();
    });

    it('End on middle line(with newline) for txt', async function () {
        let driver = await context.getDriver();
        await context.openFile('cursor/cursor.txt', driver);
        let el = await driver.findElement(webdriver.By.id('code'));
        await el.sendKeys(
            webdriver.Key.ARROW_DOWN,
            webdriver.Key.ARROW_DOWN,
            webdriver.Key.END,
            'qwe'
        );
        let els = await driver.findElements(webdriver.By.className('content-line'));
        assert.strictEqual(await els[2].getAttribute('textContent'), "12314124124142qwe\n");
        await driver.quit();
    });

    it('End on empty for txt', async function () {
        let driver = await context.getDriver();
        await context.openFile('cursor/cursor.txt', driver);
        let el = await driver.findElement(webdriver.By.id('code'));
        await el.sendKeys(
            webdriver.Key.ARROW_DOWN,
            webdriver.Key.END,
            'qwe'
        );
        let els = await driver.findElements(webdriver.By.className('content-line'));
        assert.strictEqual(await els[1].getAttribute('textContent'), "qwe\n");
        await driver.quit();
    });

    // py code
    it.skip('End on last line(without newline) for py', async function () {
        let driver = await context.getDriver();
        await context.openFile('cursor/cursor.py', driver);
        let el = await driver.findElement(webdriver.By.id('code'));
        await el.sendKeys(
            webdriver.Key.PAGE_DOWN,
            webdriver.Key.END,
            'qwe'
        );
        let els = await driver.findElements(webdriver.By.className('content-line'));
        assert.strictEqual(await els[6].getAttribute('textContent'), "        passqwe");
        await driver.quit();
    });

    it('End on middle line(with newline) for py', async function () {
        let driver = await context.getDriver();
        await context.openFile('cursor/cursor.py', driver);
        let el = await driver.findElement(webdriver.By.id('code'));
        await el.sendKeys(
            webdriver.Key.ARROW_DOWN,
            webdriver.Key.ARROW_DOWN,
            webdriver.Key.END,
            'qwe'
        );
        let els = await driver.findElements(webdriver.By.className('content-line'));
        assert.strictEqual(await els[2].getAttribute('textContent'), "class Qwe(object):qwe\n");
        await driver.quit();
    });
    it('Move to the end of string in py code', async function () {
        let driver = await context.getDriver();
        await context.openFile('cursor/cursor.py', driver);
        let el = await driver.findElement(webdriver.By.id('code'));
        await el.sendKeys(
            webdriver.Key.END,
            'qwe'
        );
        let els = await driver.findElements(webdriver.By.className('content-line'));
        assert.strictEqual(await els[0].getAttribute('textContent'), "import osqwe\n");
        await driver.quit();
    });
    it('Move to the end of string + qwe for txt', async function () {
        let driver = await context.getDriver();
        await context.openFile('cursor/cursor.txt', driver);
        let el = await driver.findElement(webdriver.By.id('code'));
        await el.sendKeys(
            webdriver.Key.END,
            'qwe'
        );
        let els = await driver.findElements(webdriver.By.className('content-line'));
        assert.strictEqual(await els[0].getAttribute('textContent'), "tratataqwe\n");
        await driver.quit();
    });
});
