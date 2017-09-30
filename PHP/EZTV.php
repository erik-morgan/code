<?php
    include '/Helpers.php';
    class EZTV
    {
        static public function search($query)
        {
            $results = [];
            $url = "https://eztv.ag/search/".urlencode($query);
            libxml_use_internal_errors(true);
            $html = preg_replace('/>\s+</', '><', curl($url));
            $dom = DOMDocument::loadHTML($html);
            $nodelist = DOMXPath($dom)->query('//tr[contains(@name, "hover")]');
            foreach ($nodelist as $node) {
                $results[] = array(
                    'name' => $node->childNodes->item(1)->firstChild->nodeValue,
                    'size' => $node->childNodes->item(3)->nodeValue,
                    'seeds' => $node->childNodes->item(5)->firstChild->nodeValue,
                    'peers' => "-",
                    'link' => "https://eztv.ag/".$node->childNodes->item(1)->firstChild->getAttribute('href'),
                    'magnet' => $ref = $node->childNodes->item(2)->firstChild->getAttribute('href'),
                    'hash' => preg_replace('/^.+btih:([A-Za-z0-9]+).*/', '$1', $ref)
                );
            }
            return $results;
        }
    }
