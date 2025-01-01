import {fetchJSONFromAPI} from "../api/request.js";
import ora from "ora";
import Table from "cli-table3";
import {CACHE_TIMEOUT_MINUTES, getCache, setCache} from "../helpers/cache-manager.js";
import inquirer from "inquirer";
import {consoleWidth, dataColMaxWidth, keyColMaxWidth} from "../helpers/terminal-utils.js";

export const problem = async function (cmd) {
    const spinner = ora('Fetching problems...').start();
    const url = 'https://codeforces.com/api/problemset.problems';
    const _cache = getCache('problems');

    let problems, problemStats;

    if (_cache && (_cache.timestamp + CACHE_TIMEOUT_MINUTES * 60 * 1000) > Date.now()) {
        problems = _cache.data;
    } else {
        try {
            const res = await fetchJSONFromAPI(url);
            problems = res.result.problems;
            problemStats = res.result.problemStatistics;

            for (let i = 0; i < problems.length; i++) {
                problems[i].solvedCount = problemStats[i].solvedCount;
            }

            setCache('problems', problems);
        } catch (error) {
            spinner.fail(' Network Error: Failed to fetch problems');
            process.exit(1);
        }
    }

    const limit = cmd.limit ? parseInt(cmd.limit) : 10;
    const rating = cmd.rating ? parseInt(cmd.rating) : null;
    const tags = cmd.tags ? cmd.tags.split(',').map(tag => tag.trim()) : null;

    if (rating) {
        problems = problems.filter(problem => problem.rating === rating);
    }

    if (tags) {
        problems = problems.filter(problem =>
            tags.every(sTag =>
                problem.tags.some(pTag =>
                    pTag.includes(sTag)
                )
            )
        );
    }

    if (problems.length === 0) {
        spinner.fail(' No problems found');
    } else {
        if (cmd.randomize) {
            let randomProblems = [];

            if (limit >= problems.length) {
                randomProblems = problems;
            } else {
                const duplicateChecker = [];
                for (let i = 0; i < limit; i++) {
                    let randomIndex = Math.floor(Math.random() * problems.length);
                    while (duplicateChecker.includes(randomIndex)) {
                        randomIndex = Math.floor(Math.random() * problems.length);
                    }
                    duplicateChecker.push(randomIndex);
                    randomProblems.push(problems[randomIndex]);
                }
                r
            }
            problems = randomProblems;
        } else {
            problems = problems.slice(0, cmd.limit);
        }

        spinner.stop();
        displayMenu(problems);
    }
}

const displayMenu = function (problems) {

    const width = process.stdout.columns;
    const maxIdLength = Math.max(...problems.map(p => {
        return (`${p.contestId}${p.index}`).length;
    }));
    const maxNameLength = Math.max(...problems.map(p => {
        return p.name.length;
    }));

    const choices = problems.map((p) => {
        const id = `# ${p.contestId}${p.index}`.padEnd(maxIdLength + 2, ' ');
        const name = `${p.name}`.padEnd(maxNameLength, ' ');
        const tags = p.tags.join(", ").slice(0, width - maxIdLength - maxNameLength - 10);

        return {
            name: `${id} │ ${name} │ ${tags}`,
            value: p
        }
    })

    inquirer.prompt([
        {
            type: 'list',
            name: 'problem',
            message: ' Choose a problem',
            choices: choices,
        }
    ])
        .then((answers) => {
            printProblem(answers.problem, () => {
                displayMenu(problems);
            });
        })
        .catch((err) => {
            if (!err.message.includes('force closed')) {
                console.log(err);
            }
        });
}

const printProblem = function (p, goBack) {
    const table = new Table({
        colWidths: [keyColMaxWidth, ((consoleWidth - (keyColMaxWidth + 3)) < dataColMaxWidth ? (consoleWidth - (keyColMaxWidth + 3)) : dataColMaxWidth)],
        wordWrap: true
    });

    const link = `https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`;

    table.push(
        [{colSpan: 2, hAlign: "center", content: `Problem # ${p.contestId}${p.index}`}],
        ['\uf121  Name', p.name],
        ['\uf437  Points', p.points ?? "N/A"],
        ['\uf0e7  Rating', p.rating ?? "N/A"],
        ['\udb80\udc04  Solved Count', p.solvedCount],
        ['\uf292  Tags', p.tags.join(', ')],
        ['\ueb14  Link', link],
    );

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