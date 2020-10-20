<?php
defined('MOODLE_INTERNAL') || die();

$capabilities = array(
     'local/adminer:useadminer' => array(
          'riskbitmask'  => RISK_MANAGETRUST | RISK_CONFIG | RISK_XSS | RISK_PERSONAL | RISK_SPAM | RISK_DATALOSS,
          'captype'      => 'write',
          'contextlevel' => CONTEXT_SYSTEM
     ),
);

