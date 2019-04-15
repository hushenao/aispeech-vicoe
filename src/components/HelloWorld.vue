<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <textarea @contextmenu.prevent='mousedown' id='test' @select='toSelect'></textarea>
    <div>
      <el-button @click="selectStatus('stop')">添加停顿</el-button>
      <el-button>修改发音</el-button>
      <el-button>设置连续</el-button>
      <el-button>设置数字串读方式</el-button>
      <el-button>设置字母串读方式</el-button>
    </div>
    <div style='border: 1px solid red;'>
      <quill-editor
        id='edit'
        class='quills'
        style='height: 120px;'
        v-model="content"
        ref="myQuillEditor"
        :options="editorOption"
        @blur="onEditorBlur($event)"
        @focus="onEditorFocus($event)"
        @change="onEditorChange($event)"
        @contextmenu.prevent='mousedown'>
      </quill-editor>
    </div>
  </div>
</template>

<script>
import Utils from '../utils';
import { quillEditor } from 'vue-quill-editor'
export default {
  name: 'HelloWorld',
  data () {
    return {
      msg: 'TTS',
      status: '',
      content: null,
      editorOption: {
        modules:{
          toolbar:[
            [
              // { 'color': [] }, 
              // { 'background': [] }, 
              'clean'
            ],
            []
          ]
        },
        placeholder: '请输入...',
        theme: 'bubble' // snow bubble
      }
    }
  },
 mounted() {
    let listNode = []
    let datas = Utils.loadXML('/static/test.xml')
    // console.log(datas.getElementsByTagName('node'))
    listNode = Utils.XmlToObject(datas, 'node')
    // console.log(listNode)
    // console.log(Utils.XmlToObject('ABCDEFG,,,'))
    this.createSsml()
    let data = Utils.loadXML('/static/data.xml')
    // console.log(data.getElementsByTagName('CurrentStatus'))
    // console.log(Utils.XmlToObject(data, 'CurrentStatus'))
  },
  methods: {
    toSelect () {
      // console.log(Utils.getSelectText(document.getElementById("test")))
      // console.log(document.getElementById("test")) // .setSelectionRange()
      // console.log(getSelection())
      // console.log(Utils.getCaretPosition(document.getElementById("test")))
      // console.log(Utils.getSelectText(document.getElementById("edit")))
      // console.log(document.getElementById("edit")) // .setSelectionRange()
      // console.log(Utils.getCaretPosition(document.getElementById("edit")))
    },
    // 鼠标右击事件
    mousedown () {
      console.log(123)
    },
    createSsml () {

    },
    selectStatus (status) {
      this.status = status
    },
    // 失去焦点事件
    onEditorBlur (event){
      console.log('失去焦点事件', this.content)
    },
    // 获得焦点事件
    onEditorFocus(event){
      if (!this.content) return false
      console.log('获得焦点事件', this.content)
      console.log(event.selection.lastRange)
      let {index, length} = event.selection.lastRange
      let currte = event.selection.root.innerText.substr(index, length)
      console.log(currte)
    },
    // 内容改变事件
    onEditorChange(event){
      console.log('内容改变事件', this.content)
      console.log(event)
      let content = event.quill.root.textContent.split('')
      console.log(content)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
// 文字选中的颜色
 .quills::selection {
    background-color: red;
    color: white;
}
.quills::-moz-selection {
    background-color: red;
    color: white;
}
.quills::-webkit-selection {
    background-color: red;
    color: white;
}
</style>
