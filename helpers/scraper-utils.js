import * as cheerio from 'cheerio';
import he from 'he';

export const CURRENT_WORKING_DIR = process.cwd();

export const getContestProblemsIndices = async function (contestId) {
    let res;
    try {
        res = await fetch(`https://codeforces.com/contest/${contestId}`).then(res => res.text());
    } catch (e) {
        console.error(e);
        throw new Error(`Network Error: Could not fetch problem list`);
    }

    const $ = cheerio.load(res);

    const problemIndices = [];

    $('.id', 'tr').each((i, el) => {
        problemIndices.push($(el).text().trim());
    });
    return problemIndices;
}

export const getTestCases = async function (contestId, problemIndex) {

    let res;
    try {
        res = await fetch(`https://codeforces.com/problemset/problem/${contestId}/${problemIndex}`).then(res => res.text());
    } catch (e) {
        console.error(e);
        throw new Error(`Network Error: Could not fetch test cases`);
    }

    const $ = cheerio.load(res);

    const testCases = [];

    const inputs = $('pre', '.input');
    const outputs = $('pre', '.output');

    inputs.each((i, el) => {
        let input = [];
        if ($(el).children('div').length) {
            $(el).children('div').each((i, ell) => {
                input.push($(ell).text());
            });
            input = input.join('\n');
        } else {
            input = he.decode($(el).html().replace(/<br>/g, '\n'));
        }
        const output = he.decode($(outputs[i]).html().replace(/<br>/g, '\n'));

        testCases.push({input, output});
    });

    return testCases;

}