import test from 'node:test';
import assert from 'node:assert/strict';
import {levels,tutorialLevel} from '../levels.mjs';
import {triangleLayout,diagram} from '../geometry.mjs';

const faces=[...levels,tutorialLevel].flatMap(l=>l.tiles.flatMap(t=>t.faces)).filter(f=>f.kind!=='given');
const cross=(a,b,p)=>(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);
test('Every inner-angle label fits wholly inside the triangle with space from its edges',()=>{
  for(const f of faces.filter(f=>f.kind==='inner')){
    const {points,question:q}=triangleLayout(f);
    assert.ok(q.size>=13&&q.size<=17,'Question marks are compact but readable');
    for(const dx of [-.32,.32])for(const dy of [-.52,.52]){
      const corner=[q.x+dx*q.size,q.y+dy*q.size];
      for(let i=0;i<3;i++){
        const a=points[i],b=points[(i+1)%3];
        assert.ok(cross(a,b,corner)/Math.hypot(b[0]-a[0],b[1]-a[1])>=1.99,JSON.stringify(f));
      }
    }
  }
});
test('Resized diagrams preserve the actual known triangle angles',()=>{
  const degrees=(o,p,q)=>{const u=[p[0]-o[0],p[1]-o[1]],v=[q[0]-o[0],q[1]-o[1]];return Math.acos((u[0]*v[0]+u[1]*v[1])/(Math.hypot(...u)*Math.hypot(...v)))*180/Math.PI;};
  for(const f of faces){const {points:[a,b,c]}=triangleLayout(f);assert.ok(Math.abs(degrees(a,b,c)-f.a)<1e-8);assert.ok(Math.abs(degrees(b,a,c)-f.b)<1e-8);}
});
test('Exterior-angle labels stay beyond the unknown vertex and above its extension',()=>{
  for(const f of faces.filter(f=>f.kind==='outer')){
    const {points:[,b,c],question:q}=triangleLayout(f);
    for(const dx of [-.32,.32])for(const dy of [-.52,.52]){
      const corner=[q.x+dx*q.size,q.y+dy*q.size];
      assert.ok(corner[1]<=c[1]-1.99);
      assert.ok(cross(c,b,corner)/Math.hypot(b[0]-c[0],b[1]-c[1])>=1.99);
      assert.ok(corner[0]<158&&corner[1]>0);
    }
  }
});

test('Inner labels remain near the base beside the unknown angle',()=>{
  for(const f of faces.filter(f=>f.kind==='inner')){
    const {points,question:q}=triangleLayout(f);
    for(const i of [2]){
      const a=points[i],b=points[(i+1)%3];
      const gaps=[];
      for(const dx of [-.32,.32])for(const dy of [-.52,.52]){
        gaps.push(cross(a,b,[q.x+dx*q.size,q.y+dy*q.size])/Math.hypot(b[0]-a[0],b[1]-a[1]));
      }
      assert.ok(Math.abs(Math.min(...gaps)-2)<1e-8,JSON.stringify(f));
    }
  }
});

test('Angle arcs join the correct rays, preserve the angle and avoid the question label',()=>{
  for(const f of faces){
    const {points:[a,b,c],question:q,arc}=triangleLayout(f);
    assert.match(diagram(f),/class="angle-arc"/);
    const inner=f.kind==='inner',expected=inner?180-f.a-f.b:f.a+f.b;
    assert.ok(Math.abs(Math.abs(arc.endAngle-arc.startAngle)*180/Math.PI-expected)<1e-8);
    assert.equal(arc.sweep,inner?1:0);
    assert.ok(arc.radius>=5&&arc.radius<=8);
    for(const point of [arc.start,arc.end])assert.ok(Math.abs(Math.hypot(point[0]-c[0],point[1]-c[1])-arc.radius)<1e-8);
    assert.ok(Math.abs(cross(c,b,arc.end))<1e-8);
    const labelDistance=Math.hypot(Math.max(0,Math.abs(q.x-c[0])-.32*q.size),Math.max(0,Math.abs(q.y-c[1])-.52*q.size));
    assert.ok(labelDistance-arc.radius>=1.99);
    for(let i=0;i<=20;i++){
      const angle=arc.startAngle+(arc.endAngle-arc.startAngle)*i/20;
      const p=[c[0]+arc.radius*Math.cos(angle),c[1]+arc.radius*Math.sin(angle)];
      if(inner)for(const [v,w] of [[a,b],[b,c],[c,a]])assert.ok(cross(v,w,p)>=-1e-8);
      else {assert.ok(p[1]<=c[1]+1e-8);assert.ok(cross(c,b,p)>=-1e-8);}
    }
  }
});
