<?php
  /*
    name|size|seeds|peer/leech|link|magnet|hash
    TRIM NAMES AND REMOVE NEWLINES!
    // $xhash = true if the hash is in $xlink
  */
  function curl($url) {
    $ch = curl_init();
    curl_setopt_array(
      $ch,
      array( 
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HEADER => false
      )
    );
    $data = curl_exec($ch);
    curl_close($ch);
    return $data;
  }
  
  function bytesize($bytes) {
    $unit = array('B','kB','MB','GB');
    $factor = floor(log($bytes, 1024));
    return round($bytes / pow(1024, $factor), 2).' '.$unit[$factor];
  }
