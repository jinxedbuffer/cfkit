#! /usr/bin/env node
'use strict';

import {program} from "commander";
import {random} from "./commands/random.js";
import {flush} from "./commands/flush.js";

const logo =
    ' ▗▄▄▖▗▄▄▄▖▗▖ ▗▖▗▄▄▄▖▗▄▄▄▖\n' +
    '▐▌   ▐▌   ▐▌▗▞▘  █    █  \n' +
    '▐▌   ▐▛▀▀▘▐▛▚▖   █    █  \n' +
    '▝▚▄▄▖▐▌   ▐▌ ▐▌▗▄█▄▖  █  \n' +
    '                         \n' +
    'Terminal application for algo experts.';

// default action
program
    .action(() => {
        console.log(logo);
        console.log('\nType `cf -h` to see available commands.');
    });

// info
program
    .name('cf')
    .description(logo)
    .usage('[command] [options]')
    .version('0.1.0');

// subcommands
program
    .command('random')
    .description('gives a random problem')
    .option('-r, --rating <rating>', 'set rating filter')
    .option('-t, --tags <tags>', 'set tags filter (comma-separated tags)')
    .action(random);

program
    .command('flush')
    .description('deletes all stored cache')
    .action(flush);

program.parse(process.argv);