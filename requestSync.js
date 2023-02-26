const url = "https://api.appworks-school-campus3.online/api/v1/clock/delay";
import request from 'sync-request';

function requestSync(url) {
    // write code to request url synchronously
    console.time("execution time")

    let res = request('GET', url);

    console.timeEnd("execution time")
}
requestSync(url); // would print out the execution time
requestSync(url);
requestSync(url);