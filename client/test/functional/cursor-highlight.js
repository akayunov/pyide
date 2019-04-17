let mocha = require('mocha');
let context = require('../context.js');
let webdriver = require('selenium-webdriver');
let assert = require('assert');


mocha.describe('HL tests', function () {
    this.timeout(0);
    // txt file
    it('HL on delete for txt', async function () {
        let driver = await context.getDriver();
        await context.openFile('cursor/cursor.txt', driver);
        let el = await driver.findElement(webdriver.By.id('code'));
        await el.sendKeys(
            ...Array(2).fill(webdriver.Key.ARROW_DOWN),
            ...Array(3).fill(webdriver.Key.ARROW_RIGHT),
            webdriver.Key.DELETE
        );
        let hl = await driver.findElement(webdriver.By.id('cursorHighlightElement'));
        let rect = await driver.executeScript('return document.getElementById(\'cursorHighlightElement\').getClientRects()');
        assert.strictEqual(rect[0].x, 193.546875);
        assert.strictEqual(rect[0].y, 36);
        await driver.quit();
    });
    it('HL on backspace for txt', async function () {
        let driver = await context.getDriver();
        await context.openFile('cursor/cursor.txt', driver);
        let el = await driver.findElement(webdriver.By.id('code'));
        await el.sendKeys(
            ...Array(2).fill(webdriver.Key.ARROW_DOWN),
            ...Array(3).fill(webdriver.Key.ARROW_RIGHT),
            webdriver.Key.BACK_SPACE
        );
        let hl = await driver.findElement(webdriver.By.id('cursorHighlightElement'));
        let rect = await driver.executeScript('return document.getElementById(\'cursorHighlightElement\').getClientRects()');
        assert.strictEqual(rect[0].x, 185.546875);
        assert.strictEqual(rect[0].y, 36);
        await driver.quit();
    });
});
