const db=require('../config/mongodb');
const collection=require('../collections/collection');
const { reject } = require('promise');
const Objectid=require("mongodb").ObjectId
module.exports={
    addproduct:(product)=>{
      return new Promise((resolve,reject)=>{
        db.get().collection(collection.product).insertOne(product).then((pro)=>{
            resolve(pro)
        })
      })
    

    },
    findpro:(product)=>{

      return new  Promise(async(resolve,reject)=>{
       let products=await db.get().collection(collection.product).find().toArray()
       resolve(products)
      })
      
    },
    deleteProduct:(id)=>{
      return new Promise((resolve,reject)=>{
        db.get().collection(collection.product).deleteOne({_id:Objectid(id)}).then((data)=>{
          resolve(data)
        })
      })
      
    },


    // edit product

    editfind:(proid)=>{

      return new Promise((resolve,reject)=>{
        db.get().collection(collection.product).findOne({_id:Objectid(proid)}).then((data)=>{
          resolve(data)
        })
      })
      
    },
    updatepro:(pro,proid)=>{
      return new Promise((resolve,reject)=>{
        db.get().collection(collection.product).updateOne({_id:Objectid(proid)},{$set:{name:pro.name,price:pro.price,about:pro.about}}).then((data)=>{
         
          resolve(data)
        })
      })
    }






    
}