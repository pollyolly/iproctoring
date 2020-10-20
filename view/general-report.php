<?php
require_once(dirname(__FILE__) . '/../../../config.php');
require_once($CFG->dirroot . '/mod/quiz/locallib.php'); //Get quiz name
defined('MOODLE_INTERNAL') || die;

require_login();

$remoteLocation = $CFG->www.'/uvle351/iproctoring_upload/';
$localLocation = dirname(__FILE__) .'/../../../iproctoring_upload/';

$courseid = optional_param('id', '', PARAM_INT); //Get Course Id in URL (GET)
$params = array('id'=>$courseid);
$course = $DB->get_record('course', $params, '*', MUST_EXIST);

$renderer = $PAGE->get_renderer('local_iproctoring');
$renderer->add_datatable_modules($course->fullname);
$renderer->add_videojs_modules();

//$attemptid = required_param('attempt', PARAM_INT);
//$page = optional_param('page', 0, PARAM_INT);
//$cmid = optional_param('cmid', null, PARAM_INT);

//$attemptobj = quiz_create_attempt_handling_errors($attemptid, $cmid);

$context = context_course::instance($courseid);
$rolesArr = array();
if ($roles = get_user_roles($context, $USER->id)) {
	foreach ($roles as $role) {
		//echo $role->roleid.'<br />';
		$rolesArr[] = $role->name;
	}
}
//var_dump($rolesArr);
$courseUrl = new moodle_url('/course/view.php', array('id' => $course->id));
if(in_array("Teacher*",$rolesArr) || in_array("Teacher",$rolesArr)){
} else {
     redirect($courseUrl);
}
$PAGE->set_context(context_course::instance($course->id));
$PAGE->set_url('/local/iproctoring/view/general-report.php');
$PAGE->force_settings_menu(true);
$PAGE->set_cacheable(true);
$PAGE->set_heading($course->fullname);
$PAGE->set_pagelayout('custom');
$PAGE->set_title('iProctoring Report');

$PAGE->navbar->ignore_active();
$PAGE->navbar->add($course->shortname, $courseUrl);
//$PAGE->navbar->add($attemptobj->get_quiz_name(), new moodle_url('/mod/quiz/attempt.php', array('cmid'=>$cmid, 'page'=>$page, 'attempt'=>$attemptid)));
$PAGE->navbar->add('iProctoring Report');
$sqlQuery = "SELECT ip.id, u.lastname, u.firstname, u.middlename, c.fullname, q.name, ip.file_size, ip.file_timestamp, ip.file_duration, ip.file_link, ip.note, ip.review
	FROM `mdl_local_iproctoring` as ip
	INNER JOIN mdl_user as u
	ON ip.user_id = u.id
	INNER JOIN mdl_course as c
	ON ip.course_id = c.id
	INNER JOIN mdl_quiz as q
	ON ip.quiz_id = q.id
        WHERE ip.course_id = ".$course->id; 
	//WHERE ip.user_id = ".$USER->id." AND ip.quiz_id = ".$attemptobj->get_quiz()->id;
$reportList = $DB->get_recordset_sql($sqlQuery, array(), 0, 0);

$ipTable .= "<button class='ipSearchFilter'>Search Filter</button>";
$ipTable .= "<table id='iProctoringTable' class='display'>";
$ipTable .= "<thead>";
//Removed Course //Will have two report page (This Report and Final Report)
$ipTable .= "<tr><th>Lastname</th><th>Firstname</th><th>Middlename</th><th>Course</th><th>Quiz</th><th>File Size</th>";
$ipTable .= "<th>Timestamp</th><th>Link</th><th>Note</th><th>Review</th><th>Action</th></tr>";
$ipTable .= "</thead>";
$ipTable .= "<tbody>";

foreach($reportList as $row){
    $ipTable .= "<tr>";
    $ipTable .= "<td>".$row->lastname."</td>";
    $ipTable .= "<td>".$row->firstname."</td>";
    $ipTable .= "<td>".$row->middlename."</td>";
    $ipTable .= "<td>".$row->fullname."</td>"; //Remove this in current report page since already in a course
    $ipTable .= "<td>".$row->name."</td>";
    $ipTable .= "<td>".convert_bytes($row->file_size, 'M', 3)."</td>";
    $ipTable .= "<td>".date('m/d/Y H:i:s',$row->file_timestamp)."</td>";
    //$ipTable .= "<td>".$row->file_duration."</td>";
    //$ipTable .= "<td>".getDuration($localLocation.$row->file_link)."</td>";
    $ipTable .= "<td><a href='".$remoteLocation.$row->file_link."' target='_blank'>".$row->file_link."</a></td>";
    $ipTable .= "<td>".$row->note."</td>";
    $ipTable .= "<td>".($row->review > 0 ? 'Done':'Pending')."</td>";
    $ipTable .= "<td><button class='ipView' data-viewid='".$row->id."' data-reviewstat='".$row->review."' data-note='".$row->note."' data-videolink='".$remoteLocation.$row->file_link."'>View</button><button class='ipDelete' data-deleteid='".$row->id."' >Delete</button></td>";
    $ipTable .= "</tr>";
}
$ipTable .= "</tbody>";
$ipTable .= "</table>";
//Review Modal
$ipModal .= "<div class='ipModal'>";
$ipModal .= "<div class='ipModalBody'>";
$ipModal .= "<span class='ipNoteAction'>";
$ipModal .= "<input type='hidden' class='ipId' id='ipId' value='' />";
$ipModal .= "<input type='checkbox' class='ipAddNote' id='ipAddNote' value='0' /></span>";
$ipModal .= "<span class='ipNoteAction'>&nbsp;&nbsp;Add Review</span>";
$ipModal .= "<span class='ipClose'>&times;</span>";
$ipModal .="
<video
    id='my-player'
    class='video-js'
    controls
    preload='auto'
    poster=''
    height='450'
    width='auto'
    controlsList='nodownload'
    data-setup='{}'>
  <source src='' type='video/mp4'></source>
  <p class='vjs-no-js'>
    To view this video please enable JavaScript, and consider upgrading to a
    web browser that
    <a href='https://videojs.com/html5-video-support/' target='_blank'>
      supports HTML5 video
    </a>
  </p>
</video>	
";
$ipModal .= "<textarea name='ipNote' id='ipNote' class='ipNote' rows='5' placeholder='Note here...' ></textarea>";
$ipModal .= "<input name='ipSubmitNote' class='ipSubmitNote' type='button' value='Save Review' />";
$ipModal .= "</div>";
$ipModal .= "</div>";

//SearchFilter Modal
$ipSearchModal .= "<div class='ipSearchModal'>";
$ipSearchModal .= "<div class='ipSearchModalBody'>";
$ipSearchModal .= "<span class='ipSearchLabel'>&nbsp;&nbsp;Search Filter:</span>";
$ipSearchModal .= "<span class='ipSearchClose'>&times;</span>";
$ipSearchModal .= "<div class='ipSearchInputs'></div>";
$ipSearchModal .= "</div>";
$ipSearchModal .= "</div>";

function convert_bytes($bytes, $to, $decimal_places) {
     $formulas = array(
          'K' => number_format($bytes / 1024, $decimal_places),
          'M' => number_format($bytes / 1048576, $decimal_places),
          'G' => number_format($bytes / 1073741824, $decimal_places)
     );
     return isset($formulas[$to]) ? $formulas[$to].$to : 0;
}
/* function getDuration($file){
      if (file_exists($file)){
     ## open and read video file
            $handle = fopen($file, "r");
	    //$duration = $handle;
  ## read video file size
            $contents = fread($handle, filesize($file));
            fclose($handle);
            $make_hexa = hexdec(bin2hex(substr($contents,strlen($contents)-3)));
            if(strlen($contents) > $make_hexa){
                 $pre_duration = hexdec(bin2hex(substr($contents,strlen($contents)-$make_hexa,3)));
                 $post_duration = $pre_duration/1000;
                 $timehours = $post_duration/3600;
                 $timeminutes =($post_duration % 3600)/60;
                 $timeseconds = ($post_duration % 3600) % 60;
                 $timehours = explode(".", $timehours);
                 $timeminutes = explode(".", $timeminutes);
                 $timeseconds = explode(".", $timeseconds);
	         $duration = $timehours[0]. ":" . $timeminutes[0]. ":" . $timeseconds[0];
            }
	    return $duration;
       } else {
          return false;
       }
}*/

echo $OUTPUT->header();
echo $ipModal;
echo $ipSearchModal;
echo $ipTable;
echo $OUTPUT->footer();
