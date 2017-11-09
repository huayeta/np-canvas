/**
 * @author zhuhui
 */
;(function(w){
    var DrawGif=function(opts){
        opts=opts || {};
        if(!opts.id)return console.log('不存在id');
        if(!opts.imgs || opts.imgs.length==0)return console.log('imgs不能为空');
        this.opts=opts;
        this.canvas=document.getElementById(opts.id);
        this.ctx=this.canvas.getContext('2d');
        this.imgs=opts.imgs || [];
    }
    DrawGif.prototype.getImg=function(url){
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
    DrawGif.prototype.clear=function(){
        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
    }
    DrawGif.prototype.drawImage=function(img){
        var ctx=this.ctx;
        this.clear();
        ctx.drawImage(img,0,0);
        return this;
    }
    DrawGif.prototype.drawOne=function(){
        var _this=this;
        var img0=this.opts.imgs[0];
        this.getImg(img0).then(function(img){
            _this.imgs[0]=img;
            _this.drawImage(img);
        });
    }
    DrawGif.prototype.drawStart=function(){
        var _this=this;
        var index=0;
        var imgs=_this.imgs;
        setInterval(function(){
            index++;
            _this.drawImage(imgs[index]);
            if(index==imgs.length-1)index=0;
        },40)
    }
    DrawGif.prototype.draw=function(){
        var _this=this;
        var length=1;
        for(var i=1;i<_this.opts.imgs.length;i++){
            (function(index){
                _this.getImg(_this.opts.imgs[index]).then(function(img){
                    _this.imgs[index]=img;
                    length++;
                    if(length==_this.opts.imgs.length)_this.drawStart();
                }).catch(function(){
                    length++;
                })
            })(i)
        }
    }
    w.DrawGif=DrawGif;
})(window)
