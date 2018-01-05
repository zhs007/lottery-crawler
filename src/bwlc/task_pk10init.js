"use strict";

const { Task, crawlercore } = require('jarvis-task');
const { CrawlerMgr } = crawlercore;
const { taskFactory } = require('../taskfactory');
const { TASK_NAMEID_PK10INIT } = require('../taskdef');
const { LotteryMgr } = require('../lotterymgr');
const { addPK10Crawler, addPK10MaxPageCrawler } = require('./pk10');

class TaskPK10Init extends Task {
    constructor(taskfactory, cfg) {
        super(taskfactory, TASK_NAMEID_PK10INIT, cfg);
    }

    onStart() {
        super.onStart();

        LotteryMgr.singleton.init(this.cfg.maindb);

        addPK10MaxPageCrawler(async (crawler) => {
            for (let ii = 1; ii <= crawler.options.pk10_maxpage; ++ii) {
                addPK10Crawler(ii, '', () => {});
            }
        });

        CrawlerMgr.singleton.start(true, false, async () => {
            this.onEnd();
        }, true);
    }
};

taskFactory.regTask(TASK_NAMEID_PK10INIT, (taskfactory, cfg) => {
    return new TaskPK10Init(taskfactory, cfg);
});

exports.TaskPK10Init = TaskPK10Init;