export function describe(f){return f.kind==='given'?f.value+'°':(f.kind==='inner'?'삼각형 내각 ?':'삼각형 외각 ?')+' · 다른 두 내각 '+f.a+'°, '+f.b+'°';}

export function triangleLayout(f){
  const A=f.a*Math.PI/180,B=f.b*Math.PI/180,C=Math.PI-A-B;
  const len=100*Math.sin(C)/Math.sin(B);
  let points=[[0,0],[len*Math.cos(A),-len*Math.sin(A)],[100,0]];
  const xs=points.map(p=>p[0]),minX=Math.min(...xs),maxX=Math.max(...xs);
  const inner=f.kind==='inner';
  const scale=Math.min((inner?120:105)/(maxX-minX),(inner?72:65)/-points[1][1]);
  points=points.map(([x,y])=>[(inner?18:22)+(x-minX)*scale,95+y*scale]);
  const [a,b,c]=points;
  if(!inner){
    // Keep the complete question mark in the exterior wedge, above the extension.
    const size=17,w=.32*size,h=.52*size,dx=b[0]-c[0],dy=b[1]-c[1];
    const offset=Math.max(w+2,w+(2*Math.hypot(dx,dy)+dx*(2*h+2))/-dy);
    return {points,question:{x:c[0]+offset,y:c[1]-h-2,size}};
  }

  // Fit a smaller label near the unknown vertex C, keeping a 2-unit edge gap.
  // Remaining barycentric space goes toward C instead of the triangle centre.
  const area2=Math.abs((b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]));
  const edges=points.map((_,i)=>{
    const p=points[(i+1)%3],q=points[(i+2)%3],dx=q[0]-p[0],dy=q[1]-p[1];
    return {length:Math.hypot(dx,dy),support:.32*Math.abs(dy)+.52*Math.abs(dx)};
  });
  const maxSize=(area2-2*edges.reduce((s,e)=>s+e.length,0))/edges.reduce((s,e)=>s+e.support,0);
  const size=Math.min(17,maxSize*.9);
  const weights=edges.map(e=>(size*e.support+2*e.length)/area2);
  weights[2]+=1-weights.reduce((sum,w)=>sum+w,0);
  const x=points.reduce((s,p,i)=>s+p[0]*weights[i],0),y=points.reduce((s,p,i)=>s+p[1]*weights[i],0);
  return {points,question:{x,y,size}};
}

export function diagram(f){
  if(f.kind==='given')return '<div class="given">'+f.value+'<small>°</small></div>';
  const {points,question:q}=triangleLayout(f),[a,b,c]=points;
  const fmt=p=>p.map(n=>n.toFixed(2)).join(','),ext=f.kind==='outer';
  const question='<text class="unknown" text-anchor="middle" x="'+q.x+'" y="'+q.y+'"'+' dominant-baseline="central" style="font-size:'+q.size+'px"'+'>?</text>';
  return '<svg viewBox="0 0 160 132" aria-hidden="true"><path d="M'+fmt(a)+' L'+fmt(b)+' L'+fmt(c)+' Z" fill="#e1eadb" stroke="#385d60" stroke-width="2.2"/>'+(ext?'<path d="M'+fmt(c)+' l27,0" stroke="#ac5e32" stroke-width="2.2"/>':'')+'<text x="'+(a[0]+2)+'" y="114">'+f.a+'°</text><text text-anchor="middle" x="'+b[0]+'" y="'+Math.max(15,b[1]-7)+'">'+f.b+'°</text>'+question+'<text class="caption" x="80" y="129" text-anchor="middle">'+(ext?'바깥 각':'안쪽 각')+'</text></svg>';
}
