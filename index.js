var npCanvas=function(id){
    var _this=this;
    this.id=id;
    this.canvas=document.getElementById(this.id);
    this.ctx=this.canvas.getContext('2d');
    this.canvasPos = this.canvas.getBoundingClientRect();
    this.canvasList=[];
    this.canvasList_tmp=[];
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
                        shape.set(offset);
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
    args.forEach(function(shape){
        _this[shape.shape]?_this[shape.shape](shape):'';
        _this.draws(shape.draws);
    })
}
npCanvas.prototype.clear=function(){
    this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
}
npCanvas.prototype.renderAll=function(){
    var _this=this;
    this.clear();
    this.canvasList.forEach(function(shape){
        _this[shape.shape]?_this[shape.shape](shape):'';
        _this.draws(shape.draws);
    })
}
// 画圆
npCanvas.prototype.Circle=function(ele){
    var opts={};
    npCanvas.utils.extends(opts,ele);
    this.ctx.beginPath();
    this.ctx.arc(opts.x,opts.y,opts.r,0,2*Math.PI);
    this.ctx.closePath();
    return this;
}
// 画线
npCanvas.prototype.Line=function(ele){
    var opts={};
    npCanvas.utils.extends(opts,ele);
    var ctx=this.ctx;
    var start=opts.start.split(',');
    var end=opts.end.split(',');
    ctx.beginPath();
    ctx.moveTo(start[0],start[1]);
    ctx.lineTo(end[0],end[1]);
    ctx.closePath();
    return this;
}
//isMouseInGraph
npCanvas.prototype.isMouseInGraph=function(ele,mouse){
    this[ele.shape]?this[ele.shape](ele):'';
    return  this.ctx.isPointInPath(mouse.x , mouse.y);
}
npCanvas.prototype.draws=function(opts){
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
npCanvas.utils={};
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
npCanvas.Circle.prototype.set=function(offset){
    this.x=this.x+offset.x;
    this.y=this.y+offset.y;
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
npCanvas.Line.prototype.set=function(offset){
    this.x1+=offset.x;
    this.y1+=offset.y;
    this.x2+=offset.x;
    this.y2+=offset.y;
    return this;
}
window.npCanvas=npCanvas
