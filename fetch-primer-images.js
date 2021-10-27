var fs = require('fs');
var wget = require('node-wget');

var spinnerDir = './src/images/spinners';
const ajaxDir = './src/images/modules/ajax'

if (!fs.existsSync(spinnerDir)){
    fs.mkdirSync(spinnerDir, { recursive: true });
}

if (!fs.existsSync(ajaxDir)){
    fs.mkdirSync(ajaxDir, { recursive: true });
}

const urls = [
    { url: 'https://github.com/images/spinners/octocat-spinner-16px.gif', dir: spinnerDir },
    { url: 'https://github.com/images/spinners/octocat-spinner-32.gif', dir: spinnerDir },
    { url: 'https://github.com/images/spinners/octocat-spinner-32-EAF2F5.gif', dir: spinnerDir },
    { url: 'https://github.com/images/modules/ajax/success@2x.png', dir: ajaxDir },
    { url: 'https://github.com/images/modules/ajax/error@2x.png', dir: ajaxDir },
    { url: 'https://github.com/images/modules/ajax/success.png', dir: ajaxDir },
    { url: 'https://github.com/images/modules/ajax/error.png', dir: ajaxDir },
];

for (let i = 0; i < urls.length; i++)
	wget({url: urls[i].url, dest: urls[i].dir + '/'});