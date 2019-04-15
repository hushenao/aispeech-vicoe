// 样式配置文档
export const format = {
    w: {
        style: 'background-color: #24f424;',
        value: 'w'
    },
    strong: {
        style: 'font-size: 20px; color: #24f424; font-weight: 900;',
        value: 'break',
        type: 'strong'
    },
    medium: {
        style: 'font-size: 18px; color: #24f424; font-weight: 900;',
        value: 'break',
        type: 'medium'
    },
    weak: {
        style: 'font-size: 16px; color: #24f424; font-weight: 900;',
        value: 'break',
        type: 'weak'
    },
    phoneme: {
        style: 'background-color: #24f425;',
        value: 'phoneme'
    },
    'spell-out': {
        style: 'background-color: #24f426;',
        value: 'sayas',
        type: 'spell-out'
    },
    acronym: {
        style: 'background-color: #24f427;',
        value: 'sayas',
        type: 'acronym'
    },
    'number:digits': {
        style: 'background-color: #24f423;',
        value: 'sayas',
        type: 'number:digits'
    },
    'number:ordinal': {
        style: 'background-color: #24f422;',
        value: 'sayas',
        type: 'number:ordinal'
    }
}

// 编辑状态的html
let index = 0
export const status = {
    undo: () => 'undo',
    removeFormat: () => 'removeFormat',
    selectAll: () => 'selectAll',
    w: (selection) => `<w style="${format.w.style}">${selection}</w>`, // 设置连读
    phoneme: (selection, py = 'hao') => `<phoneme py="${py}" style="${format.phoneme.style}">${selection}</phoneme>`, // 修改发音
    break: (strength) => `<break strength="${strength}" style="${format[strength].style}">|</break>`, // 添加停顿
    sayas: (selection, type) => {
            return `<sayas type="${type}" style="${format[type].style}">${selection}</sayas>`
        } //  spell-out（字母逐个读出）， number:digits（数字逐个读出），number:ordinal（数字按照数值发音）
}
export const Ctype = ['W', 'PHONEME', 'BREAK', 'SAYAS'] // 添加得节点类型

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


/**
 * 把html-XML 互相转换
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
    if (type === format['w'].value) return format['w'].style
    if (type === format['strong'].value) return format['strong'].style
    if (type === format['medium'].value) return format['medium'].style
    if (type === format['weak'].value) return format['weak'].style
    if (type === format['phoneme'].value) return format['phoneme'].style
    if (type === format['spell-out'].value && status == format['spell-out'].type) return format['spell-out'].style
    if (type === format['acronym'].value && status == format['acronym'].type) return format['acronym'].style
    if (type === format['number:digits'].value && status == format['number:digits'].type) return format['number:digits'].style
    if (type === format['number:ordinal'].value && status == format['number:ordinal'].type) return format['number:ordinal'].style
    return ''
}

/**
 * 生成的SSML文档进行匹配替换不需要的内容
 * @param {匹配替换} html
 */
export function replaceChat(html) {
    html = JSON.parse(JSON.stringify(html))
        .replace(/ data-(.*)=""/ig, '')
        .replace(/<span style="background-color: #24f424;">(.*)<\/span>/ig, `<w>$1</w>`)
        .replace(/<span style="background-color: #24f423;">(.*)<\/span>/ig, '<sayas type="number:digits">$1</sayas>')
        .replace(/<span style="background-color: #24f422;">(.*)<\/span>/ig, '<sayas type="number:ordinal">$1</sayas>')
        .replace(/<span style="background-color: #24f426;">(.*)<\/span>/ig, '<sayas type="spell-out">$1</sayas>')
        .replace(/<span style="background-color: #24f427;">(.*)<\/span>/ig, '<sayas type="acronym">$1</sayas>')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/<span style="font-size: 20px; color: #24f424; font-weight: 900;">\|<\/span>?/ig, '<break strength="strong"></break>')
        .replace(/<span style="font-size: 18px; color: #24f424; font-weight: 900;">\|<\/span>?/ig, '<break strength="medium"></break>')
        .replace(/<span style="font-size: 16px; color: #24f424; font-weight: 900;">\|<\/span>?/ig, '<break strength="weak"></break>')
        .replace(/\|/g, '')
        .replace(/&nbsp;/ig, '')
        .replace(/ style="[^=>]*"([(\s+\w+=)|>])/ig, '$1')
        .replace(/undefined/ig, '')
        .replace(/ style=""/ig, '')
        .replace(/(<.*?)class\s*=.*?(\w+\s*=|\s*>)/ig, '$1$2')
        .replace(/<break>/ig, '')
    return `<?xml version="1.0" encoding="utf8"?><speak xml:lang="cn">${html}</speak>`
}

/**
 * 清除有格式的文档
 * @param {传入的文档} html
 */
export function formatClear(html) {
    html = html.replace(/<[img][^>]+>/g, '')
        .replace(/<[^>]+>/g, '')
        .replace(/<o:p><\/o:p>/ig, '')
        .replace(/(^\s+)|(\s+$)/g, '')
        .replace(/\s/, '')
        .replace(/&lt;(.*?)&gt;/ig, '')
    return html
}

/**
 * 反向解析SSML成带有样式的HTML
 * @param {ssml信息} ssml
 */
export function HtmlToSsml(ssml) {
    let html = ssml.replace(/<phoneme py="(.*?)">(.*?)<\/phoneme>/ig, status.phoneme('$2', '$1'))
        .replace(/<w>(.*?)<\/w>/ig, status.w('$1'))
        .replace(/<break strength="strong"><\/break>/ig, `<break strength="strong" style="${format['strong'].style}">|</break>`)
        .replace(/<break strength="medium"><\/break>/ig, `<break strength="medium" style="${format['medium'].style}">|</break>`)
        .replace(/<break strength="weak"><\/break>/ig, `<break strength="weak" style="${format['weak'].style}">|</break>`)
        .replace(/<sayas type="spell-out">(.*?)<\/sayas>/ig, `<sayas type="spell-out" style="${format['spell-out'].style}">$1</sayas>`)
        .replace(/<sayas type="acronym">(.*?)<\/sayas>/ig, `<sayas type="acronym" style="${format['acronym'].style}">$1</sayas>`)
        .replace(/<sayas type="number:digits">(.*?)<\/sayas>/ig, `<sayas type="number:digits" style="${format['number:digits'].style}">$1</sayas>`)
        .replace(/<sayas type="number:ordinal">(.*?)<\/sayas>/ig, `<sayas type="number:ordinal" style="${format['number:ordinal'].style}">$1</sayas>`)

    console.log(html)
    return html
}

/**
 * 自定义鼠标右击事件
 * @param {自定义菜单元素} customContextMenu
 * @param {能够展示的自定义区域} activeNode
 */
export function customContext(customContextMenu, activeNode) {
    //自定鼠标右键
    document.oncontextmenu = function(ev) {
        ev = ev || window.ev;
        ev.preventDefault();

        let html = activeNode
        customContextMenu.style.display = "none";
        // 指定区域显示自定义鼠标自定义菜单
        if (ev.pageX > html.offsetLeft &&
            ev.pageX < (html.offsetLeft + html.clientWidth) &&
            ev.pageY > html.offsetTop &&
            ev.pageY < (html.offsetTop + html.clientHeight)) {
            if (ev.pageX + 300 > getViewPortWidth()) {
                customContextMenu.style.left = getViewPortWidth() - 300 + "px";
            } else {
                customContextMenu.style.left = ev.clientX + "px";
            }
            customContextMenu.style.top = ev.clientY + 12 + "px";
            customContextMenu.style.display = "block";
        }
        return false
    };
    //鼠标单击
    // document.onclick = function(ev) {
    //     customContextMenu.style.display = "none";
    // };
}

/**
 * 获取屏幕的宽度
 */
function getViewPortWidth() {
    return document.documentElement.clientWidth || document.body.clientWidth;
}