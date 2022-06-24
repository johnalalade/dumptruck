const Login = require('../Model/UserModel');
const Post = require('../Model/PostModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const aws = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const { OutgoingMessage } = require('http');
const sharp = require('sharp')
const S3_BUCKET = process.env.S3_BUCKET;
aws.config.region = 'us-east-2'

// registration
const register = (req, res, next) => {
    let login = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        password: req.body.password,
    }

    if (req.file) {
        login.src = `https://gigvee.s3.us-east-2.amazonaws.com/${uuidv4() + req.body.filename.trim()}`
        sharp(req.file.path)
            // .resize({
            //     fit: "contain"
            // })
            .jpeg({ mozjpeg: true, quality: 85, })
            .toBuffer()
            .then(data => {
                const s3 = new aws.S3();
                const s3Params = {
                    Bucket: S3_BUCKET,
                    Key: login.src.slice(42),
                    Body: data,
                    // Expires: 180,
                    ContentDisposition: "attachment;",
                    ContentType: req.file.mimetype,
                    ACL: 'public-read'
                };
                s3.putObject(s3Params, function (s3Err, data) {
                    if (s3Err) throw s3Err

                    console.log('File uploaded successfully at --> ' + data.Location)
                    fs.unlink(req.file.path, (err) => {
                        if (err) console.log('Unable to delete used file ' + err)
                        else console.log('file deleted')
                    })

                })
            })
        // fs.readFile(req.file.path, (err, data) => {
        //     if (err) throw err;
        //     const s3 = new aws.S3();
        //     const s3Params = {
        //         Bucket: S3_BUCKET,
        //         Key: login.src.slice(42),
        //         Body: data,
        //         // Expires: 180,
        //         ContentDisposition: "attachment;",
        //         ContentType: req.file.mimetype,
        //         ACL: 'public-read'
        //     };
        //     s3.putObject(s3Params, function (s3Err, data) {
        //         if (s3Err) throw s3Err

        //         console.log('File uploaded successfully at --> ' + data.Location)
        //         fs.unlink(req.file.path, (err) => {
        //             if (err) console.log('Unable to delete used file ' + err)
        //             else console.log('file deleted')
        //         })

        //     })

        // })
    }

    Login.findOne({ email: req.body.email })
        .then(user => {
            if (user) {
                res.json({
                    message: "User already exists, Try signing in..."
                })
                console.log({
                    message: "User already exists"
                })
            }
            else {

                let user = new Login(login)
                user.save()
                    .then(user => {
                        let token = jwt.sign({ name: user.name }, "Iyaaduke+5")
                        res.json({
                            message: "Login Successful",
                            token,
                            id: user._id,
                            src: user.src,
                            phone: user.phone,
                            email: user.email,
                            user: user
                        })
                        return user
                    })


            }
        })


}

const login = (req, res, next) => {
    var userName = req.body.userName
    var password = req.body.password

    Login.findOne({ $or: [{ email: userName }, { phone: userName }] })
        .then(user => {

            if (user) {
                bcrypt.compare(password, user.password, function (err, result) {
                    if (err) {
                        res.json({
                            error: err
                        })
                        console.log(err)
                    }
                    if (result) {
                        let token = jwt.sign({ name: user.name }, "Iyaaduke+5")
                        // console.log(user)
                        res.json({
                            message: "Login Succesful",
                            token,
                            id: user._id,
                            response: user
                        })
                    } else {
                        res.json({
                            message: "Password Does Not Match!"
                        })
                        console.log("Password does not match")
                    }
                })
            } else {
                res.json({
                    message: "No User Found, Try signing up..."
                })
                console.log("No user found")
            }
        })
}

const updateProfile = (req, res, next) => {

    let userID = req.body.userID

    let updatedProfile = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        src: req.body.src
    }
    if (req.file) {
        updatedProfile.src = `https://gigvee.s3.us-east-2.amazonaws.com/${uuidv4() + req.body.filename.trim()}`

        sharp(req.file.path)
            // .resize({
            //     fit: "contain"
            // })
            .jpeg({ mozjpeg: true, quality: 85, })
            .toBuffer()
            .then(data => {
                const s3 = new aws.S3();
                const s3Params = {
                    Bucket: S3_BUCKET,
                    Key: updatedProfile.src.slice(42),
                    Body: data,
                    // Expires: 180,
                    ContentDisposition: "attachment;",
                    ContentType: req.file.mimetype,
                    ACL: 'public-read'
                };
                s3.putObject(s3Params, function (s3Err, data) {
                    if (s3Err) throw s3Err

                    console.log('File uploaded successfully at --> ' + data.Location)
                    fs.unlink(req.file.path, (err) => {
                        if (err) console.log('Unable to delete used file ' + err)
                        else console.log('file deleted')
                    })

                })
            })

    }
    Login.findById(userID)
        .then((data) => {
            if (req.body.checkerImage == true) {

                if (data.src) {

                    console.log(req.body.checkerImage)
                    const s3 = new aws.S3();
                    const imgName = data.src.slice(42)
                    const s3Params = {
                        Bucket: S3_BUCKET,
                        Key: imgName,
                        // Expires: 180,
                        // ContentType: fileType,
                        // ACL: 'public-read'
                    };

                    s3.deleteObject(s3Params, function (err, data) {
                        if (err) console.log("image deletion failed" + err, err.stack)
                        else console.log("image deleted")
                    })
                }
            }
            else { return data }

        })
        .then((dd) => {
            //console.log(dd)
            Login.findByIdAndUpdate(userID, { $set: updatedProfile })
                .then((response) => {
                    res.json({
                        message: "Profile Updated Successfully",
                        response
                    })
                    Post.find({ owner: userID })
                        .then(pos => {
                            pos.forEach(pd => {
                                let upost = {
                                    image: updatedProfile.src,
                                    name: updatedProfile.name,

                                }
                                Post.findByIdAndUpdate(pd._id, { $set: upost })
                                    .then(dd => dd)
                            })
                        })
                })
                .catch(error => {
                    console.log('Update error ' + error)
                    res.json({
                        message: "An Error Occured"
                    })
                })
        })
        .catch((err) => console.log(err))

}

// show one 
const showOne = (req, res, next) => {
    let userID = req.body.userID
    Login.findById(userID)
        .then(response => {
            res.json({
                response
            })

        })
        .catch(error => {
            res.json({
                error,
                message: "Can't Find User"
            })
        })


}

const register_vendor = (req, res, next) => {
    let userID = req.body.userID

    let updatedProfile = {
        description: req.body.description,
        truck_plate_number: req.body.truck_plate_number,
        isVendor: true,
        phone: req.body.phone

    }
    if (req.file) {
        updatedProfile.truck_src = `https://gigvee.s3.us-east-2.amazonaws.com/${uuidv4() + req.body.filename.trim()}`

        sharp(req.file.path)
            // .resize({
            //     fit: "contain"
            // })
            .jpeg({ mozjpeg: true, quality: 85, })
            .toBuffer()
            .then(data => {
                const s3 = new aws.S3();
                const s3Params = {
                    Bucket: S3_BUCKET,
                    Key: updatedProfile.truck_src.slice(42),
                    Body: data,
                    // Expires: 180,
                    ContentDisposition: "attachment;",
                    ContentType: req.file.mimetype,
                    ACL: 'public-read'
                };
                s3.putObject(s3Params, function (s3Err, data) {
                    if (s3Err) throw s3Err

                    console.log('File uploaded successfully at --> ' + data.Location)
                    fs.unlink(req.file.path, (err) => {
                        if (err) console.log('Unable to delete used file ' + err)
                        else console.log('file deleted')
                    })

                })
            })

    }
    Login.findById(userID)
        .then((dd) => {
            //console.log(dd)
            Login.findByIdAndUpdate(userID, { $set: updatedProfile })
                .then((response) => {
                    res.json({
                        message: "Profile Updated Successfully",
                        response
                    })

                })
                .catch(error => {
                    console.log('Update error ' + error)
                    res.json({
                        message: "An Error Occured"
                    })
                })
        })
        .catch((err) => console.log(err))

}

const createPost = (req, res, next) => {
    let login = {
        name: req.body.name,
        src: req.body.src,
        phone: req.body.phone,
        details: req.body.details,
        location: req.body.location,
        owner: req.body.owner,
        accepted: false
    }

    if (req.file) {
        login.image = `https://gigvee.s3.us-east-2.amazonaws.com/${uuidv4() + req.body.filename.trim()}`
        sharp(req.file.path)
            // .resize({
            //     fit: "contain"
            // })
            .jpeg({ mozjpeg: true, quality: 85, })
            .toBuffer()
            .then(data => {
                const s3 = new aws.S3();
                const s3Params = {
                    Bucket: S3_BUCKET,
                    Key: login.image.slice(42),
                    Body: data,
                    // Expires: 180,
                    ContentDisposition: "attachment;",
                    ContentType: req.file.mimetype,
                    ACL: 'public-read'
                };
                s3.putObject(s3Params, function (s3Err, data) {
                    if (s3Err) throw s3Err

                    console.log('File uploaded successfully at --> ' + data.Location)
                    fs.unlink(req.file.path, (err) => {
                        if (err) console.log('Unable to delete used file ' + err)
                        else console.log('file deleted')
                    })

                })
            })

    }

    let post = new Post(login)
    post.save()
        .then(user => {
            let token = jwt.sign({ name: user.name }, "Iyaaduke+5")
            res.json({
                message: "Login Successful",
                token,
                id: user._id,
                src: user.src,
                phone: user.phone,
                email: user.email,
                post: user
            })
            return user
        })


}

const getPosts = (req, res, next) => {
    Post.find()
        .then(response => {
            res.json({
                response: response.filter(re => !re.accepted)
            })
        })
        .catch((err) => {
            console.log({ indexError: err })
            res.json({
                message: "An Error Occured"
            })
        })
}

const onePost = (req, res, next) => {
    let postID = req.body.postID
    Post.findById(postID)
        .then(response => {
            res.json({
                response
            })

        })
        .catch(error => {
            res.json({
                error,
                message: "Can't Find User"
            })
        })
}

// Email Retrive
const emailRetrive = (req, res, next) => {
    let email = req.body.email
    Login.findOne({ email: email })
        .then((user) => {
            if (user) {
                res.json({
                    id: user._id,
                    message: "An email has been sent to your address"
                })
                //email
                var transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'uniconneapp@gmail.com',
                        pass: 'JohnAlalade@4444'
                    }
                });

                var mailOptions = {
                    from: 'uniconneapp@gmail.com',
                    to: req.body.email,
                    subject: 'Uniconne Password Reset',
                    html: `<p>Hello ${user.firstname},</p> <p>To reset your password, please click the link below or copy and paste it in your browser.</p> <a href="https://www.uniconne.com/retrive/${user._id}">Click Here</a> <p>Keep your password safe</p> <p>Kind regards..</p> <quote>~John Alalade</quote>`
                };

                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log("Emailimg error: " + error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                });
            }
            else {
                res.json({
                    message: "User Doesn't Exist."
                })
            }
        })
        .catch((err) => {
            console.log("Email retrival error " + err)
            res.json({
                message: "An Error Occured"
            })
        })
}

const passwordReset = (req, res, next) => {
    bcrypt.hash(req.body.password, 10, function (err, hashedPass) {
        if (err) {
            res.json({
                error: err
            })
        }

        let data = {
            password: hashedPass
        }
        let id = req.body.userID
        Login.findByIdAndUpdate(id, { $set: data })
            .then((response) => {
                res.json({
                    message: "Password Reset successful",
                    response
                })
            })
            .catch((err) => {
                console.log("Password rest error " + err)
                res.json({
                    message: "An Error Occured"
                })
            })
    })
}

const acceptOffer = (req, res, next) => {

    let data = {
        accepted: true,
        accepterID: req.body.accepterID,
        accepterName: req.body.accepterName,
        accepterImage: req.body.accepterImage
    }

    Post.findByIdAndUpdate(req.body.postID, { $set: data })
        .then((response) => {


            Login.findById(response.owner)
                .then(user => {

                    let notification = {
                        notifications: (user.notifications) ? [{
                            name: req.body.accepterName,
                            image: req.body.accepterImage,
                            ID: req.body.accepterID,
                            time: new Date(),
                            details: `${req.body.accepterName} accepted an offer you posted`
                        }, ...user.notifications] : [{
                            name: req.body.accepterName,
                            image: req.body.accepterImage,
                            ID: req.body.accepterID,
                            time: new Date(),
                            details: `${req.body.accepterName} accepted an offer you posted`
                        }]
                    }

                    Login.findByIdAndUpdate(user._id, { $set: notification })
                        .then(update => {
                            res.json({
                                status: "success",
                                data: response
                            })
                        })

                })
        })

}

const getNotification = (req, res, next) => {

    let userID = req.body.userID
    Login.findById(userID)
        .then(response => {
            res.json({
                status: "success",
                response: response.notifications ? response.notifications : []
            })

        })
        .catch(error => {
            res.json({
                error,
                message: "Can't Find User"
            })
        })


}

const returnOffer = (req, res, next) => {
    let data = {
        accepted: false,

    }

    Post.findByIdAndUpdate(req.body.postID, { $set: data })
        .then((response) => {


            Login.findById(response.owner)
                .then(user => {

                    let notification = {
                        notifications: (user.notifications) ? [{
                            name: req.body.returnerName,
                            image: req.body.returnerImage,
                            ID: req.body.returnerID,
                            time: new Date(),
                            details: `${req.body.returnerName} returned an offer you posted`
                        }, ...user.notifications] : [{
                            name: req.body.returnerName,
                            image: req.body.returnerImage,
                            ID: req.body.returnerID,
                            time: new Date(),
                            details: `${req.body.returnerName} returned an offer you posted`
                        }]
                    }

                    Login.findByIdAndUpdate(user._id, { $set: notification })
                        .then(update => {
                            res.json({
                                status: "success",
                                data: response
                            })
                        })

                })
        })

}

// Admin
const admin = (req, res, next) => {
    Login.find()
    .then((users) => {

        Post.find()
        .then(posts => {
            res.send({
                number_of_users: users.length,
                number_of_posts: posts.lemgth,
                users: users,
                posts: posts
            })
        })

    })
}

module.exports = {
    register, login, updateProfile, showOne, register_vendor, createPost, getPosts, onePost, emailRetrive, passwordReset, acceptOffer, getNotification, returnOffer, admin
}