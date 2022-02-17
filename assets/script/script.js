var init = {
    width : 10,
    height : 10,
};

var physics = {
    g : 9.80665,

    objects : [],
    addObject : function(obj){
        this.objects.push(obj);
    },
    arr : function(number){
        return number>=0?1:-1;
    },
    update : function(dt){
        for(let o of this.objects){
            let f = (o.fx^2 + o.fy^2)^0.5,
                friction = o.u*o.m*this.g,
                angleFX = f!=0? o.fx/f: 0,
                angleFY = f!=0? o.fy/f: 0;

            f = f-(friction*this.arr(f));
            o.f = f;
            o.a = f/o.m;
            o.v += o.a*dt;
            o.fx = o.f*angleFX;
            o.fy = o.f*angleFY;
            o.ax = o.fx/o.m;
            o.ay = o.fy/o.m;
            o.x += o.vx*dt + (o.ax*(dt^2))/2;
            o.y += o.vy*dt + (o.ay*(dt^2))/2;
            o.vx += o.ax*dt;
            o.vy += o.ay*dt;
        }
    }
}

var vision = {
    objects : [],
    addObject : function(obj){
        this.objects.push(obj);
    },
    update : function(){
        for(let o of this.objects){
            o.img.style.left = `${o.x}px`;
            o.img.style.top = `${o.y}px`;
            if(o.hasShadow){
                o.shadow.style.left = `${o.x}px`;
                o.shadow.style.top = `${o.y}px`;
            }
        }
    }
}

class APPLICATION{
    updateTrey = []
    visionTrey = []
    controlTrey = []
    objects = []
    camera = {
        x : 0,
        y : 0,
        speed : 0,
        move : function(dx,dy){
            this.x += dx;
            this.y += dy;
            return this;
        },
        update : function(dt){
            out.style.left = `${this.x}px`;
            out.style.top = `${this.y}px`;
        },
        control : function(keyCode){
            switch(keyCode){
                case 100: this.move(-10,0); break;
                case 104: this.move(0,-10); break;
                case 102: this.move(10,0); break;
                case 98: this.move(0,10); break;
            }
        }
    }

    old_time = 0
    dt = 0

    constructor(){
        console.log("We in!");

        SCREEN.width = out.clientWidth;
        SCREEN.height = out.clientHeight;
        this.camera.x = SCREEN.width/2;
        this.camera.y = SCREEN.height/2;

        this.objects.push(
            new BOXBuilder(200, 200)
            .setImgUrl("src/img/enemy.png")
            .setMaxRotateAngle(22)
            .setShadowProps(0.05, 1.5, 'enemyShadow')
            .setControls({
                'left' : 65,
                'up' : 87,
                'right' : 68,
                'down' : 83
            })
            .build()
        );
        this.objects.push( 
            new BOXBuilder(0, 0)
            .setImgUrl("src/img/ghost.png")
            .setShadowId("ghostShadow")
            .setShadowTop("-10%")
            .setControls({
                'left' : 37,
                'up' : 38,
                'right' : 39,
                'down' : 40
            })
            .build()
        );

        this.controlTrey.push(this.objects[0]);
        this.controlTrey.push(this.objects[1]);
        this.controlTrey.push(this.camera);
        this.updateTrey.push(this.objects[0]);
        this.updateTrey.push(this.objects[1]);
        this.updateTrey.push(this.camera);

        //binding update function and keypress function
        this.update = this.update.bind(this);
        this.keypress = this.keypress.bind(this);
        requestAnimationFrame(this.update);
        window.addEventListener("keydown",this.keypress);

        /*let out_obj = document.querySelector("#out");
        out_obj.style.width = `${init.width*20}px`;
        let max_lenght = init.width*init.height;
        for(let i=0; i<max_lenght; i++){
            out_obj.appendChild( document.createElement("div") );
        }*/
    }

    update(new_time){
        this.dt = new_time - this.old_time;
        this.old_time = new_time;
        let checkedDt = this.dt>50? 0.16: this.dt/100;

        for(let o of this.updateTrey) o.update(checkedDt);

        vision.update();
        document.querySelector("#info").innerText = `DT:${this.dt}\n`+
        `Camera X:${this.camera.x}, Y:${this.camera.y}\n`+
        `X:${this.objects[1].x}\n`+
        `Y:${this.objects[1].y}`;

        requestAnimationFrame(this.update);
    }

    keypress(e){
        for(let o of this.controlTrey) o.control(e.keyCode);
    }
}
//!USE SCREEN DIMENSIONS
class BOX_REAL{
    dx = 0
    dy = 0
    rs = 0
    controls = {}

    constructor(x,y,imgUrl,speedProps,shadowProps,maxRotateAngle, controls){
        this.x = x;
        this.y = y;
        this.maxRotateAngle = maxRotateAngle || 45;

        this.speed = speedProps.speed;
        this.maxSpeed = speedProps.maxSpeed;
        this.brake = speedProps.brake;

        if(shadowProps){
            this.shadowRange = shadowProps.shadowRange;
            this.shadowSpeed = shadowProps.shadowSpeed;
            this.shadowTime = 0;
            this.shadowTop = shadowProps.top || '-10%';

            this.shadow = document.createElement("div")
            this.shadow.appendChild( document.createElement("div"));
            this.shadow.classList.add('shadow');
            this.shadow.classList.add(shadowProps.id);
            document.querySelector("#out").appendChild(this.shadow);
            this.hasShadow = true;
        } else this.hasShadow = false;

        this.imgUrl = imgUrl;
        this.controls = controls || false;

        this.img = document.createElement('img');
        this.img.src = this.imgUrl;
        document.querySelector("#out").appendChild(this.img);

        vision.addObject(this);
    }

    move(dx, dy){
        this.dx+=dx;
        this.dy+=dy;
        if(Math.abs(this.dx)>this.maxSpeed) this.dx = this.maxSpeed*Math.sign(this.dx);
        if(Math.abs(this.dy)>this.maxSpeed) this.dy = this.maxSpeed*Math.sign(this.dy);
    }

    update(dt){
        this.x += this.dx;
        this.y += this.dy;
        this.dx -= dt*this.brake*Math.sign(this.dx);
        this.dy -= dt*this.brake*Math.sign(this.dy);

        /*if(this.x >SCREEN.width) this.x = SCREEN.width
        else if(this.x < 0) this.x = 0;
        if(this.y >SCREEN.height) this.y = SCREEN.height
        else if(this.y < 0) this.y = 0;8*/

        this.rs = (this.dx/this.maxSpeed + this.rs*9)/10;
        this.img.style.transform = `translate(-50%, -50%) rotate(${this.maxRotateAngle*this.rs}deg)`;

        this.shadowTime = (this.shadowTime + dt*this.shadowSpeed)%(Math.PI*2);
        let status = this.shadowRange*Math.sin(this.shadowTime);
        this.shadow.style.transform = `translate(-50%, ${this.shadowTop}) scale(${0.7+status}, ${0.2+status/2})`;
    }

    control(keyCode){
        if(this.controls){
            let dxy = this.speed;
            switch(keyCode){
                case this.controls['left']: this.move(-dxy,0); break;
                case this.controls['up']: this.move(0,-dxy); break;
                case this.controls['right']: this.move(dxy,0); break;
                case this.controls['down']: this.move(0, dxy); break;
            }
        }
    }
};

class BOX extends BOX_REAL{
    constructor(builder){
        return super(
            builder.x,
            builder.y,
            builder.imgUrl,
            {
                speed : builder.speed,
                maxSpeed : builder.maxSpeed,
                brake : builder.brake
            },
            {
                shadowRange : builder.shadowRange,
                shadowSpeed : builder.shadowSpeed,
                id : builder.shadowId,
                top : builder.shadowTop
            },
            builder.maxRotateAngle,
            builder.controls
        );
    }
};

class BOXBuilder{
    maxRotateAngle = 45
    speed = 3
    maxSpeed = 3
    brake = 0.5
    imgUrl = 'src/img/unknown.png'
    shadowRange = 0.075
    shadowSpeed = 0.5
    shadowId = 'unknownShadow'
    shadowTop = '-20%'

    constructor(x,y){
        this.x = x || 0;
        this.y = y || 0;
        return this;
    }

    setPosition(x, y){
        this.x = x;
        this.y = y;
        return this;
    }

    setSpeedProps(speed, maxSpeed, brake){
        this.speed = speed;
        this.maxSpeed = maxSpeed;
        this.brake = brake;
        return this;
    }

    setMaxRotateAngle(angle){
        this.maxRotateAngle = angle;
        return this;
    }

    setImgUrl(url){
        this.imgUrl = url;
        return this;
    }

    setShadowProps(range, speed, id, top){
        this.shadowRange = range;
        this.shadowSpeed = speed;
        this.shadowId = id || "unknownShadow";
        this.shadowTop = top || "-20%";
        return this;
    }

    setShadowId(id){
        this.shadowId = id;
        return this;
    }

    setShadowTop(top){
        this.shadowTop = top;
        return this;
    }

    setControls(controls){
        this.controls = controls;
        return this;
    }

    build(){
        return new BOX(this);
    }

}


var old_time = 0, dt = 0,
    enemy,
    player,
    SCREEN = {},
    app;


function main(){
    app = new APPLICATION();
    /*console.log("We in!");

    SCREEN.width = out.clientWidth;
    SCREEN.height = out.clientHeight;

    enemy = new BOXBuilder(200, 200)
    .setImgUrl("src/img/enemy.png")
    .setMaxRotateAngle(22)
    .setShadowProps(0.05, 1.5, 'enemyShadow')
    .build();
    player = new BOXBuilder(500, 250)
    .setImgUrl("src/img/ghost.png")
    .setShadowId("ghostShadow")
    .setShadowTop("-10%")
    .build();

    requestAnimationFrame(update);
    window.addEventListener("keydown",keypress);

    /*let out_obj = document.querySelector("#out");
    out_obj.style.width = `${init.width*20}px`;
    let max_lenght = init.width*init.height;
    for(let i=0; i<max_lenght; i++){
        out_obj.appendChild( document.createElement("div") );
    }*/
}

function keypress(e){
    let keyCode = e.keyCode, 
        dxy = player.speed;
    switch(keyCode){
        case 37: player.move(-dxy,0); break;
        case 38: player.move(0,-dxy); break;
        case 39: player.move(dxy,0); break;
        case 40: player.move(0, dxy); break;
        case 65: enemy.move(-dxy,0); break;
        case 87: enemy.move(0,-dxy); break;
        case 68: enemy.move(dxy,0); break;
        case 83: enemy.move(0,dxy); break;
        default : console.log(keyCode);
    }
}

function update(new_time){
    dt = new_time - old_time;
    old_time = new_time;
    let checkedDt = dt>50? 0.16: dt/100;

    player.update(checkedDt);
    enemy.update(checkedDt);
    vision.update();
    document.querySelector("#info").innerText = `DT:${dt}\nX:${player.x}\nY:${player.y}`;

    requestAnimationFrame(update);
}