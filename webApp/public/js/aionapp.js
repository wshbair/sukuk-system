
$('.menu .item')
.tab()
;
$('.ui.accordion')
  .accordion()
;
	
	

	function AuditCode()
	{
		$('#code').modal('show');

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

   $('.trigger.example .accordion')
  .accordion({
    selector: {
      trigger: '.title .icon'
    }
  })
;

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
	  $('#transactionDetails').show()
	  $('#ShowButton').html('Hide')
	  

  }

function Sign()  
  {
	$('#transactionDetails').show()

  }


// (function() {
// 	window.requestAnimFrame = (function(callback) {
// 	  return window.requestAnimationFrame ||
// 		window.webkitRequestAnimationFrame ||
// 		window.mozRequestAnimationFrame ||
// 		window.oRequestAnimationFrame ||
// 		window.msRequestAnimaitonFrame ||
// 		function(callback) {
// 		  window.setTimeout(callback, 1000 / 60);
// 		};
// 	})();
  
// 	var canvas = document.getElementById("sig-canvas");
// 	var ctx = canvas.getContext("2d");
// 	ctx.strokeStyle = "#222222";
// 	ctx.lineWidth = 4;
  
// 	var drawing = false;
// 	var mousePos = {
// 	  x: 0,
// 	  y: 0
// 	};
// 	var lastPos = mousePos;
  
// 	canvas.addEventListener("mousedown", function(e) {
// 	  drawing = true;
// 	  lastPos = getMousePos(canvas, e);
// 	}, false);
  
// 	canvas.addEventListener("mouseup", function(e) {
// 	  drawing = false;
// 	}, false);
  
// 	canvas.addEventListener("mousemove", function(e) {
// 	  mousePos = getMousePos(canvas, e);
// 	}, false);
  
// 	// Add touch event support for mobile
// 	canvas.addEventListener("touchstart", function(e) {
  
// 	}, false);
  
// 	canvas.addEventListener("touchmove", function(e) {
// 	  var touch = e.touches[0];
// 	  var me = new MouseEvent("mousemove", {
// 		clientX: touch.clientX,
// 		clientY: touch.clientY
// 	  });
// 	  canvas.dispatchEvent(me);
// 	}, false);
  
// 	canvas.addEventListener("touchstart", function(e) {
// 	  mousePos = getTouchPos(canvas, e);
// 	  var touch = e.touches[0];
// 	  var me = new MouseEvent("mousedown", {
// 		clientX: touch.clientX,
// 		clientY: touch.clientY
// 	  });
// 	  canvas.dispatchEvent(me);
// 	}, false);
  
// 	canvas.addEventListener("touchend", function(e) {
// 	  var me = new MouseEvent("mouseup", {});
// 	  canvas.dispatchEvent(me);
// 	}, false);
  
// 	function getMousePos(canvasDom, mouseEvent) {
// 	  var rect = canvasDom.getBoundingClientRect();
// 	  return {
// 		x: mouseEvent.clientX - rect.left,
// 		y: mouseEvent.clientY - rect.top
// 	  }
// 	}
  
// 	function getTouchPos(canvasDom, touchEvent) {
// 	  var rect = canvasDom.getBoundingClientRect();
// 	  return {
// 		x: touchEvent.touches[0].clientX - rect.left,
// 		y: touchEvent.touches[0].clientY - rect.top
// 	  }
// 	}
  
// 	function renderCanvas() {
// 	  if (drawing) {
// 		ctx.moveTo(lastPos.x, lastPos.y);
// 		ctx.lineTo(mousePos.x, mousePos.y);
// 		ctx.stroke();
// 		lastPos = mousePos;
// 	  }
// 	}
  
// 	// Prevent scrolling when touching the canvas
// 	document.body.addEventListener("touchstart", function(e) {
// 	  if (e.target == canvas) {
// 		e.preventDefault();
// 	  }
// 	}, false);
// 	document.body.addEventListener("touchend", function(e) {
// 	  if (e.target == canvas) {
// 		e.preventDefault();
// 	  }
// 	}, false);
// 	document.body.addEventListener("touchmove", function(e) {
// 	  if (e.target == canvas) {
// 		e.preventDefault();
// 	  }
// 	}, false);
  
// 	(function drawLoop() {
// 	  requestAnimFrame(drawLoop);
// 	  renderCanvas();
// 	})();
  
// 	function clearCanvas() {
// 	  canvas.width = canvas.width;
// 	}
  
// 	// Set up the UI
// 	var sigText = document.getElementById("sig-dataUrl");
// 	var sigImage = document.getElementById("sig-image");
// 	var clearBtn = document.getElementById("sig-clearBtn");
// 	var submitBtn = document.getElementById("sig-submitBtn");
// 	clearBtn.addEventListener("click", function(e) {
// 	  clearCanvas();
// 	  sigText.innerHTML = "Data URL for your signature will go here!";
// 	  sigImage.setAttribute("src", "");
// 	}, false);
// 	submitBtn.addEventListener("click", function(e) {
// 	  var dataUrl = canvas.toDataURL();
// 	  sigText.innerHTML = dataUrl;
// 	  sigImage.setAttribute("src", dataUrl);
// 	}, false);
  
//   })();


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
			success: function (response) {
			  console.log(JSON.stringify(response));
			  $('#'+filename+'_msg').show()
			}
		});
}

function UploadSchedule(scheduleType)
{
	var data = new FormData();
		data.append('uploadfile', $('#'+scheduleType).prop('files')[0]);
		data.append('scheduleType', scheduleType);
		console.log(scheduleType)
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
			},
			error: function(err){
				console.log(err)
				$('#'+scheduleType+'_msg').css("display", "block");
				$('#'+scheduleType+'_msg').addClass('error')
				$('#'+scheduleType+'_msg').html(JSON.stringify(err.responseJSON.msg))
				
			}
		});

}

function SaveStep1()
{
	var original_seller_name = $('#original_seller_name').val()
	var original_seller_address = $('#original_seller_address').val()
	var solo_investor_name = $('#solo_investor_name').val()
	var solo_investor_address = $('#solo_investor_address').val()
	var solo_investor_mogopay_account = $('#solo_investor_mogopay_account').val()
	var solo_investor_eth_addr = $('#solo_investor_eth_addr').val()
	var purchaser_name = $('#purchaser_name').val()
	var purchaser_mongopay_account = $('#purchaser_mongopay_account').val()
	var purchaser_EthAddr = $('#purchaser_EthAddr').val()
	var purchaser_address = $('#purchaser_address').val()

	var data = {
		'original_seller_name': original_seller_name,
		'original_seller_address': original_seller_address,
		'solo_investor_name':solo_investor_name,
		'solo_investor_address':solo_investor_address,
		'solo_investor_mogopay_account':solo_investor_mogopay_account,
		'solo_investor_eth_addr':solo_investor_eth_addr,
		'purchaser_name':purchaser_name,
		'purchaser_mongopay_account': purchaser_mongopay_account,
		'purchaser_EthAddr': purchaser_EthAddr,
		'purchaser_address': purchaser_address
	}
	 
	$.ajax({
		url: '/counterparts/add',
		type: 'POST',
		data: data,
		success: function (response) {
		  $('#SaveStep1_msg').show()
		  $('#SaveStep1_msg').addClass('success')
		  $('#SaveStep1_msg').html(response.msg)

		},
		error: function(error){
		  $('#SaveStep1_msg').show()
		  $('#SaveStep1_msg').addClass('error')
		  $('#SaveStep1_msg').html(error)


		}
	});





}

function BroadcastSchedules()
{
	$('#notaryLoading').addClass('active')
	$.ajax({
		url: '/api/broadcast_installments_schedule',
		type: 'POST',
		success: function (response) {
			console.log(response)
			$('#msg1').show()
			$('#msg1').html(response.msg)
			$('#notaryLoading').removeClass('active')
		},
		error: function(err){
			
		}
	});

	$.ajax({
		url: '/api/broadcast_coupons_schedule',
		type: 'POST',
		success: function (response) {
			console.log(response)
			$('#msg2').show()
			$('#msg2').html(response.msg)
		},
		error: function(err){
			
		}
	});

}

function TriggerSchedule()
{
	$.ajax({
		url: '/api/trigger_schedule',
		type: 'POST',
		success: function (response) {
			$('#msg3').show()
			$('#msg3').html("Payments Schedule is Running ... ")
		},
		error: function(err){
			console.log(err)
			
		}
	});

}