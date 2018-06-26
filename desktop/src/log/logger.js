
"use strict";

const app = require('electron').app;

const path = require('path');
const _ = require('lodash');

var logger = require('tracer').console();

var chalk = require('chalk');



module.exports={

    error:function (msg,err) {
        var statement='';
        if(err)
            statement=msg+','+err;
        else
            statement=msg;
        console.log(chalk.red('error=>'+statement));
    },
    info:function(msg)
    {
        console.log(chalk.green('info=>'+msg));
    }
}