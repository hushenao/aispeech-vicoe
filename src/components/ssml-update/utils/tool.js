// 将DOM转换为JSON
export function toGetJson(el) {
    console.log(el)
    let a = []
    a.push(el)

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
                html: item.innerHTML,
                childNodes: item.childNodes
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