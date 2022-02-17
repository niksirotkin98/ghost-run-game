var app = {}, scn = {};

class VISUAL{
    position = new POINT(0,0);
    dimension = new POINT(1,1);
    real_size = true;
    root_element = false;
    real_position = false;
    parent = null;
    id = null;
    imgUrl = 'src/img/unknown.png';
    visualTrey = [];
    pixelRatio = 1;

    constructor(position, imgUrl, properties){
        this.position = position || this.position;
        this.imgUrl = imgUrl || this.imgUrl;

        if(imgUrl == "rootElement"){
            this.root_element = true;
        }

        if(properties){
            if(properties.dimension){
                this.dimension = properties.dimension;
                this.real_size = false;
            } else {
                this.real_size = true;
            }
            
            this.real_position = properties.real_position || this.real_position;
            this.pixelRatio = properties.pixelRatio || this.pixelRatio;
            this.parent = properties.parent || null;
            this.id = properties.id || null;
        }

        this.prepareVisual();

        return this;
    }

    setParent(parent){
        this.parent = parent; 
        if(this.root) this.parent.appendChild(this.root);
        
        return this;
    }

    addVisualChild(child){
        this.visualTrey.push(child);
        child.setParent(this.root);
        child.setPixelRatio(this.pixelRatio);
        this.update();
        return this;
    }

    setPixelRatio(pixelRatio){
        this.pixelRatio = pixelRatio;
        for(let o of this.visualTrey) o.setPixelRatio(pixelRatio);
        return this;
    }

    setWidth(w){
        this.dimension.width = w;
        return this;
    }

    setWidth(h){
        this.dimension.height = h;
        return this;
    }

    setDimension(d){
        this.dimension = d;
        this.real_size = false;
        this.update();
        return this;
    }

    prepareVisual(){
        let d = document.createElement("div");

        d.classList.add("object");
        if(this.id) d.id = this.id;
        if(this.real_position){
            d.style.top = this.position.y;
            d.style.left = this.position.x;
        }else{
            d.style.top = this.position.y * this.pixelRatio;
            d.style.left = this.position.x * this.pixelRatio;
        }

        if(!this.root_element){
            let v = document.createElement("img");
            v.src = this.imgUrl;
            v.classList.add("object");
            if(!this.real_size){
                v.style.width = this.dimension.width;
                v.style.height = this.dimension.height;
                v.style.top = -this.dimension.height/2;
                v.style.left = -this.dimension.width/2;
            }
    
            this.visual = v;
    
            d.appendChild(v);
        }

        for(let o of this.visualTrey){
            o.setPixelRatio(this.pixelRatio);
            o.setParent(d);
            o.update();
        }

        this.root = d;

        return this;
    }

    update(){
        if(this.root){
            if(this.real_position){
                this.root.style.left = this.position.x;
                this.root.style.top = this.position.y;
            }else{
                this.root.style.left = this.position.x * this.pixelRatio;
                this.root.style.top = this.position.y * this.pixelRatio;
            }
            if(!this.real_size && !this.root_element){
                this.visual.style.width = this.dimension.width;
                this.visual.style.height = this.dimension.height;
                this.visual.style.top = -this.dimension.height/2;
                this.visual.style.left = -this.dimension.width/2;
            }
        }

        for(let o of this.visualTrey) o.update();
        return this;
    }
}

class SCENARIO{
    playerPosition = new POINT(0,0)
    enemyTrey = []
    wallTrey = []
    starTrey = []

    id = 'unknown'

    pixelRatio = 100
    cellRatio = 100

    constructor(dimension){
        this.dimension = dimension || new POINT(5,5);

        return this;
    }

    setId(id){
        this.id = id;
        return this;
    }

    setPlayer(position, ...visualTrey){
        this.playerPosition = position;

        return this;
    }

    addEnemy(position){
        this.enemyTrey.push(position);
        
        return this;
    }

    addWall(position){
        this.wallTrey.push(position);
        
        return this;
    }
    
    addStar(position){
        this.starTrey.push(position);
        
        return this;
    }
}

class POINT{
    constructor(x,y){
        this.x = x || 0;
        this.y = y || 0;

        return this;
    }

    get width(){
        return this.x;
    }

    set width(width){
        return this.setX(width);
    }

    get height(){
        return this.y;
    }
    
    set height(height){
        return this.setY(height);
    }


    moveX(dx){
        this.x += dx;

        return this;
    }

    moveY(dy){
        this.y += dy;

        return this;
    }

    setX(newX){
        this.x = newX;

        return this;
    }

    setY(newY){
        this.y = newY;

        return this;
    }

    betweenX(minX, maxX){
        return this.x>= minX? (this.x<= maxX? true: false): false; 
    }

    betweenY(minY, maxY){
        return this.y>= minY? (this.y<= maxY? true: false): false; 
    }

    between(min, max){
        return this.betweenX(min.x, max.x) && this.betweenY(min.y, max.y);
    }

    set(newX, newY){
        return this.setX(newX).setY(newY);
    }

    move(dx, dy){
        return this.moveX(dx).moveY(dy);
    }

    scale(sx, sy){
        return new POINT(this.x*sx, this.y*sy);
    }

}

class OBJECT{
    visualTrey = []
    visualPosition = new POINT(0,0)
    visual = null
    pixelRatio = 1
    speedXY = new POINT(0,0);
    speed = 0.04;
    brake = 0.005;
    maxSpeed = 0.05;

    constructor(position){
        this.position = position || new POINT(0,0);
        return this;
    }

    addVisual(visual){
        this.visual = visual;
        return this;
    }

    setId(id){
        this.id = id;
        return this;
    }

    getVisual(){
        if(this.visual) return this.visual;
    }

    update(dt){
        let newPos = new POINT(this.position.x, this.position.y);
        newPos.move(this.speedXY.x, this.speedXY.y);
        this.speedXY.move(-dt*this.brake*Math.sign(this.speedXY.x),-dt*this.brake*Math.sign(this.speedXY.y));
        this.position.set(newPos.x, newPos.y);

        //if(this.collision(newPos)) this.position.set(newPos.x, newPos.y);
        //else{
           // this.speedXY.set(0,0);
        //}
        
        /*this.x += this.dx;
        this.y += this.dy;
        this.dx -= dt*this.brake*Math.sign(this.dx);
        this.dy -= dt*this.brake*Math.sign(this.dy);*/

        /*this.rs = (this.dx/this.maxSpeed + this.rs*9)/10;
        this.img.style.transform = `translate(-50%, -50%) rotate(${this.maxRotateAngle*this.rs}deg)`;

        this.shadowTime = (this.shadowTime + dt*this.shadowSpeed)%(Math.PI*2);
        let status = this.shadowRange*Math.sin(this.shadowTime);
        this.shadow.style.transform = `translate(-50%, ${this.shadowTop}) scale(${0.7+status}, ${0.2+status/2})`;*/
    }
    
    speedMove(dx, dy){
        this.speedXY.move(dx,dy);
        if(Math.abs(this.speedXY.x)>this.maxSpeed) this.speedXY.x = this.maxSpeed*Math.sign(this.speedXY.x);
        if(Math.abs(this.speedXY.y)>this.maxSpeed) this.speedXY.y = this.maxSpeed*Math.sign(this.speedXY.y);
    }

    control(keyCode){
    }

}

class MAP{
    constructor(){
        return this;
    }

    addValue(x,y,value){
        let id = this.getId(x,y);
        if(!this[id]) this[id] = [];
        this[id].push(value);

        return this;
    }

    findInCell(x,y,value){
        let id = this.getId(x,y),
            answer = [];
        if(!this[id]) return false;
        for(let o of this[id]){
            if(o == value) answer.push(o);
        }
        if(answer.length == 0) return false;
        return answer;
    }

    deleteByValue(x,y,value){
        let id = this.getId(x,y),
            answer = [];
        if(!this[id]) return false;
        for(let o of this[id]){
            if(o != value) answer.push(o);
        }
        this[id] = answer;
        return true;
    }

    getCell(x,y){
        let id = this.getId(x,y);
        if(!this[id]) return false;
        return this[id];
    }
    
    getId(x,y){
        return `${Math.floor(x)}x${Math.floor(y)}`;
    }
}

class APPLICATION {
    old_time = 0
    full_time = 0
    dt = 0
    timeRate = 1

    objectTrey = []
    staticTrey = []
    dynamicTrey = []
    visualTrey = []

    map = [];

    visual = null
    pixelRatio = 1

    pauseValue = false;

    constructor(scenario){
        this.scenario = scenario;

        this.pixelRatio = scenario.pixelRatio;
 
        this.update = this.update.bind(this);
        this.control = this.control.bind(this);
        this.screen = new POINT(document.body.clientWidth, document.body.clientHeight);
        this.screen2 = new POINT(this.screen.width/2, this.screen.height/2);

        window.addEventListener("keydown", this.control);

        return this;
    } 

    update(new_time){
        this.dt = (new_time - this.old_time)/100;
        this.full_time += this.dt;
        this.old_time = new_time;

        output.innerText = `FULL TIME: ${this.full_time}\nDT: ${this.dt}`;

        this.player.update(this.dt);
        this.visual.position.set(
            (this.player.position.x*this.scenario.cellRatio-9*this.visual.position.x)/10,
            (this.player.position.y*this.scenario.cellRatio-9*this.visual.position.y)/10 );
        this.updateZIndex();
        this.visual.update();

        if(!this.pauseValue) requestAnimationFrame(this.update);
    }

    updateZIndex(){
        let z_index = 0;

        this.visualTrey.sort((a, b)=> a.position.y - b.position.y);

        for(let v of this.visualTrey){
            v.root.style.zIndex = z_index;
            z_index++;
        }
    }

    readScenario(){
        let scenario = this.scenario,
            map = new MAP(),
            visual = new VISUAL(new POINT(50,50), "rootElement",{id:"scene2", pixelRatio:scenario.pixelRatio, real_position:true});

        let player = new OBJECT(scenario.playerPosition);
            player.addVisual( new VISUAL(
            player.position,
            "src/img/ghost.png",
            {
                id:"player2",
                dimension : new POINT(scenario.cellRatio,scenario.cellRatio)
            }
        ));

        this.objectTrey.push(player);
        this.player = player;
        this.visualTrey.push(player.visual);
        map.addValue(player.position.x,player.position.y,"player");
        visual.addVisualChild( player.visual);

        for(let wallID in scenario.wallTrey){
            let wall = new OBJECT(scenario.wallTrey[wallID]);
            wall.type = 'wall';
            wall.addVisual(new VISUAL(
                wall.position,
                "src/img/wall2.png",
                {
                    id:"wall"+wallID,
                    dimension : new POINT(scenario.cellRatio,scenario.cellRatio)
                }
            ));
            this.objectTrey.push(wall);
            this.visualTrey.push(wall.visual);
            map.addValue(wall.position.x,wall.position.y,"wall");
            visual.addVisualChild( wall.visual);
        }

        for(let enemyID in scenario.enemyTrey){
            let enemy = new OBJECT(scenario.enemyTrey[enemyID]);
            enemy.addVisual(new VISUAL(
                enemy.position,
                "src/img/enemy.png",
                {
                    id:"enemy"+enemyID,
                    dimension : new POINT(scenario.cellRatio,scenario.cellRatio)
                }
            ));
            this.objectTrey.push(enemy);
            this.visualTrey.push(enemy.visual);
            map.addValue(enemy.position.x,enemy.position.y,"enemy");
            visual.addVisualChild(enemy.visual);
        }

        for(let starID in scenario.starTrey){
            let star = new OBJECT(scenario.starTrey[starID]);
            star.addVisual(new VISUAL(
                star.position,
                "src/img/star.png",
                {
                    id:"star"+starID,
                    dimension : new POINT(scenario.cellRatio,scenario.cellRatio)
                }
            ));
            this.objectTrey.push(star);
            this.visualTrey.push(star.visual);
            map.addValue(star.position.x,star.position.y,"star");
            visual.addVisualChild( star.visual );
        }

        this.visual = visual;
        this.visual.setParent(document.body);
        this.map = map;

        this.showMap();

        return this;
    }

    showMap(){
        let out = "+|0_1_2_3_4_5_6_7_8_9\n",
            map = this.map,
            scenario = this.scenario;
        for(let i=0; i<scenario.dimension.height; i++){
            out += i + '|';
            for(let j=0; j<scenario.dimension.width; j++){
                let cell = map.getCell(j,i);
                cell = cell? cell[0]: "";
                switch(cell){
                    case "player": out+= '1 '; break;
                    case "wall": out+= '| '; break;
                    case "enemy": out+= '0 '; break;
                    case "star": out+= '* '; break;
                    default : out+= '_ ';
                }
            }
            out += "\n";
        }
        console.log(out);
    }

    collision(point){
        for(let i=1; i<this.objectTrey.length; i++){
            if(this.collide(point, this.objectTrey[i].position)) return false;
        }
        return true;
    }
    
    collide(a,b){
        let distance = ((b.x - a.x)**2 + (b.y - a.y)**2)**0.5;

        return distance <= 0.8;
    }

    start(){
        this.pauseValue = false;
        this.update(0);
        console.log("pause stop");
        return this;
    }

    pause(){
        this.pauseValue = true;
        console.log("pause start");
        return this;
    }

    control(e){
        if(e.keyCode == 32) this.pauseValue = this.pauseValue? false: true;

        let dxy = this.player.speed,
            new_position = new POINT(this.player.position.x, this.player.position.y);

            

        switch(e.keyCode){
            case 37: this.player.speedMove(-dxy,0); break;
            case 38: this.player.speedMove(0, -dxy); break;
            case 39: this.player.speedMove(dxy,0); break;
            case 40: this.player.speedMove(0, dxy); break;
        }

        this.map.deleteByValue(this.player.position.x, this.player.position.y, "player");
        //console.log(this.map.getCell(new_position.x,new_position.y))
        if(this.collision(new_position)) this.objectTrey[0].position.set(new_position.x, new_position.y);
        this.map.addValue(this.player.position.x, this.player.position.y, "player");

        console.clear();
        this.showMap();
        console.log(this.player.position, Math.floor(this.player.position.x),Math.floor(this.player.position.y));
    }
}

function main(){  
    scn = new SCENARIO(new POINT(10,10))
    .setPlayer(new POINT(0,0))
    .addWall(new POINT(1,1))
    .addWall(new POINT(1,2))
    .addWall(new POINT(2,2))
    .addStar(new POINT(3,3))
    .addEnemy(new POINT(3,0));

    app = new APPLICATION(scn);
    app.readScenario()

    app.start();
    app.visual.position.move(100,100);


    /*app = new APPLICATION(scn)
    console.log(app);  
    app.readScenario()
    console.log(app);  
    app.compositeVisual()
    console.log(app);  
    app.attachVisual(document.body)
    console.log(app);  
    app.updateVisual();
    console.log('last',app);*/
}