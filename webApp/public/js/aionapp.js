$( document ).ready(function() {
	//Load Data from database 
	loadData()
	
})

var uploadedFiles = [];

function ViewCode(code)
{
	event.preventDefault();
	$('#'+code+'Code').modal('show');
}




function deploySmartContract()
{
	
	
	setTimeout(function(){
		$('#msg1').show(); window.scrollTo(0,document.body.scrollHeight); },1000);
	setTimeout(function(){
		$('#msg2').show(); 
		window.scrollTo(0,document.body.scrollHeight);
		$('#msg1').find('i')[0].classList.remove("notched", "circle", "loading")
		$('#msg1').find('i')[0].classList.add("check", "green")
	},2500);
	setTimeout(function(){
		$('#msg3').show(); 
		window.scrollTo(0,document.body.scrollHeight); 
		$('#msg2').find('i')[0].classList.remove("notched", "circle", "loading")
		$('#msg2').find('i')[0].classList.add("check", "green")
	
	},4000);
	setTimeout(function(){
		$('#msg4').show(); 
		window.scrollTo(0,document.body.scrollHeight); 
		$('#msg3').find('i')[0].classList.remove("notched", "circle", "loading")
		$('#msg3').find('i')[0].classList.add("check", "green")
	},5500);
	setTimeout(function(){
		$('#msg5').show(); window.scrollTo(0,document.body.scrollHeight);
			$('#msg4').find('i')[0].classList.remove("notched", "circle", "loading")
			$('#msg4').find('i')[0].classList.add("check", "green")
	},7000);
	setTimeout(function(){
		$('#msg5').find('i')[0].classList.remove("notched", "circle", "loading")
		$('#msg5').find('i')[0].classList.add("check", "green")
	},8500);
}

/*    $('.trigger.example .accordion')
  .accordion({
    selector: {
      trigger: '.title .icon'
    }
  })
; */

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
	$('#SaveStep1_msg').html('')
	$('#SaveStep1_msg').hide()


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
	$('#SaveStep1_msg').html('')
	$('#SaveStep1_msg').hide()




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
	$('#SaveStep1_msg').html('')
	$('#SaveStep1_msg').hide()


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
	$('#SaveStep1_msg').html('')
	$('#SaveStep1_msg').hide()

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
	$('#SaveStep1_msg').html('')
	$('#SaveStep1_msg').hide()



	$('#step3Content').hide();
	$('#step2Content').show();
	$('#step1Content').hide();
	$('#step4Content').hide();


}

function view()
  {
	$('#transactionDetails').toggle()
  }

function Sign()  
  {
	$('#transactionDetails').show()
    $('#sign').modal('show');
  }


function GetEthereumAddress(inputid)
  {
	$.ajax({
		type: "GET",
		url: "/api/ethereum/address",
			success: function(result){
			$("#"+inputid).val(result)
			console.log(result)
			},
			error: function(err){
				console.log(err)
			}
	});
}

function UploadFile(filename)
{    
		var data = new FormData();
		data.append('uploadfile', $('#'+filename).prop('files')[0]);
		data.append('type', filename);

		$.ajax({
			url: '/api/uploadfile',
			type: 'POST',
			data: data,
			processData: false,
			contentType: false,
			async: false,
			success: function (response) {
			  $('#'+filename+'_msg').css("display", "block");
			  $('#'+filename+'_msg').addClass('success')
			  $('#'+filename+'_msg').text('File uploaded Successfully')
			   uploadedFiles.push({[filename]: response.file})
			   loadData()
			},
			error: function(err){
			  $('#'+filename+'_msg').css("display", "block");
			  $('#'+filename+'_msg').addClass('error')
			  $('#'+filename+'_msg').text('File uploaded Failed')
 			  uploadedFiles.push({[filename]: response.file})

			   
			}
		});
}

function UploadSchedule(scheduleType)
{
	var data = new FormData();
		data.append('uploadfile', $('#'+scheduleType).prop('files')[0]);
		data.append('scheduleType', scheduleType);
 		$.ajax({
			url: '/api/upload_schedule',
			type: 'POST',
			data: data,
			processData: false,
			contentType: false,
			success: function (response) {
			  $('#'+scheduleType+'_msg').css("display", "block");
			  $('#'+scheduleType+'_msg').addClass('success')
			  $('#'+scheduleType+'_msg').html(response.msg)
			  uploadedFiles.push({[scheduleType]: response.file})

			},
			error: function(err){
				console.log(err)
				$('#'+scheduleType+'_msg').css("display", "block");
				$('#'+scheduleType+'_msg').addClass('error')
				$('#'+scheduleType+'_msg').html(JSON.stringify(err.responseJSON.msg))
				uploadedFiles.push({[scheduleType]: response.file})

				
			}
		});

}

function SaveStep1()
{
	$('#transactionSetup').addClass('active')
	var original_seller_name = $('#original_seller_name').val()
	var original_seller_address = $('#original_seller_address').val()

	var solo_investor_name = $('#solo_investor_name').val()
	var solo_investor_address = $('#solo_investor_address').val()
	var solo_investor_payment_account_id = $('#solo_investor_payment_account_id').val()
	var solo_investor_eth_addr = $('#solo_investor_eth_addr').val()

	var purchaser_name = $('#purchaser_name').val()
	var purchaser_payment_account_id = $('#purchaser_payment_account_id').val()
	var purchaser_EthAddr = $('#purchaser_EthAddr').val()
	var purchaser_address = $('#purchaser_address').val()

	var validation1A = (isEmpty(original_seller_name)&& isEmpty(original_seller_address))
	var validation1B = (isEmpty(solo_investor_name)&&isEmpty(solo_investor_address)&&isEmpty(solo_investor_payment_account_id)&&isEmpty(solo_investor_eth_addr))
	var validation1C = (isEmpty(purchaser_name)&&isEmpty(purchaser_address)&&isEmpty(purchaser_payment_account_id)&&isEmpty(purchaser_EthAddr))

	var data = {
		'original_seller_name': original_seller_name,
		'original_seller_address': original_seller_address,
		'solo_investor_name':solo_investor_name,
		'solo_investor_address':solo_investor_address,
		'solo_investor_payment_account_id':solo_investor_payment_account_id,
		'solo_investor_eth_addr':solo_investor_eth_addr,
		'purchaser_name':purchaser_name,
		'purchaser_payment_account_id': purchaser_payment_account_id,
		'purchaser_EthAddr': purchaser_EthAddr,
		'purchaser_address': purchaser_address,
		'validation1A': validation1A,
		'validation1B':validation1B,
		'validation1C':validation1C
	}	 
	$.ajax({
		url: '/api/counterparts/add',
		type: 'POST',
		data: data,
		success: function (response) {
		  $('#SaveStep1_msg').show()
		  $('#SaveStep1_msg').addClass('success')
		  $('#SaveStep1_msg').html(response.msg)
	      $('#transactionSetup').removeClass('active')

		},
		error: function(error){
		  $('#SaveStep1_msg').show()
		  $('#SaveStep1_msg').addClass('error')
		  $('#SaveStep1_msg').html(error)
	      $('#transactionSetup').removeClass('active')
		}
	});





}

async function SaveStep2()
{
	//Save uploaded files in database 
	console.log(uploadedFiles)
	var msg="Uploaded Files <br>";
	uploadedFiles.forEach(element => {
		msg= msg + JSON.stringify(element) +"<br>"
		
	});
	$('#SaveStep1_msg').show()
	$('#SaveStep1_msg').addClass('success')
	$('#SaveStep1_msg').html(msg)
	$('#transactionSetup').removeClass('active')
}
 

 
 

function isEmpty(str) {
    return !(!str || 0 === str.length);
}

function getStatus(result)
{
	if(result)
	return '<i class="large green checkmark icon"></i>'
	else 
	return '<i class="large red close icon"></i>'
}

function GetVerification()
{
	event.preventDefault();
	$('#transactionSetup').addClass('active')
	$('#A1').removeClass('green checkmark red close')
	$('#B1').removeClass('green checkmark red close')
	$('#C1').removeClass('green checkmark red close')

    $.ajax({
    type: "GET",
    url: "/api/verification/counterparts",
        success: async function(result){
			console.log(result[0])
		   if(JSON.parse(result[0].validation1A))
			$('#A1').addClass('green checkmark')
			else
			$('#A1').addClass('red close')

			if(JSON.parse(result[0].validation1B))
			$('#B1').addClass('green checkmark')
			else
			$('#B1').addClass('red close')

			if(JSON.parse(result[0].validation1C))
			$('#C1').addClass('green checkmark')
			else
			$('#C1').addClass('red close')

			// If all are valid, you can transfer to notary
			if(JSON.parse(result[0].validation1A) && JSON.parse(result[0].validation1B) &&JSON.parse(result[0].validation1C) )
			{
				$('#send2notary').prop('disabled', false);
			}
			else 
			$('#send2notary').prop('disabled', true);
    }
});

 
	$.ajax({
    type: "GET",
    url: "/api/verification/files",
        success: async function(result){
			$('#A2').removeClass('green checkmark red close')
			$('#B2').removeClass('green checkmark red close')
			$('#C2').removeClass('green checkmark red close')
			$('#D2').removeClass('green checkmark red close')
			$('#E2').removeClass('green checkmark red close')
			$('#F2').removeClass('green checkmark red close')
			$('#G2').removeClass('green checkmark red close')

			arr =[]
			result.forEach(element => {
				arr.push(element.type)
			});
			 
			if(arr.includes('titleDead'))
				$('#A2').addClass('green checkmark')
			else
				$('#A2').addClass('red close')

			if(arr.includes('puvContract'))
				$('#B2').addClass('green checkmark')
			else
				$('#B2').addClass('red close')	

			if(arr.includes('puaContract'))
				$('#C2').addClass('green checkmark')
			else
				$('#C2').addClass('red close') 
			
			if(arr.includes('spvKycDocument'))
				$('#D2').addClass('green checkmark')
			else
				$('#D2').addClass('red close') 
			 
			if(arr.includes('cxcKycDocument'))
				$('#E2').addClass('green checkmark')
			else
				$('#E2').addClass('red close') 

			if(arr.includes('coupons'))
				$('#F2').addClass('green checkmark')
			else
				$('#F2').addClass('red close') 

			if(arr.includes('installments'))
				$('#G2').addClass('green checkmark')
			else
				$('#G2').addClass('red close') 

        $('#transactionSetup').removeClass('active')
   
    }
});
 
}

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

function Send2Notary()
{
	event.preventDefault();
	$('#transactionSetup').addClass('active')	
	$.ajax({
		type: "POST",
		url: "/api/verification/send2notary",
			success: async function(result){
				console.log(result[0])
				$('#transactionSetup').removeClass('active')
				$('#SaveStep1_msg').addClass('success')
				$('#SaveStep1_msg').html('Request sent to Notary')
				$('#SaveStep1_msg').show()

		},
		error: function(err){
			$('#transactionSetup').removeClass('active')
			$('#SaveStep1_msg').addClass('red')
			$('#SaveStep1_msg').html('Error')
			$('#SaveStep1_msg').show()

		}
	});

	$.ajax({
        type: "POST",
        url: "/api/contracts/reset",
        success: function(result){     
        },
        error: function(err){
        }
    });
}
