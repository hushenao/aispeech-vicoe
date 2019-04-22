import Vue from 'vue';

export const format = {
    w: {
        style: 'background-color: rgb(36, 244, 36);',
        value: 'w'
    },
    strong: {
        style: 'font-size: 16px; color: rgb(36, 244, 36); font-weight: 900; display: inline-block; height:20px; width: 10px; background-color: rgb(36, 244, 37);',
        value: 'break',
        type: 'strong'
    },
    medium: {
        style: 'font-size: 16px; color: rgb(36, 244, 36); font-weight: 900; display: inline-block; height:20px; width: 7px; background-color: rgb(36, 244, 37);',
        value: 'break',
        type: 'medium'
    },
    weak: {
        style: 'font-size: 16px; color: rgb(36, 244, 36); font-weight: 900; display: inline-block; height:20px; width: 5px; background-color: rgb(36, 244, 37);',
        value: 'break',
        type: 'weak'
    },
    phoneme: {
        style: 'background-color: rgb(36, 244, 37); border-radius: 50%;',
        value: 'phoneme'
    },
    'spell-out': {
        style: 'background-color: rgb(36, 244, 38);',
        value: 'sayas',
        type: 'spell-out'
    },
    acronym: {
        style: 'background-color: rgb(36, 244, 39);',
        value: 'sayas',
        type: 'acronym'
    },
    'number:digits': {
        style: 'background-color: rgb(36, 244, 35);',
        value: 'sayas',
        type: 'number:digits'
    },
    'number:ordinal': {
        style: 'background-color: rgb(36, 244, 34);',
        value: 'sayas',
        type: 'number:ordinal'
    },
    number: 'number',
    spellout: 'spell-out',
    ssmlNode: '.html-text', // 显示ssml文本的dom
    htmlNode: '.exec', // 能够编辑的dom
    excludeReg: /[0-9a-zA-Z|,.，。！“”""''‘’@%！、]/, // 排除数字字母和符号
    queryDom: function(dom) { // 获取DOM
        return document.querySelector(dom)
    },
    querySelection: function(type = false) { // 获取选中的文本
        if (type) {
            return document.getSelection()
        }
        return document.getSelection().toString()
    },
    execCommand: function(type = 'insertHTML', blen = false, text = '') { // 生成需要插入的html
        return document.execCommand(type, blen, text);
    },
    comm: function(text) { // 组装ssml
        return `<?xml version="1.0" encoding="utf8"?><speak xml:lang="cn">${text}</speak>`
    },
    setAttributeNode: function(node) { // 给添加标签的元素加上不可编辑属性
        const len = node.length
        if (!len) return false
        for (let i = 0; i < len; i++) {
            node[i].setAttribute('contenteditable', false)
        }
    }
}

export const status = {
    undo: () => 'undo',
    removeFormat: () => 'removeFormat',
    selectAll: () => 'selectAll',
    w: (selection, wIndex) => `<w onclick="ws(this, '${selection}', '${wIndex}')" style="${format.w.style}">${selection}</w>`, // 设置连读
    phoneme: (selection, py = 'hao', phonemeIndex) => `<phoneme onclick="phonemes(this, '${selection}', '${py}', '${phonemeIndex}')" py="${py}" style="${format.phoneme.style}">${selection}</phoneme>`, // 修改发音
    break: (strength, indexs) => `<break onclick="breaks(this, '${strength}', '${indexs}')" strength="${strength}" style="${format[strength].style}">|</break>`, // 添加停顿
    sayas: (selection, type, specialIndex) => {
        return `<sayas onclick="sayass(this,'${selection}', '${type}', '${specialIndex}')" type="${type}" style="${format[type].style}">${selection}</sayas>`
    }
}

/**
 * 设置停顿的取消交互方式
 */
window.breaks = function(event, strength) {
    let title = ''
    if (strength === 'strong') {
        title = '长'
    }
    if (strength === 'medium') {
        title = '中'
    }
    if (strength === 'weak') {
        title = '短'
    }
    Vue.prototype.$confirm(`确认删除${title}停顿`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        closeOnClickModal: false,
        showClose: false,
        modal: false,
    }).then(() => {
        const html = format.queryDom(format.htmlNode).innerHTML
            // const reg = `<break contenteditable="false" onclick="${event.getAttribute('onclick')}" strength="${strength}" style="${format[strength].style}" contenteditable="false">|</break>`
        format.queryDom(format.htmlNode).innerHTML = html.replace(event.outerHTML, '')

        const htmlTextNode = format.queryDom(format.ssmlNode)
        const ssmlHtml = htmlTextNode.innerHTML
        const regs = `&lt;break strength="${strength}"&gt;&lt;/break&gt;`
        htmlTextNode.innerHTML = ssmlHtml.replace(regs, '')
    }).catch(() => {
        return false
    })
}

/**
 * 设置读音取消的交互方式
 */
window.phonemes = function(event, text, py) {
    const selection = format.querySelection()
    if (!selection || selection.length > 1) return false
    Vue.prototype.$prompt(`修改“${text}(${py})”发音`, '提示', {
        confirmButtonText: '修改读音',
        cancelButtonText: '取消读音',
        inputValue: py,
        closeOnClickModal: false,
        showClose: false,
        inputPattern: /^[a-z]{1,}[1-5]{1}$/,
        inputErrorMessage: '请输入正确是拼音格式(如：ping2)',
        modal: false
    }).then(({ value = py }) => {
        event.setAttribute('py', value)
        event.setAttribute('onclick', `phonemes(this, '${text}', '${value}')`)
        if (value) {
            format.execCommand('insertHTML', false, text)
        }
    }).catch(() => {
        const html = format.queryDom(format.htmlNode).innerHTML
        format.queryDom(format.htmlNode).innerHTML = html.replace(event.outerHTML, text)
        const htmlTextNode = format.queryDom(format.ssmlNode)
        const ssmlHtml = htmlTextNode.innerHTML
        const regs = `&lt;phoneme py="${py}"&gt;${text}&lt;/phoneme&gt;`
        htmlTextNode.innerHTML = ssmlHtml.replace(regs, text)
        return false
    })
}

/**
 * 设置连续取消的交互方式
 */
window.ws = function(event, text) {
    Vue.prototype.$confirm(`确认清除“${text}”此处连续`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        closeOnClickModal: false,
        showClose: false,
        modal: false
    }).then(() => {
        const html = format.queryDom(format.htmlNode).innerHTML
            // const reg = `<w onclick="${event.getAttribute('onclick')}" style="${format.w.style}" contenteditable="false">${text}</w>`
        format.queryDom(format.htmlNode).innerHTML = html.replace(event.outerHTML, text)

        const ssmlHtml = format.queryDom(format.ssmlNode).innerHTML
        const regs = `&lt;w&gt;${text}&lt;/w&gt;`
        format.queryDom(format.ssmlNode).innerHTML = ssmlHtml.replace(regs, text)
    }).catch(() => {
        return false
    })
}

/**
 * 设置数字和字母的取消交互方式
 */
window.sayass = function(event, text, type) {
    let title = ''
    if (type === format['number:digits'].type || type === format['number:ordinal'].type) {
        title = `确认清除数字“${text}”的串读方式`
    }
    if (type === format['spell-out'].type || type === format['acronym'].type) {
        title = `确认清除字母“${text}”的串读方式`
    }
    Vue.prototype.$confirm(title, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        closeOnClickModal: false,
        showClose: false,
        modal: false
    }).then(() => {
        const html = format.queryDom(format.htmlNode).innerHTML
            // const reg = `<sayas onclick="${event.getAttribute('onclick')}" type="${type}" style="${format[type].style}" contenteditable="false">${text}</sayas>`
        format.queryDom(format.htmlNode).innerHTML = html.replace(event.outerHTML, text)

        const ssmlHtml = format.queryDom(format.ssmlNode).innerHTML
        const regs = `&lt;sayas type="${type}"&gt;${text}&lt;/sayas&gt;`
        format.queryDom(format.ssmlNode).innerHTML = ssmlHtml.replace(regs, text)
    }).catch(() => {
        return false
    })
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

/**
 * 生成的SSML文档进行匹配替换不需要的内容
 * @param {匹配替换} html
 */
export function replaceChat(html) {
    html = JSON.parse(JSON.stringify(html))
        .replace(/ data-(.*)=""/ig, '')
        .replace(/<span style="background-color: rgb(36, 244, 36);">(.*)<\/span>/ig, `<w>$1</w>`)
        .replace(/<span style="background-color: rgb(36, 244, 35);">(.*)<\/span>/ig, '<sayas type="number:digits">$1</sayas>')
        .replace(/<span style="background-color: rgb(36, 244, 34);">(.*)<\/span>/ig, '<sayas type="number:ordinal">$1</sayas>')
        .replace(/<span style="background-color: rgb(36, 244, 38);">(.*)<\/span>/ig, '<sayas type="spell-out">$1</sayas>')
        .replace(/<span style="background-color: rgb(36, 244, 39);">(.*)<\/span>/ig, '<sayas type="acronym">$1</sayas>')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/<span style="font-size: 16px; color: rgb(36, 244, 36); font-weight: 900; display: inline-block; height:20px; width: 10px; background-color: rgb(36, 244, 37);">\|<\/span>?/ig, '<break strength="strong"></break>')
        .replace(/<span style="font-size: 16px; color: rgb(36, 244, 36); font-weight: 900; display: inline-block; height:20px; width: 10px; background-color: rgb(36, 244, 37);">\|<\/span>?/ig, '<break strength="medium"></break>')
        .replace(/<span style="font-size: 16px; color: rgb(36, 244, 36); font-weight: 900; display: inline-block; height:20px; width: 10px; background-color: rgb(36, 244, 37);">\|<\/span>?/ig, '<break strength="weak"></break>')
        .replace(/\|/g, '')
        .replace(/&nbsp;/ig, '')
        .replace(/ style="[^=>]*"([(\s+\w+=)|>])/ig, '$1')
        .replace(/undefined/ig, '')
        .replace(/ style=""/ig, '')
        .replace(/ onclick="(.*?)"/ig, '')
        .replace(/(<.*?)class\s*=.*?(\w+\s*=|\s*>)/ig, '$1$2')
        .replace(/<break>/ig, '')
        .replace(/ contenteditable="false"/ig, '')
        .replace(/<span>(.*?)<\/span>/ig, '')

    return html
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
                customContextMenu.style.left = getViewPortWidth() - 350 + "px";
            } else {
                customContextMenu.style.left = ev.clientX + "px";
            }
            customContextMenu.style.top = ev.clientY + 12 + "px";
            customContextMenu.style.display = "block";
        }
        return false
    };
}

/**
 * 获取屏幕的宽度
 */
function getViewPortWidth() {
    return document.documentElement.clientWidth || document.body.clientWidth;
}

/**
 * 获取选中文本的位置
 * @param {*} dom
 */
export function getPositions(dom) {  
    var el = dom  
    var startPosition = 0; //所选文本的开始位置     
    var endPosition = 0; //所选文本的结束位置
    if (document.selection) {     //IE    
        var range = document.selection.createRange(); //创建范围对象     
        var drange = range.duplicate(); //克隆对象
        drange.moveToElementText(el); //复制范围 
        drange.setEndPoint('EndToEnd', range);    
        startPosition = drange.text.length - range.text.length;    
        endPosition = startPosition + range.text.length;  
    }  
    else if (window.getSelection) {     //Firefox,Chrome,Safari etc
        console.log(el.innerHTML, window.getSelection())
        startPosition = window.getSelection().anchorOffset;    
        endPosition = window.getSelection().focusOffset;  
    }  
    return {    
        start: startPosition,
        end: endPosition  
    }
}

/**
 * 获取选中文本的内容
 */
export function querySelectHtml() {
    let selectionObj = null,
        rangeObj = null;
    selectionObj = document.getSelection();
    rangeObj = selectionObj.getRangeAt(0);
    let docFragment = rangeObj.cloneContents();
    let tempDiv = document.createElement("div");
    tempDiv.appendChild(docFragment);
    return tempDiv.innerHTML;
}