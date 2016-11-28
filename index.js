var npCanvasUtils=function(id){
    var _this=this;
    this.id=id;
    this.canvas=document.getElementById(this.id);
    this.ctx=this.canvas.getContext('2d');
    return this;
}
/**
 * Circle 画圆
 * @params {Object} obj {x,y,r,strokeWidth,stroke,fill}
 */
npCanvasUtils.prototype.Circle=function(obj){
    var opts={};
    this.extends(opts,obj);
    if(!opts.x || !opts.y || !opts.r){
        throw new Error('Circle函数需要输入x,y,r参数');
    }
    this.ctx.beginPath();
    this.ctx.arc(opts.x,opts.y,opts.r,0,2*Math.PI);
    this.draws(opts);
    return this;
}
/**
 * Line 画线
 * @params {Object} obj
 */
npCanvasUtils.prototype.Line=function(x1,y1,x2,y2,obj){
    var opts={};
    this.extends(opts,obj);
    if(!x1 || !y1 || !x2 || !y2){
        throw new Error('Line函数需要输入x1,y1,x2,y2参数');
    }
    var ctx=this.ctx;
    ctx.beginPath();
    ctx.moveTo(x1,y1);
    ctx.lineTo(x2,y2);
    ctx.draws(opts);
    return this;
}
npCanvasUtils.prototype.draws=function(opts){
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
npCanvasUtils.prototype.isTrue=function(){
    return ;
}
npCanvasUtils.prototype.extends=function(){
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
window.npCanvasUtils=npCanvasUtils
