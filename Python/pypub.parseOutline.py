def parseOutline(xdoc):
    # xdoc = xdoc.replace('<w:br/>', '<w:t>\t</w:t>')
    doc = etree.fromstring(xdoc.replace('<w:tab/>', '<w:t>\t</w:t>'))
    nstag = lambda tag: '{' + xns.w + '}' + tag
    sections = doc.xpath('//w:p[not(.//w:strike) and .//w:u and .//w:b and position() > 2]', namespaces=xns)
    drawTest = re.compile('\d{5}', re.I)
    procTest = re.compile('[A-Z]{2,6}\d{4}')
    resplit = re.compile('\t+')
    project = {'data': []}
    app = project['data'].append
    join = ''.join
    for section in sections:
        sectInfo = {'phase': '', 'title': '', 'docs': []}
        if section.getnext().lastChild.lastChild.name !== nstag('t')
            sectTitle = join(t[-1].text for t in section.iter('{*}t'))
            sectTitle = re.sub('(?i)^([^\t\r]+) ?[\s\S]*', '$1', sectTitle).strip()
            if sectTitle.beginswith('STACK-UP') or 'TEST OPTION' in sectTitle:
                sectInfo['title'] = sectTitle if 'BOP' in sectTitle else 'STACK-UP DRAWINGS'
                section = section.getnext()
            else:
                activePhase = sectTitle
                continue
        sectInfo['phase'] = activePhase
        for p in section.itersiblings('{*}p'):
            paraText = join(t[-1].text for t in p.iter('{*}t'))
            if not paraText:
                break
            para = re.split(resplit, paraText.split('\r')[0])
            if drawTest.search(para[0]):
                sectInfo['docs'].append({'type': 'DRAW', 'id': para[0], 'description': para[1]})
            elif re.match(procTest, para[0]):
                # standardize RP naming convention (regarding CC0104-MT vs CC0104-QTM-CR vs CC0104-01MT)
                sectInfo['docs'].append({'type': 'RP', 'id': para[0].replace('/', '-')})
            elif para[0].beginswith('Rev'):
                proc = sectInfo['docs'][0]
                proc['rev'] = int(para[0].split()[1])
            elif 'ADVISORY' in paraText:
                proc = sectInfo['docs'][0]
                proc['advisory'] = True
            elif 'BTC' in paraText:
                btc = paraText.split()
                sectInfo['docs'].append({'type': 'BTC', 'id': join(btc[0:2]), 'rev': int(btc[3])})
        app(sectInfo)
    return project
