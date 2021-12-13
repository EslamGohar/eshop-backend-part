const mongoose = require("mongoose")

// Database
mongoose.connect(process.env.CONNECTION_STRING, {     // to get database from the cloud
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: process.env.DB_NAME
})
.then(() => {
    console.log('We are using ' + process.env.DB_NAME)
    console.log('Database Connection is ready...')
})
.catch((err) => {
    console.log(err)
})