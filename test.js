import * as cheerio from 'cheerio';

const res = await fetch(`https://codeforces.com/contest/100`).then(res => res.text());
const $ = cheerio.load(res);
console.log($.html());