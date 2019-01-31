<template>
  <div id="app">
		<router-view></router-view>
  </div>
</template>

<script>
import './assets/css/main.css'

export default {
  name: 'app',
  data () {
    return {

    }
  },
  computed : {
  },
  mounted() {
    // 设置rem单位比例
    document.addEventListener('DOMContentLoaded', function () {
      var deviceWidth = document.documentElement.clientWidth
      document.documentElement.style.fontSize = deviceWidth / 10 + 'px'
    }, false)
    window.onresize = function () {
      var deviceWidth = document.documentElement.clientWidth
      document.documentElement.style.fontSize = deviceWidth / 10 + 'px'
    }
  }
}
</script>
<style>
  #app {
    font-family: 'Microsoft YaHei', 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #000;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
  }
</style>
