## npCanvas

函数：
 * `canvas.add()` 添加形状
 * `canvas.renderAll()` 重新渲染
 * `canvas.clear()` 清空canvas
 * `canvas.animate()` 动画，@params {Object} {begin,changeVal,duration,mode,callback}

形状：@params2 {Object} draws {fill,stoke,strokeWidth,rotate,angle,transform(1,0,0,1,0,0)}
 * `npCanvas.Circle` @params1 {Object} {x,y,r}
 * `npCanvas.Line` @params1 {Object} {x1,y1,x2,y2}
 * `npCanvas.Rect` @params1 {Object} {x,y,width,height} @params2 {Objst} {radiusWidth}
 * `npCanvas.Text` @params1 {Object} {x,y,text}
 * `npCanvas.Act` @params1 {Object} {x,y,r,startAngle,endAngle[,counterclockwise]}
 * `npCanvas.QuadraticCurveTo` @params1 {Object} {x1,y1,cpx,cpy,x2,y2}
 * `npCanvas.BezierCurveTo` @params1 {Object} {x1,y1,cpx1,cpy1,cpx2,cpy2,x2,y2}

增量的函数:
 * `shape.offset(offset)` offset={x,y}

事件
 *  `this.on('object:move')` 当元素运动的时候,参数{originEvent(原生event对象),target(目标形状),x,y}
