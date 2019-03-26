<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <input @contextmenu.prevent='mousedown'  type='text' id='test' @select='toSelect'/>
  </div>
</template>

<script>
import Utils from '../utils';
export default {
  name: 'HelloWorld',
  data () {
    return {
      msg: 'Welcome'
    }
  },
 mounted() {
    let listNode = []
    let datas = Utils.loadXML('/static/test.xml')
    console.log(Utils.XmlToObject(datas, 'node'))
    console.log(Utils.XmlToObject('ABCDEFG,,,'))
  },
  methods: {
    toSelect () {
      console.log(Utils.getSelectText(document.getElementById("test")))
    },
    // 鼠标右击事件
    mousedown () {
      console.log(123)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
// 文字选中的颜色
 input::selection {
    background-color: red;
    color: white;
}
input::-moz-selection {
    background-color: red;
    color: white;
}
input::-webkit-selection {
    background-color: red;
    color: white;
}
</style>
