var express = require('express');
var router = express.Router();
var userhelper=require('../user/userhelper')
var adminhelper=require('../admin/adminpro');
const { FindOperators } = require('mongodb');
const { product, user } = require('../collections/collection');
const { response } = require('express');
const session = require('express-session');
var db=require('../config/mongodb')
const collection=require('../collections/collection');
const Objectid=require("mongodb").ObjectId



/* GET home page. */
router.get('/', function(req, res) {
 
adminhelper.findpro().then(async(product1)=>{

 


let user=req.session.user;
console.log(user)
let cartcount=null
if (user){
cartcount= await userhelper.cartcount(user._id)

}
console.log(cartcount)
res.render('index', {admin:false,style:false,user,product1,cartcount});

})

  
});

// signup page 
router.get('/sign',(req,res)=>{
  res.render('sighnup',{style:"signup.css"});
})

router.post('/sign',(req,res,next)=>{


userhelper.adduser(req.body,((user)=>{

 res.redirect('/login')
}))
 
 })


//  login pge

 router.get('/login',(req,res)=>{
  if(req.session.loggedin)
  {
    res.redirect('/')
  }
  else {
    res.render('login',{style:"login.css"})
  }
  
 })

 router.post('/login',(req,res,next)=>{
  userhelper.checkuser(req.body,(user)=>{
    if(user.status){
      req.session.loggedin=true;
      req.session.user=user.user
      res.redirect('/')
    }
    else {
      res.redirect('/sign')
    }
})
 
 })

//  adminpage 


router.get('/addproduct',(req,res)=>{
  res.render('addpro',{style:false});
})

router.post('/addproduct',(req,res)=>{
console.log(req.files.image)
  adminhelper.addproduct(req.body).then((product)=>{
   
   let Image=req.files.image
   Image.mv('./public/images/productImg/'+product.insertedId+'.jpg',(err,done)=>{
    if(err){
      console.log(err)

    }else{
      res.redirect('/')
    }
   })
  
  })
  
  
})


// delete pro


router.get('/delete',(req,res)=>{
  let proid= req.query.id 

adminhelper.deleteProduct(proid).then((data)=>{
  res.redirect('/')
  

})
  
})


// edit pro


router.get('/edit',(req,res)=>{
  let proid=req.query.id
  adminhelper.editfind(proid).then((data)=>{
  
    res.render('edit-pro',{data,style:false})
  })
})

router.post('/edit',(req,res)=>{
  let proid=req.query.id
  
  adminhelper.updatepro(req.body,proid).then((data)=>{
    
    res.redirect('/')
    
    if(req.files){
      let Image=req.files.image
      Image.mv('./public/images/productImg/'+proid+'.jpg')
      
    }
  })
 
})

// cart

router.get('/add-cart',(req,res)=>{
  console.log("iam ok di oyu ok now ")
  if(req.session.user){
    userhelper.addcart(req.query.id,req.session.user._id).then((data)=>{
      res.redirect('/')
      // res.json({status:true})
   })
  }else {
    res.redirect('/login')
    // res.json({status:false})
  }
 
 })

router.get('/cart',(req,res)=>{
   let cartcount=null;
  if(req.session.user){
 userhelper.findcart(req.session.user._id ).then(async(products)=>{

  cartcount= await userhelper.cartcount(req.session.user._id )
  console.log(cartcount)
  
  if(cartcount==0){
    
      res.render('cartnull',{style:false ,products,user:req.session.user,cartcount })
    
  

  }else{
   let totel=await userhelper.totelamount(products[0]._id)
    res.render('cart',{style:false ,products,user:req.session.user,cartcount,totel })
  
  }
  

  

  
  

    
     

 

 
 })
  

    
  }else{
    res.redirect('/login')
  }
  
})

router.post('/cart-qty',(req,res)=>{
  console.log(req.body)
  userhelper.changeqty(req.body).then((data)=>{

    if(data.remove){
      res.json(data)
    }else{
      userhelper.totelamount(req.body.cartid).then((totel)=>{
        data.totel=totel;
        console.log(data)
        res.json(data)
      })
      
    }
   
  
  })
  
})

router.post('/remove',(req,res)=>{
  console.log(req.body)
  console.log("iam ok")
  userhelper.removepro(req.body).then((data)=>{
    res.json(data)
  })

  
  
})
router.get('/place-order',(req,res)=>{
 let cartid =req.query.cartid
let cartcount=null
 if(req.session.user){
  
  userhelper.totelamount(cartid).then((data)=>{
    res.render('place-order',{data,style:false,user:req.session.user,cartcount})
  })
  
}else{
  res.redirect('/login')
}
})

router.post('/place-order',async(req,res)=>{
  let cartcount=null;

  if(req.session.user){
    let dt=new Date().toLocaleString('en-US',{timeZone:'Asia/Calcutta'});
let user=req.session.user._id;
 let datas=req.body;
 datas.date=dt
 datas.user=user 
  let orderedpro= await db.get().collection(collection.cart).findOne({user:Objectid(user)})

  
   
  
  console.log(datas)
 

  userhelper.saveorder(datas, orderedpro).then((data)=>{

  if(data.status){
      res.render('orderok',{style:false,user:req.session.user,cartcount})
      
  }else {
    userhelper.razorpaycr(data.orderid,parseInt( datas.totel)).then((data)=>{
      console.log(data)
      res.render('razor',{style:false,user:req.session.user,cartcount,data})
    })
      
    


    
  }

  })
  }else {
    res.redirect('/login')
  }
 
})
router.get('/view-product',(req,res)=>{

  let cartcount=null
  if(req.session.user){
    userhelper.findorder(req.query.id).then((data)=>{
    
      let orderlist=data
      // console.log ("okk aayyi mone ",orderlist)
      res.render('vieworder',{user:req.session.user,cartcount,style:false,orderlist})
    })

}else {
  res.redirect('/login')
}
 
})
  
router.get('/view-pro',(req,res )=>{
  let cartcount=null
  let products=req.query.orderid
  console.log(products)
  userhelper.orderdpro(products).then((products1)=>{
    res.render('orderpro',{products1,user:req.session.user,cartcount,style:false})

  })
  
})

router.post('/checkpay',(req,res)=>{
  console.log(req.body) 
   let cartcount=null
  userhelper.checkpay(req.body).then((order)=>{
    
    console.log("just tryyy",order)
    
    res.json(order)
  })

  
 
})
router.get('/orderok',(req,res)=>{
  let cartcount=null
  res.render('orderok',{style:false,user:req.session.user,cartcount})
})
  
  
  



module.exports = router;
