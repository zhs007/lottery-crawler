"use strict";

const fs = require('fs');
const util = require('util');
const moment = require('moment');
const process = require('process');
const { startTask, initDailyRotateFileLog, log } = require('jarvis-task');
const { taskFactory } = require('../src/taskfactory');
require('../src/alltask');

initDailyRotateFileLog(util.format('./log/pk10init_%d.log', moment().format('x')), 'info');

process.on('unhandledRejection', (reason, p) => {
    log('error', 'Unhandled Rejection at: ' + p + ' reason: ' + reason);

    process.exit(0);
});

process.on('uncaughtException', (err) => {
    log('error', 'Unhandled Exception: ' + JSON.stringify(err));

    process.exit(0);
});

// log('info', 'haha');

const cfg = JSON.parse(fs.readFileSync('./pk10init.json').toString());

startTask(cfg, taskFactory, () => {
    process.exit(0);
});