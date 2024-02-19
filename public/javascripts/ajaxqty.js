
  function changeqty(userid,cartid,proid,count){
    
   
    let qty=parseInt(document.getElementById(proid).innerHTML)
    if(qty==1 && count==-1){
      if(confirm("Are you sure remove!!")){
        $.ajax({
          url:'/cart-qty',
          method:'post',
          data:{
           userid:userid ,
           cartid :cartid  ,
           proid :proid ,
           count:count,
           qty:qty
          
           
          },
          success :(response)=>{
           if(response.remove){
            alert("product removed successfully")
            
            location.reload()
            
           }else{
            document.getElementById(proid).innerHTML=qty+count,
            document.getElementById("totel").innerHTML=response.totel
           }
          }
         
          
        })
    
      }else {
        location.reload()
      }
    }else {
      $.ajax({
        url:'/cart-qty',
        method:'post',
        data:{
         userid:userid ,
         cartid :cartid  ,
         proid :proid ,
         count:count,
         qty:qty
        
         
        },
        success :(response)=>{
         if(response.remove){
          alert("product removed successfully")
          
          location.reload()
          
         }else{
          document.getElementById(proid).innerHTML=qty+count,
          document.getElementById("totel").innerHTML=response.totel
         }
        }
       
        
      })
    }
   

}


