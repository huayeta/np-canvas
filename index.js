"use strict";
/**
 * npCanvas
 * @author zhuhui
 */

var npCanvas=function(id,obj){
    this.id=id;
    if(obj)npCanvas.Utils.extends(this,obj);
    this.canvas=document.getElementById(this.id);
    //设置样式
    this.setStyle();
    this.ctx=this.canvas.getContext('2d');
    //得到canvas的位置
    this.canvasPos = this.getPos();
    // 所有形状的列表
    this.canvasList=[];
    // 形状的临时列表
    this.canvasList_tmp=[];
    // 拖拽
    this.drage();
    // 点击事件
    this._click();
    // 序号
    this._id=0;
    return this;
}
/**
 * Events 事件发射器
 */
npCanvas.Events=function(){
    return this;
}
npCanvas.Events.prototype.on=function(event,cb){
    this._events = this._events || {};
	this._events[event] = this._events[event]	|| [];
	this._events[event].push(cb);
    return this;
}
npCanvas.Events.prototype.fire=function(event /* , args... */){
    this._events = this._events || {};
    var args=Array.prototype.slice.call(arguments, 1);
	if( event in this._events === false  )	return;
	for(var i = 0,n=this._events[event].length; i <n ; i++){
		this._events[event][i].apply(this, args);
	}
    return this;
}
npCanvas.Events.prototype.off=function(event,cb){
    this._events = this._events || {};
	if( event in this._events === false  )	return;
	this._events[event].splice(this._events[event].indexOf(cb), 1);
    return this;
}
/**
 * Utils 工具函数
 */
npCanvas.Utils={};
npCanvas.Utils.noop=function(){};
npCanvas.Utils.isUndefined=function(){
    var args=Array.prototype.slice.apply(arguments);
    for(var i=0,n=args.length;i<n;i++){
        var val=args[i];
        if(val===undefined)return true;
    }
    return false;
}
npCanvas.Utils.extends=function(){
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
npCanvas.Utils.inherit=function(){
    var args=Array.prototype.slice.call(arguments);
    var parent=args[args.length-1];
    var objs=args.slice(0,-1);
    for(var i=0,n=objs.length;i<n;i++){
        npCanvas.Utils.extends(objs[i].prototype,parent.prototype);
    }
}
npCanvas.Utils.formUrl=function(url){
    if(!url)return Promise.reject(new Error('图片src不存在'));
    return new Promise(function(resolve,reject){
        var img=new Image();
        img.src=url;
        if(img.complete)return resolve(img);
        img.onload=function(){
            resolve(img);
        }
        img.onerror=function(){
            reject(new Error('图片加载失败'));
        }
    })
}
/**
 * 动画类型
 * t: current time（当前时间）；
 * b: beginning value（初始值）；
 * c: change in value（变化量）；
 * d: duration（持续时间）。
 * you can visit 'http://easings.net/zh-cn' to get effect
 */
npCanvas.Utils.moveMode=function(type){
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
npCanvas.Utils.requestAnimationFrame=(function(){
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
npCanvas.Utils.cancelAnimationFrame=(function(){
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
npCanvas.Utils.animate=function(obj){
    var opts={
        onChange:npCanvas.Utils.noop,
        onComplete:npCanvas.Utils.noop,
        duration:50,
        mode:'Linear',
        begin:0,
        changeVal:10
    };
    npCanvas.Utils.extends(opts,obj);
    var arr_mode=opts.mode.split('.');
    var modeModeFn=npCanvas.Utils.moveMode(opts.mode);
    var start=0;
    var _run=function(){
        start++;
        var percentRun=modeModeFn(start,opts.begin,opts.changeVal,opts.duration);
        opts.onChange(percentRun);
        if(start>=opts.duration){
            opts.onComplete();
            start=null;
            opts=null;
            modeModeFn=null;
            _run=null;
        }else{
            npCanvas.Utils.requestAnimationFrame(_run);
        }
    };
    _run();
}

npCanvas.Utils.inherit(npCanvas,npCanvas.Events);
// 获取canvas的位置和宽高信息
npCanvas.prototype.getPos=function(){
     this.canvasPos=this.canvas.getBoundingClientRect();
     return this.canvasPos;
}
// 设置宽度
npCanvas.prototype.setWidth=function(width){
    if(!width)return;
    this.canvas.setAttribute('width',width);
    this.getPos();
}
// 设置高度
npCanvas.prototype.setHeight=function(height){
    if(!height)return;
    this.canvas.setAttribute('height',height);
    this.getPos();
}
npCanvas.prototype.drage=function(){
    var _this=this;
    this.canvas.addEventListener('mousedown',function(e){
        var mouse={
            x:e.clientX-_this.canvasPos.left,
            y:e.clientY-_this.canvasPos.top
        };
        _this.canvasList.forEach(function(shape){
            // console.log(_this.isMouseInGraph(shape,mouse))
            if(_this.isMouseInGraph(shape,mouse)){
                if(_this.is_drage || shape.draws.is_drage){
                    _this.canvasList_tmp.push(shape);
                }
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
                        if(shape.offset){
                            shape.offset(offset);
                            _this.fire('object:move',{
                                originEvent:e,
                                target:shape,
                                mouse:mouse,
                                x:offset.x,
                                y:offset.y
                            });
                            shape.fire('shape:move',{
                                originEvent:e,
                                target:shape,
                                mouse:mouse,
                                x:offset.x,
                                y:offset.y
                            })
                            _this.renderAll();
                        }
                    }
                }
                var mouseup=function(e){
                    _this.fire('object:click',{
                        originEvent:e,
                        target:shape,
                        mouse:mouse
                    })
                    shape.fire('shape:click',{
                        originEvent:e,
                        target:shape,
                        mouse:mouse
                    })
                    shape.fire('shape:mouseup',{
                        originEvent:e,
                        target:shape,
                        mouse:mouse
                    })
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
npCanvas.prototype._click=function(){
    var _this=this;
    // 点击事件
    _this.canvas.addEventListener('click',function(e){
        // _this.fire('object:click',event);
    },false)
    // 鼠标移动事件
    _this.canvas.addEventListener('mousemove',function(e){
        _this.fire('object:mousemove',{
            originEvent:e
        });
        var mouse={
            x:e.clientX-_this.canvasPos.left,
            y:e.clientY-_this.canvasPos.top
        };
        _this.canvasList.forEach(function(shape){
            // console.log(_this.isMouseInGraph(shape,mouse))
            var is_mouse_in_graph=_this.isMouseInGraph(shape,mouse);
            // console.log(is_mouse_in_graph,mouse);
            if(is_mouse_in_graph){
                shape.fire('shape:mouseover',{
                    originEvent:e,
                    shape:shape,
                    mouse:mouse
                });
                shape.is_mouseover=true;
            }else if(shape.is_mouseover){
                shape.is_mouseover=false;
                shape.fire('shape:mouseleave',{
                    originEvent:e,
                    shape:shape,
                    mouse:mouse
                });
            }
        })
    },false)
}
// 画圆
npCanvas.prototype.Circle=function(ele){
    var opts={};
    npCanvas.Utils.extends(opts,ele);
    this.ctx.arc(opts.x,opts.y,opts.r,0,2*Math.PI);
    return this;
}
// 画弧线
npCanvas.prototype.Act=function(ele){
    var opts={};
    npCanvas.Utils.extends(opts,ele);
    // counterclockwise顺时针还是逆时针
    this.ctx.arc(opts.x,opts.y,opts.r,opts.startAngle,opts.endAngle*Math.PI,opts.counterclockwise);
    return this;
}
// 画线
npCanvas.prototype.Line=function(ele){
    var opts={};
    npCanvas.Utils.extends(opts,ele);
    var ctx=this.ctx;
    ctx.moveTo(opts.x1,opts.y1);
    ctx.lineTo(opts.x2,opts.y2);
    return this;
}
// 画矩形
npCanvas.prototype.Rect=function(ele){
    var opts={};
    npCanvas.Utils.extends(opts,ele);
    var ctx=this.ctx;
    if(opts.draws.radiusWidth){
        var x=opts.x;
        var y=opts.y;
        var width=opts.width;
        var height=opts.height;
        var radiusWidth=opts.draws.radiusWidth;
        ctx.lineJoin="round";
        ctx.moveTo(x+radiusWidth,y);
        ctx.lineTo(x+width-radiusWidth,y);
        ctx.arcTo(x+width,y,x+width,y+radiusWidth,radiusWidth);
        ctx.lineTo(x+width,y+height-radiusWidth);
        ctx.arcTo(x+width,y+height,x+width-radiusWidth,y+height,radiusWidth);
        ctx.lineTo(x+radiusWidth,y+height);
        ctx.arcTo(x,y+height,x,y+height-radiusWidth,radiusWidth);
        ctx.lineTo(x,y+radiusWidth);
        ctx.arcTo(x,y,x+radiusWidth,y,radiusWidth);
    }else{
        ctx.rect(opts.x,opts.y,opts.width,opts.height);
    }
    return this;
}
// 画text
npCanvas.prototype.Text=function(ele){
    var opts={};
    npCanvas.Utils.extends(opts,ele);
    var ctx=this.ctx;
    if(opts.draws.font){
        ctx.font=opts.draws.font;
        var fontSize;
        if(opts.draws.font.indexOf(' ')!=-1){
            fontSize=parseInt(opts.draws.font.split(' ')[0]);
        }else{
            fontSize=parseInt(opts.draws.font);
            // 默认字体sans-serif
            ctx.font=fontSize+'px sans-serif';
        }
        if(fontSize)ele.height=fontSize;
    }
    if(opts.draws.textAlign)ctx.textAlign=opts.draws.textAlign;
    if(opts.draws.textBaseline){
        ctx.textBaseline=opts.draws.textBaseline;
    }else{
        ele.textBaseline='alphabetic';
    }
    this.drawColor(ele.draws);
    if(ele.draws.backgroundColor){
        var padding=ele.draws.padding;
        if(!padding)padding=10;
        ctx.transform(1,0,0,1,padding,padding);
        ctx.fillStyle=ele.draws.backgroundColor;
    }
    aaa();
    // 有背景颜色
    if(ele.draws.backgroundColor){
        var padding=ele.draws.padding;
        if(!padding)padding=10;
        ctx.save();
        ctx.beginPath();
        ctx.transform(1,0,0,1,-padding,-padding);
        ctx.fillStyle=ele.draws.backgroundColor;
        ctx.fillRect(ele.x,ele.y+3,ele.width+padding*2,ele.height+padding*2);
        ctx.restore();
        ctx.fillStyle=ele.draws.fill;
        aaa();
    }
    function aaa(){
        if(ele.draws.maxWidth){
            // 绘制有最大宽度换行
            var maxWidth=ele.draws.maxWidth;
            var chr=opts.text.split('');
            var tmp='';
            var rows=[];
            chr.forEach(function(a){
                if(ctx.measureText(tmp).width<maxWidth){

                }else{
                    rows.push(tmp);
                    tmp='';
                }
                tmp+=a;
            })
            rows.push(tmp);
            rows.forEach(function(txt,index){
                if(ele.draws.stroke){
                    ctx.strokeText(txt,opts.x,opts.y+(index+1)*16);
                }else{
                    ctx.fillText(txt,opts.x,opts.y+(index+1)*16);
                }
            })
            ele.height=16*rows.length;
            ele.width=maxWidth;
        }else if(opts.text.indexOf('\n')!=-1){
            // 绘制\n换行符
            var chr=opts.text.split('\n');
            var width=0;
            chr.forEach(function(txt,index){
                if(ele.draws.stroke){
                    ctx.strokeText(txt,opts.x,opts.y+(index+1)*16);
                }else{
                    ctx.fillText(txt,opts.x,opts.y+(index+1)*16);
                }
                if(ctx.measureText(txt).width>width){
                    width=ctx.measureText(txt).width;
                }
            })
            ele.height=16*chr.length;
            ele.width=width;
        }else{
            ele.width=ctx.measureText(opts.text).width;
            if(ele.draws.stroke){
                ctx.strokeText(opts.text,opts.x,opts.y);
            }else{
                ctx.fillText(opts.text,opts.x,opts.y);
            }
            if(!ele.height)ele.height=12;
            ele.width=ctx.measureText(opts.text).width;
        }
    }
    return this;
}
// 二次贝塞尔曲线
npCanvas.prototype.QuadraticCurveTo=function(ele){
    var opts={};
    npCanvas.Utils.extends(opts,ele);
    var ctx=this.ctx;
    ctx.moveTo(opts.x1,opts.y1);
    ctx.quadraticCurveTo(opts.cpx,opts.cpy,opts.x2,opts.y2);
    return this;
}
// 三次贝塞尔曲线
npCanvas.prototype.BezierCurveTo=function(ele){
    var opts={};
    npCanvas.Utils.extends(opts,ele);
    var ctx=this.ctx;
    ctx.moveTo(opts.x1,opts.y1);
    ctx.bezierCurveTo(opts.cpx1,opts.cpy1,opts.cpx2,opts.cpy2,opts.x2,opts.y2);
    return this;
}
// 绘制图片
npCanvas.prototype.DrawImage=function(ele){
    var opts={};
    npCanvas.Utils.extends(opts,ele);
    var ctx=this.ctx;
    if(!opts.sx && !opts.width){
        ctx.drawImage(opts.image,opts.x,opts.y);
    }else if(!opts.sx && opts.width){
        ctx.drawImage(opts.image,opts.x,opts.y,opts.width,opts.height);
    }else if(opts.sx && opts.width){
        ctx.drawImage(opts.image,opts.sx,opts.sy,opts.swidth,opts.sheight,opts.x,opts.y,opts.width,opts.height);
    }
    return this;
}
// 绘制数组图形
npCanvas.prototype.drawShapes=function(lists){
    if(!lists)lists=this.canvasList;
    lists.forEach(this.drawShape,this);
}
npCanvas.prototype.drawShape=function(shape,is_drawColor){
    var ctx=this.ctx;
    ctx.save();
    ctx.beginPath();
    // 设置alpha
    this.alpha(shape.draws);
    // 中心点
    this.translate(shape.draws);
    //旋转角度
    this.rotate(shape);
    // transform
    this.transform(shape.draws);
    //绘制
    this[shape.shape]?this[shape.shape](shape):'';
    //上色
    if(is_drawColor!==false)this.drawColor(shape.draws);
    // ctx.closePath();
    ctx.restore();
    return this;
}
// 设置alpha
npCanvas.prototype.alpha=function(draws){
    var ctx=this.ctx;
    if(!npCanvas.Utils.isUndefined(draws.alpha)){
        ctx.globalAlpha=draws.alpha;
    }
    return this;
}
// 绘制颜色
npCanvas.prototype.drawColor=function(opts){
    if(opts.lineCap){
        // 设置直线两端的样式'butt,round,square'
        this.ctx.lineCap=opts.lineCap;
    }
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
// 中心点移动
npCanvas.prototype.translate=function(draws){
    var ctx=this.ctx;
    if(draws.translate){
        ctx.translate.apply(ctx,draws.translate.split(','));
    }
    return this;
}
// 旋转角度
npCanvas.prototype.rotate=function(shape){
    var ctx=this.ctx;
    if(shape.draws.angle){
        this.angle(shape);
    }else if(shape.draws.rotate){
        ctx.rotate(shape.draws.rotate*Math.PI/180);
    }
    return this;
}
// angle
npCanvas.prototype.angle=function(shape){
    var ctx=this.ctx;
    var angle=shape.draws.angle;
    var angleCenter=shape.draws.angleCenter;
    // console.log(shape.shape);
    if(angle){
        if(shape.shape=='Act' || shape.shape=='Circle'){
            ctx.translate(shape.x,shape.y);
            ctx.rotate(angle*Math.PI/180);
            ctx.translate(-(shape.x),-(shape.y));
        }else if(shape.shape=='Line'){
            ctx.translate(shape.x1+shape.width/2,shape.y1+shape.height/2);
            ctx.rotate(angle*Math.PI/180);
            ctx.translate(-(shape.x1+shape.width/2),-(shape.y1+shape.height/2));
        }else{
            if(angleCenter){
                ctx.translate(angleCenter.x,angleCenter.y);
            }else{
                ctx.translate(shape.x+shape.width/2,shape.y+shape.height/2);
            }
            ctx.rotate(angle*Math.PI/180);
            if(angleCenter){
                ctx.translate(-angleCenter.x,-angleCenter.y);
            }else{
                ctx.translate(-(shape.x+shape.width/2),-(shape.y+shape.height/2));
            }
        }
    }
    return this;
}
// transform
npCanvas.prototype.transform=function(draws){
    var ctx=this.ctx;
    if(draws.transform){
        ctx.transform.apply(ctx,draws.transform.split(','));
    }
    return this;
}
npCanvas.prototype.clear=function(){
    this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
    return this;
}
npCanvas.prototype.renderAll=function(){
    this.clear();
    this.drawShapes();
    return this;
}
npCanvas.prototype.add=function(){
    var _this=this;
    var args=Array.prototype.slice.apply(arguments);
    var tmp=[];
    if(_this.canvasList.length!==0){
        args.forEach(function(arg){
            var tx=true;
            _this.canvasList.forEach(function(shape){
                if(arg.id===shape.id){
                    tx=false;
                }
            },this)
            if(tx)tmp.push(arg);
        },this)
    }else{
        tmp=args;
    }
    this.canvasList=this.canvasList.concat(tmp);
    // console.log(this.canvasList.length);
    // this.drawShapes(args);
    return this;
}
npCanvas.prototype.remove=function(shape){
    var canvasList=this.canvasList;
    var tmp=[];
    canvasList.forEach(function(list){
        if(list.id!==shape.id){
            tmp.push(list);
        }
    })
    this.canvasList=tmp;
    // this.renderAll();
    return this;
}
npCanvas.prototype.removeAll=function(){
    this.canvasList=[];
    return this;
}
//isMouseInGraph
npCanvas.prototype.isMouseInGraph=function(ele,mouse){
    var ctx=this.ctx;
    switch (ele.shape) {
        case 'Text':
            var textBaseline=ele.draws.textBaseline;
            var y=ele.y;
            if(textBaseline=='top' || textBaseline=='hanging'){
                y=ele.y;
            }else if(textBaseline=='bottom' || textBaseline=='alphabetic'){
                y=ele.y-ele.height
            }else if(textBaseline=='middle'){
                y=ele.y-ele.height/2
            }
            var shape=new npCanvas.Rect({
                x:ele.x,
                y:y,
                width:ele.width,
                height:ele.height
            },ele.draws);
            this.drawShape(shape,false);
            break;
        case 'DrawImage':
            var shape=new npCanvas.Rect({
                x:ele.x,
                y:ele.y,
                width:ele.width,
                height:ele.height
            },ele.draws);
            this.drawShape(shape,false);
            break;
        case 'Line':
            var shape=new npCanvas.Rect({
                x:ele.x1,
                y:ele.y1-ele.draws.strokeWidth/2,
                width:Math.sqrt(Math.abs(Math.pow(ele.x2-ele.x1,2))+Math.abs(Math.pow(ele.y2-ele.y1,2))),
                height:ele.draws.strokeWidth,
            },{
                fill:'#000',
                angle:Math.atan2(ele.y2-ele.y1,ele.x2-ele.x1)*180/Math.PI,
                angleCenter:{
                    x:ele.x1,
                    y:ele.y1,
                }
            });
            this.drawShape(shape,false);
            break;
        default:
            this.drawShape(ele,false);
    }
    return  ctx.isPointInPath(mouse.x , mouse.y);
}
npCanvas.prototype.setStyle=function(obj){
    var style=obj || this.style;
    if(style){
        for(var i in style){
            this.canvas.style[i]=style[i];
        }
    }
}
// 导出canvas
npCanvas.prototype.toDataURL=function(min){
    var canvas=this.canvas;
    min=min || "images/jpeg"
    return canvas.toDataURL(min);
}
// 获取canvas的像素点
npCanvas.prototype.getImageData=function(x,y,width,height){
    var ctx=this.ctx;
    x=x||0;
    y=y||0;
    width=width|| this.canvasPos.width;
    height=height|| this.canvasPos.height;
    return ctx.getImageData(x,y,width,height);
}

/**
 * Object 对象
 */
npCanvas.Object=function(){
    this.shape='Object';
    this.width=0;
    this.height=0;
    this.draws={};
    return this;
}
npCanvas.Utils.inherit(npCanvas.Object,npCanvas.Events);
npCanvas.Object.prototype.offset=function(){
    this.x+=offset.x;
    this.y+=offset.y;
    return this;
}

/**
 * Circle 画圆
 * @params {Object} obj {x,y,r}
 * @params {Object} draws {strokeWidth,stroke,fill}
 * @returns {Object} {x,y,width,height,draws}
 */
 var id=0;
npCanvas.Circle=function(obj,draws){
    this.shape='Circle';
    npCanvas.Utils.extends(this,obj);
     if(!draws)draws={};
    if(npCanvas.Utils.isUndefined(this.x,this.y,this.r)){
        throw new Error('Circle函数需要输入x,y,r参数');
    }
    this.width=2*this.r;
    this.height=2*this.r;
    this.draws=draws;
    this.id=++id;
    return this;
}
npCanvas.Utils.inherit(npCanvas.Circle,npCanvas.Object);
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
    npCanvas.Utils.extends(this,obj);
     if(!draws)draws={};
    if(npCanvas.Utils.isUndefined(this.x1,this.y1,this.x2,this.y2)){
        throw new Error('Line函数需要输入x1、y1、x2、y2参数');
    }
    this.width=Math.abs(this.x1-this.x2);
    this.height=Math.abs(this.y1-this.y2);
    this.draws=draws;
    this.id=++id;
    return this;
}
npCanvas.Utils.inherit(npCanvas.Line,npCanvas.Object);
npCanvas.Line.prototype.offset=function(offset){
    this.x1=this.x1+offset.x;
    this.y1+=offset.y;
    this.x2+=offset.x;
    this.y2+=offset.y;
    return this;
}
/**
 * Rect 矩形
 * @params1 {Object} obj {x,y,width,height}
 */
 npCanvas.Rect=function(obj,draws){
     this.shape='Rect';
     npCanvas.Utils.extends(this,obj);
      if(!draws)draws={};
     if(npCanvas.Utils.isUndefined(this.x,this.y,this.width,this.height)){
         throw new Error('Rect函数需要输入x,y,width,height参数');
     }
     this.width=this.width;
     this.height=this.height;
     this.draws=draws;
     this.id=++id;
     return this;
 }
 npCanvas.Utils.inherit(npCanvas.Rect,npCanvas.Object);
 npCanvas.Rect.prototype.offset=function(offset){
     this.x+=offset.x;
     this.y+=offset.y;
     return this;
 }
 /**
  * Rect 文字
  * @params {Object} obj {x,y,width,height}
  */
  npCanvas.Text=function(obj,draws){
      this.shape='Text';
      npCanvas.Utils.extends(this,obj);
      if(!draws)draws={};
      if(npCanvas.Utils.isUndefined(this.x,this.y,this.text)){
          throw new Error('Text函数需要输入x,y,text');
      }
      this.draws=draws;
      this.id=++id;
      return this;
  }
  npCanvas.Utils.inherit(npCanvas.Text,npCanvas.Object);
  npCanvas.Text.prototype.offset=function(offset){
      this.x+=offset.x;
      this.y+=offset.y;
      return this;
  }
  /**
   * Arc 创建弧线
   * @params {Object} obj {x,y,r,startAngle,endAngle,counterclockwise}
   */
npCanvas.Act=function(obj,draws){
   this.shape='Act';
   npCanvas.Utils.extends(this,obj);
   if(!draws)draws={};
   if(npCanvas.Utils.isUndefined(this.x,this.y,this.r,this.startAngle,this.endAngle)){
       throw new Error('Arc函数需要输入x,y,r,startAngle,endAngle');
   }
   if(this.counterclockwise===undefined)this.counterclockwise=false;// 顺时针
   this.width=this.height=this.r*2;
   this.draws=draws;
   this.id=++id;
   return this;
}
npCanvas.Utils.inherit(npCanvas.Act,npCanvas.Object);
npCanvas.Act.prototype.offset=function(offset){
   this.x+=offset.x;
   this.y+=offset.y;
   return this;
}
/**
 * QuadraticCurveTo 创建二次贝塞尔曲线
 * @params {Object} obj {cpx,cpy,x1,y1,x2,y2}
 */
npCanvas.QuadraticCurveTo=function(obj,draws){
    this.shape='QuadraticCurveTo';
    npCanvas.Utils.extends(this,obj);
    if(!draws)draws={};
    if(npCanvas.Utils.isUndefined(this.x1,this.y1,this.x2,this.y2,this.cpx,this.cpy)){
        throw new Error('QuadraticCurveTo函数需要输入x1,y1,x2,y2,cpx,cpy');
    }
    this.draws=draws;
    this.id=++id;
    return this;
}
npCanvas.Utils.inherit(npCanvas.QuadraticCurveTo,npCanvas.Object);
npCanvas.QuadraticCurveTo.prototype.offset=function(offset){
    this.x1+=offset.x;
    this.x2+=offset.x;
    this.cpx+=offset.x;
    this.y1+=offset.y;
    this.y2+=offset.y;
    this.cpy+=offset.y;
    return this;
}
/**
 * BezierCurveTo 创建三次贝塞尔曲线
 * @params {Object} obj {x1,y1,cpx1,cpy1,cpx2,cpy2,x2,y2}
 */
 npCanvas.BezierCurveTo=function(obj,draws){
     this.shape='BezierCurveTo';
     npCanvas.Utils.extends(this,obj);
     if(!draws)draws={};
     if(npCanvas.Utils.isUndefined(this.x1,this.y1,this.x2,this.y2,this.cpx1,this.cpy1,this.cpx2,this.cpy2)){
         throw new Error('QuadraticCurveTo函数需要输入x1,y1,x2,y2,cpx1,cpy1,cpx2,cpx2');
     }
     this.draws=draws;
     this.id=++id;
     return this;
 }
 npCanvas.Utils.inherit(npCanvas.BezierCurveTo,npCanvas.Object);
 npCanvas.BezierCurveTo.prototype.offset=function(offset){
     this.x1+=offset.x;
     this.x2+=offset.x;
     this.cpx1+=offset.x;
     this.cpx2+=offset.x;
     this.y1+=offset.y;
     this.y2+=offset.y;
     this.cpy1+=offset.y;
     this.cpy2+=offset.y;
     return this;
 }
/**
 * DrawImage 绘制图像
 * @params {Object} obj {x,y,image[,width][,height][,sx][,sy][,swidth][,sheight]}
 */
npCanvas.DrawImage=function(obj,draws){
    this.shape='DrawImage';
    npCanvas.Utils.extends(this,obj);
    if(!draws)draws={};
    if(npCanvas.Utils.isUndefined(this.x,this.y,this.image)){
        throw new Error('DrawImage函数需要输入x,y,image');
    }
    this.width=this.image.width;
    this.height=this.image.height;
    this.draws=draws;
    this.id=++id;
    return this;
}
npCanvas.Utils.inherit(npCanvas.DrawImage,npCanvas.Object);
npCanvas.DrawImage.prototype.offset=function(offset){
    this.x+=offset.x;
    this.y+=offset.y;
    return this;
}
window.npCanvas=npCanvas;
