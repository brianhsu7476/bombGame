const fps=60, bw=288, bh=288, cw=9, ch=9;
var canvas=document.getElementById('mycanvas'), ctx=canvas.getContext('2d'), ww=window.innerWidth, wh=window.innerHeight;
var b=new Array(), player=new Array(), bomb=new Array(), d=new Array(4), tttime=0, bwt=30, wall=0, stone=new Array(), nst=0;
class Point{
    constructor(x, y){
        this.x=x, this.y=y;
    }
}
class Obj{
    constructor(type, time){
        this.type=type, this.time=time;
    }
    color(){
        if(this.type==='empty')return 'rgba(0, 29, 46, 1)';
        if(this.type==='stone')return 'rgba(255, 255, 255, 1)';
        if(this.type==='wood')return 'rgba(222, 184, 135, 1)';
        if(this.type==='p0')return 'rgba(0, 0, 255, 1)';
        if(this.type==='p1')return 'rgba(0, 255, 0, 1)';
        if(this.type==='bomb'){
            if(this.time%(bwt*2)<bwt)return 'rgba(255, 0, 0, 1)';
            else return 'rgba(127, 0, 0, 1)';
        }
        if(this.type==='explode')return 'rgba('+String(255-this.time*10)+', '+String(255-this.time*10)+', 0, 1)';
    }
}
class Bomb{
    constructor(x, y, t){
        this.x=x, this.y=y, this.t=t;
    }
    explode(){
        this.t=200;
        b[this.x][this.y].type='explode';
        for(var i=0; i<4; ++i){
            var cnt=0;
            for(var j=0; true; ++j){
                if(cnt===1)break;
                var x=this.x+d[i].x*j, y=this.y+d[i].y*j;
                if(x<0||x>=cw||y<0||y>=ch||b[x][y].type==='stone')break;
                if(b[x][y].type==='wood')++cnt;
                if(b[x][y].type!=='bomb')b[x][y].type='explode', b[x][y].time=0;
                for(var k=0; k<2; ++k)if(player[k].x===x&&player[k].y===y)player[k].die();
            }
        }
        this.x=-1, this.y=-1;
    }
}
class Player{
    constructor(x, y, id){
        this.x=x, this.y=y, this.id=id;
    }
    left(){
        if(this.x>=0&&b[this.x-1][this.y].type==='empty')--this.x;
    }
    right(){
        if(this.x<cw&&b[this.x+1][this.y].type==='empty')++this.x;
    }
    up(){
        if(this.y>=0&&b[this.x][this.y-1].type==='empty')--this.y;
    }
    down(){
        if(this.y<ch&&b[this.x][this.y+1].type==='empty')++this.y;
    }
    bb(){
        if(bomb[this.id].t>=bwt*6){
            bomb[this.id].x=this.x, bomb[this.id].y=this.y, bomb[this.id].t=0;
        }
    }
    die(){
        if(this.x!==-100)this.x=-100, this.y=tttime;
    }
}
function init(){
    alert('Player 0: WASD to move, R to place bombs\nPlayer 1: IJKL to move, P to place bombs');
    player.push(new Player(0, 0, 0)), player.push(new Player(cw-1, ch-1, 1));
    bomb.push(new Bomb(-1, -1, 200)), bomb.push(new Bomb(-1, -1, 200)), bomb.push(new Bomb(-1, -1, 200));
    var used=new Array(), bfs=new Array(cw*ch), ibfs=0, nbfs=1;
    for(var i=0; i<cw; ++i)b.push(new Array(ch)), used.push(new Array(ch));
    for(var i=0; i<cw; ++i)for(var j=0; j<ch; ++j){
        b[i][j]=new Obj('empty', 0);
        if(Math.random()<0.3&&(i!=Math.floor(cw/2)||j!=Math.floor(ch/2)))b[i][j].type='stone';
        else if(Math.random()<0.9)b[i][j].type='wood';
    }
    for(var i=0; i<cw; ++i)for(var j=0; j<ch; ++j)for(var k=0; k<2; ++k)if(i==player[k].x&&j==player[k].y)b[i][j].type='p'+String(k);
    for(var i=0; i<cw; ++i)for(var j=0; j<ch; ++j)used[i][j]=0;
    d[0]=new Point(1, 0), d[1]=new Point(0, -1), d[2]=new Point(-1, 0), d[3]=new Point(0, 1);
    for(var i=0; i<cw; ++i)for(var j=0; j<ch; ++j)if(b[i][j].type[0]==='p')for(var k=0; k<4; ++k){
        var x=i+d[k].x, y=j+d[k].y;
        if(x>=0&&x<cw&&y>=0&&y<ch)b[x][y].type='empty';
    }
    bfs[0]=new Point(Math.floor(cw/2), Math.floor(ch/2));
    while(nbfs>ibfs){
        for(var i=0; i<4; ++i){
            var x=bfs[ibfs].x+d[i].x, y=bfs[ibfs].y+d[i].y;
            if(x>=0&&x<cw&&y>=0&&y<ch&&used[x][y]===0&&b[x][y].type!='stone')bfs[nbfs++]=new Point(x, y), used[x][y]=1;
        }
        ++ibfs;
    }
    for(var i=0; i<cw; ++i)for(var j=0; j<ch; ++j)if(b[i][j].type[0]==='p'&&used[i][j]===0){
        init();
        return;
    }
}
function update(){
    for(var i=0; i<cw; ++i)for(var j=0; j<ch; ++j)++b[i][j].time;
    for(var i=0; i<cw; ++i)for(var j=0; j<ch; ++j)if(b[i][j].type[0]==='p'){
        var ok=0;
        for(var k=0; k<2; ++k)if(player[k].x===i&&player[k].y===j)ok=1;
        if(ok===0)b[i][j].type='empty';
    }
    if(bwt===10&&tttime%80===0&&wall===0){
        var a=new Array();
        for(var i=0; i<cw; ++i)for(var j=0; j<ch; ++j)if(b[i][j].type==='stone')a.push(new Point(i, j));
        if(a.length!==0){
            var tmp=Math.floor(Math.random()*a.length);
            bomb[2].x=a[tmp].x, bomb[2].y=a[tmp].y, bomb[2].t=0;
        }
        else{
            wall=1;
            var x=0, y=ch-1, dnow=0, used=new Array();
            for(var i=0; i<cw; ++i)used.push(new Array(ch));
            for(var i=0; i<cw; ++i)for(var j=0; j<ch; ++j)used[i][j]=0;
            for(var i=0; i<cw*ch; ++i){
                stone.push(new Point(x, y)), used[x][y]=1;
                var xx=x+d[dnow].x, yy=y+d[dnow].y;
                if(xx<0||xx>=cw||yy<0||yy>=ch||used[xx][yy])dnow=(dnow+1)%4;
                x+=d[dnow].x, y+=d[dnow].y;
            }
        }
    }
    if(wall===1&&tttime%30===0){
        if(nst<stone.length){
            var x=stone[nst].x, y=stone[nst].y;
            for(var i=0; i<2; ++i)if(player[i].x===x&&player[i].y===y)player[i].die();
            b[stone[nst].x][stone[nst].y].type='stone';
            ++nst;
        }
    }
    for(var i=0; i<cw; ++i)for(var j=0; j<ch; ++j)for(var k=0; k<2; ++k)if(player[k].x===i&&player[k].y===j)b[i][j].type='p'+String(k);
    for(var i=0; i<cw; ++i)for(var j=0; j<ch; ++j)for(var k=0; k<bomb.length; ++k){
        if(bomb[k].x===i&&bomb[k].y===j){
            b[i][j].type='bomb', ++bomb[k].t, b[i][j].time=bomb[k].t;
            if(bomb[k].t>=bwt*6)bomb[k].explode();
        }
    }
    for(var i=0; i<cw; ++i)for(var j=0; j<ch; ++j)if(b[i][j].type==='explode'&&b[i][j].time>10)b[i][j].type='empty';
    for(var i=0; i<2; ++i)if(player[i].x===-100){
        var x;
        if(i===0)x=-bw-400;
        else x=bw+70;
        ctx.font='30px Arial', ctx.fillStyle='white';
        ctx.fillText('Player '+String(i)+' die at time '+String(player[i].y)+'!', x, 0);
    }
    ++tttime;
    bwt=Math.max(10, Math.floor(31-tttime/300));
}
function draw(){
    ctx.fillStyle='rgba(0, 29, 46, 0.5)';
    ctx.fillRect(-ww/2, -wh/2, ww, wh);
    ctx.beginPath();
    for(var i=-bw; i<=bw; i+=bw*2/cw)ctx.moveTo(i, bh), ctx.lineTo(i, -bh);
    for(var i=-bh; i<=bh; i+=bh*2/ch)ctx.moveTo(bw, i), ctx.lineTo(-bw, i);
    ctx.strokeStyle='rgba(255, 255, 255, 0.5)';
    ctx.stroke();
    for(var i=0; i<cw; ++i)for(var j=0; j<ch; ++j){
        ctx.save();
        ctx.translate(bw*2/cw*(i-Math.floor(cw/2)), bh*2/ch*(j-Math.floor(ch/2)));
        ctx.beginPath();
        ctx.arc(0, 0, bw/cw-3, 0, 2*Math.PI);
        ctx.fillStyle=b[i][j].color();
        ctx.fill();
        ctx.restore();
    }
    requestAnimationFrame(draw);
}
canvas.width=ww;
canvas.height=wh;
ctx.translate(ww/2, wh/2);
init();
setInterval(update, 1000/fps);
requestAnimationFrame(draw);
document.addEventListener('keydown', function(evt){
    if(evt.code=='KeyW')player[0].up();
    if(evt.code=='KeyA')player[0].left();
    if(evt.code=='KeyS')player[0].down();
    if(evt.code=='KeyD')player[0].right();
    if(evt.code=='KeyR')player[0].bb();
    if(evt.code=='KeyI')player[1].up();
    if(evt.code=='KeyJ')player[1].left();
    if(evt.code=='KeyK')player[1].down();
    if(evt.code=='KeyL')player[1].right();
    if(evt.code=='KeyP')player[1].bb();
})
