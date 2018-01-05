"use strict";

const util = require('util');
const fs = require('fs');
const moment = require('moment');
const { Task, crawlercore, log } = require('jarvis-task');
const { CrawlerMgr } = crawlercore;

const SQL_BATCH_NUMS = 4096;

class LotteryMgr{
    constructor() {
        this.mysqlid = undefined;
    }

    async init(mysqlid) {
        this.mysqlid = mysqlid;
    }

    async _fixPK10(lst) {
        if (lst.length <= 0) {
            return ;
        }

        let conn = CrawlerMgr.singleton.getMysqlConn(this.mysqlid);
        let str0 = '';
        for (let ii = 0; ii < lst.length; ++ii) {
            if (ii > 0) {
                str0 += ' or ';
            }
            str0 += ' code = ' + lst[ii].code + ' ';
        }

        let str = util.format("delete from `pk10` where %s;", str0);

        try{
            await conn.query(str);
        }
        catch(err) {
            log('error', 'mysql err: ' + err + ' sql: ' + str);
        }
    }

    async getCurPK10() {
        let conn = CrawlerMgr.singleton.getMysqlConn(this.mysqlid);
        let sql = 'select code, opentime from pk10 order by code desc limit 0, 1;';
        try{
            let [rows, fields] = await conn.query(sql);
            if (rows.length > 0) {
                return {code: rows[0].code, opentime: rows[0].opentime};
            }
        }
        catch(err) {
            log('error', 'mysql err: ' + err + ' sql: ' + sql);
        }

        return undefined;
    }

    async savePK10(lst) {
        if (lst.length <= 0) {
            return ;
        }

        await this._fixPK10(lst);

        let conn = CrawlerMgr.singleton.getMysqlConn(this.mysqlid);

        let fullsql = '';
        let sqlnums = 0;

        for (let i = 0; i < lst.length; ++i) {
            let cursp = lst[i];
            let str0 = '';
            let str1 = '';

            let j = 0;
            for (let key in cursp) {
                if (cursp[key] != undefined) {
                    if (j != 0) {
                        str0 += ', ';
                        str1 += ', ';
                    }

                    str0 += '`' + key + '`';
                    str1 += "'" + cursp[key] + "'";

                    ++j;
                }
            }

            let tname = 'pk10';
            let sql = util.format("insert into %s(%s) values(%s);", tname, str0, str1);

            fullsql += sql;
            ++sqlnums;

            if (sqlnums > SQL_BATCH_NUMS) {
                try {
                    await conn.query(fullsql);
                }
                catch(err) {
                    log('error', 'mysql err: ' + err + ' sql: ' + fullsql);
                }

                fullsql = '';
                sqlnums = 0;
            }
        }

        if (sqlnums > 0) {
            try {
                await conn.query(fullsql);
            }
            catch(err) {
                log('error', 'mysql err: ' + err + ' sql: ' + fullsql);
            }
        }

        return true;
    }
}

LotteryMgr.singleton = new LotteryMgr();

exports.LotteryMgr = LotteryMgr;