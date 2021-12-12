const { Order } = require('../database/models/order.model')
const { OrderItem } = require('../database/models/order-item.model')
const express = require('express')
const Product = require('../database/models/product.model')
const stripe = require('stripe')('sk_test_51K4o0qKBAyYBGP1FiGSGgpXUZC3HVv1o7B6DqnwmOErcEVtmio4zeAnrmggE61ysmSbQZaUC36XvLJAXZdd4ZUVC00G2K5djGe')
const router = express.Router()

// list all orders with populate user name, and sort order by date time
router.get('/', async (req, res) =>{
    const orderList = await Order.find().populate("user", "name").sort({"dateOrdered": -1})

    if (!orderList) {
        res.status(500).json({success: false})
    } 
    res.status(200).send(orderList)
})

// get order details and populate products and user data in order items  
router.get('/:id', async (req, res) =>{
    const order = await Order.findById(req.params.id)
    .populate('user', 'name')
    .populate({ path: 'orderItems', populate: { 
        path:'product', populate: 'category' }
    })

    if (!order) {
        res.status(500).json({success: false})
    } 
    res.status(200).send(order)
})

// add order
router.post('/', async (req, res)=> {
    const orderItemsIds = Promise.all( req.body.orderItems.map( async orderItem => {
        let newOrderItem = new OrderItem ({
            quantity: orderItem.quantity,
            product: orderItem.product
        })
        newOrderItem = await newOrderItem.save()
        return newOrderItem._id
    }))
    
    const orderItemsIdsResolved = await orderItemsIds
    // console.log(orderItemsIdsResolved)

    // Calculate the total price for every order's items
    const totalPrices = await Promise.all(orderItemsIdsResolved.map( async ( orderItemId ) => {
        const orderItem = await OrderItem.findById(orderItemId).populate('product' ,'price')
        const totalPrice = orderItem.product.price * orderItem.quantity
        return totalPrice
    }))

    const totalPrice = totalPrices.reduce((a, b)=> a +b, 0)
    //console.log(totalPrices)

    let order = new Order({
        orderItems: orderItemsIdsResolved,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        user: req.body.user,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: totalPrice
    })
    order = await order.save()
    
    if(!order) {
        return res.status(404).send({ success: false, data: message, message:"this order cannot be created"})
    } else {
        res.status(200).send({ success: true, data: order, message:"the order is added!"})
    }
})

router.post('/create-checkout-session', async (req, res) => {
    const orderItems = req.body
    if (!orderItems) {
        res.status(400).send('checkout session cannot be created - check the order items.')
    }
    const lineItems = await Promise.all(
        // Reshape orderItems array to a new shape of data (lineItems)
        orderItems.map(async (orderItem) => {
            const product = await Product.findById(orderItem.product)
            return {
                price_data: {
                    currency: 'usd',
                    product_data: {
                      name: product.name,
                    },
                    unit_amount: product.price * 100,  // 1 dollar = 100 cent
                },
                quantity: orderItem.quantity,
            }
        })
    )
    
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: 'http://localhost:4200/success',
        cancel_url: 'http://localhost:4200/error'
    })

    res.json({ id: session.id })
})


// update status of order
router.put('/:id', async(req, res)=> {
    const order = await Order.findByIdAndUpdate(
        req.params.id,
        {
            status: req.body.status
        },
        { new: true }  // return the new updated data
    )
    if(!order)
        return res.status(404).send({success: false, message:"the status of order not found"})

    res.status(200).send({success: true, data: order, message:"the status of order is updated!"})
})

// delete a specific order by Id
router.delete('/:id', (req, res)=>{
    Order.findByIdAndRemove(req.params.id).then( async order => {
        if(order){
            await order.orderItems.map( async orderItem => { // to delete order Items from database completely
                await OrderItem.findByIdAndRemove(orderItem)
            })
            return res.status(200).send({success: true, data: order, message:"order is deleted"})
        } else { 
            return res.status(404).send({success: false, data: message, message:"order cannot be deleted!"})
        }
    }).catch(err=> {
        return res.status(500).send({success: false, error: err})
    })
})

// get total sales for all orders 
router.get('/get/totalsales', async(req, res) => {
    const totalSales = await Order.aggregate([
        { $group: { _id: null, totalsales: { $sum: '$totalPrice'} } }
    ])
    
    if(!totalSales) {
        return res.status(400).send({ success: false, message:'The order sales cannot be generated' })
    }

    res.status(200).send({totalsales: totalSales.pop().totalsales}) // to remove the _id and return totalsales only. 
})

// count orders are created - for the admin.
router.get('/get/count', async(req, res)=>{
    const orderCount = await Order.countDocuments()

    if(!orderCount) {
        res.status(500).json({ success: false, message: "Cannot count the orders.." })
    }

    res.status(200).send({
        success: true,
        orderCount: orderCount,
        message: `the number of orders are ${orderCount}`
    })
})

// get a list of orders for one user
router.get('/get/userorders/:userId', async(req, res)=>{
    const userOrderList = await Order.find({ user: req.params.userId }).populate({
        path: 'orderItems', populate: {
            path: 'product', populate: 'category' }
    }).sort({ 'dateOrdered': -1 })

    if(!userOrderList) {
        return res.status(400).json({success: false, message: 'there is no user order list'})
    }
    res.status(200).send(userOrderList)
})


module.exports = router;