const Product  = require('../database/models/product.model')
const { Category } = require('../database/models/category.model')
const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const multer  = require('multer')
const path = require('path')

// file types
const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpg': 'jpg',
    'image/jpeg': 'jpeg'
};

// upload images for products
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype]
        let uploadError = new Error('invalid image type')
        if (isValid) {
            uploadError = null
        }
        cb(uploadError, "public/uploads")
    },
    filename: function (req, file, cb) {
        const fileName= file.originalname.split(' ').join('-')
        const extension = FILE_TYPE_MAP[file.mimetype]
        cb(null, `${fileName} - ${Date.now()}.${extension}`)
    }
})

const uploadOptions = multer({ storage: storage })

// get a list of all products
router.get('/', async(req,res)=> {
    // if filter not found it will bring all products,
    // if filter has a value it will filter products by category .
    let filter = {};    
    if (req.query.categories) {
        filter = { category: req.query.categories.split(',') }
    }

    const productList = await Product.find(filter).populate('category')   // list with a category details

    if(!productList) {
        res.status(500).json({ success: false })
    }
    res.status(200).send({ success: true, data: productList })
})

// get one single product by ID
router.get('/:id', async(req,res)=> {
    const product = await Product.findById(req.params.id)

    if(!product) {
        res.status(500).json({ success: false })
    }
    res.status(200).send({ success: true, data: product })
})

// add a new product with an Image to database
router.post(`/`, uploadOptions.single('image'), async (req, res) => {
    // validate the category of product
    const category = await Category.findById(req.body.category)
    if (!category) return res.status(400).send('Invalid Category')

    // validate the image file of the product
    const file = req.file
    if (!file) return res.status(400).send('No image in the request')

    const fileName = file.filename
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
    
    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: `${basePath}${fileName}`,    // "http://localhost:3000/public/uploads/image-2323232"
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured
    })

    product = await product.save()
    
    if(!product) return res.status(404).send({
        success:false, 
        data: message, 
        message: "the product not found" 
    })

    res.status(200).send({ success: true, data: product })
})

// update a specific product by ID and update its image,, (UPDATE) -> get old id & post a new data to body of old id.
router.put('/:id', uploadOptions.single('image'), async(req, res) => {
    // validate the product id
    if(!mongoose.isValidObjectId(req.params.id)) {
        return res.status(404).send({ success: false, message: "Invalid Product Id" })
    }

    // validate the category of the product
    const category = await Category.findById(req.body.category)
    if(!category) return res.status(404).send({ success: false, message:"Invalid Category!" })

    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).send("Invalid Product!")
    
    const file = req.file
    let imagePath

    if(file) {
        const fileName = file.filename
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`
        imagePath = `${basePath}${fileName}`
    } else {
        imagePath = product.image
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: imagePath,
            images: req.body.images,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured
        },
        { new: true }  //means return the new updated data
    )
    if(!updatedProduct)
        return res.status(404).send({
            success: false, 
            message:"this product cannot be created"
        })

    res.status(200).send({
        success: true, 
        data: updatedProduct, 
        message:"the product is updated!"
    })
})

// delete a specific product by ID
router.delete('/:id', (req, res)=>{
    Product.findByIdAndRemove(req.params.id).then(product=> {
        if(product)
            return res.status(200).send({success: true, data: product, message:"product is deleted"})
        else 
            return res.status(404).send({success:false, data:message, message:"product cannot be deleted!"})
    }).catch(err=>{
        return res.status(500).send({success: false, error: err})
    })
})

// show to the Admin how many products in the store.
router.get('/get/count', async(req, res)=>{
    const productCount = await Product.countDocuments()

    if(!productCount) {
        res.status(500).json({ success: false, message: "Cannot count the products.." })
    }

    res.status(200).send({
        success: true,
        productCount: productCount,
        message: `the number of products is ${productCount} in the store.`
    })
})

// list the featured products.
router.get('/get/featured', async(req, res)=>{
    const products = await Product.find({ isFeatured: true })

    if(!products) {
        res.status(500).json({ success: false, message: "Cannot get the featured products.." })
    }

    res.status(200).send({
        success: true,
        featuredProducts: products
    })
})

// show the number of featured products.
router.get('/get/featured/:count', async(req, res) => {
    const count = req.params.count ? req.params.count : 0
    const products = await Product.find({ isFeatured: true }).limit(+count)

    if(!products) {
        res.status(500).json({ success: false, message: "Cannot get the count of featured products.." })
    }

    res.status(200).send({
        success: true,
        featuredProducts: products
    })
})

// get a list of all products by Categories (query parameters)
router.get('/', async(req,res)=> {
    // localhost:3000/api/v1/products?categories=234234, 234569
    let filter = {}
    if (req.query.categories) {
        filter =  { category: req.query.categories.split(',') }
    }

    const productList = await Product.find(filter).populate('category') // list with a category details

    if(!productList) {
        res.status(500).json({ success: false })
    }
    res.status(200).send({ success: true, data: productList })
})


// put the product and upload images gallery (multiple images) for one product.
// NOTICE: when upload multiple images, firstly, MUST clear the 'image' field. 
router.put('/gallery-images/:id', uploadOptions.array('images', 10), async(req, res) => {
    if(!mongoose.isValidObjectId(req.params.id)) {
        return res.status(404).send({ success: false, message: "Invalid Product Id" })
    }
    
    const files = req.files
    let imagesPaths = []
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`

    if (files) {
        files.map((file) => {
          imagesPaths.push(`${basePath}${file.filename}`);
        })
    }

    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            images: imagesPaths
        },
        { new: true }
    )

    if(!product) {
        return res.status(500).send('the gallery cannot be updated!')
    }
    res.status(200).send(product)
})


module.exports = router