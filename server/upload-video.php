<?php
require_once(dirname(__FILE__) . '/../../../config.php');
//require_once(dirname(__FILE__) . '/../getID3/getid3/getid3.php');
define('AJAX_SCRIPT', true);

require_login();

$uploadDir = dirname(__DIR__).'/../../iproctoring_upload/';
if(isset($_FILES["audioVideo"]) && isset($_POST['sessKey'])){
     if($_POST['sessKey'] === sesskey()){
          $courseId = $_POST['courseId'];
          $quizId = $_POST['quizId'];
          $userId = $USER->id;
          $randomFilename = md5(uniqid());
          $fileName = $randomFilename.'.mp4';
          $uploadDirectory = $uploadDir.$fileName;
          $fileSize = $_FILES["audioVideo"]["size"];
     // Move the file to your server
          if (!move_uploaded_file($_FILES["audioVideo"]["tmp_name"], $uploadDirectory)) {
               echo json_encode(array('code'=>1, 'message'=>"Could not upload a video !"));
          }
          else{
	       //$getID3 = new getID3; 
               //$videoFile = $getID3->analyze($uploadDirectory);
   	       $record = new stdClass();
   	       //$duration = $videoFile["playtime_string"];
  	       $record->course_id = $courseId;
	       $record->quiz_id = $quizId;
	       $record->user_id = $userId;
	       $record->file_link = $fileName;
	       $record->file_timestamp = time();
	       $record->file_size = $fileSize;
	       //$record->file_duration =  format_duration($duration); 
	       $DB->insert_record('local_iproctoring', $record);
               echo json_encode(array('code'=>0, 'message'=>"Video uploaded!"));
          }
     } else {
          echo json_encode(array('code'=>1, 'message'=>'Invalid session!'));
     }
     //echo("Session UserID:".$USER->id." Post UserID:".$userId);
} else {
     echo json_encode(array('code'=>1,'message'=>'Failed to upload!'));
}
/* function format_duration($duration){
   
     if(strlen($duration) == 4){
          return "00:0" . $duration;
     }
     
     else if(strlen($duration) == 5){
          return "00:" . $duration;
     } 
     else if(strlen($duration) == 7){
          return "0" . $duration;
     }
}*/
