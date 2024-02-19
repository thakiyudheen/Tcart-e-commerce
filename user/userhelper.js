
var db=require('../config/mongodb')
const bcrypt=require('bcrypt')
const saltrounds=10;
const salt=bcrypt.genSalt(saltrounds)
const collection=require('../collections/collection');
const { resolve } = require('promise');
const { ConnectionPoolReadyEvent, ObjectId } = require('mongodb');
const Objectid=require("mongodb").ObjectId
const Razorpay = require('razorpay');
var instance = new Razorpay({
    key_id: 'rzp_test_8d5ezak0ozFf7z',
    key_secret: '14yIElBh48OSu7I1ml2a2BHL',
  });


module.exports={
    adduser:(user,done)=>{
        console.log(user.password)
    
       
                db.get().collection(collection.user).insertOne(user).then((data)=>{
                    done(data )
                    
            
            })
            
        
       
       
    },
    checkuser:(nowuser,done)=>{
       let  logginstatus=true;
        let response={}
        db.get().collection(collection.user).findOne({email:nowuser.email}).then((user)=>{
            if(user){
                
                if(user.password[0]===nowuser.password){
                    response.user=user;
                    response.status=true ;
                    done(response)
                }
                else  {
                    done({staus:false})
                }
            }

            else {
                done({staus:false})
            }
            
            
        })
    },

    addcart:(proid,userid)=>{
      let cartobj={
        item:Objectid(proid),
        qty:1
      }
        return new Promise(async(resolve,reject)=>{

          let data= await db.get().collection(collection.cart).findOne({user:Objectid(userid)})

                if(data){
                    console.log(data)
                   
         let cartindex=await   db.get().collection(collection.cart).findOne({user:Objectid(userid),'products.item':Objectid(proid)})
                

                if(cartindex){
                   
                    db.get().collection(collection.cart).updateOne({user:Objectid(userid),  'products.item':Objectid(proid)},{$inc:{'products.$.qty':1}})
                }else{
                    db.get().collection(collection.cart).updateOne({user:Objectid(userid)},{$push:{products:cartobj}})
                   
                }
            
                    


                   
                }else {
                    let tcart={user:Objectid(userid),products:[cartobj]}
                    console.log(tcart)
                    db.get().collection(collection.cart).insertOne(tcart)
                    
                }

            resolve(data)
        })
       
    
    },

  findcart:(userid)=>{
console.log(userid )
    return new Promise(async(resolve,reject)=>{
        
        let cartitem=await db.get().collection(collection.cart).aggregate([
            {
               $match:{user:Objectid(userid)} 
            },
            {
                $unwind:'$products'
            },
            {
                $project:{item:'$products.item',
                qty:'$products.qty'}
            },
            {
                $lookup:{
                        from:collection.product,
                        localField:'item' ,
                        foreignField:'_id',
                        as:'products'
                }
            }
            
            // ,
            // {
            //     $lookup:{
            //         from:collection.product,
            //         let :{products:'$products'},
            //         pipeline:[{
            //             $match:{
            //                 $expr:{
            //                     $in:['$_id',"$$products"]
            //                 }
            
            //             }
            
        
            //         }],as:'prod'
        
            //     }
            // }
          
        ]).toArray()
      
        resolve(cartitem)
     
    })
    

  },
  cartcount:(userid)=>{

    return new Promise((resolve,rejcet)=>{
        db.get().collection(collection.cart).findOne({user:Objectid(userid)}).then((user)=>{
            // let product=user.products 

          
            let count=0;
            if(user){
                count=user.products.length
                console.log(count, "aimm ok aan tto")
            }
           
            resolve(count);
        })
    })
   
  },

  changeqty:(data)=>{

  let proid=data.proid 
  let userid=data.userid 
  let cartid=data.cartid 
  let count=parseInt(data.count)
  let qty=data.qty
  
    return new Promise(async(resolve,reject)=>{
        if(count==-1 && qty<=1){
            
            db.get().collection(collection.cart).updateOne({_id:Objectid(cartid)}, {$pull:{products:{item:ObjectId(proid)}}}).then((user)=>{
                resolve({remove:true})
            })
            

        }else{
       let counts= await db.get().collection(collection.cart).updateOne({_id:Objectid(cartid),'products.item':Objectid(proid)},{$inc:{'products.$.qty':count}}).then((user)=>{
        resolve({remove:false})
       })
            
            
           
        
        
        }
        
    })
  },
  removepro:(cart)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.cart).updateOne({_id:Objectid(cart.cartid)}, {$pull:{products:{item:ObjectId(cart.proid)}}}).then((user)=>{
            resolve({remove:true})
        })
    })
   
    

  },
  totelamount:(cartid)=>{
    return new Promise(async(resolve,reject)=>{
        let totel=await db.get().collection(collection.cart).aggregate([
            {
               $match:{_id:Objectid(cartid)} 
            },
            {
                $unwind:'$products'
            },
            {
                $project:{item:'$products.item',
                qty:'$products.qty'}
            },
            {
                $lookup:{
                        from:collection.product,
                        localField:'item' ,
                        foreignField:'_id',
                        as:'products'
                }
            },
            {
                $project:{
                    item:1 ,qty:1,product:{$arrayElemAt:['$products',0]}
                }

            },
            {
               
                $group:{
                    _id:null,
                    
                    Totel:{$sum:{$multiply:[{$toInt:'$qty'},{$toInt:'$product.price'}]}}
                }
            }
            // {
            //     $group: {
            //       _id: null,
            //       total: {
            //         $sum: {
            //           $multiply: [
            //             {
            //                  $toInt: '$qty'
            //             },
            //             {
            //               $toInt: {
            //                 "$replaceAll": {
            //                   "input": "$product.price",
            //                   "find": ",",
            //                   "replacement": ""
            //                 }
            //               }
            //             }
            //           ]
            //         }
            //       }
            //     }
            //   }
           
        ]).toArray()
        console.log(totel)
        resolve(totel[0].Totel)
        
    
    })

},
saveorder:(data,products)=>{

    
    let status=data.delivery==="cod"?"Placed":"Pending"
  let order={
    user:Objectid( data.user),
    deliverydetails:{
      Name :data.name ,
      date:data.date,
      phone:data.phno,
      delivery:data.delivery,
      totel:data.totel,
      status:status,
      adress:data.addres,
      products:products.products
    }
    
  }
//   let orderonly={
//     Name:data.name,
//     date:data.date,
//     phone:data.phno,
//     delivery:data.delivery,
//     totel:data.totel,
//     status:status,
//     adress:data.addres,
//     products:products.products
//   }
    

    console.log(order.user)
 return new Promise(async(resolve,reject)=>{
//    let orderlist=await  db.get().collection(collection.order).findOne({user:Objectid(data.user)})

    //   if(orderlist){
        // db.get().collection(collection.order).updateOne({user:Objectid(order.user)},{$push:{deliverydetails:orderonly}}).then((orders)=>{
        //    console.log("ok aayi")
        //    if(status==="Pending"){
        //     resolve({status:false,orderid:orderlist._id})
        //    }else{
        //     resolve({status:true,orderid:orderlist._id})
        //    }
           
           
                       
        // })
    //   }else {
        db.get().collection(collection.order).insertOne(order).then((data)=>{
            console.log("colaaayi")
            console.log(data)
            if(status==="Pending"){
                resolve({status:false,orderid:data.insertedId})
               }else{
                resolve({status:true,orderid:data.insertedId})
               }
        
    
        })
      }
    )
    
    
            
              
           
    
    
 },
 findorder:(userid)=>{
    return new  Promise(async(resolve,reject)=>{
console.log(userid,"iam okkkkxc")
      let orders= await db.get().collection(collection.order).find({user:Objectid(userid)}).toArray()
      resolve(orders)
      console.log(orders, "lets " )
    })
 
 },
 razorpaycr:(orderid,totel,done)=>{
    let totels=totel*100
    console.log(" okk  ayyiienjnkjij",totels)
return new Promise((resolve,reject)=>{
    var options = {
        amount: totels,  // amount in the smallest currency unit
        currency: "INR",
        receipt: ""+orderid
      };
      console.log(options)
      instance.orders.create(options, function(err, order) {
        console.log("iam ookkkk",order);
        db.get().collection(collection.paysave).insertOne(order)
        resolve(order)
      });
})
       
    
   

 },
 orderdpro:(orderid)=>{
    return new Promise(async(resolve,reject)=>{
        
        let orderpro=await db.get().collection(collection.order).aggregate([
            {
               $match:{_id:Objectid(orderid)} 
            },
            {
                $unwind:'$deliverydetails.products'
             },
            {
                $project:{item:'$deliverydetails.products.item',
                qty:'$deliverydetails.products.qty'}
            },
            {
                $lookup:{
                        from:collection.product,
                        localField:'item' ,
                        foreignField:'_id',
                        as:'products'
                }
            }
          
          
        ]).toArray()
        console.log(orderpro)
      
        resolve(orderpro)
     
    })
 },
 checkpay:(data)=>{
  return new Promise((resolve,reject)=>{
    db.get().collection(collection.paysave).findOne({receipt:data.orderid ,id:data.razorid}).then((order)=>{
        if(order){
            db.get().collection(collection.order).updateOne({_id:Objectid(data.orderid)}, {$set:{'deliverydetails.status':"placed"}})
            resolve({status:true})
        }else{
            resolve({status:false})
        }
        
        
    })
  })
   

 }
  

 


  

  

}


