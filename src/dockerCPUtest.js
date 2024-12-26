import axios from "axios";

const protocol = "http://";
const host = "localhost";
const port = 8080;
const endpoint = "/api/v1/stress/1000000/1000000";


let portCount = 9;

let urls = [];
for (let i = 0; i < portCount; i++) {
  urls.push(`${protocol}${host}:${port + i}${endpoint}`);
}

let timeBetweenRequests = 1000;
let maxTime = 1000 * 60 * 15;
const startTime = new Date().getTime();


const makeRequest = async (url) => {
    try {
        axios.get(url);
    } catch (error) {
        console.error(error);
    }
    let currentTime = new Date().getTime();
    if (currentTime - startTime < maxTime) {
        setTimeout(() => makeRequest(url), timeBetweenRequests);
    }
}

urls.forEach(url => makeRequest(url));
