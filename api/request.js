import axios from 'axios';

export async function fetchJSONFromAPI(url) {
    const response = await axios.get(url);
    return response.data;
}