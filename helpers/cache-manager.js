import fs from 'fs';
import path from 'path';

const PROJECT_DIR = path.join(import.meta.dirname, '..');
export const CACHE_DIR = path.join(PROJECT_DIR, 'cache');
export const CACHE_TIMEOUT_MINUTES = 60;

export const setCache = function (key, value) {
    if (!fs.existsSync(CACHE_DIR)) {
        fs.mkdirSync(CACHE_DIR);
    }
    const CACHE_FILE = path.join(CACHE_DIR, key + '.json');

    const cachedData = {
        timestamp: Date.now(),
        data: value,
    };

    fs.writeFileSync(CACHE_FILE, JSON.stringify(cachedData));
}

export const getCache = function (key) {
    const CACHE_FILE = path.join(CACHE_DIR, key + '.json');
    try {
        return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    } catch (_) {
        return null;
    }
}