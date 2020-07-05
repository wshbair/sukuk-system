$( document ).ready(function() {
    $('#loadCoupons').addClass('active')
    let i=1  
    $.ajax({
    type: "GET",
    url: "/api/coupon/all",
        success: function(result){
            if(result.length ==0)
            {
                $("#coupons-table").find('tbody')
                .append("<tr class='center aligned'><td colspan=9 > No Coupon scheduled yet</td></tr>" );
            }
            else{
                result.forEach(element => {
                    $("#coupons-table").find('tbody')
                    .append("<tr>"+
                            "<td>"+(element.id)+"</td>"+
                            "<td>"+timeConverter(element.timestamp)+"</td>"+
                            "<td>"+(element.capital)/100+" &euro;</td>"+
                            "<td>"+(element.reumn)/100+" &euro;</td>"+
                            "<td>"+(element.rembCapital)/100+" &euro;</td>"+
                            "<td>"+getLabel(element.status)+"</td>"+
                            "<td>"+element.TxId+"</td>"+ 
                            "<td>"+(element.value)/100+" &euro;</td>"+    
                            "</tr>" );
                        
                    });
            }
         $('#loadCoupons').removeClass('active')
    }
});
    
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
        default:
            return '<a class="item"> <div class="ui gray horizontal label"> Unknown</div></a>'
            break; 
      }

}
function timeConverter(UNIX_timestamp){
    
     var a = new Date(UNIX_timestamp * 1000);
    return a.toLocaleString()
  }
   