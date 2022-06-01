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
user.post('/get-post', UserController.onePost)
user.post('/get-notifications', UserController.getNotification)
user.post('/accept-offer', UserController.acceptOffer)
user.post('/return-offer', UserController.returnOffer)

user.post('/forget-password', UserController.emailRetrive)
user.post('/change-password', UserController.passwordReset)


module.exports = user