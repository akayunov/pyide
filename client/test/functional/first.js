let mocha = require('mocha');
let context = require('../context.js');
let webdriver = require('selenium-webdriver');
let assert = require('assert');


mocha.describe('Put some symbols', function () {
    it('Put qwerty', function () {
        context.driver.get(context.url);
        context.driver.findElements(webdriver.By.className('content-line')).then(
            x => {
                x[0].sendKeys('qwerty');
            }
        );
        context.driver.findElement(webdriver.By.className('content-line')).getText().then(
            function (text) {
                assert.equal("qwerty", text);
                context.driver.quit();
            }
        );
    });
});
