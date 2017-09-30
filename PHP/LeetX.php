<?php
    include '/Helpers.php';
    class LeetX
    {
        static public function search($query)
        {
            $results = [];
            $page = 1;
            do
            {
                $url = "https://1337x.to/search/".urlencode($query)."/$page/";
                libxml_use_internal_errors(true);
                $html = preg_replace('/>\s+</', '><', curl($url));
                $dom = DOMDocument::loadHTML($html);
                $nodelist = $dom->getElementsByTagName('tbody')->item(0)->getElementsByTagName('tr');
                foreach ($nodelist as $node) {
                    $results[] = array(
                        'name' => $node->firstChild->childNodes->item(1)->nodeValue,
                        'size' => $node->childNodes->item(4)->firstChild->nodeValue,
                        'seeds' => $node->childNodes->item(1)->nodeValue,
                        'peers' => $node->childNodes->item(2)->nodeValue,
                        'link' => "https://1337x.to".$node->firstChild->childNodes->item(1)->getAttribute('href')
                    );
                }
                $last = DOMXPath($dom)->query('//li[contains(@class, "last")]')->length;
                $page += 1;
            } while ($last > 0);
            return $results;
        }
    }
