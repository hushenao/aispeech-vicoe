const updateType = ['break', 'phoneme', 'w', 'number:digits', 'number:ordinal', 'spell-out', 'sayas']
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
            // xmlDoc = document.implementation.createDocument('', '', null);
            let oXmlHttp = new XMLHttpRequest();
            oXmlHttp.open("GET", xmlFile, false);
            oXmlHttp.send(null);
            if (oXmlHttp.readyState == 4) {
                return oXmlHttp.responseXML;
            }
        } catch (e) {}
    } else { //谷歌浏览器
        let oXmlHttp = new XMLHttpRequest();
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
    const itemType = ['w', 'break', 'phoneme', 'sayas']
        // 为XML对象时
    if (node) {
        Array.from(xml.getElementsByTagName(node)[0].children).forEach(item => {
            let obj = {}
            let attributes = {}
            obj.node = item.nodeName

            // 在标签下的属性
            item.children.length > 0 && Array.from(item.children).forEach(it => {
                obj[it.tagName] = it.textContent.trim()
            });

            // 在标签上的属性
            item.attributes.length > 0 && Array.from(item.attributes).forEach(it => {
                attributes[it.name] = it.value.trim()
            });
            if (itemType.includes(obj.node)) {
                attributes.style = setStyle(obj.node, attributes['type'])
            }
            if (Object.keys(attributes).length > 0) obj.attributes = attributes
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
export function appendForm(lable, value, attrs = {}) {
    let xml = ''
    let attr = ''
    if (Object.keys(attrs).length > 0) {
        for (let key in attrs) {
            attr += `${key}="${attrs[key]}" `
        }
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


/**
 * 把html解析成XML
 * @param html
 * @returns {string}
 * @constructor
 */
export function HtmlToXml(html, type) {
    let xml = ''
    xml = (new DOMParser()).parseFromString(html, type) // type/xml type/html
    return xml
}

/**
 * 判断是否为NAN
 * @param {检验的值} value
 */
export function judgeNaN(value) {
    return (typeof value) === 'number' && window.isNaN(value);
}

/**
 * 判断是否是字母
 * @param {校验的值} value
 */
export function IsEN(value) {
    const re = /^[a-zA-Z]+$/
    return re.test(value)
}

// 将DOM转换为JSON
export function toGetJson(el) {
    let a = []

    function getJSON(el, arr) {
        Array.from(el.children).forEach(function(item) {
            // console.log(item)
            let attributes = {}
            if (Array.from(item.attributes).length > 0) {
                Array.from(item.attributes).forEach(it => {
                    attributes[it.name] = it.value.trim()
                })
            }
            // 存储每一个节点
            let obj = {
                tagName: item.tagName,
                attributes: attributes,
                html: item.innerHTML
            }
            arr.push(obj);
            arr[arr.length - 1][item.tagName] = [];
            if (Array.from(item.children).length > 0) {
                getJSON(item, arr[arr.length - 1][item.tagName]);
            }
        });
        return arr
    };
    return getJSON(el, a);
}

// 将JSON转换成DOM树
export function JsonToDom(json) {
    let html = ''
    if (Object.prototype.toString.call(json) !== '[object Array]') return false;
    console.log('输出的原始数据：', json)

    function ergodic(list) {
        list.forEach(item => {
            // console.log(item)
            if (item[item.tagName].length > 0) {
                ergodic(item[item.tagName])
            }
        })
    }
    ergodic(json)
    return html
}

// 选中文本的html
export function selectHtml() {
    let selectionObj = null,
        rangeObj = null,
        selectedText = "",
        selectedHtml = "";　
    selectionObj = document.getSelection();
    selectedText = selectionObj.toString();
    rangeObj = selectionObj.getRangeAt(0);
    let docFragment = rangeObj.cloneContents();
    let tempDiv = document.createElement("div");
    tempDiv.appendChild(docFragment);
    selectedHtml = tempDiv.innerHTML;
    return HtmlToXml(selectedHtml, 'text/html').body
}

// 设置样式
function setStyle(type, status = '') {
    if (type === 'w') return 'background-color: steelblue;'
    if (type === 'break') return 'color: red; font-weight: 900;'
    if (type === 'phoneme') return 'background-color: gold;'
    if (type === 'sayas' && status == 'spell-out') return 'background-color: red;'
    if (type === 'sayas' && status == 'number:digits') return 'background-color: green;'
    if (type === 'sayas' && status == 'number:ordinal') return 'background-color: pink;'
    return ''
}

export function replaceChat(html) {
    html = JSON.parse(JSON.stringify(html))
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/<span style="color: red; font-weight: 900;">\|<\/span>?/ig, '<break></break>')
        .replace(/\|/g, '')
        .replace(/&nbsp;/ig, '')
        .replace(/style="background-color: gold;"/ig, '')
        .replace(/style="background-color: steelblue;"/ig, '')
        .replace(/style="background-color: pink;"/ig, '')
        .replace(/style="background-color: green;"/ig, '')
        .replace(/style="background-color: red;"/ig, '')
        .replace(/style="color: red; font-weight: 900;"/ig, '')
        .replace(/undefined/ig, '')
        .replace(/style=""/ig, '')
    return html
}