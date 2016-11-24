module.exports = function(ipaddr, useUDP) {

  var express = require("express");
  var path = require("path");
  var logger = require("morgan");
  var bodyParser = require("body-parser");
  var nunjucks = require("nunjucks");
  var app = express();
  var server = require("http").Server(app);
  var io = require("socket.io")(server);
  var ipbus = require("./app/ipbus.js")(io, ipaddr, useUDP);

  app.set("views", path.join(__dirname, "views"));
  app.set("view engine", "nunjucks");
  app.use(logger("dev"));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(require("less-middleware")(path.join(__dirname, "public")));
  app.use(express.static(path.join(__dirname, "public")));

  nunjucks.configure("views", { autoescape: true, express: app });

  app.get("/", function (req, res) {
      res.render("home.html", { js: "home" });
  });

  app.get("/glib", function (req, res) {
      res.render("glib.html", { js: "glib" });
  });

  app.get("/oh", function (req, res) {
      res.render("oh.html", { js: "oh" });
  });

  app.get("/vfat2", function (req, res) {
      res.render("vfat2.html", { js: "vfat2" });
  });

  app.get(/\/vfat2\/[0-9]+/, function (req, res) {
      res.render("vfat2.html", { js: "vfat2" });
  });

  app.get("/i2c", function (req, res) {
      res.render("i2c.html", { js: "i2c" });
  });

  app.get("/scan", function (req, res) {
      res.render("scan.html", { js: "scan" });
  });

  app.get("/ultra", function (req, res) {
      res.render("ultra.html", { js: "ultra" });
  });

  app.get("/rates", function (req, res) {
      res.render("rates.html", { js: "rates" });
  });

  app.get("/t1", function (req, res) {
      res.render("t1.html", { js: "t1" });
  });

  app.get("/tkdata", function (req, res) {
      res.render("tkdata.html", { js: "tkdata" });
  });

  app.get("/adc", function (req, res) {
      res.render("adc.html", { js: "adc" });
  });



  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
      var err = new Error("Not Found");
      err.status = 404;
      next(err);
  });

  // development error handler
  // will print stacktrace
  if (app.get("env") === "development") {
      app.use(function(err, req, res, next) {
          res.status(err.status || 500);
          res.render("error.html", {
              message: err.message,
              error: err
          });
      });
  }

  // production error handler
  // no stacktraces leaked to user
  app.use(function(err, req, res, next) {
      res.status(err.status || 500);
      res.render("error.html", {
          message: err.message,
          error: {}
      });
  });

  return server;

};
