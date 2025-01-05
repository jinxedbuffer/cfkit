import {fetchJSONFromAPI} from "../api/request.js";
import ora from "ora";
import Table from "cli-table3";
import {CACHE_TIMEOUT_MINUTES, getCache, setCache} from "../helpers/cache-manager.js";
import inquirer from "inquirer";
import {consoleWidth, dataColMaxWidth, keyColMaxWidth} from "../helpers/terminal-utils.js";
import {contest} from "./contest.js";
import open from "open";
import {generate} from "./generate.js";

export const problem = async function (cmd, back) {
    const spinner = ora('Fetching problems').start();
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
        } catch (e) {
            spinner.fail('Network Error: Failed to fetch problems');
            console.error(e);
            return;
        }
    }

    if (cmd.id) {
        const match = cmd.id.match(/^(\d+)([A-Z]\d*)$/);
        if (!match) {
            spinner.fail(`Invalid problem ID`);
            return;
        }
        const contestId = match[1];
        const problemIndex = match[2];
        problems = problems.filter(problem =>
            (problem.contestId === parseInt(contestId)) && (problem.index === problemIndex)
        )
    }

    const limit = cmd.limit ? parseInt(cmd.limit) : 10;
    const rating = cmd.rating ? parseInt(cmd.rating) : null;
    const contest = cmd.contest ? parseInt(cmd.contest) : null;
    const tags = cmd.tags ? cmd.tags.split(',').map(tag => tag.trim()) : null;
    const searchTags = cmd.search ? cmd.search.toLowerCase().split(' ') : null;

    if (rating) {
        problems = problems.filter(problem => problem.rating === rating);
    }

    if (contest) {
        problems = problems.filter(problem => problem.contestId === contest);
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

    if (searchTags) {
        problems = problems.filter(problem =>
            searchTags.every(sTag =>
                problem.name.toLowerCase().split(' ').some(nTag =>
                    nTag.includes(sTag)
                )
            )
        )
    }

    if (problems.length === 0) {
        spinner.fail('No problems found');
        return;
    }

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
        }
        problems = randomProblems;
    } else {
        problems = problems.slice(0, cmd.limit);
    }

    spinner.stop();
    
    if (cmd.id) {
        printProblem(problems[0], back);
    } else {
        displayProblemsMenu(problems, back);
    }

}

const displayProblemsMenu = function (problems, back) {
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
            message: ' Select a problem',
            choices: choices,
        }
    ])
        .then((answers) => {
            printProblem(answers.problem, () => {
                displayProblemsMenu(problems, back);
            });
        })
        .catch((e) => {
            if (!e.message.includes('force closed')) {
                console.log(e);
            }
        });
}

const printProblem = function (p, back) {
    const table = new Table({
        colWidths: [keyColMaxWidth, ((consoleWidth - (keyColMaxWidth + 3)) < dataColMaxWidth ? (consoleWidth - (keyColMaxWidth + 3)) : dataColMaxWidth)],
        wordWrap: true
    });

    table.push(
        [{colSpan: 2, hAlign: "center", content: `Problem # ${p.contestId}${p.index}`}],
        ['Name', p.name],
        ['Points', p.points ?? "N/A"],
        ['Rating', p.rating ?? "N/A"],
        ['Solved Count', p.solvedCount],
        ['Tags', p.tags.join(', ')],
    );

    console.log(table.toString());
    chooser(p, back);
}

const chooser = function (p, back) {
    const choices = [
        {
            name: "Open in browser",
            value: "browserOpen"
        },
        {
            name: "Generate files for this problem",
            value: "generateFiles"
        },
        {
            name: "See contest",
            value: "contestDetails"
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
                message: ' Choose an option',
                choices: choices,
            },
        ])
        .then((answers) => {
            switch (answers.options) {
                case 'contestDetails': {
                    contest({
                            id: p.contestId,
                        },
                        () => printProblem(p, back)
                    ).catch((e) => {
                        console.error(e);
                    });
                    break;
                }

                case 'generateFiles': {
                    generate({
                        problem: `${p.contestId}${p.index}`,
                    }).catch((e) => console.error(e));
                    break;
                }

                case 'back': {
                    back();
                    break;
                }

                case 'browserOpen': {
                    open(`https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`)
                        .then(() => chooser(p, back))
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
            console.error(e);
        }
    });
}