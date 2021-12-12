const express = require("express")
const app = express()
const morgan = require("morgan")
const cors = require("cors")
const path = require("path")
const authJwt = require("../helpers/jwt")
const errorHandler = require("../helpers/errorHandler")

require("dotenv").config()
require("../database/connection")

// API Routes
const productsRoutes = require('../routers/products.routes')
const categoriesRoutes = require('../routers/categories.routes')
const usersRoutes = require('../routers/users.routes')
const ordersRoutes = require('../routers/orders.routes')

app.use(cors())
app.options('*', cors())

// Middlewares
app.use(express.json());
app.use(morgan("tiny"));
app.use(authJwt());
app.use("/public/uploads", express.static(path.join(__dirname, "../public/uploads")));
app.use(errorHandler);

const api = process.env.API_URL

app.use(`${api}/products`, productsRoutes)  //http://localhost:3000/api/v1/products
app.use(`${api}/categories`, categoriesRoutes)
app.use(`${api}/orders`, ordersRoutes)
app.use(`${api}/users`, usersRoutes)

module.exports = app