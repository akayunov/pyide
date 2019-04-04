let mocha = require('mocha');
let context = require('../context.js');
let webdriver = require('selenium-webdriver');
let assert = require('assert');


mocha.describe('Put some symbols', function () {
    it('qwertyENTERasd', async function () {
        let driver = await context.getDriver();
        //TODO may be I don't need tabindex on code-line elements??
        let el = await driver.findElement(webdriver.By.id('code'));
        await el.sendKeys('qwerty\nasd');
        let els = await driver.findElements(webdriver.By.className('content-line'));

        assert.strictEqual(await els[0].getText(), "qwerty");
        assert.strictEqual(await els[1].getText(), "asd");
        await driver.quit();
    });

    it('5 Enters', async function () {
        let driver = await context.getDriver();
        //TODO may be I don't need tabindex on code-line elements??
        let el = await driver.findElement(webdriver.By.id('code'));
        await el.sendKeys(webdriver.Key.ENTER);
        await el.sendKeys(webdriver.Key.ENTER);
        await el.sendKeys(webdriver.Key.ENTER);
        await el.sendKeys(webdriver.Key.ENTER);
        await el.sendKeys(webdriver.Key.ENTER);
        await el.sendKeys('qwe');
        let els = await driver.findElements(webdriver.By.className('content-line'));
        assert.strictEqual(await els[0].getAttribute('textContent'), "\n");
        assert.strictEqual(await els[1].getAttribute('textContent'), "\n");
        assert.strictEqual(await els[2].getAttribute('textContent'), "\n");
        assert.strictEqual(await els[3].getAttribute('textContent'), "\n");
        assert.strictEqual(await els[4].getAttribute('textContent'), "\n");
        assert.strictEqual(await els[5].getAttribute('textContent'), "qwe\n");
        await driver.quit();
    });

    it('ENDqwe in text', async function () {
        let driver = await context.getDriver();
        await context.openFile('cursor/cursor.txt', driver);
        let el = await driver.findElement(webdriver.By.id('code'));
        await el.sendKeys(webdriver.Key.END, 'qwe');
        let els = await driver.findElements(webdriver.By.className('content-line'));
        assert.strictEqual(await els[0].getAttribute('textContent'), "tratataqwe\n");
        await driver.quit();
    });

    it('ENDqwe in py code', async function () {
        let driver = await context.getDriver();
        await context.openFile('cursor/cursor.py', driver);
        let el = await driver.findElement(webdriver.By.id('code'));
        await el.sendKeys(webdriver.Key.END, 'qwe');
        let els = await driver.findElements(webdriver.By.className('content-line'));
        assert.strictEqual(await els[0].getAttribute('textContent'), "import osqwe\n");
        await driver.quit();
    });
    it('Split row', async function () {
        let driver = await context.getDriver();
        await context.openFile('cursor/cursor.txt', driver);
        let el = await driver.findElement(webdriver.By.id('code'));
        await el.sendKeys(webdriver.Key.END, 'qwe');
        let els = await driver.findElements(webdriver.By.className('content-line'));
        assert.strictEqual(await els[0].getAttribute('textContent'), "import osqwe\n");
        await driver.quit();
    });
});
