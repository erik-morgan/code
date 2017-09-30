<?php
    include '/Helpers.php';
    class LimeTorrents
    {
        public function search($query)
        {
            $results = [];
            $page = 1;
            do
            {
                $url = "https://www.limetorrents.cc/search/all/".urlencode($query)."/seeds/$page/";
                libxml_use_internal_errors(true);
                $html = preg_replace('/>\s+</', '><', curl($url));
                $dom = DOMDocument::loadHTML($html);
                $nodelist = DOMXPath($dom)->query('//td[contains(@class, "tdleft")]');
                foreach ($nodelist as $node) {
                    $results[] = array(
                        'name' => $node->firstChild->lastChild->nodeValue,
                        'size' => $node->nextSibling->nextSibling->nodeValue,
                        'seeds' => $node->nextSibling->nextSibling->nextSibling->nodeValue,
                        'peers' => $node->nextSibling->nextSibling->nextSibling->nextSibling->nodeValue,
                        'link' => "https://www.limetorrents.cc".$node->firstChild->lastChild->getAttribute('href'),
                        'torrent' => $node->firstChild->firstChild->getAttribute('href')
                    );
                }
                $next = $dom.getElementById('next');
                $page += 1;
            } while (isset($next));
            return $results;
        }
    }
