/**
 * 获取xml文件数据
 * @param {文件路径} xmlFile 
 */
export function loadXML(xmlFile) {
    var xmlDoc = null;
    var agent = navigator.userAgent.toLowerCase();

    //判断浏览器的类型
    //支持IE浏览器
    if (agent.indexOf("msie") > 0) {
        var xmlDomVersions = ['MSXML.2.DOMDocument.6.0', 'MSXML.2.DOMDocument.3.0', 'Microsoft.XMLDOM'];
        for (var i = 0; i < xmlDomVersions.length; i++) {
            try {
                xmlDoc = new ActiveXObject(xmlDomVersions[i]);
                break;
            } catch (e) {}
        }
    }
    //支持firefox浏览器
    else if (agent.indexOf("firefox") > 0) {
        try {
            xmlDoc = document.implementation.createDocument('', '', null);
        } catch (e) {}
    } else { //谷歌浏览器
        var oXmlHttp = new XMLHttpRequest();
        oXmlHttp.open("GET", xmlFile, false);
        oXmlHttp.send(null);
        if (oXmlHttp.readyState == 4) {
            return oXmlHttp.responseXML;
        }
    }
    if (xmlDoc != null) {
        xmlDoc.async = false;
        xmlDoc.load(xmlFile);
    }
    return xmlDoc;
}

/**
 * xml 转 obj
 * @param {xmlDom} xml 
 */
export function XmlToObject(xml, node) {
    let XMLDOM = []
        // 为XML对象时
    if (node) {
        Array.from(xml.getElementsByTagName(node)).forEach(item => {
            let obj = {}
            item.children.length > 0 && Array.from(item.children).forEach(it => {
                obj[it.tagName] = it.textContent.trim()
            })
            XMLDOM.push(obj)
        })
    } else {
        // 为纯字符串时
        if (typeof xml === 'string') {
            XMLDOM = xml.split('')
            if (XMLDOM.length > 0) {
                XMLDOM = XMLDOM.map((item, index) => {
                    return {
                        [item]: item
                    }
                })
            }
        }
    }
    return XMLDOM
}

/**
 * 生成对应的 xml格式
 * @param {需要的标签} lable 
 * @param {值} value 
 * @param {插入的属性} attrs 
 */
function appendForm(lable, value, attrs = []) {
    let xml = ''
    let attr = ''
    if (attrs.length > 0) {
        attr = attrs.join(' ')
        xml = `<${lable} ${attr}>${value}</${lable}>`
    } else {
        xml = `<${lable}>${value}</${lable}>`
    }
    return xml
}

// 获取文本框中选中的值
export function getSelectText(editor) {
    if (!editor) return;
    editor.focus();
    if (editor.document && editor.document.selection)
        return editor.document.selection.createRange().text;
    else if ("selectionStart" in editor)
        return editor.value.substring(editor.selectionStart, editor.selectionEnd);
}