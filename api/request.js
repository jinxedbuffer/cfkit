import axios from 'axios';

export async function fetchJSONFromAPI(url) {
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        throw error;
    }
}