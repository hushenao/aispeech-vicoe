import Vue from 'vue'
import Router from 'vue-router'
// import HelloWorld from '@/components/HelloWorld'

Vue.use(Router)

export default new Router({
    routes: [{
        path: '/',
        name: 'HelloWorld',
        // component: () => import('@/components/g6/g6')
        // component: () => import('@/components/defineType')
        component: () =>
            import ('@/components/ssml-update')
    }]
})
