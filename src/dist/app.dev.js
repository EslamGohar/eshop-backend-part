"use strict";

var express = require("express");

var app = express();

var morgan = require("morgan");

var cors = require("cors");

var path = require("path");

var authJwt = require("../helpers/jwt");

var errorHandler = require("../helpers/errorHandler");

require("dotenv").config();

require("../database/connection"); // API Routes


var productsRoutes = require('../routers/products.routes');

var categoriesRoutes = require('../routers/categories.routes');

var usersRoutes = require('../routers/users.routes');

var ordersRoutes = require('../routers/orders.routes');

app.use(cors());
app.options('*', cors()); // Middlewares

app.use(express.json());
app.use(morgan("tiny"));
app.use(authJwt());
app.use("/public/uploads", express["static"](path.join(__dirname, "../public/uploads")));
app.use(errorHandler);
var api = process.env.API_URL;
app.use("".concat(api, "/products"), productsRoutes); // http://localhost:3000/api/v1/products

app.use("".concat(api, "/categories"), categoriesRoutes);
app.use("".concat(api, "/orders"), ordersRoutes);
app.use("".concat(api, "/users"), usersRoutes);
module.exports = app;