<?php
    include '/Helpers.php';
    class SkyTorrents
    {
        public function search($query)
        {
            $results = [];
            for ($page = 1; $page <= 10; $page++) {
                $url = "https://www.skytorrents.in/search/all/ed/${page}/?src=searchbar&q=".urlencode($query);
                libxml_use_internal_errors(true);
                $html = preg_replace('/>\s+</', '><', curl($url));
                $dom = DOMDocument::loadHTML($html);
                $nodelist = $dom->getElementsByTagName('tbody')->item(0)->getElementsByTagName('tr');
                if ($nodelist->length == 0) {
                    return $results;
                }
                foreach ($nodelist as $node) {
                    $results[] = array(
                        'name' => $node->firstChild->firstChild->nodeValue,
                        'size' => $node->firstChild->nextSibling->nodeValue,
                        'seeds' => $node->childNodes->item(4)->nodeValue,
                        'peers' => $node->childNodes->item(5)->nodeValue,
                        'link' => "https://www.skytorrents.in".$node->firstChild->firstChild->getAttribute('href'),
                        'magnet' => $ref = $node->firstChild->childNodes->item(3)->getAttribute('href'),
                        'hash' => preg_replace('/^.+btih:([A-Za-z0-9]+).*$/', '$1', $ref), 
                    );
                }
            }
            return $results;
        }
    }
