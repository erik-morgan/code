<?php
    include '/Helpers.php';
    class RARBG
    {
        public function search($query)
        {
            $results = [];
            $page = 1;
            do
            {
                $url = "https://rarbg.to/torrents.php?search=".urlencode($query)."&page=${page}&order=seeders&by=DESC";
                libxml_use_internal_errors(true);
                $html = preg_replace('/>\s+</', '><', curl($url));
                $dom = DOMDocument::loadHTML($html);
                $nodelist = DOMXPath($dom)->query('//tr[contains(@class, "lista2")]/td[2]');
                foreach ($nodelist as $node) {
                    $results[] = array(
                        'name' => $ref1 = $node->firstChild->getAttribute('title'),
                        'size' => $node->nextSibling->nextSibling->nodeValue,
                        'seeds' => $node->nextSibling->nextSibling->nextSibling->firstChild->nodeValue,
                        'peers' => $node->nextSibling->nextSibling->nextSibling->nextSibling->nodeValue,
                        'link' => $ref2 = "https://rarbg.to".$node->firstChild->getAttribute('href'),
                        'torrent' => str_replace('/torrent/', '/download.php?id=', $ref2)."&f=".rawurlencode($ref1)."-[rarbg.to].torrent"
                    );
                }
                $next = $dom.getElementById('pager_links')->lastChild->getAttribute('title');
                $page += 1;
            } while (isset($next));
            return $results;
        }
    }
