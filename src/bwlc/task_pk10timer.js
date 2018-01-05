"use strict";

const moment = require('moment');
const { Task, crawlercore, log } = require('jarvis-task');
const { CrawlerMgr } = crawlercore;
const { taskFactory } = require('../taskfactory');
const { TASK_NAMEID_PK10TIMER } = require('../taskdef');
const { LotteryMgr } = require('../lotterymgr');
const { addCurPK10Crawler } = require('./pk10');

function procCrawler(curpage, lastcode, lasthm) {
    addCurPK10Crawler(curpage, lastcode, (crawler) => {
        let lst = crawler.options.lstpk10;
        if (lst.length > 0) {
            if (lst[lst.length - 1].code > lastcode + 1) {
                procCrawler(curpage + 1, lastcode, lasthm);
            }

            if (curpage == 1) {
                let hm = parseInt(moment(lst[0].opentime, 'YYYY-MM-DD HH:mm').format('HHmm'));

                log('info', 'lasthm ' + lasthm);
                log('info', 'hm ' + hm);

                if (hm < lasthm) {
                    // 这里不能settimeout，后面会被关掉的
                    // 暂时在crawlermgr层做延时吧
                    // setTimeout(() => {
                        procCrawler(1, lst[0].code, lasthm);
                    // }, 1000);
                }
            }
        }
        else {
            if (curpage == 1) {
                procCrawler(1, lastcode, lasthm);
            }
        }
    });
}

class TaskPK10Timer extends Task {
    constructor(taskfactory, cfg) {
        super(taskfactory, TASK_NAMEID_PK10TIMER, cfg);
    }

    onStart() {
        super.onStart();

        LotteryMgr.singleton.init(this.cfg.maindb);
        LotteryMgr.singleton.getCurPK10().then(async (curpk10) => {
            if (curpk10 == undefined) {
                this.onEnd();

                return ;
            }

            let curhm = parseInt(moment(curpk10.opentime, 'YYYY-MM-DD HH:mm').format('HHmm'));

            let th = parseInt(moment().format('HH'));
            let tm = parseInt(moment().format('mm'));
            if (th < 9) {
                this.onEnd();

                return ;
            }

            let thm = Math.floor(tm / 10);
            let tmm = tm % 10;
            if (tmm >= 7) {
                tmm = 7;
            }
            else {
                tmm = 2;
            }

            tm = thm * 10 + tmm;
            let hm = th * 100 + tm;

            log('info', JSON.stringify(curpk10));
            log('info', 'hm ' + hm);

            if (hm <= curhm) {
                this.onEnd();

                return ;
            }

            procCrawler(1, curpk10.code, hm);

            CrawlerMgr.singleton.start(true, false, async () => {
                this.onEnd();
            }, true);
        });

        // addPK10MaxPageCrawler(async (crawler) => {
        //     for (let ii = 1; ii <= crawler.options.pk10_maxpage; ++ii) {
        //         addPK10Crawler(ii, '', () => {});
        //     }
        // });
    }
};

taskFactory.regTask(TASK_NAMEID_PK10TIMER, (taskfactory, cfg) => {
    return new TaskPK10Timer(taskfactory, cfg);
});

exports.TaskPK10Timer = TaskPK10Timer;