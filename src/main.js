// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import Vuex from 'vuex'
import axios from 'axios'
import VueTouch from 'vue-touch'
import VueCookie from 'vue-cookie'
import MintUI from 'mint-ui'

/* 常量定义 */

// 阻止 vue 在启动时生成生产提示
Vue.config.productionTip = false

Vue.use(Vuex)
Vue.use(VueTouch,{name: 'v-touch'})
Vue.use(VueCookie)
Vue.use(MintUI)

/* simple requests ajax module */
let ajax = axios.create()
// 允许跨域传送cookies
ajax.interceptors.request.use((config) => {
  /* 降级为简单的ajax请求，用以适配服务端API不支持CORS标准的情况 */
  config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
  if(config.method === 'post') {
      config.data = qs.stringify( {
          ...config.data
      })
  }
  return config
},(error) => {
  console.log('请求发送异常')
  Promise.reject(error)
})

ajax.interceptors.response.use(function (response) {
  return response.data
}, function (error) {
  console.log('请求接收异常')
  return Promise.reject(error)
})

Vue.prototype.$ajax = ajax

let instance = axios.create()
// 允许跨域传送cookies
instance.defaults.withCredentials = true
// 请求头控制所有xhr的共通行为
instance.defaults.headers = {
  // 是否自动显示业务错误信息
  'X-Auto-Show-Error-Message':true,
  // 是否显示Loading图标
  'X-Need-Loading-Indicator':true
}

// 封装ajax请求
//  1.默认情况下调用'加载中...'遮罩层
//  2.接口返回业务异常时自动报错
let axiosUserControl = {
  autoShowErrorMessage : true,
  needLoadingIndicator : true
}

instance.interceptors.request.use((config) => {
  if (config.headers["X-Need-Loading-Indicator"]){
    MintUI.Indicator.open({text: '加载中...',spinnerType: 'triple-bounce'})
  }
  /* 降级为简单的ajax请求，用以适配服务端API不支持CORS标准的情况 */
  // config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
  // if(config.method === 'post') {
  //     config.data = qs.stringify( {
  //         ...config.data
  //     })
  // }
  axiosUserControl.autoShowErrorMessage = config.headers["X-Auto-Show-Error-Message"]
  return config
},(error) => {
  if (config.headers["X-Need-Loading-Indicator"]){
    MintUI.Indicator.open({text: '加载中...',spinnerType: 'triple-bounce'})
  }
  console.log('请求发送异常')
  Promise.reject(error)
})

instance.interceptors.response.use(function (response) {
  MintUI.Indicator.close()
  if (axiosUserControl.autoShowErrorMessage && response.data && response.data.Head.Ret == -1){
    MintUI.Toast(response.data.Head.Msg)
  }
  return response.data
}, function (error) {
  MintUI.Indicator.close()
  console.log('请求接收异常')
  return Promise.reject(error)
})

Vue.prototype.$http = instance


// 封装localStorage，兼容无痕模式/隐私模式
let storage = {
  // 是否支持cookie
  isSupportCookie : navigator.cookieEnabled,
  // 是否支持localStorage
  isSupportLocalStorage : (function(){
    try {
        localStorage.setItem('localStorageTestValue', 'localStorageTestValue')
        localStorage.removeItem('localStorageTestValue')
    } catch (e) {
        return false
    }
    return true
  }()),
  // 设置localStorage
  setItem : function(name,value){
    this.isSupportLocalStorage ? window.localStorage.setItem(name,value) : VueCookie.set(name,value,{domain: COOKIE_DOMAIN})
  },
  // 获取localStorage
  getItem: function(name){
    return this.isSupportLocalStorage ? window.localStorage.getItem(name) : VueCookie.get(name)
  },
  // 删除localStorage
  removeItem: function(name){
    this.isSupportLocalStorage ? window.localStorage.removeItem(name) : VueCookie.delete(name,{domain: COOKIE_DOMAIN})
  }
}

Vue.prototype.$localStorage = storage

// 隐私/无痕下弹出警告
if (typeof localStorage === 'object') {
  try {
    localStorage.setItem('localStorage', 'localStorage');
    localStorage.removeItem('localStorage');
  } catch (e) {
    MintUI.Toast('浏览器为隐私/无痕模式!请切换到正常模式');
  }
}

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
})