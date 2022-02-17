const IMAGE_URL_LIST = {
    'unknown' : 'src/img/unknown.png',
    'ghost' : 'src/img/ghost.png',
    'enemy' : 'src/img/enemy.png',
    'star' : 'src/img/star.png',
    'wall1' : 'src/img/wall1.png',
    'wall2' : 'src/img/wall2.png',
    'day guy mad' : 'src/img/day_guy_mad.png',
    'night guy mad' : 'src/img/night_guy_mad.png',
    'hole' : 'src/img/hole.png',
    'shadow' : 'src/img/shadow.png',
    'aim' : 'src/img/aim.png'
};

var objects = [
    {x: 0, y:0, value: 'player'},
    {x: 1, y:1, value: 'wall'},
    {x: 3, y:1, value: 'wall'},
    {x: 3, y:3, value: 'wall'},
    {x: 1, y:3, value: 'wall'}
];

function main(){
    
}

//test
let scene = new ROOT(0,0),
    screen = new VECTOR(document.body.clientWidth/2,document.body.clientHeight/2),
    player = new BOX(0,0),
    camera = new CAMERA(0,0,screen,scene,player, 'average', true),
    holes = [],
    current = player,
    speed = 20,
    playerVisual = new ROOT(0,0),
    newPosition = new VECTOR(current.coords.x, current.coords.y),
    pause = false,
    wheelState = false;
    //graph = new GRAPH(0,0,200,200,document.body),
    //dtArray = [new VECTOR(0,0), new VECTOR(0,0)];

playerVisual.addChild(new VISUAL(-100,-50, 'shadow'));
playerVisual.addChild(new VISUAL(-100,100, 'day guy mad'));
playerVisual.setLink(player)

//scene.addChild(new ROOT(0,0).addChild(new VISUAL(-250,250, 'aim')).setLink(camera));

scene.setParent(document.body);
scene.setZindex(0);

scene.setLink(camera);
scene.linkFunction = function(){
    this.setCoords(this.link.getRealCoords(this.link.coords));
}

for(let i=0;i<10;i++){
    for(let j=0;j<10;j++){
        let imageNumber = Math.floor(Math.random()*8),
            h;

        switch(imageNumber){
            case 1: imageNumber = 'wall1'; break;
            case 2: imageNumber = 'wall2'; break;
            case 3: imageNumber = 'enemy'; break;
            case 4: imageNumber = 'star'; break;
            case 5: imageNumber = 'hole'; break;
            case 6: imageNumber = 'ghost'; break;
            //case 7: imageNumber = 'unknown'; break;
            default : imageNumber = false;
        }

        if(imageNumber){
            h = new BOX(j*200 - 1000,i*200 - 1000,'wall');
            holes.push(h);
            scene.addChild(new ROOT(0,0).addChild(new VISUAL(-100,100, imageNumber)).setLink(h));
        }
    }
}

scene.addChild(playerVisual);
scene.linkUpdate();

window.addEventListener('keydown',function({keyCode:key}){
    let dxy = 50;
    newPosition = new VECTOR(current.coords.x, current.coords.y);

    switch(key){
        case 37:
            newPosition.move(-dxy,0); 
            break;
        case 38:
            newPosition.move(0,dxy); 
            break;
        case 39:
            newPosition.move(dxy,0); 
            break;
        case 40:
            newPosition.move(0,-dxy); 
            break;
        case 65:
            camera.move(-dxy,0); 
            break;
        case 87:
            camera.move(0,dxy); 
            break;
        case 68:
            camera.move(dxy,0); 
            break;
        case 83:
            camera.move(0,-dxy); 
            break;
        case 49:
            camera.setChaseState(false);
            current = camera;
            newPosition = new VECTOR(current.coords.x, current.coords.y);
            break;
        case 50:
            camera.setChaseState(true);
            current = player;
            newPosition = new VECTOR(current.coords.x, current.coords.y);
            break;
        case 52:
            camera.setCoords(player.coords.x,player.coords.y);
            break;
        case 32:
            pause = pause?false:true;
            break;
        case 51:
            console.log(key, wheelState);
            wheelState = wheelState?false:true;
            break;
        default: console.log(key);
    }
})

window.addEventListener('wheel',function({deltaY:y}){
    if(wheelState){
        let i = y>0? scene.blur - 0.5: scene.blur + 0.5;
        i = i < 0? 0: i;
        scene.setBlur(i);
    }else{
        let s = y>0? scene.scale.x*0.9: scene.scale.x*1.1;
        camera.setScale(s);
    }
})

let odt = 0, dt = 0, cdt = 0, fps = 0, t = 0, k;

function u(ndt){
    if(!pause){
        dt = ndt-odt;
        odt = ndt;
        fps = Math.round(1000/cdt);
        cdt = (cdt*19+dt)/20;

        /*dtArray.push(new VECTOR(player.coords.x, player.coords.y));
        if(dtArray.length>60)dtArray.shift();

        graph.draw(dtArray);*/
        if(t == 0){
            holes.every((hole)=>{
                hole.newPosition = new VECTOR(hole.coords.x + 100*Math.cos(Math.random()*2*Math.PI),hole.coords.y + 100*Math.cos(Math.random()*2*Math.PI));
                return true;
            })
        }

        holes.every((hole)=>{
            hole.setV(hole.coords.mul(9).sum(hole.newPosition).mul(0.1));
            return true;
        })

        current.setV(current.coords.mul(4).sum(newPosition).mul(1/5));
        current.setV(newPosition);
        // camera.setScale(1 + Math.sin(ndt*0.005)*0.2);
        // camera.setAngle(Math.sin(ndt*0.0025)*10);
        // playerVisual.setAngle(Math.sin(ndt/(Math.PI*100))*360);
        //camera.setBlur(Math.abs(Math.sin(ndt*0.005)*5));
        // playerVisual.childrenList[0].setScale(0.9 + 0.1*Math.sin(ndt/(Math.PI*25)));

        

        camera.update(dt);

        outext.innerText = `fps:${fps}\npl:${player.coords.x.toFixed(2)},${player.coords.y.toFixed(2)}\ncam:${camera.coords.x.toFixed(2)},${camera.coords.y.toFixed(2)}`;

        t = t>1000?0:t+dt;
    }
    requestAnimationFrame(u);
}

u(0);