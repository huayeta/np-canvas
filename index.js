"use strict";
/**
 * npCanvas
 */

var npCanvas=function(id,style){
    var _this=this;
    this.id=id;
    this.canvas=document.getElementById(this.id);
    this.style=style;
    this.setStyle();
    this.ctx=this.canvas.getContext('2d');
    this.canvasPos = this.canvas.getBoundingClientRect();
    this.canvasList=[];
    this.canvasList_tmp=[];
    this._events={};
    this.canvas.addEventListener('mousedown',function(e){
        var mouse={
            x:e.clientX-_this.canvasPos.left,
            y:e.clientY-_this.canvasPos.top
        };
        _this.canvasList.forEach(function(shape){
            if(_this.isMouseInGraph(shape,mouse)){
                _this.canvasList_tmp.push(shape);
                var mousemove=function(e){
                    if(shape===_this.canvasList_tmp[_this.canvasList_tmp.length-1]){
                        var mouse_tmp={
                            x:e.clientX-_this.canvasPos.left,
                            y:e.clientY-_this.canvasPos.top
                        };
                        var offset={
                            x:mouse_tmp.x-mouse.x,
                            y:mouse_tmp.y-mouse.y
                        };
                        mouse=mouse_tmp;
                        shape.offset(offset);
                        _this.fire('object:move',{
                            originEvent:e,
                            target:shape,
                            x:offset.x,
                            y:offset.y
                        });
                        _this.renderAll();
                    }
                }
                var mouseup=function(e){
                    _this.canvasList_tmp=[];
                    mouse=null;
                    shape=null;
                    _this.canvas.removeEventListener('mousemove',mousemove,false);
                    _this.canvas.removeEventListener('mouseup',mouseup,false);
                    mousemove=null;
                    mouseup=null;
                }
                _this.canvas.addEventListener('mousemove',mousemove,false);
                _this.canvas.addEventListener('mouseup',mouseup,false);
            }
        })
        e.preventDefault();
    },false)
    return this;
}
npCanvas.prototype.add=function(){
    var _this=this;
    var args=Array.prototype.slice.apply(arguments);
    this.canvasList=this.canvasList.concat(args);
    this.drawShapes(args);
}
// 画圆
npCanvas.prototype.Circle=function(ele){
    var opts={};
    npCanvas.utils.extends(opts,ele);
    this.ctx.arc(opts.x,opts.y,opts.r,0,2*Math.PI);
    return this;
}
// 画线
npCanvas.prototype.Line=function(ele){
    var opts={};
    npCanvas.utils.extends(opts,ele);
    var ctx=this.ctx;
    ctx.moveTo(opts.x1,opts.y1);
    ctx.lineTo(opts.x2,opts.y2);
    return this;
}
// 画矩形
npCanvas.prototype.Rect=function(ele){
    var opts={};
    npCanvas.utils.extends(opts,ele);
    var ctx=this.ctx;
    ctx.rect(opts.x,opts.y,opts.width,opts.height);
    return this;
}
// 旋转角度
npCanvas.prototype.rotate=function(draws){
    var ctx=this.ctx;
    if(draws.rotate){
        ctx.rotate(draws.rotate*Math.PI/180);
    }
    return this;
}
// 绘制数组路径
npCanvas.prototype.drawShapes=function(lists){
    if(!lists)lists=this.canvasList;
    lists.forEach(this.drawShape,this);
}
npCanvas.prototype.drawShape=function(shape,is_drawColor){
    var _this=this;
    var ctx=this.ctx;
    ctx.save();
    ctx.beginPath();
    //旋转角度
    _this.rotate(shape.draws);
    //绘制
    _this[shape.shape]?_this[shape.shape](shape):'';
    //上色
    if(is_drawColor!==false)_this.drawColor(shape.draws);
    ctx.closePath();
    ctx.restore();
    return this;
}
// 绘制颜色
npCanvas.prototype.drawColor=function(opts){
    if(!opts.fill && !opts.strokeWidth && !opts.stroke){
        this.ctx.lineWidth=1;
        this.ctx.strokeStyle='#000';
        this.ctx.stroke();
    }else{
        if(opts.strokeWidth || opts.stroke){
            if(!opts.strokeWidth)opts.strokeWidth=1;
            if(!opts.stroke)opts.stroke='#000';
            this.ctx.lineWidth=opts.strokeWidth;
            this.ctx.strokeStyle=opts.stroke;
            this.ctx.stroke();
        }
        if(opts.fill){
            this.ctx.fillStyle=opts.fill;
            this.ctx.fill();
        }
    }
    return this;
}
npCanvas.prototype.clear=function(){
    this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
}
npCanvas.prototype.renderAll=function(){
    this.clear();
    this.drawShapes();
    return this;
}
//isMouseInGraph
npCanvas.prototype.isMouseInGraph=function(ele,mouse){
    var ctx=this.ctx;
    this.drawShape(ele,false);
    return  ctx.isPointInPath(mouse.x , mouse.y);
}
npCanvas.prototype.setStyle=function(){
    var style=this.style;
    if(style){
        for(var i in style){
            this.canvas.style[i]=style[i];
        }
    }
}
npCanvas.prototype.on=function(type,cb){
    if(!this._events[type])this._events[type]=[];
    this._events[type].push(cb);
    return this;
}
npCanvas.prototype.fire=function(){
    var _this=this;
    var args=Array.prototype.slice.call(arguments);
    var events=this._events[args[0]];
    var params=args.slice(1);
    if(events && events.length>0){
        events.forEach(function(event){
            event.apply(_this,params);
        })
    }
    return this;
}
npCanvas.prototype.unbind=function(type,cb){
    if(!type)return this._events={};
    var events=this._events[type];
    if(events && events.length>0){
        for(var i=0,n=events.length;i<n;i++){
            if(events[i]===cb){
                events.splice(i,-1);
                break;
            }
        }
    }
    this._events[type]=events;
    return this;
}
npCanvas.utils={};
npCanvas.utils.noop=function(){};
npCanvas.utils.isUndefined=function(val){
    return val!==undefined;
}
npCanvas.utils.extends=function(){
    var args=Array.prototype.slice.apply(arguments,[1]);
    var obj=arguments[0];
    for(var i=0,n=args.length;i<n;i++){
        var objTmp=args[i];
        for(var j in objTmp){
            obj[j]=objTmp[j];
        }
    }
    return this;
}
/**
 * 动画类型
 * t: current time（当前时间）；
 * b: beginning value（初始值）；
 * c: change in value（变化量）；
 * d: duration（持续时间）。
 * you can visit 'http://easings.net/zh-cn' to get effect
 */
npCanvas.utils.moveMode=function(type){
    var Tween = {
        Linear: function(t, b, c, d) { return c*t/d + b; },
        Quad: {
            easeIn: function(t, b, c, d) {
                return c * (t /= d) * t + b;
            },
            easeOut: function(t, b, c, d) {
                return -c *(t /= d)*(t-2) + b;
            },
            easeInOut: function(t, b, c, d) {
                if ((t /= d / 2) < 1) return c / 2 * t * t + b;
                return -c / 2 * ((--t) * (t-2) - 1) + b;
            }
        },
        Cubic: {
            easeIn: function(t, b, c, d) {
                return c * (t /= d) * t * t + b;
            },
            easeOut: function(t, b, c, d) {
                return c * ((t = t/d - 1) * t * t + 1) + b;
            },
            easeInOut: function(t, b, c, d) {
                if ((t /= d / 2) < 1) return c / 2 * t * t*t + b;
                return c / 2*((t -= 2) * t * t + 2) + b;
            }
        },
        Quart: {
            easeIn: function(t, b, c, d) {
                return c * (t /= d) * t * t*t + b;
            },
            easeOut: function(t, b, c, d) {
                return -c * ((t = t/d - 1) * t * t*t - 1) + b;
            },
            easeInOut: function(t, b, c, d) {
                if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
                return -c / 2 * ((t -= 2) * t * t*t - 2) + b;
            }
        },
        Quint: {
            easeIn: function(t, b, c, d) {
                return c * (t /= d) * t * t * t * t + b;
            },
            easeOut: function(t, b, c, d) {
                return c * ((t = t/d - 1) * t * t * t * t + 1) + b;
            },
            easeInOut: function(t, b, c, d) {
                if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
                return c / 2*((t -= 2) * t * t * t * t + 2) + b;
            }
        },
        Sine: {
            easeIn: function(t, b, c, d) {
                return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
            },
            easeOut: function(t, b, c, d) {
                return c * Math.sin(t/d * (Math.PI/2)) + b;
            },
            easeInOut: function(t, b, c, d) {
                return -c / 2 * (Math.cos(Math.PI * t/d) - 1) + b;
            }
        },
        Expo: {
            easeIn: function(t, b, c, d) {
                return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
            },
            easeOut: function(t, b, c, d) {
                return (t==d) ? b + c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
            },
            easeInOut: function(t, b, c, d) {
                if (t==0) return b;
                if (t==d) return b+c;
                if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
                return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
            }
        },
        Circ: {
            easeIn: function(t, b, c, d) {
                return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
            },
            easeOut: function(t, b, c, d) {
                return c * Math.sqrt(1 - (t = t/d - 1) * t) + b;
            },
            easeInOut: function(t, b, c, d) {
                if ((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
                return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
            }
        },
        Elastic: {
            easeIn: function(t, b, c, d, a, p) {
                var s;
                if (t==0) return b;
                if ((t /= d) == 1) return b + c;
                if (typeof p == "undefined") p = d * .3;
                if (!a || a < Math.abs(c)) {
                    s = p / 4;
                    a = c;
                } else {
                    s = p / (2 * Math.PI) * Math.asin(c / a);
                }
                return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
            },
            easeOut: function(t, b, c, d, a, p) {
                var s;
                if (t==0) return b;
                if ((t /= d) == 1) return b + c;
                if (typeof p == "undefined") p = d * .3;
                if (!a || a < Math.abs(c)) {
                    a = c;
                    s = p / 4;
                } else {
                    s = p/(2*Math.PI) * Math.asin(c/a);
                }
                return (a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b);
            },
            easeInOut: function(t, b, c, d, a, p) {
                var s;
                if (t==0) return b;
                if ((t /= d / 2) == 2) return b+c;
                if (typeof p == "undefined") p = d * (.3 * 1.5);
                if (!a || a < Math.abs(c)) {
                    a = c;
                    s = p / 4;
                } else {
                    s = p / (2  *Math.PI) * Math.asin(c / a);
                }
                if (t < 1) return -.5 * (a * Math.pow(2, 10* (t -=1 )) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
                return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p ) * .5 + c + b;
            }
        },
        Back: {
            easeIn: function(t, b, c, d, s) {
                if (typeof s == "undefined") s = 1.70158;
                return c * (t /= d) * t * ((s + 1) * t - s) + b;
            },
            easeOut: function(t, b, c, d, s) {
                if (typeof s == "undefined") s = 1.70158;
                return c * ((t = t/d - 1) * t * ((s + 1) * t + s) + 1) + b;
            },
            easeInOut: function(t, b, c, d, s) {
                if (typeof s == "undefined") s = 1.70158;
                if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
                return c / 2*((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
            }
        },
        Bounce: {
            easeIn: function(t, b, c, d) {
                return c - Tween.Bounce.easeOut(d-t, 0, c, d) + b;
            },
            easeOut: function(t, b, c, d) {
                if ((t /= d) < (1 / 2.75)) {
                    return c * (7.5625 * t * t) + b;
                } else if (t < (2 / 2.75)) {
                    return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
                } else if (t < (2.5 / 2.75)) {
                    return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
                } else {
                    return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
                }
            },
            easeInOut: function(t, b, c, d) {
                if (t < d / 2) {
                    return Tween.Bounce.easeIn(t * 2, 0, c, d) * .5 + b;
                } else {
                    return Tween.Bounce.easeOut(t * 2 - d, 0, c, d) * .5 + c * .5 + b;
                }
            }
        }
    };
    var arr_type=type.split('.');
    if(arr_type.length===1){
        return Tween[type];
    }else{
        arr_type.forEach(function(val){
            if(Tween[val])Tween=Tween[val];
        })
        return Tween;
    }
}
npCanvas.utils.requestAnimationFrame=(function(){
    var lastTime = 0;
    var vendors = ['webkit', 'moz'];
    var requestAnimationFrame=window.requestAnimationFrame;
    for(var x = 0; x < vendors.length && !requestAnimationFrame; ++x) {
      requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
    }

    if (!requestAnimationFrame) {
       requestAnimationFrame = function(callback, element) {
           var currTime = new Date().getTime();
           var timeToCall = Math.max(0, 16.7 - (currTime - lastTime));
           var id = setTimeout(function() {
               callback(currTime + timeToCall);
           }, timeToCall);
           lastTime = currTime + timeToCall;
           return id;
       };
    }
    return requestAnimationFrame.bind(window);
})();
npCanvas.utils.cancelAnimationFrame=(function(){
    var vendors = ['webkit', 'moz'];
    var cancelAnimationFrame=window.cancelAnimationFrame;
    for(var x = 0; x < vendors.length && !requestAnimationFrame; ++x) {
        cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }
    if (!cancelAnimationFrame) {
        cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
    }
    return cancelAnimationFrame.bind(window);
})();
npCanvas.utils.animate=function(obj){
    var opts={
        callback:npCanvas.utils.noop,
        duration:50,
        mode:'Linear',
        begin:0,
        changeVal:10
    };
    npCanvas.utils.extends(opts,obj);
    var arr_mode=opts.mode.split('.');
    var modeModeFn=npCanvas.utils.moveMode(opts.mode);
    var start=0;
    var _run=function(){
        start++;
        var percentRun=modeModeFn(start,opts.begin,opts.changeVal,opts.duration);
        opts.callback(percentRun);
        if(start>=opts.duration){
            start=null;
            opts=null;
            modeModeFn=null;
            _run=null;
        }else{
            npCanvas.utils.requestAnimationFrame(_run);
        }
    };
    _run();
}
/**
 * Circle 画圆
 * @params {Object} obj {x,y,r}
 * @params {Object} draws {strokeWidth,stroke,fill}
 * @returns {Object} {x,y,width,height,draws}
 */
npCanvas.Circle=function(obj,draws){
    this.shape='Circle';
    npCanvas.utils.extends(this,obj);
    if(!npCanvas.utils.isUndefined(this.x) || !npCanvas.utils.isUndefined(this.y) || !npCanvas.utils.isUndefined(this.r)){
        throw new Error('Circle函数需要输入x,y,r参数');
    }
    this.width=2*this.r;
    this.height=2*this.r;
    this.draws=draws;
    return this;
}
npCanvas.Circle.prototype.offset=function(offset){
    this.x+=offset.x;
    this.y+=offset.y;
    return this;
}
/**
 * Line 画线
 * @params {Object} obj
 */
npCanvas.Line=function(obj,draws){
    this.shape='Line';
    npCanvas.utils.extends(this,obj);
    if(!npCanvas.utils.isUndefined(this.x1) || !npCanvas.utils.isUndefined(this.y1) || !npCanvas.utils.isUndefined(this.x2) || !npCanvas.utils.isUndefined(this.y2)){
        throw new Error('Line函数需要输入x1、y1、x2、y2参数');
    }
    this.width=Math.abs(this.x1-this.x2);
    this.height=Math.abs(this.y1-this.y2);
    this.draws=draws;
    return this;
}
npCanvas.Line.prototype.offset=function(offset){
    this.x1=this.x1+offset.x;
    this.y1+=offset.y;
    this.x2+=offset.x;
    this.y2+=offset.y;
    return this;
}
/**
 * Rect 矩形
 * @params {Object} obj {x,y,width,height}
 */
 npCanvas.Rect=function(obj,draws){
     this.shape='Rect';
     npCanvas.utils.extends(this,obj);
     if(!npCanvas.utils.isUndefined(this.x) || !npCanvas.utils.isUndefined(this.y) || !npCanvas.utils.isUndefined(this.width) || !npCanvas.utils.isUndefined(this.height)){
         throw new Error('Rect函数需要输入x,y,width,height参数');
     }
     this.width=this.width;
     this.heigh=this.heigh;
     this.draws=draws;
     return this;
 }
 npCanvas.Rect.prototype.offset=function(offset){
     this.x+=offset.x;
     this.y+=offset.y;
     return this;
 }
window.npCanvas=npCanvas;
