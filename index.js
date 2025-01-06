#! /usr/bin/env node
'use strict';

import {program} from "commander";
import {problem} from "./commands/problem.js";
import {flush} from "./commands/flush.js";
import {contest} from "./commands/contest.js";
import {upgrade} from "./commands/upgrade.js";
import {blog} from "./commands/blog.js";
import {judge} from "./commands/judge.js";
import {generate} from "./commands/generate.js";
import updateNotifier from "update-notifier";
import packageJson from './package.json' with {type: 'json'};

const notifier = updateNotifier({pkg: packageJson});

if (notifier.update) {
    console.log(`[!] Update available: ${notifier.update.latest}`);
    console.log("[!] Run `cf upgrade` to upgrade to latest version");
}

const logo =
    "  _____ ______ _  _______ _______\n" +
    "/ ____|  ____| | / /_   _|__   __|\n" +
    "| |    | |__  | ' /  | |    | |\n" +
    "| |    |  __| |  <   | |    | |\n" +
    "| |____| |    | . \\ _| |_   | |\n" +
    " \\_____|_|    |_|\\_\\_____|  |_|\n\n" +
    "⭐ If you enjoy this software, give it a star:\n" +
    "https://github.com/jinxedbuffer/cfkit";


// default action
program
    .action(() => {
        console.log('See `cf -h` for help');
    });

// info

program
    .name('cf')
    .description(logo)
    .usage('[command] [options]')
    .version('0.1.13', '-v, --version', 'Output the version number')
    .helpOption('-h, --help', 'Display help for a command');

// subcommands
program
    .command('contest')
    .alias('c')
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
    .alias('p')
    .description('Show problems from problemset')
    .option('-R, --randomize', 'Randomize problems')
    .option('-i, --id <id>', "Search for a problem by its ID")
    .option('-s, --search <name>', 'Search for a problem by its name')
    .option('-c, --contest <id>', 'Show problems of a specific contest')
    .option('-l, --limit <limit>', 'Limit how many problems to show', '15')
    .option('-r, --rating <rating>', 'Set rating filter')
    .option('-t, --tags <tags>', 'Set tags filter (comma-separated tags)')
    .action((cmd) => problem(cmd, () => process.exit(0)));

program
    .command('generate')
    .alias('g')
    .description('Generate files (`in.txt`, `out.txt`, `main.cpp`)')
    .option('-p, --problem <id>', 'Generate files for a problem')
    .option('-c, --contest <id>', 'Generates files for each problem in contest')
    .option('-t, --template <file>', 'Placeholder to use for `main.cpp`', 'template.cpp')
    .action(generate);

program
    .command('judge')
    .alias('j')
    .description('Judge code against testcases')
    .requiredOption('-i, --input <file>', 'Input file name', 'in.txt')
    .requiredOption('-o, --output <file>', 'Output file name', 'out.txt')
    .requiredOption('-c, --code <file>', 'Code file name', 'main.cpp')
    .action(judge);

program
    .command('blog')
    .alias('b')
    .description('Show blog posts')
    .requiredOption('-u, --user <handle>', 'Show blog posts by user')
    .action(blog);

program
    .command('upgrade')
    .alias('u')
    .description('Upgrade cfkit')
    .action(upgrade);

program
    .command('flush')
    .alias('f')
    .description('Deletes all stored cache')
    .action(flush);

program.parse(process.argv);