import ora from "ora";
import Table from "cli-table3";
import {CACHE_TIMEOUT_MINUTES, getCache, setCache} from "../helpers/cache-manager.js";
import {fetchJSONFromAPI} from "../api/request.js";
import moment from "moment";
import "moment-duration-format";
import inquirer from "inquirer";
import {consoleWidth, dataColMaxWidth, keyColMaxWidth} from "../helpers/terminal-utils.js";

export const contest = async function (cmd) {
    const spinner = ora('Fetching contests...').start();
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
            spinner.fail(' Network Error: Failed to fetch contests');
            console.error(error);
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
        spinner.fail(` No contests found`);
    } else {
        spinner.stop();
        if (cmd.id) {
            printContest(cmd, contests[0]);
        } else {
            displayMenu(cmd, contests);
        }
    }
}

const displayMenu = function (cmd, contests) {
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
            message: ' Choose a contest',
            choices: choices,
        }
    ])
        .then((answers) => {
            printContest(cmd, answers.contest, () => displayMenu(cmd, contests));
        })
        .catch((err) => {
            if (!err.message.includes('force closed')) {
                console.log(err)
            }
        });
}

const printContest = function (cmd, c, goBack) {
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
            [{content: `Cont-est # ${c.id}`, hAlign: "center", colSpan: 2}],
            ['\ue780  Name', c.name],
            ['\uf400  Type', c.type],
            ['\uf058  Phase', c.phase],
            ['\uf03a  Frozen', c.frozen ? "Yes" : "No"],
            ['\udb81\udd1b  Duration', duration],
            ['\udb81\udc6e  Start Time', startTime],
            ['\udb80\udc04  Prepared By', c.preparedBy ?? "N/A"],
            ['\ueb14  Website URL', c.websiteUrl ?? "N/A"],
            ['\uf463  Difficulty', c.difficulty ?? "N/A"],
            ['\udb81\udc74  Kind', c.kind ?? "N/A"],
            ['\udb80\udd46  City', c.city ?? "N/A"],
            ['\ued00  Region', c.icpcRegion ?? "N/A"],
            ['\ueb01  Country', c.country ?? "N/A"],
            ['\udb80\udced  Season', c.season ?? "N/A"],
        );
    } else {
        table.push(
            [{content: `Contest # ${c.id}`, hAlign: "center", colSpan: 2}],
            ['\ue780  Name', c.name],
            ['\uf058  Phase', c.phase],
            ['\uf03a  Frozen', c.frozen ? "Yes" : "No"],
            ['\udb81\udd1b  Duration', duration],
            ['\udb81\udc6e  Start Time', startTime],
            ['\ueb14  Link', `https://codeforces.com/contest/${c.id}`]
        );
    }
    console.log(table.toString());

    inquirer
        .prompt([
            {
                type: 'confirm',
                name: 'back',
                message: ' Go back to menu?',
                default: true,
            },
        ])
        .then((answers) => {
            if (answers.back) {
                goBack();
            } else {
                process.exit(0);
            }
        }).catch(err => {
        if (!err.message.includes('force closed')) {
            console.log(err);
        }
    });
}