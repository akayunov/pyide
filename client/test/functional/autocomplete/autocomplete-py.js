let mocha = require('mocha');
let context = require('../../context.js');
let webdriver = require('selenium-webdriver');
let assert = require('assert');


mocha.describe('Auto complete', function () {
    this.timeout(0);

    it('Complete class name', async function () {
        let driver = await context.getDriver();
        let codeElement =  await context.openFile('autocomplete/class.py', driver);
        await codeElement.sendKeys(
            ...Array(7).fill(webdriver.Key.ARROW_DOWN),
            'Tra'
        );
        await driver.wait(webdriver.until.elementLocated(webdriver.By.id('active-autocomplete')), 1000);
        await codeElement.sendKeys(
            webdriver.Key.TAB
        );
        let els = await driver.findElements(webdriver.By.className('content-line'));
        assert.strictEqual(await els[7].getAttribute('textContent'), "Tratata\n");
        await driver.quit();
    });

    it('Backspace after complete', async function () {
        let driver = await context.getDriver();
        let codeElement = await context.openFile('autocomplete/class.py', driver);
        await codeElement.sendKeys(
            ...Array(7).fill(webdriver.Key.ARROW_DOWN),
            'Tra'
        );
        let firstActiveComplete = await driver.wait(webdriver.until.elementLocated(webdriver.By.id('active-autocomplete')), 1000);
        await codeElement.sendKeys(
            webdriver.Key.TAB,
            '.'
        );
        await driver.wait(webdriver.until.stalenessOf(firstActiveComplete), 1000);
        let secondActiveComplete = await driver.wait(webdriver.until.elementLocated(webdriver.By.id('active-autocomplete')), 1000);
        await codeElement.sendKeys(
            're',
            webdriver.Key.TAB,
            ...Array(3).fill(webdriver.Key.BACK_SPACE),
            'qwe'
        );
        let els = await driver.findElements(webdriver.By.className('content-line'));
        assert.strictEqual(await els[7].getAttribute('textContent'), "Tratata.repqwe\n");
        await driver.quit();
    });

    it('Twice tab', async function () {
        let driver = await context.getDriver();
        let codeElement = await context.openFile('autocomplete/class.py', driver);
        await codeElement.sendKeys(
            ...Array(7).fill(webdriver.Key.ARROW_DOWN),
            'class Tra'
        );
        let firstActiveComplete = await driver.wait(webdriver.until.elementLocated(webdriver.By.id('active-autocomplete')), 1000);
        await codeElement.sendKeys(
            webdriver.Key.TAB,
            ':',
            webdriver.Key.TAB,
        );
        await driver.wait(webdriver.until.stalenessOf(firstActiveComplete), 1000);
        let els = await driver.findElements(webdriver.By.className('content-line'));
        assert.strictEqual(await els[7].getAttribute('textContent'), "class Tratata:    \n");
        await driver.quit();
    });

    it('Typing to the end of completed string and tab twice', async function () {
        let driver = await context.getDriver();
        let codeElement = await context.openFile('autocomplete/class.py', driver);
        await codeElement.sendKeys(
            ...Array(7).fill(webdriver.Key.ARROW_DOWN),
            'Tratata',
            webdriver.Key.TAB,
            webdriver.Key.TAB,
        );
        let els = await driver.findElements(webdriver.By.className('content-line'));
        assert.strictEqual(await els[7].getAttribute('textContent'), "Tratata        \n");
        await driver.quit();
    });

    it.skip('Long auto compelete, mouse scroll', async function () {
        // let driver = await context.getDriver();
        // await context.openFile('cursor/cursor-many-row.txt', driver);
        // let el = await driver.findElement(webdriver.By.id('code'));
        // await el.sendKeys(
        //     'tratata.',
        //     ...Array(5).fill(webdriver.Key.BACK_SPACE),
        //     'qwe'
        // );
        // // TODO check highlight position
        // // let els = await driver.findElements(webdriver.By.className('content-line'));
        // // assert.strictEqual(await els[170].getAttribute('textContent'), "qwe0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 df");
        // await driver.quit();
    });
});
