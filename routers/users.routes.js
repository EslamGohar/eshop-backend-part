const { User } = require('../database/models/user.model');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// a list of all users without password
router.get('/', async (req, res) =>{
    const userList = await User.find().select('-password')
    if (!userList) {
        res.status(500).json({success: false})
    } 
    res.send(userList)
})

// Register for Admin - create new user
router.post('/', async (req, res)=> {
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        password: bcrypt.hashSync(await req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    })
    
    user = await user.save()

    if (!user) {
        return res.status(400).send({
            success: false,
            message: "the user cannot be created"
        })
    }
    else {   
        res.status(200).send({
            success: true,
            data: user,
            message: "User is created!"
        })
    }
})

// get one single user by ID
router.get('/:id', async(req, res)=> {
    let user = await User.findById(req.params.id).select('-password')

    if(!user)
        return res.status(404).send({
            success: false,
            data: message,
            message:"the user with the given id is not found"
        })
    res.status(200).send({ success: true, data: user })
})

// update a specific user by id with/without password
router.put('/:id', async (req, res)=>{
    const userExit = await User.findById(req.params.id)
    let newPassword
    if (req.body.password) {
        newPassword = bcrypt.hashSync(req.body.password, 10)
    } else {
        newPassword = userExit.password
    }

    const user = await User.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            email: req.body.email,
            password: newPassword,
            phone: req.body.phone,
            isAdmin: req.body.isAdmin,
            street: req.body.street,
            apartment: req.body.apartment,
            zip: req.body.zip,
            city: req.body.city,
            country: req.body.country
        },
        { new: true }  // return the new updated data
    )
    if ( !user ) {
        return res.status(404).send({success: false, message:"this user cannot be updated"})
    }
    res.status(200).send({ success: true, data: user, message:"the user is updated!" })
})

// login user and create a token
router.post('/login', async (req, res) => {
    const user = await User.findOne({ email: req.body.email })
    const secret = process.env.secret

    if (!user) { 
        return res.status(404).send({ success: false, message:"the user not found" })
    }

    if (user && bcrypt.compare(req.body.password, user.password)) {
        const token = jwt.sign(
            {
                userId: user.id,
                isAdmin: user.isAdmin
            },
            secret,     // like password to create token
            { expiresIn: '2m' }     // expire time to clear token after 1month
        )
        return res.status(200).send({ success: true, user: user.email, token: token })
    } else {
        return res.status(404).send({ success: false, message:"password is wrong" })
    }
})

// Register for User - create new user 
router.post('/register', async (req, res)=> {
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        password: bcrypt.hashSync(await req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country
    })
    user = await user.save()

    if (!user) {
        return res.status(400).send({
            success: false,
            message: "the user cannot be created"
        })
    }
    else{   
        res.status(200).send({
            success: true,
            data: user,
            message: "User is created!"
        })
    }
})

// delete a specific user by ID
router.delete('/:id', async(req, res)=>{
    try {
        let user = await User.findByIdAndRemove(req.params.id)
        if (user) {
            return res.status(200).send({ success: true, data: user, message:"User is deleted" })
        } else {
            return res.status(404).send({ success:false, data: message, message:"user cannot be deleted!" })
        }
    } catch(err) {
        return res.status(500).send({ success: false, error: err })
    }
})

// Show to the Admin how many users on the store.
router.get('/get/count', async(req, res)=>{
    const userCount = await User.countDocuments()

    if (!userCount) {
        res.status(500).json({ success: false, message: "Cannot count the users.." })
    }

    res.status(200).send({
        success: true,
        userCount: userCount,
        message: `the number of user is ${userCount} on the store.`
    })
})

module.exports = router;