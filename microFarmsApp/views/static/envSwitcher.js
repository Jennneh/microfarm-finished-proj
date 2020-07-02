var host = window.location.host;

var env = "";

if (host.includes("localhost")) {
  env = "http://localhost:5001";
} else {
  env = "http://18.132.124.135:5001";
}

if (host.includes("192.168.1.20")) {
  env = "http://192.168.1.20:5001";
}
