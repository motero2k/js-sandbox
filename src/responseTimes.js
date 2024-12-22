// Status: WORKING
import axios from 'axios';
let options = {
    url: 'http://localhost:8080/api/v1/stress/88000/88000',
    requests: 150,
    delay: 200,
    verbose: true,
};

let logger = options.verbose ? console : { log: () => {}, error: () => {} };

let responseTimes = [];

async function measureResponseTimes() {
    console.log('Starting to measure response times');
    for (let i = 0; i < options.requests; i++) {
        let start = new Date();
        try {
            let response = await axios.get(options.url);
            let end = new Date();
            let time = end - start;
            responseTimes.push(time);
            logger.log(`Request ${i + 1} took ${time}ms`);
        } catch (error) {
            logger.error(`Request ${i + 1} failed:`, error.message);
        }
    }

    let average = responseTimes.reduce((acc, time) => acc + time, 0) / responseTimes.length;
    console.log(`Average response time: ${average}ms`);
    console.log(`Max response time: ${Math.max(...responseTimes)}ms`);
    console.log(`Min response time: ${Math.min(...responseTimes)}ms`);
    console.log(`Total requests: ${responseTimes.length}`);
}

measureResponseTimes();

/*
no tlm
Average response time: 103.03ms
Max response time: 142ms
Min response time: 90ms
Total requests: 200
--- in docker
Average response time: 118.615ms
Max response time: 187ms
Min response time: 99ms
Total requests: 200
--- with 
Average response time: 116.61333333333333ms
Max response time: 168ms
Min response time: 98ms
Total requests: 150

telemetry
Average response time: 103.935ms
Max response time: 141ms
Min response time: 93ms
Total requests: 200
--- in docker alpine
Average response time: 156.73ms
Max response time: 200ms
Min response time: 138ms
Total requests: 200
--- no alpine
Average response time: 117.19333333333333ms
Max response time: 179ms
Min response time: 102ms
Total requests: 150

 */
