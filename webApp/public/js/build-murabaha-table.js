$( document ).ready(function() {
    $('#loadInstallments').addClass('active')
    let i=1  
    $.ajax({
    type: "GET",
    url: "/api/installment/all",
        success: async function(result){
            if(result.length ==0)
            {
                $("#murabaha-table").find('tbody')
                .append("<tr class='center aligned'><td colspan=9 > No Installment scheduled Yet</td></tr>" );
            }
            else
            {
                result.forEach(element =>{
                    $("#murabaha-table").find('tbody')
                    .append("<tr>"+
                            "<td>"+(element.id)+"</td>"+
                            "<td>"+timeConverter(element.timestamp)+"</td>"+
                            "<td>"+(element.capital)/100+" &euro;</td>"+
                            "<td>"+(element.reumn)/100+" &euro;</td>"+
                            "<td>"+(element.rembCapital)/100+" &euro;</td>"+
                            "<td>"+(((element.reumn)/100)+((element.rembCapital)/100)).toFixed(2)+" &euro;</td>"+
                            "<td>"+ (element.totalCollected)/100+" &euro;</td>"+ 
                            "<td>"+getLabel(element.overallstatus)+"</td>"+  
                            "<td><button class='mini ui blue button' onclick=showMe("+element.id+")> Show </button></td>"+  
                            "</tr>" );
                    });
            }
        $('#loadInstallments').removeClass('active')
        
        
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
        case "2":
        case "Refunded":
            return '<a class="item"> <div class="ui black horizontal label"> Refunded</div></a>'
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

function showMe(id)
{
    $("#payments-table> tbody").empty();
    var total=0;
    $.ajax({
        type: "GET",
        url: "/api/installment/payments/"+id,
        success: function(result){
                if(result.length ==0)
                {
                    $("#payments-table").find('tbody')
                    .append("<tr class='center aligned'><td colspan=9 > No Payments yet!</td></tr>" );
                }
                else
                {
                    result.forEach(element => {
                        total = total+ (element.value)/100
                        $("#payments-table").find('tbody')
                        .append("<tr>"+
                                "<td>"+(element.id)+"</td>"+
                                "<td>"+timeConverter(element.timestamp)+"</td>"+
                                "<td>"+(element.TxId)+"</td>"+
                                "<td>"+getLabel(element.status)+"</td>"+   
                                "<td>"+(element.paymentType)+"</td>"+
                                "<td>"+(element.value)/100+" &euro;</td>"+
                                "</tr>" );
                        });
                        $("#payments-table").find('tbody')
                        .append("<tr class='warning'>"+
                                "<td></td>"+
                                "<td></td>"+
                                "<td></td>"+
                                "<td></td>"+
                                "<td><h4>Total:</h4></td>"+   
                                "<td><h4>"+total.toFixed(2)+" &euro;</h4></td>"+
                                "</tr>" );
                }
            
        }
    });
    $('#payments').modal('show');
}

function GetTotalPayments(id)
{
    $.ajax({
        type: "GET",
        url: "/api/installment/payments/total/"+id,
        success: function(result){
                return result;
            
        }
    });
}
   