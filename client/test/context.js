let webdriver = require('selenium-webdriver');
let chromeCapabilities = webdriver.Capabilities.chrome();

let chromeOptions = {
    'args': ['--no-sandbox']
};

chromeCapabilities.set('chromeOptions', chromeOptions);
exports.driver = new webdriver.Builder().withCapabilities(chromeCapabilities).build();
exports.url = 'http://127.0.0.1:31415/client/resourses/pyide.html';
