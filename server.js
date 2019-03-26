const express = require('express');
const bodyParser = require('body-parser');
const port = 7000;
const app = express();

app.use(express.static(__dirname + '/public/dist/public'));
app.use(bodyParser.json());
app.listen(port, () => console.log(`Start listening on port ${port}`));

// require('./server/routes')(app);