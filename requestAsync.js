import request from 'then-request';
const url = "https://api.appworks-school-campus3.online/api/v1/clock/delay";

function requestCallback(url, callback) {
    // write code to request url asynchronously
    const start = Date.now();

    request('GET', 'http://example.com').done((res) => {});

    console.log(Date.now() - start);

}
function requestPromise(url) {
    // write code to request url asynchronously with Promise
    return new Promise((resolve, reject) => {
            const start = Date.now();
            let res = request('GET', url);
            const end = Date.now() - start;
            resolve(end);

    });
}

async function requestAsyncAwait(url) {
    // write code to request url asynchronously
    // you should call requestPromise here and get the result using async/await.
    const start = Date.now();

    const value = await requestPromise(url);

    console.log(Date.now() - start);
}


requestCallback(url, console.log); // would print out the execution time
requestPromise(url).then(console.log);
requestAsyncAwait(url);