<template>
  <div>
    <div class="btn-list">
      <el-button @click="exchange('break')">添加停顿</el-button>
      <el-button @click="exchange('phoneme')">修改发音</el-button>
      <el-button @click="exchange('w')">设置连续</el-button>
      <el-button @click="exchange('number')">设置数字串读方式</el-button>
      <el-button @click="exchange('spell-out')">设置字母串读方式</el-button>
      <el-button @click="undo">撤销上一步</el-button>
      <el-button @click="removeFormat">清除样式</el-button>
      <el-button @click="del">删除内容</el-button>
    </div>
    <!--语音数据源 -->
    <div style="text-align:left;">语音数据源：</div>
    <div class="exec" contentEditable="true" @contextmenu.prevent='mousedown($event)'>
      {{text}}
    </div>
    <!-- 生成的SSML文档 -->
    <div style="text-align:left;">生成的SSML文档：</div>
    <div class="html-text">{{htmlText}}</div>
    <!-- 生成的SSML解析成HTML文档 -->
    <div style="text-align:left;">生成的SSML解析成HTML文档：</div>
    <div class="html-text" v-html="ssmltohtml"></div>
    <div class="to-right-click" id="customContextMenu" v-show="active">

      <div class="breaks option" v-if="active === 'break'">
        <h4>添加停顿</h4>
        <p>请选择停顿的长短</p>
        <el-radio-group v-model="activeBreak">
          <el-radio class="radios" label="strong">长停顿</el-radio>
          <el-radio class="radios" label="medium">中停顿</el-radio>
          <el-radio class="radios" label="weak">短停顿</el-radio>
        </el-radio-group>
        <div>
          <el-button @click="hiedDiv">取消</el-button>
          <el-button @click="breaks(activeBreak)">保存</el-button>
        </div>
      </div>

      <div class="phoneme option" v-if="active === 'phoneme'">
        <h4>修改发音</h4>
        <div class="edit-list">
          <div class="edit-title">
            <span>文字</span>
            <span>拼音</span>
            <span>声调</span>
          </div>
          <div class="edit-item" v-for="(item, index) in activePhoneme" :key="index">
            <div>{{item.value}}</div>
            <div>
              <el-radio-group v-model="item.pinvalue" @change='update(item)'>
                <el-radio v-for="(its, i) in item.pin" :label="its" :key="its + i">{{its}}</el-radio>
              </el-radio-group>
              <!-- <el-select style="width: 100px;" v-model="item.pinvalue" placeholder="请选择">
                <el-option
                  v-for="(its, i) in item.pin"
                  :key="its + i"
                  :label="its"
                  :value="its">
                </el-option>
              </el-select> -->
            </div>
            <div>
              <el-radio-group v-model="item.tonevalue" @change='update(item)'>
                <el-radio v-for="(its, i) in item.tone" :label="its" :key="its + i + Math.random()">{{its}}</el-radio>
              </el-radio-group>
              <!-- <el-select style="width: 80px;" v-model="item.tonevalue" placeholder="请选择">
                <el-option
                  v-for="(its, i) in item.tone"
                  :key="its + i + Math.random()"
                  :label="its"
                  :value="its">
                </el-option>
              </el-select> -->
            </div>
          </div>
          <div>
            <el-button @click="hiedDiv">取消</el-button>
            <el-button @click="phoneme">保存</el-button>
          </div>
        </div>
      </div>

      <div class="ws option" v-if="active === 'w'">
        <h4>这是连续</h4>
        <p>以下选中的内容作为一个词语连续</p>
        <div class="selecteds">
          {{activeW}}
        </div>
        <div>
          <el-button @click="hiedDiv">取消</el-button>
          <el-button @click="w">保存</el-button>
        </div>
      </div>

      <div class="digits option" v-if="active === 'number'">
        <h4>设置数字串读方式</h4>
        <el-radio-group v-model="activeNumber">
          <el-radio class="radios" label="number:digits">按数值朗读(例：2007 读作 二千零七)</el-radio>
          <el-radio class="radios" label="number:ordinal">数字逐个朗读(例：2007 读作 二零零七)</el-radio>
        </el-radio-group>
        <div>
          <el-button @click="hiedDiv">取消</el-button>
          <el-button @click="numbers(activeNumber)">保存</el-button>
        </div>
      </div>

      <div class="spell-out option" v-if="active === 'spell-out'">
        <h4>设置字母串读方式</h4>
        <el-radio-group v-model="activeSpellout">
          <el-radio class="radios" label="spell-out">字母逐个朗读（字母发言间隔较大）</el-radio>
          <el-radio class="radios" label="acronym">字母逐个朗读（字母发言间隔较小）</el-radio>
        </el-radio-group>
        <div>
          <el-button @click="hiedDiv">取消</el-button>
          <el-button @click="acronym(activeSpellout)">保存</el-button>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
const ACTIVE = {
  break: 'break',
  w: 'w',
  phoneme: 'phoneme',
  number: 'number',
  spellout: 'spell-out'
}
const pinyin = require("pinyin");
import Utils from '../utils';
export default {
  data () {
    return {
        active: '',
        activeBreak: '',
        activeW: '',
        activeNumber: '',
        activeSpellout: '',
        activePhoneme: [],
        content: '',
        html: '',
        htmlText: '',
        ssmltohtml: '',
        text: '这是长命一个很不错的测试，现在我需要测试添加停顿，以及修改发音，设置连续，设置数字读取方式2019、2018和字母读取方式，是连读ABCD，还是单个读取abcd, 然后来进行一个反编译的过程'
      }
  },
  mounted() {
    let that = this
    // let datas = Utils.loadXML('/static/test.xml')
    // let root = datas.children[0].nodeName
    // let listNode = Utils.XmlToObject(datas, root)
    // // console.log(listNode)
    // this.content = listNode
    // let html = ''
    // listNode.forEach(item => {
    //   html += Utils.appendForm(item.node, item.value, item.attributes)
    // })
    // this.html = html
    // Utils.HtmlToXml(html, 'text/xml')

    this.$nextTick(() => {
      const htmls = document.querySelector('.exec')
      // 文本内容改变事件
      htmls.addEventListener('input', function(){
        if (htmls) {
          console.log(htmls.innerText.length, htmls.innerText)
          if (htmls.innerText.length > 5000) {
            htmls.innerText = htmls.innerText.substring(0, 5000)
          }
          that.htmlText = Utils.replaceChat(htmls.innerHTML)
          that.ssmltohtml = Utils.HtmlToSsml(that.htmlText)
        }
      });
      that.htmlText = Utils.replaceChat(htmls.innerHTML) // htmls.children[0].innerHTML
    })
  },
  methods: {
    update (item) {
      console.log(item)
      this.activePhoneme.forEach(it => {
        if (item.id === it.id) {
          it = item
        }
      })
    },
    // 删除
    del () {
       const htmls = document.querySelector('.exec')
       htmls.innerHTML = ''
       this.htmlText = ''
       this.ssmltohtml = Utils.HtmlToSsml(this.htmlText)
    },
    // 切换状态
    exchange (active) {
      this.active = active
    },
    breaks (type) {
      const selection = document.getSelection().toString()
      if (selection.trim()) return false
      let text = Utils.status.break(type)
      document.execCommand('insertHTML', false, text);
      const html = document.querySelector('.exec')
      this.htmlText = Utils.replaceChat(html.innerHTML) // html.children[0].innerHTML

      // this.ssmltohtml = Utils.HtmlToSsml(this.htmlText)
      this.hiedDiv()
    },
    phoneme () {
      const selection = document.getSelection().toString()
      if (!selection) return false
      if(/[0-9a-zA-Z]/.test(selection)) {
        alert('选中的文字中不能包含字符串和数字')
        return false
      }
      let htmls = ''
      this.activePhoneme.forEach(item => {
        htmls += Utils.status.phoneme(item.value, `${item.pinvalue}${item.tonevalue}`)
      })

      if (!Utils.judgeNaN(selection.trim() * 1) || Utils.IsEN(selection.trim())) {
        alert('数字和字符禁止设置此操作');
        return false
      }

      // let ss = document.getSelection().focusNode.parentNode
      // console.log('修改发音：', ss.nodeName, ss.parentNode.nodeName)
      // console.log(document.getSelection())
      // if (ss.nodeName === 'PHONEME') {
      //   alert('设置得字段已经包含修改发音了不可以重新设置')
      //   return false
      // }

      document.execCommand('insertHTML', false, htmls); // status.phoneme(selection, 'xiao', 'gold')
      const html = document.querySelector('.exec')
      // console.log(Utils.JsonToDom(Utils.toGetJson(html)))
      this.htmlText = Utils.replaceChat(html.innerHTML)
      // this.ssmltohtml = Utils.HtmlToSsml(this.htmlText)
      this.hiedDiv()
    },
    w () {

      let selection = document.getSelection().toString()
      if (!selection) return false
      if(/[0-9a-zA-Z]/.test(selection)) {
        alert('选中的文字中不能包含字符串和数字')
        return false
      }
      if (!Utils.judgeNaN(selection.trim() * 1) || Utils.IsEN(selection.trim())) {
        alert('数字和字符禁止设置此操作');
        return false
      }
      this.activeW = selection
      let ss = document.getSelection().focusNode.parentNode
      // console.log(document.getSelection(), document.getSelection().toString())
      // console.log('设置连续：', ss.nodeName, ss.parentNode.nodeName)
      if (ss.nodeName === 'PHONEME') {
        let selectArr = selection.replace(/\s/g, "").split('')
        let htmls = ''
        selectArr.forEach((item, index) => {
          htmls += `<phoneme py=${pinyin(item, {
            style: pinyin.STYLE_TONE2
          })}>${item}</phoneme>`
        })
        // alert('设置得字段已经包含连续了不可以重新设置')
        selection = htmls
        console.log(Utils.status.w(selection))
        // return false
      }

      document.execCommand('insertHTML', false, Utils.status.w(selection));
      const html = document.querySelector('.exec')
      this.htmlText = Utils.replaceChat(html.innerHTML)
      // this.ssmltohtml = Utils.HtmlToSsml(this.htmlText)
      this.hiedDiv()
    },
    numbers (type) {
      // console.log(Utils.selectHtml(), Utils.selectHtml().children)

      const selection = document.getSelection().toString().trim()
      if (!selection) return false
      if (Utils.judgeNaN(selection.trim() * 1)) {
        alert('选中的不是数字');
        return false
      }
      if (type === 'number:digits') {
        document.execCommand('insertHTML', false, Utils.status.sayas(selection, type)); // digits ordinal
      }
      if (type === 'number:ordinal') {
        document.execCommand('insertHTML', false, Utils.status.sayas(selection, type)); // digits ordinal
      }

      const html = document.querySelector('.exec')
      this.htmlText = Utils.replaceChat(html.innerHTML)
      this.ssmltohtml = Utils.HtmlToSsml(this.htmlText)
      this.hiedDiv()
    },
    acronym (type) {

      const selection = document.getSelection().toString()
      if (!Utils.IsEN(selection.trim())) {
        alert('选中的不是字符')
        return false;
      }
      if (!selection) return false
      let text = ''
      if (type === 'spell-out') {
        text = Utils.status.sayas(selection, type)
      }
      if (type === 'acronym') {
        text = Utils.status.sayas(selection, type)
      }
      document.execCommand('insertHTML', false, text)
       // spell-out acronym
      let html = document.querySelector('.exec')

      this.htmlText = Utils.replaceChat(html.innerHTML)
      // this.ssmltohtml = Utils.HtmlToSsml(this.htmlText)
      this.hiedDiv()
    },
    // 撤销最近指定的命令
    undo () {
      document.execCommand(Utils.status.undo())
      const html = document.querySelector('.exec')
      this.htmlText = Utils.replaceChat(html.innerHTML)
      console.log(html.innerHTML)
    },
    // 清除样式 可以用于清除复制粘贴过来的文本的格式
    removeFormat () {
      document.execCommand(Utils.status.selectAll())
      document.execCommand(Utils.status.removeFormat())
      const html = document.querySelector('.exec')
      html.innerHTML = Utils.formatClear(html.innerHTML)
      this.htmlText = Utils.replaceChat(html.innerHTML)
      this.ssmltohtml = Utils.HtmlToSsml(this.htmlText)
      console.log(html.innerHTML)
      // console.log(Utils.HtmlToXml(html.innerHTML, 'text/xml'))
    },
    // 鼠标右击事件
    mousedown (ev) {
      ev.preventDefault();
      const customContextMenu = document.querySelector("#customContextMenu");
      const html = document.querySelector('.exec')
      let selection = document.getSelection().toString()
      if (!this.active) {
        // alert('请选择编辑方式')
        ev.stopPropagation() // 清除冒泡
        return false
      } else {

        if (this.active === 'w') {
          if (!Utils.judgeNaN(selection.trim() * 1) || Utils.IsEN(selection.trim())) {
            alert('数字和字符禁止设置此操作');
            return false
          }
          this.activeW = selection
        }
        if (this.active === 'phoneme') {
          if (!Utils.judgeNaN(selection.trim() * 1) || Utils.IsEN(selection.trim())) {
            alert('数字和字符禁止设置此操作');
            return false
          }
          this.activePhoneme = selection.replace(/\s/g, "").split('')
          if (this.activePhoneme.length > 0) {
            this.activePhoneme = this.activePhoneme.map((item, index) => {
              return this.createPinYin(item, index)
            })
          }
        }
        Utils.customContext(customContextMenu, html)
      }
    },
    hiedDiv () {
      this.active = ''
    },
    // 获取汉字的拼音 包括多音字
    createPinYin (item, index) {
      return {
        id: index,
        value: item,
        pin: pinyin(item, {
          style: pinyin.STYLE_NORMAL,
          heteronym: true
        })[0],
        pinvalue: pinyin(item, {
          style: pinyin.STYLE_NORMAL,
          heteronym: true
        })[0][0],
        tone: pinyin(item, {
          style: pinyin.STYLE_TONE2, // STYLE_NORMAL STYLE_TONE2
          heteronym: true
        })[0].map(it => {
          if (!Utils.judgeNaN(it.slice(-1) * 1)) {
            return it.slice(-1) * 1
          } else {
            return 5
          }
        }),
        tonevalue: pinyin(item, {
          style: pinyin.STYLE_TONE2, // STYLE_NORMAL STYLE_TONE2
          heteronym: true
        })[0].map(it => {
          if (!Utils.judgeNaN(it.slice(-1) * 1)) {
            return it.slice(-1) * 1
          } else {
            return 5
          }
        })[0]
      }
    }
  }
}
</script>

<style scoped>
.exec {
  border: 1px solid pink;
  min-height: 120px;
  text-align: left;
  letter-spacing: 3px;
}
.to-right-click {
  width: 350px;
  min-height: 200px;
  max-height: 300px;
  overflow-y: auto;
  background-color:cornsilk;
  text-align: left;
}
#customContextMenu {
  position: fixed;
  list-style: none;
  padding: 0 0 10px 0;
  margin: 0;
  display: none;
}
.html-text {
  margin-top: 20px;
  min-height: 120px;
  border: 1px solid pink;
  white-space: pre-line;
  text-align: left;
  letter-spacing: 3px;
}
.breaks {
  padding-left: 20px;
}
.radios {
  display: block;
  margin-bottom: 20px;
}
.option {
  padding: 0 20px 0 20px;
}
.edit-title > span, .edit-item > div {
  width: 90px;
  height: 33px;
  display: inline-block;
  margin: 0 5px;
}
.edit-title > span:nth-child(1),  .edit-item > div:nth-child(1) {
  width: 50px;
}
.selecteds {
  min-height: 60px;
  overflow-y: auto;
  overflow-x: hidden;
  border: 1px solid blueviolet;
}
</style>
