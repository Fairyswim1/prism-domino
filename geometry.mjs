import {svgMath,mathHtml} from './math-display.mjs';
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
    return withAngleArc(f,points,{x:c[0]+offset,y:c[1]-h-2,size});
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
  return withAngleArc(f,points,{x,y,size});
}

function withAngleArc(f,points,question){
  const [a,b,c]=points,q={...question},inner=f.kind==='inner';
  const w=.32*q.size,h=.52*q.size,verticalGap=c[1]-q.y-h;
  const desiredHorizontal=Math.sqrt(Math.max(0,10**2-verticalGap**2));
  if(inner){
    // Move only as far as necessary along the base to leave room for the arc.
    const dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy);
    const clearance=(dx*(q.y-a[1])-dy*(q.x-a[0])-w*Math.abs(dy)-h*Math.abs(dx))/length;
    const available=Math.max(0,(clearance-2)*length/-dy);
    q.x-=Math.max(0,Math.min(available,q.x-(c[0]-w-desiredHorizontal)));
  }else{
    q.x+=Math.max(0,Math.min(158-q.x-w,c[0]+w+desiredHorizontal-q.x));
  }
  const textDistance=Math.hypot(Math.max(0,Math.abs(q.x-c[0])-w),Math.max(0,Math.abs(q.y-c[1])-h));
  const radius=Math.min(8,textDistance-2,.25*Math.hypot(b[0]-c[0],b[1]-c[1]),.25*Math.hypot(a[0]-c[0],a[1]-c[1]));
  const endAngle=Math.atan2(b[1]-c[1],b[0]-c[0]);
  const arc={center:c,radius,start:[c[0]+(inner?-radius:radius),c[1]],end:[c[0]+radius*Math.cos(endAngle),c[1]+radius*Math.sin(endAngle)],startAngle:inner?-Math.PI:0,endAngle,sweep:inner?1:0};
  return {points,question:q,arc};
}

export function diagram(f){
  if(f.kind==='given')return '<div class="given">'+mathHtml(f.value+'°')+'</div>';
  const {points,question:q,arc}=triangleLayout(f),[a,b,c]=points;
  const fmt=p=>p.map(n=>n.toFixed(2)).join(','),ext=f.kind==='outer';
  const marker='<path class="angle-arc" d="M'+fmt(arc.start)+' A'+arc.radius.toFixed(2)+','+arc.radius.toFixed(2)+' 0 0 '+arc.sweep+' '+fmt(arc.end)+'" fill="none" stroke="#ac5e32" stroke-width="1.6" stroke-linecap="round"/>';
  const question='<text class="unknown" text-anchor="middle" x="'+q.x+'" y="'+q.y+'"'+' dominant-baseline="central" style="font-size:'+q.size+'px"'+'>?</text>';
  return '<svg viewBox="0 0 160 132" aria-hidden="true"><path d="M'+fmt(a)+' L'+fmt(b)+' L'+fmt(c)+' Z" fill="#e1eadb" stroke="#385d60" stroke-width="2.2"/>'+(ext?'<path d="M'+fmt(c)+' l27,0" stroke="#ac5e32" stroke-width="2.2"/>':'')+svgMath(f.a+'°',a[0],97,44,25)+svgMath(f.b+'°',Math.max(0,b[0]-22),Math.max(0,b[1]-27),44,25,'center')+marker+question+'<text class="caption" x="80" y="129" text-anchor="middle">'+(ext?'바깥 각':'안쪽 각')+'</text></svg>';
}
