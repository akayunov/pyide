let webdriver = require('selenium-webdriver');
var test = require('selenium-webdriver/testing'); // add 'test.' wrapper
// let qwe  = new webdriver.Builder();


var chromeCapabilities = webdriver.Capabilities.chrome();
var chromeOptions = {
    'args': ['--no-sandbox']
};

chromeCapabilities.set('chromeOptions', chromeOptions);
var driver = new webdriver.Builder().withCapabilities(chromeCapabilities).build();

var assert = require('assert');
describe('User Authentication', function () {
    it('User can sign in', function () {
        driver.get('http://travel.agileway.net');
        driver.findElement(webdriver.By.name('username')).sendKeys('agileway');
        driver.findElement(webdriver.By.name('password')).sendKeys('testwise');
        driver.findElement(webdriver.By.name('commit')).click();
        driver.getTitle().then( function(the_title){
            // assert.equal("Agile Travel", the_title);
        });
    });
});
