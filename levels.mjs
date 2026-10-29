const given=value=>({kind:'given',value});
function face(value,mode,seed){if(mode===0)return given(value);const outer=mode===2||(mode===3&&seed%2===0);const total=outer?value:180-value;const a=Math.max(10,Math.floor(total/10)*5+(seed%3-1)*5),b=total-a;return {kind:outer?'outer':'inner',a,b};}
// Each walk is a witness, while displayed order is deliberately unrelated to that witness.
const plans=[
 ['첫 번째 빛',[60,80,100,120],0,'같은 각도를 이어 도착까지 가요.'],
 ['조각 뒤집기',[70,90,50,110,80],0,'한 조각의 두 끝은 서로 달라요. 뒤집어서 이어 보세요.'],
 ['삼각형의 빈자리',[60,80,50,100,70],1,'삼각형의 세 내각을 합하면 180°예요.'],
 ['돌아오는 길',[60,80,100,60,120],1,'맞는 조각이 여럿이면, 남은 조각이 이어질지도 생각해요.'],
 ['마지막 조각을 남겨요',[50,80,110,50,90,120],1,'도착으로 바로 가면 나머지 조각이 남을 수 있어요.'],
 ['갈림길의 약속',[70,90,120,70,50,100,80],1,'다시 만날 각도를 기억하면 길이 끊기지 않아요.'],
 ['삼각형 바깥의 빛',[60,90,120,60,100,80],2,'외각은 이웃하지 않는 두 내각의 합이에요.'],
 ['돌아온 나비',[50,80,110,50,100,130,70],2,'도착 방향 조각을 아껴 두고 작은 고리를 먼저 이어요.'],
 ['겉과 속',[60,80,110,60,90,130,90,100],3,'안쪽 물음표인지 바깥 물음표인지 먼저 보세요.'],
 ['두 개의 고리',[70,90,70,110,130,110,70,50],3,'같은 각도로 돌아오는 묶음을 먼저 연결할 수 있어요.'],
 ['남겨 둔 다리',[60,90,120,90,110,140,110,60,80],3,'다른 묶음으로 건너가는 조각은 마지막까지 필요해요.'],
 ['온실에 빛을',[50,80,110,50,120,140,80,120,90],3,'내각·외각, 방향, 남길 조각을 함께 생각해요.']
];
export const levels=plans.map(([title,walk,mode,note],index)=>{let tiles=walk.slice(1).map((v,j)=>({id:String.fromCharCode(65+j),faces:[face(walk[j],mode,j+index),face(v,mode,j+index+1)]}));if(index>2){tiles=[tiles.at(-1),...tiles.slice(0,-1).reverse()];}else tiles=tiles.reverse();tiles=tiles.map((t,j)=>j%2?{...t,faces:[...t.faces].reverse()}:t);return {id:index+1,title,chapter:Math.floor(index/4),start:walk[0],goal:walk.at(-1),tiles,note,mode};});
export const tutorialLevel={id:0,title:'첫 빛을 이어 볼까요',start:60,goal:100,tiles:[{id:'A',faces:[given(60),given(80)]},{id:'B',faces:[given(100),given(80)]}],note:'같은 각도가 닿게 이어요.'};
