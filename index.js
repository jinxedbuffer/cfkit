#! /usr/bin/env node
'use strict';

import {program} from "commander";
import {problem} from "./commands/problem.js";
import {flush} from "./commands/flush.js";
import {contest} from "./commands/contest.js";

const logo =
    ' ▗▄▄▖▗▄▄▄▖▗▖ ▗▖▗▄▄▄▖▗▄▄▄▖\n' +
    '▐▌   ▐▌   ▐▌▗▞▘  █    █  \n' +
    '▐▌   ▐▛▀▀▘▐▛▚▖   █    █  \n' +
    '▝▚▄▄▖▐▌   ▐▌ ▐▌▗▄█▄▖  █  \n' +
    '                         \n' +
    'cfkit v0.1.0';

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
    .helpOption('-h, --help', 'Display help for a command');

// subcommands
program
    .command('contest')
    .description('Show available contests')
    .option('-i, --id <id>', 'Show details of a contest by its ID')
    .option('-s, --search <name>', 'Search for a contest by its name')
    .option('-u, --upcoming', 'Show upcoming contests')
    .option('-a, --active', 'Show active contests')
    .option('-l, --limit <limit>', 'Number of contests to show', '100')
    .option('-g, --gym', 'Show only gym contests')
    .action((cmd) => contest(cmd, () => process.exit(0)));


program
    .command('problem')
    .description('Show problems from problemset')
    .option('-R, --randomize', 'Randomize problems')
    .option('-c, --contest <id>', 'Show problems of a specific contest')
    .option('-l, --limit <limit>', 'Limit how many problems to show', '10')
    .option('-r, --rating <rating>', 'Set rating filter')
    .option('-t, --tags <tags>', 'Set tags filter (comma-separated tags)')
    .action((cmd) => problem(cmd, () => process.exit(0)));

program
    .command('flush')
    .description('Deletes all stored cache')
    .action(flush);

program.parse(process.argv);