let mocha = require('mocha');
let context = require('../../context.js');
let webdriver = require('selenium-webdriver');
let assert = require('assert');


mocha.describe('Enter', function () {
    this.timeout(0);

    it('qwerty,ENTER,asd on empty page', async function () {
        let driver = await context.getDriver();
        //TODO may be I don't need tabindex on code-line elements??
        let el = await driver.findElement(webdriver.By.id('code'));
        await el.sendKeys(
            'qwerty\nasd'
        );
        let els = await driver.findElements(webdriver.By.className('content-line'));

        assert.strictEqual(await els[0].getText(), "qwerty");
        assert.strictEqual(await els[1].getText(), "asd");
        await driver.quit();
    });

    it('5 Enters on empty page', async function () {
        let driver = await context.getDriver();
        //TODO may be I don't need tabindex on code-line elements??
        let el = await driver.findElement(webdriver.By.id('code'));
        await el.sendKeys(
            ...Array(5).fill(webdriver.Key.ENTER),
            'qwe'
        );
        let els = await driver.findElements(webdriver.By.className('content-line'));
        assert.strictEqual(await els[0].getAttribute('textContent'), "\n");
        assert.strictEqual(await els[1].getAttribute('textContent'), "\n");
        assert.strictEqual(await els[2].getAttribute('textContent'), "\n");
        assert.strictEqual(await els[3].getAttribute('textContent'), "\n");
        assert.strictEqual(await els[4].getAttribute('textContent'), "\n");
        assert.strictEqual(await els[5].getAttribute('textContent'), "qwe");
        await driver.quit();
    });

    it('Split row for txt', async function () {
        let driver = await context.getDriver();
        await context.openFile('cursor/cursor.txt', driver);
        let el = await driver.findElement(webdriver.By.id('code'));
        await el.sendKeys(
            ...Array(5).fill(webdriver.Key.ARROW_RIGHT),
            webdriver.Key.ENTER
        );

        let els = await driver.findElements(webdriver.By.className('content-line'));
        assert.strictEqual(await els[1].getAttribute('textContent'), "ta\n");
        await driver.quit();
    });
    it('Split row for py', async function () {
        let driver = await context.getDriver();
        await context.openFile('cursor/cursor.py', driver);
        let el = await driver.findElement(webdriver.By.id('code'));
        await el.sendKeys(
            ...Array(2).fill(webdriver.Key.ARROW_DOWN),
            ...Array(9).fill(webdriver.Key.ARROW_RIGHT),
            webdriver.Key.ENTER
        );
        let els = await driver.findElements(webdriver.By.className('content-line'));
        assert.strictEqual(await els[2].getAttribute('textContent'), "class Qwe\n");
        assert.strictEqual(await els[3].getAttribute('textContent'), "(object):\n");
        await driver.quit();
    });
    it('Enter on span with class name == keyword', async function () {
        let driver = await context.getDriver();
        let el = await context.openFile('cursor/cursor.py', driver);
        // TODO
        // await driver.findElement(webdriver.By.id('code'));
        // await el.sendKeys(
        //     ...Array(2).fill(webdriver.Key.ARROW_DOWN),
        //     ...Array(9).fill(webdriver.Key.ARROW_RIGHT),
        //     webdriver.Key.ENTER
        // );
        // let els = await driver.findElements(webdriver.By.className('content-line'));
        // assert.strictEqual(await els[2].getAttribute('textContent'), "class Qwe\n");
        // assert.strictEqual(await els[3].getAttribute('textContent'), "(object):\n");
        await driver.quit();
    });
});
