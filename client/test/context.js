let webdriver = require('selenium-webdriver');
let chromeCapabilities = webdriver.Capabilities.chrome();

let chromeOptions = {
    'args': ['--no-sandbox']
};

chromeCapabilities.set('chromeOptions', chromeOptions);

url = 'http://127.0.0.1:31415/client/resourses/pyide.html';

exports.getDriver = async function () {
    let driver = new webdriver.Builder().withCapabilities(chromeCapabilities).build();
    await driver.get(url);
    return driver;
};

exports.openFile = async function (filePath, driver) {
    let name = filePath.split('/').slice(-1)[0];
    let href = '/server/filelisting';

    for (let part of filePath.split('/')){
        if (name === part){
            href = href.replace('filelisting', 'code')
        }
        href += '/' + part;
        let folderCursorEl = await driver.findElements(webdriver.By.css('a[href*="' + href + '"]'));
        await folderCursorEl[0].click();
    }
};


