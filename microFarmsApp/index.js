var express = require("express");
var exphbs = require("express-handlebars");
var path = require("path");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var crypto = require("crypto");
var chalk = require("chalk");
var app = express();
const port = 80;
var auth = require('./auth');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");

console.log(chalk.blue("[*] Server started on port " + port));
// Set static path of app
const publicPath = path.join(__dirname, "/views");
app.use("/", express.static(publicPath));

app.get("/", function (req, res) {
  res.render("landing");
});

app.get("/login", auth.authCheck, function (req, res) {
  res.redirect("dashboard");
});

app.post("/login", function (req, res) {
  // API request to check username and password
  callToApi("/api/loginAuth?username=" + req.body.username + "&password=" + req.body.password).then(function (loginJSON) {
    // If login successful, create a cookie based on the sessionID returned by the api
    if (loginJSON.status == true && loginJSON.status != null) {
      res.cookie("userSession", loginJSON.sessionID, { maxAge: 999999999, httpOnly: false });
      res.redirect("/dashboard");
    // If unsuccessful reload login with error message
    } else {
      res.render("login", { class: "visible-true", message: "Username or password incorrect" });
    }
  });
});

app.post("/register", function (req, res) {
  if (req.body.username == "" || req.body.email == "" || req.body.password == "" || req.body.phonenumber == "") {
    res.send("Please fill in every field");
  } else if ( req.body.role != "tenant" && req.body.role != "landowner" && req.body.role != "supplier" && req.body.role != "buyer") {
    res.send("Please enter an account type");
  } else if (req.body.password.length < 8) {
    res.send("Password must be at least 8 characters long");
  } else {
    callToApi("/api/addUser?username=" + req.body.username + "&password=" + req.body.password + "&role=" + req.body.role + "&email=" + req.body.email + "&phone=" + req.body.phonenumber).then(function (registerJSON) {
      if (registerJSON.status == "Account created successfully") {
        res.send("success");
      } else {
        res.send('<div class="login-message-red">Username or email already exists</div>');
      }
    });
  }
});

app.get("/dashboard", auth.authCheck, async function (req, res) {
  var role = req.user_role
  if (role == "tenant") { res.render("tenantDashboard"); }
  else if (role == "landowner") { res.render("landownerDashboard"); } 
  else if (role == "buyer") { res.render("buyerDashboard"); }
  else if (role == "supplier") { res.render("supplierDashboard");} 
  else { res.redirect("login"); }
});

app.get("/plot", auth.authCheck, function (req, res, next) {
      res.render("plot");
});

app.get("/landownerPlot", auth.authCheck, async function (req, res) {
  res.render("landownerPlot");
});

app.get("/profile", auth.authCheck, async function (req, res) {
  res.render("profile");
});

app.get("/landDivision", auth.authCheck, async function (req, res) {
  var role = req.user_role
  if (role == "landowner") {
    res.render("landDivision");
  } else {
    res.redirect("/dashboard");
  }
});

app.get("/browsePlots", auth.authCheck, async function (req, res) {
  res.render("browsePlots");
});

app.get("/logout", async function (req, res) {
  res.clearCookie("userSession");
  res.redirect("/");
});

////////// GENERAL FUNCTIONS //////////////////////////

//example get request to api
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
      res.on("data", function (chunk) { chunks.push(chunk); });
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

app.listen(port);
