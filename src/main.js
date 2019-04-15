// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css';
import VueQuillEditor from './config/edit'
import x2js from 'x2js' //xml数据处理插件
Vue.prototype.$x2js = new x2js() //创建x2js对象，挂到vue原型上

Vue.config.productionTip = false
Vue.use(ElementUI);
Vue.use(VueQuillEditor)
    /* eslint-disable no-new */
new Vue({
    el: '#app',
    router,
    components: { App },
    template: '<App/>'
})