const mongoose = require("mongoose")

// Database
mongoose.connect(process.env.DBURL,{     // to get database in the cloud
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'eshop-database'
})
.then(()=> {
    console.log('Database Connection is ready...')
})
.catch(err =>{
    console.log(err)
})