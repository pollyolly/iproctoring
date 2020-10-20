<?php
require_once(dirname(__FILE__) . '/../../../config.php');
define('AJAX_SCRIPT', true);

require_login();

if(isset($_POST['id']) && isset($_POST['sessKey'])){
     if($_POST['sessKey'] === sesskey()){
          $id = $_POST['id'];
          $review = $_POST['reviewStat'];
          $note = $_POST['textNote'];
          $records = new stdClass();
          $records->id = $id;
          $records->review = $review;
          $records->note = $note;
          $DB->update_record('local_iproctoring',$records, false);
          echo json_encode(array('code'=>0,'message'=>"Review added!"));
     } else {
          echo json_encode(array('code'=>2, 'message'=>'Invalid session!'));
     }
}else {
     echo json_encode(array('code'=>1,'message'=>'Failed to delete!'));
}
