const UserController = require("../Controllers/UserController")
const authenticate = require('../Middleware/authenticate')
const upload = require('../Middleware/upload')

const express = require('express')
const user = express.Router()

user.post('/register', upload, UserController.register)
user.post('/login', UserController.login)
user.post('/user', UserController.showOne)

user.post('/update', upload, UserController.updateProfile)
user.post('/create', upload, UserController.register_vendor)
user.post('/post', upload, UserController.createPost)
user.get('/posts', UserController.getPosts)


module.exports = user