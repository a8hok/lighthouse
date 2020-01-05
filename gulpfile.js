'use strict';

const gulp = require('gulp');
const connect = require('gulp-connect');
const lighthouse = require('lighthouse');
const fs = require('fs');
const chromeLauncher = require('lighthouse/chrome-launcher');
const ReportGeneratorV2 = require('./node_modules/lighthouse/lighthouse-core/report/v2/report-generator.js');

const PORT = 8080;

/**
 * Start server
 */
const startServer = function () {
    return connect.server({
        root: './public',
        port: PORT
    });
};

/**
 * Stop server
 */
const stopServer = function () {
    connect.serverClose();
};

/**
 * Run lighthouse
 */
function launchChromeAndRunLighthouse(url, opts, config = null) {
    return chromeLauncher.launch({
        chromeFlags: opts.chromeFlags
    }).then(chrome => {
        opts.port = chrome.port;
        return lighthouse(url, opts, config).then(results => {
            const html = new ReportGeneratorV2().generateReportHtml(results);

            //workaround to save the report
            fs.writeFile("output.html", html, 'UTF-8', function (err) {
                if (err) {
                    return console.log(err);
                }
            });
            chrome.kill().then(() => results)
        });
    });
}

/**
 * Handle ok result
 * @param {Object} results - Lighthouse results
 */
const handleOk = function (results) {
    stopServer();

    return results;
};

const opts = {
    output: 'html',
    chromeFlags: ['--headless'],
    view: true

};

gulp.task('lighthouse', function () {
    startServer();
    launchChromeAndRunLighthouse('https://github`.com', opts).then(handleOk);
});

gulp.task('default', ['lighthouse']);
