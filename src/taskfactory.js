"use strict";

const { TaskFactory, regTaskFactory_InitCrawlerMgr, regTaskFactory_Shell, regTaskFactory_Chain } = require('jarvis-task');
const { TASKFACTORY_NAMEID_FINANCEMAIN } = require('./taskdef');

let taskFactory = new TaskFactory(TASKFACTORY_NAMEID_FINANCEMAIN);
regTaskFactory_InitCrawlerMgr(taskFactory);
regTaskFactory_Shell(taskFactory);
regTaskFactory_Chain(taskFactory);

exports.taskFactory = taskFactory;
