import fs from 'fs';
import {CACHE_DIR} from "../helpers/cache-manager.js";

export const flush = async () => {
    if (fs.existsSync(CACHE_DIR)) {
        fs.rmSync(CACHE_DIR, { recursive: true, force: true });
        console.log('Cache flushed successfully.');
    } else {
        console.log('No cache to flush.');
    }
}