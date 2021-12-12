const { Category } = require('../database/models/category.model')
const express = require('express')
const router = express.Router()

// get a list of all categories
router.get('/', async (req, res) =>{
    const categoryList = await Category.find()

    if(!categoryList) {
        res.status(500).send({ success: false, message: "error in showing the categories" })
    }
    res.status(200).send({ success: true, data: categoryList })
})

// get one single category by ID
router.get('/:id' ,  async(req, res)=>{
    const category = await Category.findById(req.params.id)

    if(!category)
        return res.status(404).send({
            success: false,
            data: message, 
            message:"the category with the given ID is not found"
        })

    res.status(200).send({success: true, data: category })
}) 

// add a new category to database
router.post('/', async(req, res)=>{
    let category = new Category({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color
    })
    category = await category.save()
    
    if(!category)
        return res.status(404).send({success: false, data: message, message:"this category cannot be created"})

    res.status(200).send({success: true, data: category, message:"the category is added!"})
})

// delete a specific category by ID
router.delete('/:id', (req, res)=>{
    Category.findByIdAndRemove(req.params.id).then(category=> {
        if(category)
            return res.status(200).send({success: true, data: category, message:"category is deleted"})
        else 
            return res.status(404).send({success:false, data:message, message:"category cannot be deleted!"})
    }).catch(err=>{
        return res.status(500).send({success: false, error: err})
    })
})

// update a specific category by ID,, (UPDATE) -> get old id & post a new data to body of old id.
router.put('/:id', async(req, res)=>{
    const category = await Category.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            icon: req.body.icon || category.icon,
            color: req.body.color
        },
        { new: true }  // return the new updated data
    )
    if(!category)
        return res.status(404).send({success: false, data: message, message:"this category cannot be created"})

    res.status(200).send({success: true, data: category, message:"the category is updated!"})
})

module.exports = router;