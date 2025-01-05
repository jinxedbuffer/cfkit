import ora from "ora";
import Table from "cli-table3";
import {CACHE_TIMEOUT_MINUTES, getCache, setCache} from "../helpers/cache-manager.js";
import {fetchJSONFromAPI} from "../api/request.js";
import moment from "moment";
import "moment-duration-format";
import inquirer from "inquirer";
import {consoleWidth, dataColMaxWidth, keyColMaxWidth} from "../helpers/terminal-utils.js";
import open from "open";
import {problem} from "./problem.js";
import {generate} from "./generate.js";

export const contest = async function (cmd, back) {
    const spinner = ora('Fetching contests').start();
    const url = 'https://codeforces.com/api/contest.list' + ((cmd.gym) ? '?gym=true' : '');
    let contests, _cache;

    if (cmd.gym) {
        _cache = getCache('contests-gym');
    } else {
        _cache = getCache('contests')
    }

    if (_cache && (_cache.timestamp + CACHE_TIMEOUT_MINUTES * 60 * 1000) > Date.now()) {
        contests = _cache.data;
    } else {
        try {
            const res = await fetchJSONFromAPI(url);
            contests = res.result;
            setCache((cmd.gym) ? 'contests-gym' : 'contests', contests);
        } catch (error) {
            spinner.fail('Failed to fetch contests');
            console.error(error);
            return;
        }
    }

    if (cmd.upcoming && cmd.active) {
        contests = contests.filter(contest =>
            contest.phase === 'BEFORE' || contest.phase === 'CODING'
        );
    } else if (cmd.active) {
        contests = contests.filter(contest =>
            contest.phase === 'CODING' || contest.phase === 'PENDING_SYSTEM_TEST' || contest.phase === 'SYSTEM_TEST'
        )
    } else if (cmd.upcoming) {
        contests = contests.filter(contest =>
            contest.phase === 'BEFORE'
        )
    }

    if (cmd.id) {
        contests = contests.filter(contest =>
            contest.id === parseInt(cmd.id)
        )
    }

    if (cmd.search) {
        const tags = cmd.search.toLowerCase().split(' ');
        contests = contests.filter(contest =>
            tags.every(sTag =>
                contest.name.toLowerCase().split(' ').some(nTag =>
                    nTag.includes(sTag)
                )
            )
        )
    }

    contests.sort((a, b) => {
        if (!a.relativeTimeSeconds) return 1;
        if (!b.relativeTimeSeconds) return -1;
        return a.relativeTimeSeconds - b.relativeTimeSeconds;
    });

    if (cmd.limit) {
        contests = contests.slice(0, cmd.limit);
    }

    if (contests.length === 0) {
        spinner.fail('No contests found');
        return;
    }

    spinner.stop();
    if (cmd.id) {
        printContest(cmd, contests[0], back);
    } else {
        displayContestMenu(cmd, contests);
    }

}

const displayContestMenu = function (cmd, contests) {
    const width = process.stdout.columns;
    const maxIdLength = Math.max(...contests.map(c => c.id.toString().length));
    const maxTimeLength = Math.max(...contests.map(c => moment.duration(-c.relativeTimeSeconds, 's').humanize(true).length));

    const choices = contests.map((c) => {
        const id = `# ${c.id}`.padEnd(maxIdLength + 2, ' ');
        const time = (moment.duration(-c.relativeTimeSeconds, 's').humanize(true)).toString().padEnd(maxTimeLength, ' ');
        const name = c.name.slice(0, width - maxIdLength - maxTimeLength - 10);
        return {
            name: `${id} │ ${time} │ ${name}`,
            value: c
        }
    })

    inquirer.prompt([
        {
            type: 'list',
            name: 'contest',
            message: 'Select a contest',
            choices: choices,
        }
    ])
        .then((answers) => {
            printContest(cmd, answers.contest, () => {
                    displayContestMenu(cmd, contests);
                }
            );
        })
        .catch((e) => {
            if (!e.message.includes('force closed')) {
                console.error(e);
            }
        });
}

const printContest = function (cmd, c, back) {
    const link = (cmd.gym) ? c.websiteUrl : `https://codeforces.com/contest/${c.id}`;
    const duration = moment.duration(c.durationSeconds, 's').format('d [days] h [hours] m [minutes]', {trim: 'all'});
    const startTime =
        c.startTimeSeconds
            ? `${moment.unix(c.startTimeSeconds).format("DD MMM YYYY | hh:mm A")} (${moment.duration(-c.relativeTimeSeconds, 's').humanize(true)})`
            : "N/A";

    const table = new Table({
            colWidths: [keyColMaxWidth, ((consoleWidth - (keyColMaxWidth + 3)) < dataColMaxWidth ? (consoleWidth - (keyColMaxWidth + 3)) : dataColMaxWidth)],
            wordWrap: true
        }
    );

    if (cmd.gym) {
        table.push(
            [{content: `Contest # ${c.id}`, hAlign: "center", colSpan: 2}],
            ['Name', c.name],
            ['Type', c.type],
            ['Phase', c.phase],
            ['Frozen', c.frozen ? "Yes" : "No"],
            ['Duration', duration],
            ['Start Time', startTime],
            ['Prepared By', c.preparedBy ?? "N/A"],
            ['Website URL', c.websiteUrl ?? "N/A"],
            ['Difficulty', c.difficulty ?? "N/A"],
            ['Kind', c.kind ?? "N/A"],
            ['City', c.city ?? "N/A"],
            ['Region', c.icpcRegion ?? "N/A"],
            ['Country', c.country ?? "N/A"],
            ['Season', c.season ?? "N/A"],
        );
    } else {
        table.push(
            [{content: `Contest # ${c.id}`, hAlign: "center", colSpan: 2}],
            ['Name', c.name],
            ['Phase', c.phase],
            ['Frozen', c.frozen ? "Yes" : "No"],
            ['Duration', duration],
            ['Start Time', startTime],
            ['Link', link],
        );
    }
    console.log(table.toString());
    chooser(cmd, c, back, link);
}

const chooser = function (cmd, c, back, link) {
    let choices = [
        ...(link ? [
            {
                name: "Open in browser",
                value: "browserOpen"
            }
        ] : []),
        {
            name: "Generate files for this contest",
            value: "generateFiles"
        },
        {
            name: "See problems",
            value: "contestProblems"
        },
        {
            name: "Back",
            value: "back"
        },
        {
            name: "Exit",
            value: "exit"
        }
    ];

    inquirer
        .prompt([
            {
                type: 'list',
                name: 'options',
                message: 'Choose an option',
                choices: choices,
            },
        ])
        .then((answers) => {
            switch (answers.options) {
                case 'contestProblems': {
                    problem({
                        contest: c.id,
                    }, () => displayContestMenu(cmd, c, back))
                        .catch((e) => console.error(e));
                    break;
                }

                case 'generateFiles': {
                    generate({
                        contest: c.id,
                        template: "template.cpp"
                    }).catch((e) => console.error(e));
                    break;
                }

                case 'back': {
                    back();
                    break;
                }

                case 'browserOpen': {
                    open(link)
                        .then(() => chooser(cmd, c, back, link))
                        .catch((e) => {
                            console.error(e);
                        });
                    break;
                }

                default: {
                    process.exit(0);
                }
            }
        }).catch(e => {
        if (!e.message.includes('force closed')) {
            console.log(e);
        }
    });
}