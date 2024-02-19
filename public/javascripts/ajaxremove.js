function remove(cartid,proid){
    if(confirm("are you sure remove")){
  $.ajax({
    url:'/remove',
    method:'post',
    data:{
      cartid:cartid ,
      proid :proid 
    },
  
    success:(response)=>{
      if(response.remove){
       
        location.reload()
      }
    }
  
  })}else{
    location.reload()
  }
  }