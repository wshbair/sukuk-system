$( document ).ready(function() {
    $('#loadUnresolvedInstallments').addClass('active')
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
                    if(element.overallstatus != "Pending" && element.overallstatus !="Success")
                    {
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
                                "<td><button class='mini ui blue button' onclick=showMe("+element.id+")> Show Payments </button></td>"+ 
                                "<td>"+getActionsButton(element.overallstatus, element.id)+"</td>"+  
                                "</tr>" );
                    }
                })

                       
            }
        $('#loadUnresolvedInstallments').removeClass('active')   
    }
});
    
}); 

function getActionsButton(status,id){
    switch(status){
        case "Success":
        case "Pending":
            return "";
            break;
        default:
            return "<button class='mini ui blue button' onclick=Resolve("+id+")> Resolve </button>"
            break;
    }
}
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
    return a.toLocaleDateString()
}

function showMe(id)
{
    $('#refunddiv').hide()
    $('#refunddiv').removeClass('positive')
    $('#refundmsg').html("")
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
                                "<td> "+getActions(id, element.id, element.TxId,element.value)+"</td>"+
                                "</tr>" );
                                ""
                        });
                        $("#payments-table").find('tbody')
                        .append("<tr class='warning'>"+
                                "<td></td>"+
                                "<td></td>"+
                                "<td></td>"+
                                "<td></td>"+
                                "<td><h4>Total:</h4></td>"+   
                                "<td><h4>"+total+" &euro;</h4></td>"+
                                "<td></td>"+
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

function Resolve(id){
    $.ajax({
        type: "GET",
        url: "/api/installment/"+id,
        success: function(result){
            $('#installmentId').val(result.id)
            $('#installmentCapital').val(((result.capital)/100)+ " €")
            $('#installmentRembCapital').val((result.rembCapital)/100 + " €")
            $('#installmentTotalCollected').val(result.totalCollected/100 + " €")
            $('#installmentTimestamp').val(timeConverter(result.timestamp))
            $('#installmentRenum').val(result.reumn/100 + " €")
            $('#installmentMonthlyPayment').val(((result.reumn/100)+(result.rembCapital/100)).toFixed(2) + " €")
            $('#installmentToPay').val(((result.reumn/100)+(result.rembCapital/100)-(result.totalCollected/100)).toFixed(2)+ " €")
            $('#value').val(((result.reumn/100)+(result.rembCapital/100)-(result.totalCollected/100)).toFixed(2))

        }
    });
    $('#resolve').modal('show');
    $('#addresolvedpaymentdiv').hide()
    $('#timestamp').val(new Date().toLocaleDateString())

}

function AddResolvedPayment()
{
    var id =$('#installmentId').val()
    var txId= $('#txId').val()
    var value = $('#value').val()*100
    var status = $('#paymentStatus').val()
    var type = $('#paymentType').val()

    if(status==1)
    {
        value=0;
    }
    
    var data = {
        'id':id,
        'status':status,
        'TxId': txId,
        'value':value,
        'type':type
	}

    $.ajax({
		url: '/api/installment/update',
		type: 'POST',
		data: data,
		success: function (response) {
          $('#addresolvedpaymentdiv').show()
          $('#addresolvedpaymentdiv').addClass('positive')
          $('#addresolvedpaymentmsg').html("- Transaction hash: "+ response.transactionHash +"<br>"+ 
                                           "- New balance: "+ response.events.UpdateInstallmentEvent.returnValues.value/100 +" €")
		},
		error: function(error){
		  console.log(error)
		}
	});
}

function Refund(installmentId, paymentId, reference, value)
{
    

    var data = {
        'installmentId':installmentId,
        'paymentId':paymentId,
        'reference':reference,
        'type':'SEPA',
        'value':value
    }
    
    $.ajax({
		url: '/api/payments/refundOrCancel',
		type: 'POST',
		data: data,
		success: function (response) {
            console.log(response.hash)
            $('#refunddiv').show()
            $('#refunddiv').addClass('positive')
            $('#refundmsg').html("- SEPA Response: "+ response.response +"<br>"+ 
                                 "- SEPA Reference: "+ response.pspReference +"<br>"+ 
                                 "- Blockchain Transaction Hash: "+response.hash)
		},
		error: function(error){
		  console.log("Refund function: ",error)
		}
	});  
}

function getActions(installmentId, paymentId,txId, value)
{
    switch(value){
        case "0":
            return "<button class='mini ui blue button' disabled> Refund/Cancel </button>"
           break;
        default:
            return "<button class='mini ui blue button' onclick=Refund("+installmentId+","+paymentId+",'"+txId+"',"+value+")> Refund/Cancel </button>"
    }
}