"use strict";

const { crawlercore, log } = require('jarvis-task');
let { CrawlerMgr, CRAWLER, DATAANALYSIS, STORAGE } = crawlercore;
let { LotteryMgr } = require('../lotterymgr');
let cheerio = require('cheerio');
let moment = require('moment');
let util = require('util');

function analysisNode(crawler, element, lst) {
    let code, opentime;
    let lstret = [];

    cheerio('td', element).each((ni, nele) => {
        let obj = cheerio(nele);
        if (ni == 0) {
            code = obj.text();
        }
        else if (ni == 1) {
            let curstr = obj.text();
            let curlst = curstr.split(',');

            for (let ii = 0; ii < curlst.length; ++ii) {
                lstret.push(parseInt(curlst[ii]));
            }
        }
        else if (ni == 2) {
            opentime = obj.text();
        }

        return true;
    });

    let curnode = {
        code: code,
        opentime: opentime
    };

    for (let ii = 0; ii < lstret.length; ++ii) {
        curnode['result' + ii] = lstret[ii];
    }

    lst.push(curnode);
}

// 分析数据
async function func_analysis(crawler) {
    let isok = false;

    if (crawler.options.pk10_mode == 'maxpage') {
        crawler.da.data('a.lastPage').each((index, element) => {
            if (index == 0) {
                let obj = cheerio(element);
                let uri = obj.attr('href');
                let astr = uri.split('=');
                crawler.options.pk10_maxpage = astr[1];

                isok = true;
            }

            return true;
        });
    }
    else {
        crawler.da.data('table.tb').each((index, element) => {
            if (index == 0) {
                cheerio('tbody', element).each(async (fi, tele) => {
                    if (fi == 0) {
                        let lst = [];

                        cheerio('tr', element).each((ni, nele) => {
                            if (ni > 1) {
                                analysisNode(crawler, nele, lst);
                            }

                            return true;
                        });

                        if (lst.length > 0) {
                            isok = true;

                            await LotteryMgr.singleton.savePK10(lst);
                        }
                    }

                    return true;
                });
            }

            return true;
        });
    }

    if (!isok) {
        log('error', crawler.data);

        return undefined;
    }

    return crawler;
}

let pk10Options = {
    // 主地址
    uri: 'http://bwlc.net/bulletin/trax.html?page=1',
    timeout: 30 * 1000,

    // 爬虫类型
    crawler_type: CRAWLER.REQUEST,

    // 数据分析配置
    dataanalysis_type: DATAANALYSIS.CHEERIO,

    // 分析数据
    func_analysis: func_analysis,
    func_onfinish: undefined,

    pk10_maxpage: 15070
};

function addPK10Crawler(page, pk10mode, callback) {
    let op = Object.assign({}, pk10Options);

    op.uri = util.format("http://bwlc.net/bulletin/trax.html?page=%d", page);
    op.func_onfinish = callback;
    op.pk10_mode = pk10mode;

    CrawlerMgr.singleton.addCrawler(op);
}

function addPK10MaxPageCrawler(callback) {
    addPK10Crawler(1, 'maxpage', callback);
}

exports.pk10Options = pk10Options;
exports.addPK10Crawler = addPK10Crawler;
exports.addPK10MaxPageCrawler = addPK10MaxPageCrawler;