$( document ).ready(function() {
    loadData();
    
	(function worker() {
		$('#notaryLoading').addClass('active')
				
        $.ajax({
            type: "GET",
            url: "/api/notary/records",
                success: function(result){
					console.log(result)
					if(parseInt(result.murabaha_smart_contract)==1)
					{
						$('#murabahBtn').prop('disabled',true)
						$('#msg').html(' Smart contract deployment confirmed')
						$('#notaryLoading').removeClass('active') 
					}
					else
						$('#murabahBtn').prop('disabled',false)
					if(parseInt(result.sukuk_smart_contract)==1)
					{
						$('#sukukBtn').prop('disabled',true)
						$('#msg').html(' Smart contract deployment confirmed')
						$('#notaryLoading').removeClass('active') 
					}
					else
						$('#sukukBtn').prop('disabled',false)

					if(result.installment_broadcasted==1)
					{
						$('#installmentBtn').prop('disabled',true)
						$('#msg').html('Installments are broadcasted')
						$('#notaryLoading').removeClass('active') 
					}
					else
						$('#installmentBtn').prop('disabled',false)

					if(result.coupon_broadcasted==1)
					{
						$('#couponBtn').prop('disabled',true)
						$('#msg').html('Coupons are broadcasted')
						$('#notaryLoading').removeClass('active') 

					}
					else
						$('#couponBtn').prop('disabled',false)					
					
					if(result.trigger_payment==1)
					{
						$('#paymentBtn').prop('disabled',true)
						$('#msg').html('Payments are triggered')
						$('#notaryLoading').removeClass('active') 
					}
					else
						$('#paymentBtn').prop('disabled',false)

						
					}, 
					
                    complete: function() {
                        $('#notaryLoading').removeClass('active')
                        setTimeout(worker, 20000);
                      }        
                   })
      })();
}); 

function update(field)
{
    $.ajax({
        type: "POST",
        url: "/api/notary/update",
        data: {"filed": field},
        success: function(result){
            console.log(result)            
        }
    });
} 

//--------------------------------------------------------
// Load transaction data 
//--------------------------------------------------------
function loadData(){
	$.ajax({
		type: "GET",
		url: "/api/load_data",
			success: function(result){
			 $('#original_seller_name').val(result.original_seller_name)
			 $('#original_seller_address').val(result.original_seller_address)
			 $('#original_seller_id').val(result.original_seller_id)
			 $('#solo_investor_name').val(result.solo_investor_name)
			 $('#solo_investor_address').val(result.solo_investor_address)
			 $('#solo_investor_payment_account_id').val(result.solo_investor_payment_account_id)
			 $('#solo_investor_eth_addr').val(result.solo_investor_eth_address)
			 $('#purchaser_name').val(result.purchaser_name)
			 $('#purchaser_address').val(result.purchaser_address)
			 $('#purchaser_payment_account_id').val(result.purchaser_payment_account_id)
			 $('#purchaser_EthAddr').val(result.purchaser_eth_address)

			 //Documents Link 
			 $("#titleDeadLink").attr("href", "/"+result.titleDead);
			 $("#puaContractLink").attr("href", "/"+result.puaContract);
			 $("#murabaAgreementLink").attr("href", "/"+result.murabaAgreement);
			 $("#sukukCertificateLink").attr("href", "/"+result.sukukCertificate);
			 $("#installmentsLink").attr("href", "/"+result.installments);
			 $("#couponsLink").attr("href", "/"+result.coupons);
			 $("#cxcKycDocumentLink").attr("href", "/"+result.cxcKycDocument);
			 $("#spvKycDocumentLink").attr("href", "/"+result.spvKycDocument);
			 $("#puvContractLink").attr("href", "/"+result.puvContract);
 			},
			error: function(err){
				console.log(err)
			}
	});
}  

//--------------------------------------------------------
// View transaction tabs navigation functions
//--------------------------------------------------------
function Next0()
{
	document.body.scrollTop = 0; // For Safari
	document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
	$('#step1').addClass('active');
	$('#step2').removeClass('active');
	$('#step3').removeClass('active');
	$('#step4').removeClass('active');



	$('#step1Content').show();
	$('#step2Content').hide();
	$('#step3Content').hide();
	$('#step4Content').hide();

}
function Next1()
{
	document.body.scrollTop = 0; // For Safari
	document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
	$('#step1').removeClass('active');
	$('#step2').addClass('active');
	$('#step3').removeClass('active');
	$('#step4').removeClass('active');


	$('#step1Content').hide();
	$('#step2Content').show();
	$('#step3Content').hide();
	$('#step4Content').hide();


}

function Next2()
{
	document.body.scrollTop = 0; // For Safari
	document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
	$('#step1').removeClass('active');
	$('#step2').removeClass('active');
	$('#step3').addClass('active');
	$('#step4').removeClass('active');


	$('#step1Content').hide();
	$('#step2Content').hide();
	$('#step3Content').show();
	$('#step4Content').hide();

}
function Prev2()
{
	document.body.scrollTop = 0; // For Safari
	document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
	$('#step2').removeClass('active');
	$('#step1').addClass('active');
	$('#step3').removeClass('active');
	$('#step4').removeClass('active');


	$('#step1Content').show();
	$('#step2Content').hide();
	$('#step3Content').hide();
	$('#step4Content').hide();

}

function Next3()
{
	event.preventDefault();
	document.body.scrollTop = 0; // For Safari
	document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
	$('#step1').removeClass('active');
	$('#step2').removeClass('active');
	$('#step3').removeClass('active');
	$('#step4').addClass('active');

	$('#step1Content').hide();
	$('#step2Content').hide();
	$('#step3Content').hide();
	$('#step4Content').show();
	GetVerification()

}
function Prev3()
{
	document.body.scrollTop = 0; // For Safari
	document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
	$('#step3').removeClass('active');
	$('#step2').addClass('active');
	$('#step1').removeClass('active');
	$('#step4').removeClass('active');



	$('#step3Content').hide();
	$('#step2Content').show();
	$('#step1Content').hide();
	$('#step4Content').hide();


}

function view()
{
$('#transactionDetails').toggle()
}
function ViewCode(code)
{
	event.preventDefault();
	$('#'+code+'Code').modal('show');
}

//--------------------------------------------------------
// Publish Coupon on Blockchain 
//--------------------------------------------------------
async function BroadcastCoupons(e)
{
  $('#msg').html("")   
  $('#notaryLoading').addClass('active')
  await $.ajax({
		url: '/api/broadcast_coupons_schedule',
		type: 'POST',
		async: false,
		success: function (response) {
 			$('#msg').show()
			$('#msg').html(response.msg)
			$('#msg').addClass('success')
            $('#notaryLoading').removeClass('active')
            update('coupon_broadcasted')
		},
		error: function(err){
			console.log(err)	
			$('#notaryLoading').removeClass('active')

		}
	});
}
//--------------------------------------------------------
// Publish Installments on Blockchain
//--------------------------------------------------------
function BroadcastInstallments()
{
	$('#msg').html("")   
 	$('#notaryLoading').addClass('active')
	$.ajax({
		url: '/api/broadcast_installments_schedule',
		type: 'POST',
		success: function (response) {
 			$('#msg').show()
			$('#msg').html(response.msg)
			$('#msg').addClass('success')
            update('installment_installments')
		},
		error: function(err){
			console.log(err)
			$('#notaryLoading').removeClass('active')
		}
	});
}

//--------------------------------------------------------
// Trigger the payment scheduler  
//--------------------------------------------------------
function TriggerSchedule()
{
	$('#msg').html("")   
	$('#msg').removeClass('success')
	$('#notaryLoading').addClass('active')
	$.ajax({
		url: '/api/trigger_schedule',
		type: 'POST',
		success: function (response) {
			$('#msg').show()
			$('#msg').html("Payments Schedule is Running ... ")
			$('#msg').addClass('success')	
			update('trigger_payment')			
		},
		error: function(err){
			console.log(err)
		}
	});
}
//--------------------------------------------------------
// Deploy Sukuk smart contract button  
//--------------------------------------------------------
function DeploySukuk()
{
	$('#msg').html("")  
	$('#msg').removeClass('success')
    $('#notaryLoading').addClass('active')
    $.ajax({
        type: "POST",
        url: "/api/contracts/deploy/sukuk",
        success: function(result){
            $('#msg').show()
            $('#msg').addClass('success')
			$('#msg').html(result.msg)         
        },
        error: function(err){
            $('#notaryLoading').removeClass('active') 
            $('#msg').show()
            $('#msg').addClass('danger')
			$('#msg').html("Error")
        }

    });

}
//--------------------------------------------------------
// Deploy Murabaha smart contract button  
//--------------------------------------------------------
function DeployMurabaha()
{
	$('#msg').html("")
	$('#msg').removeClass('success')
    $('#notaryLoading').addClass('active')
    $.ajax({
        type: "POST",
        url: "/api/contracts/deploy/murabaha",
        success: function(result){
            $('#msg').show()
            $('#msg').addClass('success')
			$('#msg').html(result.msg)         
        },
        error: function(err){
            $('#notaryLoading').removeClass('active, success') 
            $('#msg').show()
            $('#msg').addClass('danger')
			$('#msg').html("Error")
        }
    });
}
//--------------------------------------------------------
// Reset the button to redeploy smart contracts 
//--------------------------------------------------------
function ResetAll()
{
	$('#msg').html("") 
	$('#msg').hide()
	$('#notaryLoading').addClass('active')
    $.ajax({
        type: "POST",
        url: "/api/contracts/reset",
        success: function(result){
            $('#notaryLoading').removeClass('active') 
            $('#msg').show()
            $('#msg').addClass('success')
			$('#msg').html("Reset Success! WAIT ...")   
			loadData()      
        },
        error: function(err){
            $('#notaryLoading').removeClass('active') 
            $('#msg').show()
            $('#msg').addClass('danger')
			$('#msg').html("Error")
        }
    });

}