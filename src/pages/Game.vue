<template>
  <div class="game">
    <canvas id="canvas" disable-scroll="true" @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd"></canvas>
    <ul>
      <li><img src="../../static/img01.jpg" @click="addImg" alt=""></li>
      <li><img src="../../static/img02.jpg" @click="addImg" alt=""></li>
      <li><img src="../../static/img03.jpg" @click="addImg" alt=""></li>
      <li><img src="../../static/img04.jpg" @click="addImg" alt=""></li>
      <li><img src="../../static/img05.jpg" @click="addImg" alt=""></li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'Game',
  data () {
    return {
      clientWidth:null,
      clientHeight:null,
      ctx:null,
      cornerSize:24,
      imgEles:[],
      imgInit:{
        radian:0,
        top:0,
        left:0,
        scaleX:1,
        scaleY:1,
        width:null,
        height:null,
        oElement:null
      },
      currentTransform:null
    }
  },
  mounted(){
    let canvas = document.getElementById('canvas')
    this.clientWidth = document.documentElement.clientWidth
    this.clientHeight = document.documentElement.clientHeight
    canvas.width = this.clientWidth
    canvas.height = this.clientHeight
    this.ctx = canvas.getContext('2d')
  },
  methods: {
    // 将图片添加到画布上
    addImg(e) {
      let imgEle = {
        oElement: e.currentTarget,
        width:326,
        height:216,
        left: 326 / 2 + this.cornerSize,
        top: 216 / 2 + this.cornerSize
      }
      let oImg= Object.assign({},this.imgInit,imgEle)
      this.setImageCoords(oImg)
      this.imgEles.push(oImg)
      this.renderAll()
    },
    // 计算并设置图片的四点坐标
    setImageCoords(oImg) {
      oImg.left = parseInt(oImg.left)
      oImg.top = parseInt(oImg.top)
      let _currentWidth = parseInt(oImg.width) * oImg.scaleX
      let _currentHeight = parseInt(oImg.height) * oImg.scaleX
      let _hypotenuse = Math.sqrt(Math.pow(_currentWidth / 2, 2) + Math.pow(_currentHeight / 2, 2)) //斜角边
      let _angle = Math.atan(_currentHeight / _currentWidth)  //长宽角度
      let _offsetX = Math.cos(_angle + oImg.radian) * _hypotenuse
      let _offsetY = Math.sin(_angle + oImg.radian) * _hypotenuse
      let _sinTh = Math.sin(oImg.radian)
      let _cosTh = Math.cos(oImg.radian)
      let tl = {  //左上角
        x: oImg.left - _offsetX,
        y: oImg.top - _offsetY
      }
      let tr = {  //右上角
        x: tl.x + (_currentWidth * _cosTh),
        y: tl.y + (_currentWidth * _sinTh)
      }
      let br = {  //右下角
        x: tr.x - (_currentHeight * _sinTh),
        y: tr.y + (_currentHeight * _cosTh)
      }
      let bl = {  //左下角
        x: tl.x - (_currentHeight * _sinTh),
        y: tl.y + (_currentHeight * _cosTh)
      }
      oImg.oCoords = { tl: tl, tr: tr, br: br, bl: bl }
      this.setCornerCoords(oImg)
    },
    // 设置四个角的控制柄坐标
    setCornerCoords(oImg){
      let coords = oImg.oCoords
      let radian = oImg.radian
      let cosOffset = this.cornerSize * oImg.scaleX * Math.cos(radian)
      let sinOffset = this.cornerSize * oImg.scaleX * Math.sin(radian)
      coords.tl.corner = {
        tl: {
          x: coords.tl.x,
          y: coords.tl.y
        },
        tr: {
          x: coords.tl.x + cosOffset,
          y: coords.tl.y + sinOffset
        },
        bl: {
          x: coords.tl.x - sinOffset,
          y: coords.tl.y + cosOffset
        }
      }
      coords.tl.corner.br = {
        x: coords.tl.corner.tr.x - sinOffset,
        y: coords.tl.corner.tr.y + cosOffset
      }
      coords.tr.corner = {
        tl: {
          x: coords.tr.x - cosOffset,
          y: coords.tr.y - sinOffset
        },
        tr: {
          x: coords.tr.x,
          y: coords.tr.y
        },
        br: {
          x: coords.tr.x - sinOffset,
          y: coords.tr.y + cosOffset
        }
      }
      coords.tr.corner.bl = {
        x: coords.tr.corner.tl.x - sinOffset,
        y: coords.tr.corner.tl.y + cosOffset
      }
      coords.bl.corner = {
        tl: {
          x: coords.bl.x + sinOffset,
          y: coords.bl.y - cosOffset
        },
        bl: {
          x: coords.bl.x,
          y: coords.bl.y
        },
        br: {
          x: coords.bl.x + cosOffset,
          y: coords.bl.y + sinOffset
        }
      }
      coords.bl.corner.tr = {
        x: coords.bl.corner.br.x + sinOffset,
        y: coords.bl.corner.br.y - cosOffset
      }
      coords.br.corner = {
        tr: {
          x: coords.br.x + sinOffset,
          y: coords.br.y - cosOffset
        },
        bl: {
          x: coords.br.x - cosOffset,
          y: coords.br.y - sinOffset
        },
        br: {
          x: coords.br.x,
          y: coords.br.y
        }
      }
      coords.br.corner.tl = {
        x: coords.br.corner.bl.x + sinOffset,
        y: coords.br.corner.bl.y - cosOffset
      }
    },
    // 绘制四个控制手柄
    drawCorners(oImg, offsetX, offsetY) {
      this.ctx.fillStyle = "gray"
      this.ctx.fillRect(-offsetX, -offsetY, this.cornerSize, this.cornerSize)
      this.ctx.fillRect(oImg.width - offsetX - this.cornerSize, -offsetY, this.cornerSize, this.cornerSize)
      this.ctx.fillRect(-offsetX, oImg.height - offsetY - this.cornerSize, this.cornerSize, this.cornerSize)
      this.ctx.fillRect(oImg.width - offsetX - this.cornerSize, oImg.height - offsetY - this.cornerSize, this.cornerSize, this.cornerSize)
    },
    // 触发开始逻辑
    onTouchStart(e) {
      if (this.currentTransform != null || this.imgEles.length == 0) {
        return
      }
      let tp = this.findTouchPosition(e)
      let oImg = this.findTargetImage(tp)
      if (oImg) {
        let corner = this.findTargetCorner(tp, oImg)
        let action = (!corner) ? 'drag' : (corner === 'tl' ? 'delete' : 'rotate')
        if (action === 'delete') {
          this.deleteImage(oImg)
          this.renderAll()
        } else {
          this.currentTransform = {
            target: oImg,
            action: action,
            scalex: oImg.scaleX,
            offsetX: tp.ex - oImg.left,
            offsetY: tp.ey - oImg.top,
            ex: tp.ex,
            ey: tp.ey,
            left: oImg.left,
            top: oImg.top,
            theta: oImg.radian
          }
        }
      }
    },
    onTouchEnd() {
      if (this.currentTransform) {
        // determine the new coords everytime the image changes its position
        this.setImageCoords(this.currentTransform.target)
      }
      this.currentTransform = null
      // this.renderAll()
    },
    onTouchMove(e){
      let tp = this.findTouchPosition(e)
      if (this.currentTransform === null) {
        let oImg = this.findTargetImage(tp)
      } else {
        if (this.currentTransform.action === 'rotate') {
          this.rotateImage(tp)
          this.scaleImage(tp)
        } else {
          this.translateImage(tp)
        }
        this.renderAll()
      }
    },
    // 移动图片
    translateImage(tp) {
      this.currentTransform.target.left = tp.ex - this.currentTransform.offsetX
		  this.currentTransform.target.top = tp.ey - this.currentTransform.offsetY
    },
    // 缩放图片
    scaleImage(tp) {
      let lastLen = Math.sqrt(Math.pow(this.currentTransform.ey - this.currentTransform.top, 2) + Math.pow(this.currentTransform.ex - this.currentTransform.left, 2))
      let curLen = Math.sqrt(Math.pow(tp.ey - this.currentTransform.top, 2) + Math.pow(tp.ex - this.currentTransform.left, 2))
      this.currentTransform.target.scaleX = this.currentTransform.scalex * (curLen / lastLen)
      this.currentTransform.target.scaleY = this.currentTransform.target.scaleX
    },
    // 旋转图片
    rotateImage(tp) {
      let lastAngle = Math.atan2(this.currentTransform.ey - this.currentTransform.top,this.currentTransform.ex - this.currentTransform.left)
      let curAngle = Math.atan2(tp.ey - this.currentTransform.top,tp.ex - this.currentTransform.left)
      this.currentTransform.target.radian = (curAngle - lastAngle) + this.currentTransform.theta
    },
    // 删除图片
    deleteImage(img) {
      let imgIndex
      this.imgEles.map((item,index) => {
        if (item.oElement === img.oElement) {
          imgIndex= index
        }
      })
      this.imgEles.splice(imgIndex,1)
      // this.imgEles.delete()
    },
    // 获取触点坐标
    findTouchPosition(e) {
      let x = e.touches[0].clientX
      let y = e.touches[0].clientY
      return {
        ex:x,
        ey:y
      }
    },
    findCrossPoints(tp,lines) {
      let b1, b2, a1, a2, xi, yi
      let xcount = 0
      let iLine = null
      for (let key in lines) {
        iLine = lines[key]
        // optimisation 1: line below dot. no cross
        if ((iLine.o.y < tp.ey) && (iLine.d.y < tp.ey)) {
          continue
        }
        // optimisation 2: line above dot. no cross
        if ((iLine.o.y >= tp.ey) && (iLine.d.y >= tp.ey)) {
          continue
        }
        // optimisation 3: vertical line case
        if ((iLine.o.x == iLine.d.x) && (iLine.o.x >= tp.ex)) {
          xi = iLine.o.x
          yi = tp.ey
        }
        // calculate the intersection point
        else {
          b1 = 0 //(y2-tp.ey)/(x2-tp.ex);
          b2 = (iLine.d.y-iLine.o.y)/(iLine.d.x-iLine.o.x)
          a1 = tp.ey-b1*tp.ex
          a2 = iLine.o.y-b2*iLine.o.x

          xi = - (a1-a2)/(b1-b2)
          yi = a1+b1*xi
        }

        // dont count xi < tp.ex cases
        if (xi >= tp.ex) {
          xcount += 1
        }
        // optimisation 4: specific for square images
        if (xcount == 2) {
          break
        }
      }
      return xcount
    },
    // 获取某图片的上下左右的坐标对象
    getImageLines(oCoords){
      return {
        topline: {
          o: oCoords.tl,
          d: oCoords.tr
        },
        rightline: {
          o: oCoords.tr,
          d: oCoords.br
        },
        bottomline: {
          o: oCoords.br,
          d: oCoords.bl
        },
        leftline: {
          o: oCoords.bl,
          d: oCoords.tl
        }
      }
    },
    findTargetImage(tp) {
      for (let i = this.imgEles.length-1; i !== -1; i--) {
        let iLines = this.getImageLines(this.imgEles[i].oCoords)
        let xpoints = this.findCrossPoints(tp, iLines)
        if (xpoints % 2 == 1 && xpoints != 0) {
          let target = this.imgEles[i]
          this.imgEles.splice(i, 1)
          this.imgEles.push(target)
          return target
        }
      }
    },
    // 判断四个角哪个角被点击到
    findTargetCorner(tp,oImg) {
      let xpoints = null
      for (var i in oImg.oCoords) {
        xpoints = this.findCrossPoints(tp, this.getImageLines(oImg.oCoords[i].corner))
        if (xpoints % 2 == 1 && xpoints != 0) {
          return i
        }
      }
      return false
    },
    // 清除画布
    clearCtx() {
      this.ctx.clearRect(0, 0, this.clientWidth, this.clientHeight)
    },
    // 重新绘制
    renderAll() {
      this.clearCtx()
      this.imgEles.map((item)=>{
        this.drawImgElement(item)
      })
    },
    drawImgElement(oImg) {
      let offsetX = oImg.width / 2
      let offsetY = oImg.height / 2
      this.ctx.save()
      this.ctx.translate(oImg.left,oImg.top)
      this.ctx.rotate(oImg.radian)
      this.ctx.scale(oImg.scaleX, oImg.scaleY)
      this.ctx.drawImage(
        oImg.oElement,
        - oImg.width / 2,
        - oImg.height / 2,
        oImg.width,
        oImg.height
      )
      this.drawDashRect(
        - oImg.width / 2,
        - oImg.height / 2,
        oImg.width,
        oImg.height
      )
      this.drawCorners(oImg, offsetX, offsetY)
      this.ctx.restore()
    },
    drawDashRect(left, top, width, height) {
      this.ctx.setLineDash([5])
      this.ctx.lineWidth = 1
      this.ctx.strokeStyle = '#ffffff'
      this.ctx.strokeRect(left,top,width,height)
    }
  }
}
</script>

<style scoped lang="scss">
.game{
  font-size: 0;
  canvas{
    margin: 0;
    padding: 0;
    background: #000;
  }
  ul{
    position: absolute;
    left:0;
    bottom:0;
    display: flex;
    li{
      img{
        width:2rem;
      }
    }
  }
}
</style>
