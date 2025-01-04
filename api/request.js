import axios from 'axios';

export async function fetchJSONFromAPI(url) {
    let response;
    try {
        response = await axios.get(url);
    } catch (e) {
        throw new Error(`Network Error: Error fetching JSON from API`);
    }
    return response.data;
}