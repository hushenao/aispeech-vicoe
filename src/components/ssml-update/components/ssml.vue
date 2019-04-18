<template>
  <div>
    <!-- 操作按钮部分 -->
    <div class="btn-list">
      <el-button :type="active === 'break' ? 'primary' : ''"  @click="toBreaks('break')">添加停顿</el-button>
      <el-button :type="active === 'phoneme' ? 'primary' : ''" @click="toPhoneme('phoneme')">修改发音</el-button>
      <el-button :type="active === 'w' ? 'primary' : ''" @click="toW('w')">设置连续</el-button>
      <el-button :type="active === 'number' ? 'primary' : ''" @click="exchange('number')">设置数字串读方式</el-button>
      <el-button :type="active === 'spell-out' ? 'primary' : ''" @click="exchange('spell-out')">设置字母串读方式</el-button>
      <!-- <el-button @click="undo">撤销上一步</el-button> -->
      <el-button @click="removeFormat">清除样式</el-button>
      <el-button @click="del">删除内容</el-button>
    </div>
    <!-- 主体部分 -->
    <div class='ssml-header'>
      <div class="origin">语音数据源：</div>
      <div class="to-ssml">生成的SSML文档：</div>
    </div>
    <div class="ssml-wrap">
      <div class="ssml-origin exec" contentEditable="true" @contextmenu.prevent='mousedown($event)'>{{text.trim()}}</div>
      <div class="ssml-text html-text">{{htmlText}}</div>
    </div>
    <div>
      总字数为：{{ssmlLen}}
    </div>

    <!-- 生成的SSML解析成HTML文档 -->
    <!-- <div style="text-align:left;">生成的SSML解析成HTML文档：</div>
    <div class="html-text" v-html="ssmltohtml"></div> -->
    <!-- <div class="to-right-click" id="customContextMenu" v-show="active">
      <div class="phoneme option" v-show="active === 'phoneme'">
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
            </div>
            <div>
              <el-radio-group v-model="item.tonevalue" @change='update(item)'>
                <el-radio v-for="(its, i) in item.tone" :label="its" :key="its + i + Math.random()">{{its}}</el-radio>
              </el-radio-group>
            </div>
          </div>
          <div>
            <el-button @click="hiedDiv">取消</el-button>
            <el-button @click="phoneme">保存</el-button>
          </div>
        </div>
      </div>
    </div> -->

    <!-- 弹出操作框部分 -->
    <el-dialog
      title="提示"
      :visible.sync="centerDialogVisible"
      :width="active === 'break' ? '25%' : '30%'"
      :show-close="false"
      :close-on-click-modal="false">
      <!-- 设置断点 -->
      <div class="breaks option" v-show="active === 'break'">
        <h4>添加停顿</h4>
        <p>请选择停顿的长短</p>
        <el-radio-group v-model="activeBreak">
          <el-radio class="radios" label="strong">长停顿</el-radio>
          <el-radio class="radios" label="medium">中停顿</el-radio>
          <el-radio class="radios" label="weak">短停顿</el-radio>
        </el-radio-group>
      </div>
      <div class="dialog-footer" slot="footer" v-show="active === 'break'">
        <el-button @click="hiedDiv">取消</el-button>
        <el-button type="primary" @click="breaks(activeBreak)">保存</el-button>
      </div>

      <!-- 设置数字穿读方式 -->
      <div class="digits option" v-show="active === 'number'">
        <h4>设置数字串读方式</h4>
        <el-radio-group v-model="activeNumber">
          <el-radio class="radios" label="number:digits">按数值朗读(例：2007 读作 二千零七)</el-radio>
          <el-radio class="radios" label="number:ordinal">数字逐个朗读(例：2007 读作 二零零七)</el-radio>
        </el-radio-group>
      </div>
      <div class="dialog-footer" slot="footer" v-show="active === 'number'">
        <el-button @click="hiedDiv">取消</el-button>
        <el-button type="primary" @click="numbers(activeNumber)">保存</el-button>
      </div>

      <!-- 设置字母穿读方式 -->
      <div class="spell-out option" v-show="active === 'spell-out'">
        <h4>设置字母串读方式</h4>
        <el-radio-group v-model="activeSpellout">
          <el-radio class="radios" label="spell-out">字母逐个朗读（字母发言间隔较大）</el-radio>
          <el-radio class="radios" label="acronym">字母逐个朗读（字母发言间隔较小）</el-radio>
        </el-radio-group>
      </div>
      <div class="dialog-footer" slot="footer" v-show="active === 'spell-out'">
        <el-button @click="hiedDiv">取消</el-button>
        <el-button type="primary" @click="acronym(activeSpellout)">保存</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
const pinyin = require("pinyin");
import Utils from '../utils';
export default {
  data () {
    return {
        centerDialogVisible: false, // 控制dialog弹出框的状态
        active: '', // 设置当前所处的编辑状态
        activeBreak: '', // 设置停顿
        activeW: '', // 设置连续
        activeNumber: '', // 设置数字发音
        activeSpellout: '', // 设置字母发言
        activePhoneme: [], // 设置读音数组
        htmlText: '', // 生成的ssml数据
        ssmltohtml: '', // 反向生成html标签文档
        text: '这是长命一个很不错的测试，现在我需要测试添加停顿，以及修改发音，设置连续，设置数字读取方式2019、2018和字母读取方式，是连读ABCD，还是单个读取abcd, 然后来进行一个反编译的过程',
        ssmlLen: 0, // ssml原数据的长度
        breakIndex: 0, // 设置停顿的标识索引
        wIndex: 0, // 设置连续的标识索引
        specialIndex: 0 // 设置数字和字母的标识索引
      }
  },
  mounted() {
    let that = this
    this.$nextTick(() => {
      const htmls = this.queryDom('.exec')
      that.ssmlLen = htmls.innerText.length
      // 文本内容改变事件
      htmls.addEventListener('input', function(){
        if (htmls) {
          that.ssmlLen = htmls.innerText.length
          if (htmls.innerText.length > 5000) {
            htmls.innerText = htmls.innerText.substring(0, 5000)
          }

          that.htmlText = Utils.replaceChat(htmls.innerHTML)
          that.ssmltohtml = Utils.HtmlToSsml(that.htmlText)

          that.htmlText = that.comm(that.htmlText)
          document.querySelector('.html-text').innerText = that.comm(Utils.replaceChat(that.ssmltohtml))
        }
      });
      that.htmlText = that.comm(Utils.replaceChat(htmls.innerHTML))
    })
  },
  methods: {
    comm (text) {
      return `<?xml version="1.0" encoding="utf8"?><speak xml:lang="cn">${text}</speak>`
    },
    toBreaks (active) {
      this.active = active
    },
    toW (active) {
      this.active = active
      let selection = this.querySelection()
      if (Utils.querySelectHtml().indexOf('</phoneme>') !== -1) return false
      if (!selection || selection.trim().length < 2 || selection.indexOf('|') !== -1) return false
      if (/[0-9a-zA-Z]/.test(selection.trim()) || !Utils.judgeNaN(selection.trim() * 1) || Utils.IsEN(selection.trim())) {
        this.active = ''
        this.$alert('选中的文字中不能包含字符串和数字', '警告', {
          confirmButtonText: '取消',
          type: 'warning'
        })
        return false
      }
      let parentNode = this.querySelection(true).focusNode.parentNode
      if (parentNode.nodeName === 'PHONEME') {
        let selectArr = selection.replace(/\s/g, "").split('')
        let htmls = ''
        selectArr.forEach((item, index) => {
          htmls += `<phoneme py=${pinyin(item, {
            style: pinyin.STYLE_TONE2
          })}>${item}</phoneme>`
        })
        selection = htmls
      }
      this.wIndex++
      this.execCommand('insertHTML', false, Utils.status.w(selection, this.wIndex++))
      const html = this.queryDom('.exec')
      this.htmlText = this.comm(Utils.replaceChat(html.innerHTML))
    },
    toPhoneme (active) {
      this.active = active
      const selection = this.querySelection()
      if (Utils.querySelectHtml().indexOf('</w>') !== -1) return false
      if (!selection || selection.indexOf('|') !== -1) return false
      if (/[0-9a-zA-Z]/.test(selection.trim()) || !Utils.judgeNaN(selection.trim() * 1) || Utils.IsEN(selection.trim())) {
        this.active = ''
        this.$alert('选中的文字中不能包含字符串和数字', '警告', {
          confirmButtonText: '取消',
          type: 'warning'
        })
        return false
      }
      let htmls = ''
      this.activePhoneme = selection.replace(/\s/g, "").split('')
      this.activePhoneme = this.activePhoneme.map((item, index) => {
              return this.createPinYin(item, index)
      })
      this.activePhoneme.forEach(item => {
        htmls += Utils.status.phoneme(item.value, `${item.pinvalue}${item.tonevalue}`)
      })
      this.execCommand('insertHTML', false, htmls)
      const html = this.queryDom('.exec')
      this.htmlText = this.comm(Utils.replaceChat(html.innerHTML))

    },
    queryDom (dom) {
      return document.querySelector(dom)
    },
    querySelection(type = false) {
      if (type) {
        return document.getSelection()
      }
      return document.getSelection().toString()
    },
    execCommand (type = 'insertHTML', blen = false, text = '') {
      return document.execCommand(type, blen, text);
    },
    update (item) {
      let that = this
      for (let it of that.activePhoneme) {
        if (item.id === it.id) {
          it = item
          return
        }
      }
    },
    // 删除
    del () {
       const htmls = this.queryDom('.exec')
       htmls.innerHTML = ''
       this.htmlText = ''
       this.ssmltohtml = Utils.HtmlToSsml(this.htmlText)
    },
    // 切换状态
    exchange (active) {
      this.active = active
    },
    breaks (type) {
      const selection = this.querySelection()
      if (selection.trim()) return false
      this.breakIndex++
      let text = Utils.status.break(type, this.breakIndex)
      this.execCommand('insertHTML', false, text)
      const html = this.queryDom('.exec')
      this.htmlText = this.comm(Utils.replaceChat(html.innerHTML))  // `<?xml version="1.0" encoding="utf8"?><speak xml:lang="cn">${Utils.replaceChat(html.innerHTML)}</speak>`
      this.hiedDiv()
    },
    phoneme () {
      const selection = this.querySelection()
      if (!selection) return false

      let htmls = ''
      this.activePhoneme.forEach(item => {
        htmls += Utils.status.phoneme(item.value, `${item.pinvalue}${item.tonevalue}`)
      })
      this.execCommand('insertHTML', false, htmls)
      const html = this.queryDom('.exec')
      this.htmlText = Utils.replaceChat(html.innerHTML)
      this.hiedDiv()
    },
    w () {
      let selection = this.querySelection()
      if (!selection) return false
      this.activeW = selection
      let parentNode = this.querySelection(true).focusNode.parentNode
      if (parentNode.nodeName === 'PHONEME') {
        let selectArr = selection.replace(/\s/g, "").split('')
        let htmls = ''
        selectArr.forEach((item, index) => {
          htmls += `<phoneme py=${pinyin(item, {
            style: pinyin.STYLE_TONE2
          })}>${item}</phoneme>`
        })
        selection = htmls
      }
      this.execCommand('insertHTML', false, Utils.status.w(selection))
      const html = this.queryDom('.exec')
      this.htmlText = Utils.replaceChat(html.innerHTML)
      this.hiedDiv()
    },
    numbers (type) {
      const selection =this.querySelection().trim()
      if (!selection) return false
      this.specialIndex++
      this.execCommand('insertHTML', false, Utils.status.sayas(selection, type, this.specialIndex))

      const html = this.queryDom('.exec')
      const htmlText = this.queryDom('.html-text')
      // this.htmlText = Utils.replaceChat(html.innerHTML)
      // this.ssmltohtml = Utils.HtmlToSsml(this.htmlText)
      htmlText.innerText = this.comm(Utils.replaceChat(html.innerHTML)) //  `<?xml version="1.0" encoding="utf8"?><speak xml:lang="cn">${this.htmlText}</speak>`
      this.hiedDiv()
    },
    acronym (type) {
      const selection = this.querySelection()
      if (!selection) return false
      this.specialIndex++
      let text = Utils.status.sayas(selection, type, this.specialIndex)
      this.execCommand('insertHTML', false, text)

      let html = this.queryDom('.exec')
      const htmlText = this.queryDom('.html-text')
      // this.htmlText = Utils.replaceChat(html.innerHTML)
      htmlText.innerText = this.comm(Utils.replaceChat(html.innerHTML)) //  `<?xml version="1.0" encoding="utf8"?><speak xml:lang="cn">${this.htmlText}</speak>`
      this.hiedDiv()
    },
    // 撤销最近指定的命令
    undo () {
      this.execCommand(Utils.status.undo())
      const html = this.queryDom('.exec')
      this.htmlText = Utils.replaceChat(html.innerHTML)
    },
    // 清除样式 可以用于清除复制粘贴过来的文本的格式
    removeFormat () {
      this.execCommand(Utils.status.selectAll())
      this.execCommand(Utils.status.removeFormat())
      const html = this.queryDom('.exec')
      html.innerHTML = Utils.formatClear(html.innerHTML)
      this.htmlText = Utils.replaceChat(html.innerHTML)
      this.ssmltohtml = Utils.HtmlToSsml(this.htmlText)
    },
    // 鼠标右击事件
    mousedown (ev) {
      ev.preventDefault();
      const customContextMenu = this.queryDom('#customContextMenu')
      const html = this.queryDom('.exec')
      let selection = this.querySelection()
      if (!this.active) {
        ev.stopPropagation() // 清除冒泡
        return false
      } else {
        if (this.active === Utils.format.strong.value) {
          if (selection.trim()) return false
          this.centerDialogVisible = true
        }
        if (this.active === Utils.format.phoneme.value) {
          if (/[0-9a-zA-Z]/.test(selection.trim()) || !Utils.judgeNaN(selection.trim() * 1) || Utils.IsEN(selection.trim())) {
            // this.active = ''
            ev.preventDefault()
            ev.stopPropagation()
            this.$alert('选中的文字中不能包含字符串和数字', '警告', {
              confirmButtonText: '取消'
            })
            // alert('选中的文字中不能包含字符串和数字')
            return false
          }
          this.activePhoneme = selection.replace(/\s/g, "").split('')
          if (this.activePhoneme.length > 0) {
            this.activePhoneme = this.activePhoneme.map((item, index) => {
              return this.createPinYin(item, index)
            })
          }
          this.centerDialogVisible = true
        }
        if (this.active === Utils.format.w.value) {
          if (!selection || selection.trim().length < 2) return false
          this.activeW = selection
          if ( /[0-9a-zA-Z]/.test(selection.trim()) || !Utils.judgeNaN(selection.trim() * 1) || Utils.IsEN(selection.trim())) {
            // this.active = ''
            ev.preventDefault()
            ev.stopPropagation()
            this.$alert('选中的文字中不能包含字符串和数字', '警告', {
              confirmButtonText: '取消',
              type: 'warning'
            })
            // alert('选中的文字中不能包含字符串和数字');
            return false
          }
          this.centerDialogVisible = true
        }
        if (this.active === Utils.format.number) {
          if (Utils.judgeNaN(selection.trim() * 1)) {
            // this.active = ''
            ev.preventDefault()
            ev.stopPropagation()
            this.$alert('选中的不是数字', '警告', {
              confirmButtonText: '取消',
              type: 'warning'
            })
            // alert('选中的不是数字');
            return false
          }
          this.centerDialogVisible = true
        }
        if (this.active === Utils.format.spellout) {
          if (!Utils.IsEN(selection.trim())) {
            // this.active = ''
            ev.preventDefault()
            ev.stopPropagation()
            this.$alert('选中的不是字符', '警告', {
              confirmButtonText: '取消',
              type: 'warning'
            })
            // alert('选中的不是字符')
            return false;
          }
          this.centerDialogVisible = true
        }
        // Utils.customContext(customContextMenu, html)
      }
    },
    hiedDiv () {
      // this.active = ''
      this.centerDialogVisible = false
      // document.querySelector('#customContextMenu').style.display = "none";
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
          style: pinyin.STYLE_TONE2,
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
@import '../css/style.css';
/* .exec {
  border: 1px solid pink;
  min-height: 120px;
  text-align: left;
  letter-spacing: 3px;
} */
/* .to-right-click {
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
} */
/* .html-text {
  margin-top: 20px;
  min-height: 120px;
  border: 1px solid pink;
  white-space: pre-line;
  text-align: left;
  letter-spacing: 3px;
} */
/* .breaks {
  padding-left: 20px;
}
.radios {
  display: block;
  margin-bottom: 20px;
  text-align: left;
}
.option {
  padding: 0 20px 0 20px;
} */
/* .edit-title > span, .edit-item > div {
  width: 90px;
  height: 33px;
  display: inline-block;
  margin: 0 5px;
} */
/* .edit-title > span:nth-child(1),  .edit-item > div:nth-child(1) {
  width: 50px;
} */
/* .selecteds {
  min-height: 60px;
  overflow-y: auto;
  overflow-x: hidden;
  border: 1px solid pink;
} */
</style>
