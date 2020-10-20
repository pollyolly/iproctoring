<?php
require_once(dirname(__FILE__) . '/../../../config.php');
define('AJAX_SCRIPT', true);

require_login();

if(isset($_POST['id']) && isset($_POST['sessKey'])){
     if($_POST['sessKey'] === sesskey()){
          $id = $_POST['id'];
          $DB->delete_records('local_iproctoring', array('id'=>$id));
          echo json_encode(array('code'=>0,'message'=>'Record deleted!'));
     } else {
          echo json_encode(array('code'=>2,'message'=>'Invalid session!'));
     }
} else {
     echo json_encode(array('code'=>1,'message'=>'Failed to delete!'));
}
