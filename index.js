const app = require('./src/app')

// Local Server
const PORT = process.env.PORT || 3000

app.listen( PORT, () => { console.log(`server is running on http://localhost:${PORT}`) } )
