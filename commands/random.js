import {fetchJSONFromAPI} from "../api/request.js";
import ora from "ora";
import Table from "cli-table";
import {CACHE_TIMEOUT_MINUTES, getCache, setCache} from "../helpers/cache-manager.js";

export const random = async function (cmd) {
    const spinner = ora('Finding a random problem...').start();
    const url = 'https://codeforces.com/api/problemset.problems';
    const table = new Table({});
    const _cache = getCache('problems');
    let problems;

    if (_cache && (_cache.timestamp + CACHE_TIMEOUT_MINUTES*60*1000) > Date.now()) {
        problems = _cache.data;
    } else {
        try {
            const res = await fetchJSONFromAPI(url);
            problems = res.result.problems;
            setCache('problems', problems);
        } catch (error) {
            spinner.fail('Error fetching from Codeforces API');
            console.error(error);
        }
    }

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
        if (rating && tags) {
            spinner.fail(`No problems found tagged with \'${tags}\' for ${rating} rating :(`);
        } else if (rating) {
            spinner.fail(`No problems found for ${rating} rating :(`);
        } else {
            spinner.fail(`No problem found tagged with \'${tags}\' :(`);
        }
    } else {
        const randomIndex = Math.floor(Math.random() * problems.length);
        const p = problems[randomIndex];
        const link = `https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`;

        table.push(
            {'Contest ID': p.contestId},
            {'Index': p.index},
            {'Name': p.name},
            {'Rating': p.rating},
            {'Tags': p.tags.join(', ')},
            {'Link': link},
        );

        spinner.stop();
        console.log(table.toString());
    }

}