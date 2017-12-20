## npCanvas

实例化：
 * `new npCanvas(id,configs,style)` @params2 {Object} configs {is_drage}

函数：
 * `canvas.add()` 添加形状
 * `canvas.renderAll()` 重新渲染
 * `canvas.clear()` 清空canvas
 * `canvas.remove(shape)` 清楚某一个形状
 * `canvas.removeAll()` 清除所有形状
 * `canvas.setWidth(width)` 设置canvas的宽度
 * `canvas.setHeight(height)` 设置canvas的高度
 * `canvas.getPos()` 获取canvas的位置信息和宽高
 * `canvas.toDataURL(min:images/jpeg)` 导出canvas的为图片base64
 * `canvas.getImageData(x:0,y:0,width:canvas.width,height:canvas.height)` 获取canvas的像素信息

事件
 * `canvas.on('object:move')` 当元素运动的时候,参数{originEvent(原生event对象),target(目标形状),x,y}
 * `canvas.on('object:click')` 当元素点击的时候，参数{originEvent(原生event对象),target(目标形状)

形状：@params2 {Object} draws {fill,stoke,strokeWidth,rotate,angle,transform(1,0,0,1,0,0),alpha,is_drage}
 * `npCanvas.Object` 不可实例化 用来继承
 * `npCanvas.Circle` @params1 {Object} {x,y,r}
 * `npCanvas.Line` @params1 {Object} {x1,y1,x2,y2}
 * `npCanvas.Rect` @params1 {Object} {x,y,width,height} @params2 {Objst} {radiusWidth}
 * `npCanvas.Text` @params1 {Object} {x,y,text}
 * `npCanvas.Act` @params1 {Object} {x,y,r,startAngle,endAngle[,counterclockwise]}
 * `npCanvas.QuadraticCurveTo` @params1 {Object} {x1,y1,cpx,cpy,x2,y2}
 * `npCanvas.BezierCurveTo` @params1 {Object} {x1,y1,cpx1,cpy1,cpx2,cpy2,x2,y2}
 * `npCanvas.DrawImage` @params1 {Object} {x,y,image[,width][,height][,sx][,sy][,swidth][,sheight]}

形状的函数
 * `shape.on('shape:move')` 移动函数
 * `shape.on('shape:click')` 点击函数
 * `shape.on('shape:mouseover')` 移动函数
 * `shape.on('shape:mouseleave')` 移出函数
 * `shape.offset(offset)` 增量函数 offset={x,y}

工具函数：
 * `npCanvas.Utils.inherit(params1,params2)` params1被继承的 params2 继承的父
 * `npCanvas.Utils.animate` 动画，@params {Object} {begin,changeVal,duration,mode,callback}
 * `npCanvas.Utils.extends` 合并对象
 * `npCanvas.Utils.formUrl` 加载一个图片 @return Promise @params {String} 图片url
 * `npCanvas.Utils.noop` 空函数


## 运行demo

    npm install
    npm run server
    访问:http://127.0.0.1:8080/demo/demo.htm
