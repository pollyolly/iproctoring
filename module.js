M.local_iproctoring = {
      fixlayout: function(Y, coursefullname){
	 try {
            console.log('Courese Name:', coursefullname);
	    document.getElementById('sitetitle').innerText = coursefullname;
	 } catch(e) {
	    console.log(e);
	 }
      },
      init: function(Y, quizid, courseid, sesskey) {
         try {
           console.log('Quiz ID:', quizid);
	   console.log('Course ID:', courseid);
           console.log('Session Key:', sesskey);
           var options = {
                controls: true,
                autoplay: false,
                bigPlayButton: true,
                fluid: true,
                autoMuteDevice: true,
	        preload: 'none',
                aspectRatio: '16:9',
                controlBar: {
                     volumePanel: false,
     	             fullscreenToggle: false,
                },
		techOrder: ['html5', 'flash','other supported tech'],
                plugins: {
                     record: {
                          pip: true,
                          audio: true,
                          video: true,
                          maxLength: 7200,
                          displayMilliseconds: false,
                          debug: true
                     }
               },
          };
          applyVideoWorkaround();
          var player = videojs('myVideo', options, function onPlayerReady() {
               var msg = 'Using video.js ' + videojs.VERSION +
	            ' with videojs-record ' + videojs.getPluginVersion('record') +
	            ' and recordrtc ' + RecordRTC.version;
                videojs.log(msg);
          });
          player.on('ready', function() {
	       setTimeout(function(){
   	            player.record().getDevice();
	            videojs.log('Ready');
	            //videojs.log(player.record.getDevice());
	       },2000);
          });
          player.addClass('vjs-matrix');
          player.on('deviceError', function() {
               console.log('device error:', player.deviceErrorCode);
	       if(player.deviceErrorCode == "TypeError: Cannot set property 'textContent' of null"){
	            player.record().getDevice();
	       }
          });
          player.on('error', function(element, error) {
               console.error(error);
          });
          player.on('startRecord', function() {
	       /*player.on('loadedmetadata', function() {
	            console.log('Current Time Start Recording:',player.currentTime(0));
	       });*/
		  console.log('Start Recording');
          });
          player.on('stopRecord', () => {
               console.log('Stop recording, Duration: ', player.duration());
          });
          player.on('finishRecord', function() {
	     console.log('Finish Record');
	/*	player.on('timeupdate', function() {
	            console.log('Current Time Finish Record:',player.currentTime());
	       });*/

	     //player.on('loadedmetadata',function(){
	//	 if(player.readyState() === 1){
	           console.log('Last Modified date:', player.recordedData.lastModifiedDate);
   	           console.log('File Size:', player.recordedData.size);
	           console.log('Video Binary:', player.recordedData.video);
                   let formData = new FormData();
                   formData.append('audioVideo', player.recordedData);
	           formData.append('quizId', quizid);
	           formData.append('courseId', courseid);
	           //formData.append('userId', userid);
	           formData.append('sessKey', sesskey);
	           xhr('/uvle351/local/iproctoring/server/upload-video.php', formData, function (fName) {
	                console.log("Video succesfully uploaded !");
		        $('#user-notifications').html('');
		        $('#user-notifications').append('<div class="alert alert-success alert-block fade in " role="alert">'+
			                       '<button type="button" class="close" data-dismiss="alert">×</button>'+
			                       'Successfully Uploaded!'+
			                   '</div>');
                   });
                   function xhr(url, data, callback) {
	                var request = new XMLHttpRequest();
	                request.onreadystatechange = function () {
	                     if (request.readyState == 4 && request.status == 200) {
	                           callback(location.href + request.responseText);
	                     }
	                };
	                request.open('POST', url);
	                request.send(data);
	           }
	  //         }//READYSTATE 1 = CHECK METADATA (DURATION) LOADED
	   //  });//metadata
          });
          player.on("ended",function(){
		      player.hasStarted(false);

		    console.log('Duration:', player.duration());
	  });
          player.on('timestamp', function() {
              console.log('current timestamp: ', player.currentTimestamp);
              console.log('all timestamps: ', player.allTimestamps);
              console.log('array of blobs: ', player.recordedData);
          });
          var pipWindow;
          player.on('enterPIP', function(element, evt) {
              console.log('Entered Picture-in-Picture');
              pipWindow = evt.pictureInPictureWindow;
              pipWindow.addEventListener('resize', onPipWindowResize);
              console.log(`Window size is ${pipWindow.width} x ${pipWindow.height}`);
          });
          player.on('leavePIP', function() {
              console.log('Left Picture-in-Picture');
              pipWindow.removeEventListener('resize', onPipWindowResize);
          });
          function onPipWindowResize(evt) {
              console.log(`Window size changed to ${pipWindow.width} x ${pipWindow.height}`);
          }
       } catch(e){
           console.log(e);
       }
     }, //init 
     datatable: function(Y, sesskey){
	  $.noConflict();
          var table = $('#iProctoringTable').DataTable({
               dom: 'lfrtip',
               order:[[6, "desc"]],
               searching: true,
               scrollX: true,
               fixedColumns: true,
               fixedHeader: true,
               buttons: ['csvHtml5']
          });
          $('button.ipDelete').on('click', function(){
	       console.log('Delete SessionKey: ', sesskey);
	       let deleteStatus = confirm("Are you sure to delete this record?");
               if(deleteStatus){
		    let id = $(this).data('deleteid');
	            $.ajax({
			 url:'/uvle351/local/iproctoring/server/delete-review.php',
			 method: 'POST',
			 data: {
			      id: id,
			      sessKey: sesskey
			 }
	            }).done(function(datas){
			 let data = JSON.parse(datas);
			 if(data.code == 0){
			      $('.notifications').append('<div class="alert alert-success alert-block fade in " role="alert">'+
			           '<button type="button" class="close" data-dismiss="alert">×</button>'+data.message+'</div>');
			 }
			 if(data.code == 1){
			      $('.notifications').append('<div class="alert alert-danger alert-block fade in " role="alert">'+
			           '<button type="button" class="close" data-dismiss="alert">×</button>'+data.message+'</div>');
			 }
			if(data.code == 2){
			      $('.notifications').append('<div class="alert alert-warning alert-block fade in " role="alert">'+
			           '<button type="button" class="close" data-dismiss="alert">×</button>'+data.message+'</div>');
			 }
 			 setTimeout(function(){
			      location.reload(true); 
			 }, 2000);
		    });
	       } else {
	            console.log('Does not proceed!');
	       }
	   });

           $('button.ipView').on('click', function(){
                $('div.ipModal').show();
                $('.ipNote').hide();
                $('.ipSubmitNote').hide();
                if($(this).data('videolink')!=''){
                     $('#my-player').attr('src',$(this).data('videolink'));
		     $('#ipAddNote').val($(this).data('reviewstat'));
		     $('#ipId').val($(this).data('viewid'));
                } else {
                     $('#my-player').attr('src','');
		     $('#ipAddNote').val('');
		     $('#ipId').val('');
                }
		if($(this).data('reviewstat') == 1){
		     $('.ipAddNote').prop('checked', true);
		     $('.ipNote').show();
		     $('.ipSubmitNote').show();
		} else {
		     $('.ipAddNote').prop('checked', false);
		     $('.ipNote').hide();
		     $('.ipSubmitNote').hide();
		}
		$('.ipNote').val('');
		$('.ipNote').val($(this).data('note'));
           });

           $('span.ipClose').on('click',function(){
                $('div.ipModal').hide();
                $('#my-player').trigger('pause');
           });
           $('.ipAddNote').click(function(){
                if(!this.checked) {
                     $('.ipNote').hide();
                     $('.ipSubmitNote').hide();
		     $(this).val(0);
                } else {
                     $('.ipNote').show();
                     $('.ipSubmitNote').show();
		     $(this).val(1);
                }
           });
	   $('.ipSubmitNote').click(function(){
	        $.ajax({
		     url:'/uvle351/local/iproctoring/server/update-review.php',
		     method:'POST',
		     data:{
			  sessKey: sesskey,
			  id: $('#ipId').val(),
			  reviewStat: $('#ipAddNote').val(),
		          textNote: $('#ipNote').val()
		     }
		}).done(function(datas){
			 let data = JSON.parse(datas);
   		         $('div.ipModal').hide();
                         $('#my-player').trigger('pause');
		         if(data.code == 0){
			      $('.notifications').append('<div class="alert alert-success alert-block fade in " role="alert">'+
			           '<button type="button" class="close" data-dismiss="alert">×</button>'+data.message+'</div>');
			 }
			 if(data.code == 1){
			      $('.notifications').append('<div class="alert alert-danger alert-block fade in " role="alert">'+
			           '<button type="button" class="close" data-dismiss="alert">×</button>'+data.message+'</div>');
			 }
			 if(data.code == 2){
			      $('.notifications').append('<div class="alert alert-warning alert-block fade in " role="alert">'+
			           '<button type="button" class="close" data-dismiss="alert">×</button>'+data.message+'</div>');
			 }
			 setTimeout(function(){
			      location.reload(true); 
			 }, 2000);
		});
	   });
           $('button.ipSearchFilter').on('click', function(){
                $('div.ipSearchModal').show();
           });
           $('span.ipSearchClose').on('click',function(){
                $('div.ipSearchModal').hide();
          });
          $('#iProctoringTable thead tr:eq(0) th').each( function (i) {
                var title = $(this).text();
                $('div.ipSearchInputs').append( '<input type="text" placeholder="Search '+title+'" />' );
                $( 'div.ipSearchInputs input' ).on( 'input', function (e) {
                     if ( table.column(i).search() !== this.value ) {
                          table.column(i).search( this.value ).draw(false);
                     }
                     table.fnFilterClear();
                } );
          } );
     }//datatable
} //end
$(document).ready(function(){
     $('#ipSetname').click(function(){
          $('#ipSetname').hide();
	  $('#ipUnsetname').show();
          $('#ipFilename').attr('readonly', true);
     });
     $('#ipUnsetname').click(function(){
          $('#ipUnsetname').hide();
          $('#ipSetname').show();
          $('#ipFilename').attr('readonly', false);
     });
//Administration
     $('#administration').css('display','inline-block');
});
