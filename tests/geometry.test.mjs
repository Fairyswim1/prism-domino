import test from 'node:test';
import assert from 'node:assert/strict';
import {levels,tutorialLevel} from '../levels.mjs';
import {triangleLayout} from '../geometry.mjs';

const faces=[...levels,tutorialLevel].flatMap(l=>l.tiles.flatMap(t=>t.faces)).filter(f=>f.kind!=='given');
const cross=(a,b,p)=>(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);
test('Every inner-angle label fits wholly inside the triangle with space from its edges',()=>{
  for(const f of faces.filter(f=>f.kind==='inner')){
    const {points,question:q}=triangleLayout(f);
    assert.ok(q.size>=14,'Narrowest diagram remains readable');
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
