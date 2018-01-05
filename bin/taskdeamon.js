"use strict";

const fs = require('fs');
const util = require('util');
const moment = require('moment');
const { startTaskDeamon, initDailyRotateFileLog } = require('jarvis-task');
const { taskFactory } = require('../src/taskfactory');
require('../src/alltask');

initDailyRotateFileLog(util.format('./log/taskdeamon_%d.log', moment().format('x')), 'info');

const cfg = JSON.parse(fs.readFileSync('./taskdeamon.json').toString());

startTaskDeamon(cfg, taskFactory);