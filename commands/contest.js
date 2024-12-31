import ora from "ora";
import Table from "cli-table3";
import {CACHE_TIMEOUT_MINUTES, getCache, setCache} from "../helpers/cache-manager.js";
import {fetchJSONFromAPI} from "../api/request.js";

export const contest = async function(cmd) {
    const spinner = ora('Fetching contests...').start();
    const url = 'https://codeforces.com/api/contest.list' + ((cmd.gym) ? '?gym=true' : '');
    let contests, _cache;

    if (cmd.gym) {
        _cache = getCache('contests-gym');
    } else {
        _cache = getCache('contests')
    }

    if (_cache && (_cache.timestamp + CACHE_TIMEOUT_MINUTES*60*1000) > Date.now()) {
        contests = _cache.data;
    } else {
        try {
            const res = await fetchJSONFromAPI(url);
            contests = res.result;
            setCache((cmd.gym) ? 'contests-gym' : 'contests', contests);
        } catch (error) {
            spinner.fail('Error fetching from Codeforces API');
            console.error(error);
        }
    }

    if (cmd.upcoming && cmd.active) {
        contests = contests.filter(contest =>
            contest.phase === 'BEFORE' || contest.phase === 'CODING'
        );
    } else if (cmd.active) {
        contests = contests.filter(contest =>
            contest.phase === 'CODING'
        )
    } else if (cmd.upcoming) {
        contests = contests.filter(contest =>
            contest.phase === 'BEFORE'
        )
    }

    if (cmd.limit) {
        contests = (cmd.gym) ? contests.slice(-(cmd.limit)) : contests.slice(0, cmd.limit);
    }

    if (contests.length === 0) {
        spinner.fail(`No contests found :(`);
    } else {
        spinner.stop();
        contests.forEach((c) => {
            const duration =
                ((c.durationSeconds / 3600) < 24)
                    ? (c.durationSeconds / 3600)  + 'h'
                    : (c.durationSeconds / (3600*24)) + 'd';
            const startTime =
                c.startTimeSeconds
                    ? new Date(c.startTimeSeconds*1000).toString()
                    : "N/A";

            const table = new Table();
            if (cmd.gym) {
                table.push(
                    [{content: `Contest # ${c.id}`, hAlign: "center", colSpan: 2}],
                    ['Name', c.name],
                    ['Type', c.type],
                    ['Phase', c.phase],
                    ['Frozen', c.frozen ? "Yes" : "No"],
                    ['Duration', duration],
                    ['Start Time', startTime],
                    ['Prepared By', c.preparedBy],
                    ['Website URL', c.websiteUrl ?? "N/A"],
                    ['Difficulty', c.difficulty ?? "N/A"],
                    ['Kind', c.kind ?? "N/A"],
                    ['Region', c.icpcRegion ?? "N/A"],
                    ['Country', c.country ?? "N/A"],
                    ['City', c.city ?? "N/A"],
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
                    ['Link', `https://codeforces.com/contest/${c.id}`]
                );
            }
            console.log(table.toString());
        })
    }
}