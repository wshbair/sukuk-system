$( document ).ready(function() {
    
    var eventsHash=[];
    
    (function worker() {
        $.ajax({
            type: "GET",
            url: "/api/events",
                success: function(result){
                    getAccounts()
                   //get installments
                   result.forEach(event=>{
                        if(!eventsHash.includes(event.transactionHash))
                       {
                        $("#events-table").find('tbody')
                        .append("<tr>"+
                                "<td>"+getTypeLabel(event.type)+"</td>"+
                                "<td>"+(event.returnValues.id)+"</td>"+
                                "<td>"+event.blockNumber+"</td>"+
                                "<td>"+(event.returnValues.value)/100+" &euro;</td>"+
                                "<td>"+event.transactionHash+"</td>"+
                                "<td>"+getLabel(event.returnValues.status)+"</td>"+
                                "</tr>" );
                        eventsHash.push(event.transactionHash)
                       }
                       
                        });
                  


                    }, 
                    complete: function() {
                        // Schedule the next request when the current one's complete
                        setTimeout(worker, 5000);
                      }
        
         
                   })
      })();


  

        
});
    


function getLabel(status)
{
    switch(status) {
        case "Success":
        case "0":    
            return '<a class="item"> <div class="ui green horizontal label"> Success</div></a>'
            break;
        case "Pending":
            return '<a class="item"> <div class="ui orange horizontal label"> Pending</div></a>'  
            break;
        case "Partial":
            return '<a class="item"> <div class="ui purple horizontal label"> Partial</div></a>'
            break;
        case "Remediated":
            return '<a class="item"> <div class="ui olive horizontal label"> Remediated</div></a>'
            break;
        case "Failed":
        case "1":    
            return '<a class="item"> <div class="ui red horizontal label"> Failed</div></a>'
            break;  
        case "Refunded":
        case "2":    
        return '<a class="item"> <div class="ui black horizontal label"> Refunded</div></a>'
        break;  
        default:
            return '<a class="item"> <div class="ui gray horizontal label"> Unknown</div></a>'
            break; 
      }

}

function getTypeLabel(type)
{
switch(type){
    case "installment":
        return '<a class="item"> <div class="ui teal horizontal label"> Installment</div></a>'
        break;
    case "coupon":
        return '<a class="item"> <div class="ui orange horizontal label"> Coupon</div></a>'
        break;
}
}



function timeConverter(UNIX_timestamp){
    var a = new Date(UNIX_timestamp * 1000);
    return a.toLocaleDateString()
  }


  function getAccounts()
  {
    $.ajax({
		url: '/api/accounts',
		type: 'GET',
		success: function (response) {
            $("#collection").html((response.SPV_collections /100).toFixed(2)+" &euro;")
            $("#investor").html((response.investor_account/100).toFixed(2) +" &euro;")
            $("#obligor").html((response.obligor_account/100).toFixed(2)+" &euro;")

			 
		},
		error: function(err){
			console.log(err)
			
		}
	});
  }
   