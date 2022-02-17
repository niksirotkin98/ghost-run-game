
const PI = Math.PI,
    sin = Math.sin,
    cos = Math.cos,
    round = Math.round,
    random = Math.random,
    abs = Math.abs,
    asin = Math.asin,
    acos = Math.acos,
    atan = Math.atan;

class VECTOR{
    constructor(x,y){
        return this.setValue(x?x:0,y?y:0);
    }

    setValue(x,y){
        this.x = x; this.y = y; return this;
    }

    move(dx,dy){
        this.x += dx; this.y += dy; return this;
    }

    moveV(v){
        this.x += v.x; this.y += v.y; return this;
    }

    setV(v){
        this.x = v.x; this.y = v.y; return this;
    }

    len(){
        this.l = (this.x**2 + this.y**2)**0.5;
        return this.l;
    }

    sum(v){
        return new VECTOR(this.x+v.x, this.y+v.y);
    }

    getAngle(){
        let s = this.y / this.len(),
            c = this.x / this.l,
            as = asin(s),
            ac = acos(c);
        this.angle = as>0? ac: 2*PI - ac;
        return this.angle;
    }

    sub(v){
        return new VECTOR(this.x-v.x, this.y-v.y);
    }

    mul(k){
        return new VECTOR(this.x*k, this.y*k);
    }

    mul2(x,y){
        return new VECTOR(this.x*x, this.y*y);
    }

    mulV(v){
        return this.x*v.x+this.y*v.y;
    }

    mulV2(v){
        return this.mul2(v.x,v.y);
    }

    proj(v){
        return this.mulV(v)/v.len();
    }

    cos(v){
        return this.mulV(v)/(this.len()*v.len());
    }

    getSelf(){  return new VECTOR(this.x,this.y); }

    get width(){
        return this.x;
    }
    get height(){
        return this.y;
    }
}
function V(x,y){ return new VECTOR(x,y);}

class BOX{
    type = 'unknown'

    constructor(x,y, type){
        this.coords = new VECTOR(x,y);
        if(type) this.type = type;
        return this;
    }

    move(x,y){ this.coords.move(x,y); return this; }

    setCoords(x,y){ this.coords.setValue(x,y); return this; }
    setV(v){ this.coords.setV(v); return this; }

    setType(type){ this.type = type; return this; }
    
    get x(){ return this.coords.x; }
    get y(){ return this.coords.y; }
    get width(){ return this.dimensions.x; }
    get height(){ return this.dimensions.x; }
    get w(){ return this.dimensions.x; }
    get h(){ return this.dimensions.x; }
    get width2(){ return this.dimensions2.x; }
    get height2(){ return this.dimensions2.x; }
    get w2(){ return this.dimensions2.x; }
    get h2(){ return this.dimensions2.x; }
    get width2m(){ return this.dimensions2m.x; }
    get height2m(){ return this.dimensions2m.x; }
    get w2m(){ return this.dimensions2m.x; }
    get h2m(){ return this.dimensions2m.x; }
}

class CVROBJECT{
    root = false;
    z=0;

    constructor(){}

    setLink(link, ...args){
        this.link = link;
        this.linkArgs = args;
        this.linkUpdate = this.linkUpdateFunction;
        return this;
    }
    linkUpdate(){};
    linkUpdateFunction(){
        for(let i of this.linkArgs){
            this[i.to] = this.link[i.from];
        };
    }
    setZ(z){
        this.z = z;
    }
    setCoords(v){
        this.coords = v.getSelf();
        return this;
    }
    setDimensions(v){
        this.dimensions = v.getSelf();
        this.dimensions2 = v.mul(0.5);
        this.dimensions2m = v.mul(-0.5);
        return this;
    }
    setAngle(a){
        this.angle = a;
        return this;
    }
    setAnchor(v){
        this.anchor = v.getSelf();
        return this;
    }
    setScale(v){
        this.scale = v.getSelf();
        return this;
    }
    setFilter(filter){
        this.filter = filter;
        return this;
    }
    setBlur(i){
        this.filter = i<=0?'none':`blur(${round(100*i)/100}px)`;
        return this;
    }

    get x(){ return this.coords.x; }
    get y(){ return this.coords.y; }
    get width(){ return this.dimensions.x; }
    get height(){ return this.dimensions.x; }
    get w(){ return this.dimensions.x; }
    get h(){ return this.dimensions.x; }
    get width2(){ return this.dimensions2.x; }
    get height2(){ return this.dimensions2.x; }
    get w2(){ return this.dimensions2.x; }
    get h2(){ return this.dimensions2.x; }
    get width2m(){ return this.dimensions2m.x; }
    get height2m(){ return this.dimensions2m.x; }
    get w2m(){ return this.dimensions2m.x; }
    get h2m(){ return this.dimensions2m.x; }
}

class CVISUAL extends CVROBJECT{
    root = false;
    constructor(isrc, imageName, x, y, width, height, anchor, scale, angle, filter){
        super();

        this.isrc = isrc;
        this.image = this.isrc.getImage(imageName);

        this.setCoords(V(x,y));
        this.setDimensions(V(width,height));
        this.setAngle(angle || 0);
        this.setScale(scale || V(1,1));
        this.setFilter(filter || 'none');
        this.setAnchor(anchor || V(0,0));
        this.imageName = imageName;
        this.ct = 0;
        return this;
    }
    setImage(imageName){
        this.image = this.isrc.getImage(imageName);
        this.imageName = imageName;
        return this;
    }
    draw(ctx, v0){
        this.setImage(this.imageName);
        if(this.isrc.images.get(this.imageName)){
            this.draw = this.drawFunction;
        }else if(this.image){
            this.drawFunction(ctx,v0);
        }
    }
    drawFunction(ctx,v0, showImages, showLines){
        if(!showImages) return;
        let storedTransform = ctx.getTransform(), storedFilter = ctx.filter,
            o = this,
            xy = v0.sum(o.coords).sum(o.anchor).mul2(1,-1);
    
        ctx.translate(xy.x,xy.y);
        ctx.scale(o.scale.x,o.scale.y);
        ctx.rotate(o.angle);
        ctx.filter = o.filter;
        ctx.drawImage(o.image,o.dimensions2m.x,o.dimensions2m.y,o.dimensions.width,o.dimensions.height);

        ctx.setTransform(storedTransform);
        ctx.filter = storedFilter;
    }
}

class CLINE extends CVROBJECT{
    root = false;
    line = true;
    constructor(from, to, color, anchor, scale, angle, filter){
        super();

        this.setCoords(from);
        this.to = to;
        this.setDimensions(V(1,1));
        this.setAngle(angle || 0);
        this.setScale(scale || V(1,1));
        this.setFilter(filter || 'none');
        this.setAnchor(anchor || V(0,0));
        this.color = color || 'green'
        this.ct = 0;
        this.l = this.len();
        return this;
    }
    len(){
        return this.to.sub(this.coords).len();
    }
    update(dt){
        this.l = this.len();
    }
    draw(ctx,v0, showImages, showLines){
        if(!showLines) return;
        let storedTransform = ctx.getTransform(), storedFilter = ctx.filter,
            o = this,
            xy = v0.sum(o.coords).sum(o.anchor).mul2(1,-1),
            to = this.to.sub(this.coords);
    
        ctx.translate(xy.x,xy.y);
        ctx.scale(o.scale.x,o.scale.y);
        ctx.rotate(o.angle);
        ctx.filter = o.filter;
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.moveTo(0,0);
        ctx.lineTo(to.x,-to.y);
        ctx.closePath();
        ctx.stroke();

        ctx.setTransform(storedTransform);
        ctx.filter = storedFilter;
    }
}

class CROOT extends CVROBJECT{
    root = true;
    constructor(x, y, width, height, scale, angle, filter, anchor){
        super();

        this.setCoords(V(x,y));
        this.setDimensions(V(width||0,height||0));
        this.setAngle(angle || 0);
        this.setScale(scale || V(1,1));
        this.setFilter(filter || 'none');
        this.setAnchor(V(0,0));
        this.ct = 0;
        this.images = [];
        return this;
    }
    addImage(cvisual){
        this.images.push(cvisual);
        return this;
    }
    linkUpdate(){
        if(this.link) super.linkUpdateFunction();
        for(let i of this.images) i.linkUpdate();
    }
    linkUpdateFunction(){
        super.linkUpdateFunction();
        for(let i of this.images) i.linkUpdate();
    }
    draw(ctx,v0){
        let storedTransform = ctx.getTransform(), storedFilter = ctx.filter,
            o = this,
            xy = v0.sum(o.coords).sum(o.anchor).mul2(1,-1);
    
        
        ctx.translate(v0,v0);
        ctx.rotate(o.angle);
        ctx.translate(-v0,-v0);
        ctx.translate(xy.x,xy.y);
        ctx.scale(o.scale.x,o.scale.y);
        ctx.filter = o.filter;
        
        for(let i of this.images){
            i.draw(ctx, V(0,0));
        }

        ctx.setTransform(storedTransform);
        ctx.filter = storedFilter;
    }
}

class CCAMERA extends CVROBJECT{
    constructor(canvas, x, y, screen, scale, angle, filter, anchor){
        super();
        this.setScreen(screen);
        this.setCanvas(canvas);
        this.setCoords(V(x,y));
        this.setAngle(angle || 0);
        this.setScale({x,y}=scale || 1,1);
        this.setFilter(filter || 'none');
        this.setAnchor(V(0,0));
        this.images = [];
        this.showLines = true;
        this.showImages = true;
    }
    linkUpdate(){
        super.linkUpdate();

        for(let i of this.images) i.linkUpdate();
    }
    addImage(cvisual){
        this.images.push(cvisual);
        return this;
    }
    setScreen(s){
        this.screen = s;
        return this;
    }
    setCanvas(c){
        this.canvas = c;
        return this;
    }
    setAngle(aInDegrees){
        super.setAngle(aInDegrees*PI*0.00555);
    }
    setScale(x,y){
        if(!y){
            super.setScale(V(x,x));
        }else super.setScale(V(x,y));
        return this;
    }
    draw(){
        let ctx = this.canvas.getContext('2d');

        ctx.resetTransform();
        ctx.clearRect(0,0,this.screen.w, this.screen.h);

        ctx.translate(this.screen.w2,this.screen.h2);
        ctx.rotate(this.angle); 
        ctx.translate(this.screen.w2m,this.screen.h2m);
        ctx.scale(this.scale.x,this.scale.y);
        ctx.filter = this.filter;

        let screenScaledDimensions = this.screen.dimensions2.mul2(1/this.scale.x,1/this.scale.y),
            cam0 = screenScaledDimensions.sub(this.coords).mul2(1,-1),
            a1 = this.coords.mul2(1,-1).sub(screenScaledDimensions),
            a2 = this.coords.mul2(1,-1).sum(screenScaledDimensions);

            let realImages = this.images.filter((v)=>{
                if(v.root)return true;
                let xy = v.coords.sum(v.anchor);
                return ((xy.x >= a1.x - v.dimensions2.x)
                        && (xy.x <= a2.x + v.dimensions2.x)
                        && (xy.y >= a1.y - v.dimensions2.y)
                        && (xy.y <= a2.y + v.dimensions2.y));
            });

            realImages.sort((v1,v2)=>(v2.y-v2.z) - (v1.y-v1.z));
            realImages.every((value)=>{
                value.draw(ctx,cam0, this.showImages, this.showLines);
                return true;
            })
            ctx.filter = "none";
    }
}

class IMAGESRC{
    constructor(imagesList){
        this.images = new Map();
        this.countOfLoaded = 0;
        this.countOfAll = 0;
        this.addImage('./src/img/outline.png','outline');

        if(imagesList)
            for(let i of imagesList) this.addImage(i.url, i.name);
    }
    addImage(imageUrl, name){
        let i = new Image(),
            error = function(e){
                console.log('load error:',imageUrl);
                this.countOfAll--;
            },
            load = function(e){
                this.images.set(name,i);
                this.countOfLoaded++;
                console.log(`load:${name}('${imageUrl}') ${this.countOfLoaded}/${this.countOfAll}`);
            };
        
        this.countOfAll++;

        load = load.bind(this);
        error = error.bind(this);
        i.addEventListener('load',load, false);
        i.addEventListener('error',error, false);

        i.src = imageUrl;
        return this;
    }
    getImage(name){
        return this.images.get(name) || this.images.get('outline');
    }
    getCVISUAL(...args){
        return new CVISUAL(this, ...args);
    }
}

class SCREEN{
    x = 1;
    constructor(canvas){
        this.canvas = canvas;
        this.update();
        this.onresize = this.onresize.bind(this);
        window.addEventListener('resize', this.onresize);
    }
    update(){
        this.setDimensions(V(this.canvas.clientWidth*this.x,this.canvas.clientHeight*this.x));
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
    }
    setDimensions(v){
        this.dimensions = v.getSelf();
        this.dimensions2 = v.mul(0.5);
        this.dimensions2m = v.mul(-0.5);
        return this;
    }
    onresize(e){
        this.update();
    }

    get width(){ return this.dimensions.x; }
    get height(){ return this.dimensions.y; }
    get w(){ return this.dimensions.x; }
    get h(){ return this.dimensions.y; }
    get width2(){ return this.dimensions2.x; }
    get height2(){ return this.dimensions2.y; }
    get w2(){ return this.dimensions2.x; }
    get h2(){ return this.dimensions2.y; }
    get width2m(){ return this.dimensions2m.x; }
    get height2m(){ return this.dimensions2m.y; }
    get w2m(){ return this.dimensions2m.x; }
    get h2m(){ return this.dimensions2m.y; }
}

class VROBJECT{
    translate = new VECTOR(0,0);
    scale = new VECTOR(1,1);
    dimensions = false;
    origin = false;
    blur = 0;
    z_index = 0;
    rAngle = 0;

    visual = null;

    linkFunction = function(){
        this.coords.setV(this.link.coords.getSelf());
    }

    constructor(x,y){
        this.coords = new VECTOR(x,y);
    }

    linkUpdate(){
        if(this.link && this.linkFunction) this.linkFunction();
    }

    setCoords(v){
        this.coords = v.getSelf();
        return this;
    }

    setParent(parent){
        if(this.visual) parent.appendChild(this.visual);
        return this;
    }

    setLink(link){
        this.link = link;
        return this;
    }

    remove(){
        if(this.visual) this.visual.remove();
        return this;
    }

    move(dx,dy){
        this.coords.move(dx,dy);
        return this;
    }

    setDimensions(w,h){
        this.dimensions = new VECTOR(w,h); return this;
    }

    setAngle(i){
        this.rAngle = i; return this;
    }

    setZindex(i){
        this.z_index = i; return this;
    }

    setScale(sx,sy){
        this.scale = sy? new VECTOR(sx,sy): new VECTOR(sx,sx); return this;
    }

    setTranslate(x,y){
        this.translate = y? new VECTOR(x,y): new VECTOR(x,x); return this;
    }

    setOrigin(x,y){
        if(!this.origin) this.origin = new VECTOR(0,0);
        this.origin.setValue(x,y); return this;
    }

    setBlur(i){
        this.blur = i;
        return this;
    }

    draw(){
        this.visual.style.left = (this.x) + 'px';
        this.visual.style.top = (-this.y) + 'px';
        this.visual.style.transform = `translate(${this.translate.x}px,${this.translate.y}px)`
            + ` scale(${this.scale.x},${this.scale.y})`
            + ` rotate(${this.rAngle}deg)`;
        if(this.origin) this.visual.style.transformOrigin = `${this.origin.x}px ${this.origin.y}px`;
        if(this.dimensions) {
            this.visual.style.width = this.dimensions.x+'px';
            this.visual.style.height = this.dimensions.y+'px';
        }
        this.visual.style.zIndex = this.z_index;
        this.visual.style.filter = `blur(${this.blur}px)`;
        return this;
    }

    get x(){ return this.coords.x; }
    get y(){ return this.coords.y; }
    get width(){ return this.dimensions.x; }
    get height(){ return this.dimensions.x; }
    get w(){ return this.dimensions.x; }
    get h(){ return this.dimensions.x; }
    get width2(){ return this.dimensions2.x; }
    get height2(){ return this.dimensions2.x; }
    get w2(){ return this.dimensions2.x; }
    get h2(){ return this.dimensions2.x; }
    get width2m(){ return this.dimensions2m.x; }
    get height2m(){ return this.dimensions2m.x; }
    get w2m(){ return this.dimensions2m.x; }
    get h2m(){ return this.dimensions2m.x; }
}

class ROOT extends VROBJECT{
    childrenList = [];

    constructor(x,y){
        super(x,y);

        let c = document.createElement("div");

        c.classList.add("object");

        this.visual = c;
        return this;
    }

    addChild(child){
        this.childrenList.push(child);
        child.setParent(this.visual);
        return this;
    }

    linkUpdate(){
        super.linkUpdate();

        this.childrenList.every((child)=>{child.linkUpdate(); return true;});
        return this;
    }

    draw(){
        super.draw();
        this.childrenList.every((child)=>{child.draw(); return true;});
        return this;
    }

    countZIndex(){
        this.childrenList.sort(({link:{coords:c1}},{link:{coords:c2}})=>c2.y-c1.y);
        
        let z = this.z_index;
        this.childrenList.forEach((child)=>{child.setZindex(z); z++;});

        return this;
    }
}

class VISUAL extends VROBJECT{
    constructor(x,y,imageName){
        super(x,y);

        let i = document.createElement("img");

        this.imgUrl = IMAGE_URL_LIST[imageName] || IMAGE_URL_LIST.unknown;

        i.src = this.imgUrl;
        i.classList.add("object");

        this.visual = i;
        this.setCoords(new VECTOR(x,y));
        return this;
    }
}

class GRAPH{
    constructor(x,y, width, height, parent){
        this.dimensions = new VECTOR(width, height);

        let d = new ROOT(x,y),
            s = `<svg class="graph" viewBox="0 0 ${100} ${100}" xmlns="http://www.w3.org/2000/svg"></line></svg>\n`;
        
        d.visual.innerHTML = s;
        s = d.visual.querySelector('svg');
        d.visual.remove(s);

        let svg = new VROBJECT(0,0);
        svg.visual = s;
        svg.setDimensions(width, height)
        d.addChild(svg);

        if(parent) d.setParent(parent);

        this.svg = svg;
        this.root = d;
    }

    draw(array){
        let max = array[0].getSelf(), 
            min = array[0].getSelf(),
            s = "";
        
        array.every((value)=>{
            max.x = value.x>max.x?value.x:max.x;
            max.y = value.y>max.y?value.y:max.y;
            min.x = value.x<min.x?value.x:min.x;
            min.y = value.y<min.y?value.y:min.y;
            return true;
        })

        let d = max.sub(min);

        let b = array.map((value)=>{
            let i = new VECTOR(d.x==0?0:(value.x - min.x)/d.x, d.y==0?0:(value.y - min.y)/d.y);
            return i;
        })

        b.sort((v1,v2)=>v1.x-v2.x);

        for(let i=1; i<b.length; i++){
            let x1 = b[i-1].x*100,
                y1 = 100*(1 - b[i-1].y),
                x2 = b[i].x*100,
                y2 = 100*(1 - b[i].y),
                line = `<line id="line${i}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" style="stroke:white;stroke-width:2"></line>\n`;
            s += line;
        }
        this.svg.visual.innerHTML = s;
    }
}

class CAMERA extends BOX{
    coords = new VECTOR(0,0);
    target = null;
    averageSpeed = 20;
    chaseState = false;
    chaseType = 'direct';
    chase = null;

    chaseMethods = {
        direct : function(newCoords){ this.coords.setV(newCoords); },
        average : function(selfCount,...coords){ //coords - {pos1, count1}, {pos2, count2}, ... , {posN, countN}
            let newCoords = this.coords.getSelf(), count = selfCount;
            newCoords.setV(newCoords.mul(count));
            coords.every((coordAndCount)=>{
                newCoords.sum(coordAndCount.coords.mul(coordAndCount.count));
                count += coordAndCount.count;
                return true;
            });
            newCoords.setV(newCoords.mul(1/count));
            this.coords.setV(newCoords);
        }
    }

    constructor(x,y,screen,scene,target,chaseType,chaseState){
        super(x,y,'camera');

        this.coords = new VECTOR(x,y);
        this.screen = screen;
        this.scene = scene;
        this.setTarget(target);
        this.setChaseType(chaseType);
        this.setChaseState(chaseState);
        return this;
    }
    setAngle(a){
        this.scene.setAngle(a);
    }
    setBlur(a){
        this.scene.setBlur(a);
    }
    setScale(x,y){
        this.scene.setScale(x,y);
    }
    setTarget(target){ this.target = target; return this; }
    setChaseState(state){ this.chaseState = state?true:false; return this; }
    setCoords(x,y){ 
        this.coords.setV(new VECTOR(x,y));
        this.scene.setOrigin(this.coords.x,-this.coords.y);
        return this;
    }
    setV(v){ 
        this.coords.setV(v);
        this.scene.setOrigin(this.coords.x,-this.coords.y);
        return this;
    }
    setChaseType(chaseType){ // 'direct' or 'average'
        switch(chaseType){
            case 'average': this.chaseType = 'average'; this.chase = this.chaseAverage; break;
            default : this.chaseType = 'direct'; this.chase = this.chaseDirect; 
        }
        return this;
    }
    getRealCoords(coords){
        return new VECTOR(this.screen.x - coords.x,- this.screen.y - coords.y);
    }
    chaseDirect(){ this.coords.setV(this.target.coords); return this; }
    chaseAverage(){
        this.setV(this.coords.mul(this.averageSpeed-1).sum(this.target.coords).mul(1/this.averageSpeed));
        return this;
    }
    update(dt){
        if(this.chaseState) this.chase();
        
        this.scene.countZIndex();
        this.scene.linkUpdate();
        this.scene.draw();
        return this;
    }
}