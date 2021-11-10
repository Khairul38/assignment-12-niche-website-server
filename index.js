const express = require('express');
const app = express();
const port = process.env.PORT || 5000;










app.get('/', (req, res) => {
    res.send('Hello Niche-Website!')
})

app.listen(port, () => {
    console.log(`listening at port:${port}`)
})