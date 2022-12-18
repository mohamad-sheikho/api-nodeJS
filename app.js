const express = require('express');
const Users = require('./Routes/Users');
const Groups = require('./Routes/Groups');

const app = express()
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', Users);
app.use('/api/groups', Groups);

app.listen(3000, () => {
    console.log(`Listening on port 3000`)
})
