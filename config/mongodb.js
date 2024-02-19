const mongoClient=require('mongodb').MongoClient
const state={
    db:null
}

module.exports.connect=(done)=>{
    const url='mongodb://0.0.0.0:27017'
    const dbname='Tcart'

   mongoClient.connect(url,(err,data)=>{
    if(err) return done(err)
    state.db=data.db(dbname)
    done()
   })
}
module.exports.get=()=>{
    return state.db
}

RukgLKRSqu7GFYer

thakiyudheen 