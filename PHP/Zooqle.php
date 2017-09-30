<?php
    include '/Helpers.php';
    class Zooqle
    {
        public function search($query)
        {
            $results = [];
            $page = 0;
            do
            {
                $page += 1;
                $url = "https://zooqle.com/search?pg=${page}&q=".urlencode($query)."&fmt=rss";
                libxml_use_internal_errors(true);
                $xml = preg_replace('/>\s+</', '><', curl($url));
                $dom = DOMDocument::loadHTML($xml);
                $nodelist = $dom.getElementsByTagName('item');
                foreach ($nodelist as $node) {
                    $results[] = array(
                        'name' => $node->firstChild->nodeValue,
                        'size' => bytesize($node->childNodes->item(6)->nodeValue),
                        'seeds' => $node->childNodes->item(9)->nodeValue,
                        'peers' => $node->childNodes->item(10)->nodeValue,
                        'link' => $node->childNodes->item(2)->nodeValue,
                        'magnet' => preg_replace('/.+(magnet[^\]]+).+/', '$1', $node->childNodes->item(8)->nodeValue),
                        'hash' => $node->childNodes->item(7)->nodeValue,
                        'torrent' => $node->childNodes->item(5)->getAttribute('url')
                    );
                }
                $total = $dom.getElementsByTagName('opensearch:totalResults')->item(0)->nodeValue;
            } while (($page * 30) < $total);
            return $results;
        }
    }
