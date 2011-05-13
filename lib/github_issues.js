// GitHub Issues API v3
var https = require('https'),
    querystring = require('querystring');

function GitHub() {
  this.v2Host = 'github.com';
  this.v3Host = 'api.github.com';
}

GitHub.prototype.createCredentials = function(username, password) {
  return {username: username, password: password};
};

GitHub.prototype.authenticate = function(credentials, callback) {
  this._response('GET', this.v3Host, credentials, null, callback);
};

GitHub.prototype.allRepos = function(credentials, callback) {
  this._response('GET', this.v2Host, credentials, '/api/v2/json/repos/show/' + credentials.username, callback);
};

GitHub.prototype.user = function(username, callback) {
  this._response('GET', this.v2Host, null, '/api/v2/json/user/show/' + username, callback);
};

GitHub.prototype.collaborators = function(username, repo, credentials, callback) {
  this._response('GET', this.v2Host, credentials, '/api/v2/json/repos/show/' + username + '/' + repo + '/collaborators', callback);
};

GitHub.prototype.issues = function(username, repo, page, openIssues, credentials, callback) {
  var query = querystring.stringify({page: page, per_page: 100, state: openIssues ? 'open' : 'closed'});
  this._response('GET', this.v3Host, credentials, '/repos/' + username + '/' + repo + '/issues?' + query, callback);
};

GitHub.prototype._response = function(method, host, credentials, relativePath, callback) {
  var headers = null;
  if (credentials) {
    var auth = 'Basic ' + new Buffer(credentials.username + ':' + credentials.password).toString('base64');
    headers = {
      Authorization: auth
    };
  }
  var options = {
    method: method,
    host: host,
    path: relativePath,
    headers: headers
  };
  var all = '';
  var request = https.request(options, function(response) {
    response.setEncoding('utf8');
    response.on('data', function(chunk) {
      all += chunk;
    });
    response.on('end', function() {
      var error = null;
      all = JSON.parse(all);
      if (response.statusCode !== 200 && all.hasOwnProperty('message')) {
        error = all.message;
      }
      callback(error, all);
    });
  }).on('error', function(error) {
    callback(error, null);
  });
  request.end();
};

module.exports = GitHub;
