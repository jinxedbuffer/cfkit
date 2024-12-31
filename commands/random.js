const fetchJSONFromAPI = require('../api/request');

const list = function (url) {
    fetchJSONFromAPI(url).then(res => {
        console.log(res.result[0]);
    });
}

module.exports = list;