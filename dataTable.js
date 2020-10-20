/*var options = {}
var player = videojs('my-player', options, function onPlayerReady() {
     videojs.log('Your player is ready!');

     this.play();

     this.on('ended', function() {
          videojs.log('Awww...over so soon?!');
     });
});
*/
$(document).ready(function(){
	$('#user-notifications').append('<div class="alert alert-warning alert-block fade in " role="alert">'+
		    '<button type="button" class="close" data-dismiss="alert">×</button>'+
		    'Your message here'+
		'</div>');
	$('#user-notifications').append('<div class="alert alert-danger alert-block fade in " role="alert">'+
		    '<button type="button" class="close" data-dismiss="alert">×</button>'+
		    'Your message here'+
		'</div>');
	$('#user-notifications').append('<div class="alert alert-info alert-block fade in " role="alert">'+
		    '<button type="button" class="close" data-dismiss="alert">×</button>'+
		    'Your message here'+
		'</div>');

    var table = $('#iProctoringTable').DataTable({
          dom: 'lfrtip',
	  order:[[6, "desc"]], 
	  searching: true,
	  scrollX: true,
	  fixedColumns: true,
	  fixedHeader: true,
          buttons: [
               'csvHtml5',
          ]
     });
     $('button.ipDelete').on('click', function(){
          let deleteStatus = prompt("Please type 'DELETE' to delete this file permanently!");
	  let id = $(this).data('deleteId');
	  if(deleteStatus == 'DELETE'){
		let formData = new FormData();
		formData.append('id', id);
 	        $.ajax({url:'/uvle351/local/iproctoring/server/delete-review.php',
			processData: false,
   		        contentType: false,
			data: formData 
		}).done(function(data){
		     console.log('Successfully '+deleteStatus+'D!');
		     table.fnFilterClear();
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
	  } else {
	      $('#my-player').attr('src','');
	  }
     });
     $('span.ipClose').on('click',function(){
   	  $('div.ipModal').hide();
	  $('#my-player').trigger('pause'); 
     });

     $('.ipAddNote').click(function(){
	 if(!this.checked) {
     	      $('.ipNote').hide();
	      $('.ipSubmitNote').hide();
         } else {
     	      $('.ipNote').show();
     	      $('.ipSubmitNote').show();
	 }
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
});
