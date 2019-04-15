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

// 添加得节点类型
export const Ctype = ['W', 'PHONEME', 'BREAK', 'SAYAS']

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