## npCanvas

函数：
    * `canvas.add()` 添加形状
    * `canvas.renderAll()` 重新渲染
    * `canvas.clear()` 清空canvas
形状：
    * `npCanvas.Circle` @params1 {Object} {x,y,r}
    * `npCanvas.Line` @params2 {Object} {x1,y1,x2,y2}
    * ``
形状的函数:
    * `shape.set(offset)` offset={x,y}
事件
    *  `this.on('object:move')` 当元素运动的时候,返回{originEvent(原生event对象),target(目标形状),x,y}
