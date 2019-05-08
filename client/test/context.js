let webdriver = require('selenium-webdriver');
let chromeCapabilities = webdriver.Capabilities.chrome();

let chromeOptions = {
    'args': [
        '--no-sandbox'
        , '--headless'
    ]
};

chromeCapabilities.set('chromeOptions', chromeOptions);

url = 'http://127.0.0.1:31415/client/resources/pyide.html';

exports.getDriver = async function () {
    let driver = new webdriver.Builder().withCapabilities(chromeCapabilities).build();
    await driver.get(url);
    return driver;
};

exports.openFile = async function (filePath, driver) {
    let name = filePath.split('/').slice(-1)[0];
    let href = '/server/file/listing';

    let codeBefore = await driver.findElement(webdriver.By.id('code'));
    for (let part of filePath.split('/')){
         // open all folder tree
        if (name === part){
            href = href.replace('file/listing', 'file/code')
        }
        href += '/' + part;
        await driver.wait(webdriver.until.elementLocated(webdriver.By.css('a[href*="' + href + '"]')), 1000);
        let folderCursorEl = await driver.findElement(webdriver.By.css('a[href*="' + href + '"]'));
        await folderCursorEl.click();
    }
    // wait until old code will be replaced by page refresh and find some content-line
    await driver.wait(webdriver.until.stalenessOf(codeBefore), 1000);
    return await driver.wait(webdriver.until.elementLocated(webdriver.By.id('code')), 1000);

};
