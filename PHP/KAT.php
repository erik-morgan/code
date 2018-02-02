<?php
    include '/Helpers.php';
    class KAT
    {
        public function search($query)
        {
            $results = [];
            $page = 0;
            do
            {
                $url = 'https://katcr.co/new/search-torrents.php?sort=seeders&order=desc&search="' . urlencode($query) . '"&page=' . $page;
                libxml_use_internal_errors(true);
                $html = preg_replace('/>\s+</', '><', curl($url));
                $dom = DOMDocument::loadHTML($html);
                $nodelist = $dom->getElementsByClassName('cellMainLink');
                foreach ($nodelist as $node) {
                    $results[] = array(
                        'name' => $node->firstChild->lastChild->nodeValue,
                        'size' => $node->parentNode->nextSibling->nodeValue,
                        'seeds' => $node->parentNode->nextSibling->nextSibling->nextSibling->nodeValue,
                        'peers' => $node->parentNode->nextSibling->nextSibling->nextSibling->nextSibling->nodeValue,
                        'download-link' => $ref = 'https://katcr.co/'.$node->previousSibling->lastChild->getAttribute('href'),
                        'hash' => preg_replace('/^.+\.se\/([A-Za-z0-9]+)\/.+/', '$1', $ref)
                    );
                }
                $last = $dom->getElementById('nav')->firstChild->firstChild->lastChild->getAttribute('class');
                $page += 1;
            } while ($last == '');
            return $results;
        }
    }
