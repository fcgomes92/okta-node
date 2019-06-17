var express = require("express");
var path = require("path");
var logger = require("morgan");
const session = require("express-session");
const { ExpressOIDC } = require("@okta/oidc-middleware");
const OktaJwtVerifier = require("@okta/jwt-verifier");
var cors = require("cors");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// app.use('/', indexRouter);
// app.use('/users', usersRouter);

// session support is required to use ExpressOIDC
app.use(
  session({
    secret: "this should be secure",
    resave: true,
    saveUninitialized: false
  })
);

const oidc = new ExpressOIDC({
  appBaseUrl: "http://localhost:3000",
  issuer: "https://dev-710580.okta.com/oauth2/default",
  client_id: "0oaq734ljN2sbfqEL356",
  client_secret: "<CHANGE>",
  redirect_uri: "http://localhost:3000/authorization-code/callback",
  scope: "openid profile"
});

// ExpressOIDC will attach handlers for the /login and /authorization-code/callback routes
app.use(oidc.router);

app.get("/protected", oidc.ensureAuthenticated(), (req, res) => {
  res.send(JSON.stringify(req.userContext.userinfo));
});

app.get("/", (req, res) => {
  if (req.userContext.userinfo) {
    res.send(`Hi ${req.userContext.userinfo.name}!`);
  } else {
    res.send("Hi!");
  }
});

oidc.on("ready", () => {
  app.listen(3000, () => console.log(`Started!`));
});

oidc.on("error", err => {
  console.log("Unable to configure ExpressOIDC", err);
});

module.exports = app;
