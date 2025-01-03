import ora from "ora";
import {CACHE_TIMEOUT_MINUTES, getCache, setCache} from "../helpers/cache-manager.js";
import {fetchJSONFromAPI} from "../api/request.js";
import moment from "moment/moment.js";
import inquirer from "inquirer";
import Table from "cli-table3";
import {consoleWidth, dataColMaxWidth, keyColMaxWidth} from "../helpers/terminal-utils.js";
import open from "open";

export const blog = async function (cmd) {
    const spinner = ora('Fetching blogs...').start();
    const url = `https://codeforces.com/api/user.blogEntries?handle=${cmd.user}`;
    let blogs;
    const _cache = getCache(`blogs-${cmd.user}`);

    if (_cache && (_cache.timestamp + CACHE_TIMEOUT_MINUTES * 60 * 1000) > Date.now()) {
        blogs = _cache.data;
    } else {
        try {
            const res = await fetchJSONFromAPI(url);
            blogs = res.result;
            setCache(`blogs-${cmd.user}`, blogs);
        } catch (error) {
            spinner.fail(' Network Error: Failed to fetch blogs');
            process.exit(1);
        }
    }

    if (blogs.length === 0) {
        spinner.fail(` No blogs found`);
    } else {
        spinner.stop();
        displayBlogsMenu(cmd, blogs);
    }
}

const displayBlogsMenu = function (cmd, blogs) {
    const width = process.stdout.columns;
    const maxIdLength = Math.max(...blogs.map(b => b.id.toString().length));
    const maxTimeLength = Math.max(...blogs.map(b => moment.duration(b.modificationTimeSeconds - (Date.now() / 1000), 's').humanize(true).length));

    const choices = blogs.map((b) => {
        const id = `# ${b.id}`.padEnd(maxIdLength + 2, ' ');
        const time = (moment.duration(b.modificationTimeSeconds - (Date.now() / 1000), 's').humanize(true)).toString().padEnd(maxTimeLength, ' ');
        const title = b.title.replace(/<\/?[^>]+(>|$)/g, "").slice(0, width - maxIdLength - maxTimeLength - 10);
        return {
            name: `${id} │ ${time} │ ${title}`,
            value: b
        }
    })

    inquirer.prompt([
        {
            type: 'list',
            name: 'blog',
            message: ' Choose a blog',
            choices: choices,
        }
    ])
        .then((answers) => {
            printBlog(answers.blog, () => displayBlogsMenu(cmd, blogs));
        })
        .catch((err) => {
            if (!err.message.includes('force closed')) {
                console.log(err)
            }
        });
}

const printBlog = function (b, back) {
    const table = new Table({
        colWidths: [keyColMaxWidth, ((consoleWidth - (keyColMaxWidth + 3)) < dataColMaxWidth ? (consoleWidth - (keyColMaxWidth + 3)) : dataColMaxWidth)],
        wordWrap: true
    });

    const timePosted = moment.duration(b.creationTimeSeconds - (Date.now() / 1000), 's').humanize(true);
    const timeModified = moment.duration(b.modificationTimeSeconds - (Date.now() / 1000), 's').humanize(true);

    table.push(
        [{colSpan: 2, hAlign: "center", content: `Blog # ${b.id}`}],
        ['Title', b.title.replace(/<\/?[^>]+(>|$)/g, "")],
        ['Author', b.authorHandle],
        ['Posted', timePosted],
        ['Last modified', timeModified],
        ['Popularity', b.rating],
        ['Tags', (b.tags.length !== 0) ? b.tags.join(', ') : "N/A"],
    );

    console.log(table.toString());
    chooser(b, back);
}

const chooser = function (b, back) {
    const choices = [
        {
            name: "Open in browser",
            value: "browserOpen"
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
                case 'browserOpen': {
                    open(`https://codeforces.com/blog/entry/${b.id}`)
                        .then(() => chooser(b, back))
                        .catch((err) => {
                            console.log(err);
                        });
                    break;
                }

                case 'back': {
                    back();
                    break;
                }

                default: {
                    process.exit(0);
                }
            }
        }).catch(err => {
        if (!err.message.includes('force closed')) {
            console.log(err);
        }
    });
}