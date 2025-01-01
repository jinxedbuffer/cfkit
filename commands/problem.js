import {fetchJSONFromAPI} from "../api/request.js";
import ora from "ora";
import Table from "cli-table3";
import {CACHE_TIMEOUT_MINUTES, getCache, setCache} from "../helpers/cache-manager.js";

export const problem = async function (cmd) {
    const spinner = ora('Fetching problems...').start();
    const url = 'https://codeforces.com/api/problemset.problems';
    const _cache = {
        problems: getCache('problems'),
        problemStats: getCache('problem-stats'),
    }

    let problems, problemStats;

    if (_cache.problems && _cache.problemStats && (_cache.problems.timestamp + CACHE_TIMEOUT_MINUTES*60*1000) > Date.now()) {
        problems = _cache.problems.data;
        problemStats = _cache.problemStats.data;
    } else {
        try {
            const res = await fetchJSONFromAPI(url);
            problems = res.result.problems;
            problemStats = res.result.problemStatistics;
            setCache('problems', problems);
            setCache('problem-stats', problemStats);
        } catch (error) {
            spinner.fail(' Network Error: Failed to fetch problems');
            process.exit(1);
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
        spinner.fail(' No problems found');
    } else {
        spinner.stop();

        const randomIndex = Math.floor(Math.random() * problems.length);
        const p = problems[randomIndex];
        const ps = problemStats[randomIndex];

        printProblem(p, ps);
    }
}

const printProblem = function (p, ps) {
    const table = new Table({
        colWidths: [20, 60],
        wordWrap: true
    });
    const link = `https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`;

    table.push(
        [{colSpan: 2, hAlign: "center", content: `Problem # ${p.contestId}${p.index}`}],
        ['\uf121 Name', p.name],
        ['\uf437 Points', p.points ?? "N/A"],
        ['\uf0e7 Rating', p.rating ?? "N/A"],
        ['\udb80\udc04 Solved Count', ps.solvedCount],
        ['\uf292 Tags', p.tags.join(', ')],
        ['\ueb14 Link', link],
    );

    console.log(table.toString());
}