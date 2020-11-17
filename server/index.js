/**
 * Common node web server interface used for development purposes only
 */
const Server = require('@core/server');
const _ = require('underscore');
const pkg = require('../package.json');

const server = new Server();
const { app } = server;
const pagePaths = _.pluck(pkg.config.pages, 'path');
app.get(`:matcher(${pagePaths.join('|')})`, (req, res, next) => {
  const page = _.findWhere(pkg.config.pages, { path: req.params.matcher });
  // req.locals.context defines the context that handlebars will use to compile the template server-side
  req.locals.context.page = page;
  req.locals.context.version = `/marketing-campaigns/local-dress-destination/${pkg.version}`;
  next();
});

server.start();
