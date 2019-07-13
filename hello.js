const http = require('http');

(async () => {
  const options = new URL('http://google.com');
  console.log('making http request to: ' + options);

  const req = http.request(options, res => {
    console.log('response: ' + res.statusCode + ' ' + JSON.stringify(res.headers, null, 2));

    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('response body:\n' + data);
    });
    res.on('error', error => {
      console.log('error reading response body: ' + error);
    });
  });

  req.on('error', error => {
    console.log('error sending request: ' + error);
  });
  req.end();
})();
