// Send to login if unauthed or continue if authed
// Also, the user's role can be accessed through req.user_role in index.js
module.exports.authCheck  = function(req, res, next) {
    callToApi("/api/authSession?sessionID=" + req.cookies.userSession).then(
        function (authenticated) {
          if (authenticated["status"] != "authed" && authenticated != null && req.path == "/login") {
            res.render('login')
          }
          else if (authenticated["status"] == "authed" && authenticated != null) {
                req.user_role = authenticated["role"]
                return next()
          } else {
                res.redirect('/login');
          }
    })
};

function callToApi(apiPath) {
    return new Promise(function (resolve, reject) {
      var http = require("follow-redirects").http;
      var fs = require("fs");
      var apiResponse;
      var options = {
        method: "GET",
        hostname: "localhost",
        port: 5001,
        path: apiPath,
        headers: {},
        maxRedirects: 20,
      };
  
      var req = http.request(options, function (res) {
        var chunks = [];
  
        res.on("data", function (chunk) {
          chunks.push(chunk);
        });
  
        res.on("end", function (chunk) {
          var body = Buffer.concat(chunks);
          apiResponse = JSON.parse(body.toString());
          resolve(apiResponse);
        });
  
        res.on("error", function (error) {
          console.error(error);
          reject("failed");
        });
      });
  
      req.end();
    });
  }