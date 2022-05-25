const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const bodyParser = require('body-parser');
require('dotenv').config();
const cors = require('cors');
const path = require('path');
const aws = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const userRoutes = require("./Routes/UserRoute")

let port = process.env.PORT || 5000
mongoose.connect('mongodb+srv://John:John4444@cluster0.febld.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false });
const db = mongoose.connection

db.on('error', (err) => {
  console.log(err)
})


db.once('open', () => {
  console.log('Database connection Established')
})

const app = express();
const server = http.createServer(app);


app.use(cors());
app.use(morgan('dev'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use('/uploads', express.static('uploads'))

app.use('/', userRoutes)

server.listen(port, () => console.log(`Server has started.on port ${port}$`));