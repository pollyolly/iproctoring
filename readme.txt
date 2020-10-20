This plugin manually records the video of a user while doing Quizzes.

=== Sample Course Query ===
https://moodle.org/mod/forum/discuss.php?d=201539

=== Instruction ===
You may need to create the upload folder in the app folder. i.e uvle/iproctoring_upload

=== How to use ? ===
In the uvle/mod/quiz/attempt.php paste the code below in line 122.

$renderer = $PAGE->get_renderer('local_iproctoring');
$renderer->add_iproctoring_js_modules();
$renderer->add_iproctoring_css_modules();
$iproctoring_block = $renderer->add_iproctoring_block($attemptid, $page, $cmid);
$PAGE->blocks->add_fake_block($iproctoring_block, reset($regions));
