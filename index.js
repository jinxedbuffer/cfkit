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
        console.log('\nType `cf -h` to see available commands.');
    });

// info
program
    .name('cf')
    .description(logo)
    .usage('[command] [options]')
    .version('0.1.0', '-v, --version', 'Output the version number')
    .helpOption('-h, --help [command]', 'Display help for a command');

// subcommands
program
    .command('random')
    .description('Gives a random problem from problemset')
    .option('-r, --rating <rating>', 'Set rating filter')
    .option('-t, --tags <tags>', 'Set tags filter (comma-separated tags)')
    .action(random);

program
    .command('flush')
    .description('Deletes all stored cache')
    .action(flush);

program.parse(process.argv);