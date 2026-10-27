// Export built-in ImageGen sheets without altering the reference assets.
// Usage: node tools/export_illustrated_portraits.cjs <generated-images-dir> <sharp-module>
const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require(process.argv[3] || 'sharp');
const sourceDir = process.argv[2];
const out = path.resolve('tools/art/archive/illustrated_portraits');
const sources = {
  noura: 'exec-4592fbc0-e294-4d1d-b3b5-27d5ca53964a.png',
  faisal: 'exec-cfa5963f-a8c9-4e0f-8dc2-692828125707.png',
  tariq: 'exec-35e34ab6-aa0c-4c79-8d2a-754617a59b4a.png',
  lama: 'exec-c4659d52-5df5-4046-88fd-f49fb07b202e.png',
  sultan: 'exec-bf906694-e1ab-4a51-8b7f-6432d63453dc.png',
  ghabga: 'exec-7a0656ed-08d7-46bc-b1c3-d69fde0fab69.png',
};
const expressions = ['neutral', 'happy', 'surprised', 'worried', 'angry'];
// Retain the principal connected alpha region when exporting a sprite cell.
// This removes disconnected generation specks, retaining original edge colors.
async function cleanAlpha(pipeline) {
  const {data,info} = await pipeline.ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const w=info.width,h=info.height,n=w*h, seen=new Uint8Array(n);
  let largest=[];
  for(let start=0;start<n;start++) {
    if(seen[start] || data[start*4+3]<96) continue;
    const group=[start];seen[start]=1;
    for(let k=0;k<group.length;k++) {
      const p=group[k],x=p%w,y=Math.floor(p/w);
      for(const q of [x>0?p-1:-1,x<w-1?p+1:-1,y>0?p-w:-1,y<h-1?p+w:-1]) {
        if(q>=0 && !seen[q] && data[q*4+3]>=96) {seen[q]=1;group.push(q);}
      }
    }
    if(group.length>largest.length) largest=group;
  }
  const keep=new Uint8Array(n);
  for(const p of largest) {
    const x=p%w,y=Math.floor(p/w);
    for(let dy=-1;dy<=1;dy++) for(let dx=-1;dx<=1;dx++) {
      if(x+dx>=0&&x+dx<w&&y+dy>=0&&y+dy<h) keep[p+dy*w+dx]=1;
    }
  }
  for(let p=0;p<n;p++) if(!keep[p]) data[p*4+3]=0;
  return sharp(data,{raw:{width:w,height:h,channels:4}});
}
(async () => {
  await fs.mkdir(path.join(out, 'sources'), {recursive:true});
  const assets = {};
  for (const [id, file] of Object.entries(sources)) {
    const input = path.join(sourceDir, file);
    await fs.copyFile(input, path.join(out, 'sources', `${id}.png`));
    const meta = await sharp(input).metadata();
    assets[id] = {};
    for (const [index, expression] of (id === 'ghabga' ? ['neutral'] : expressions).entries()) {
      const pipeline = sharp(input);
      if (id !== 'ghabga') {
        const col = index % 3, row = Math.floor(index / 3);
        const left = Math.round(col * meta.width / 3), top = Math.round(row * meta.height / 2);
        pipeline.extract({left, top, width:Math.round((col+1)*meta.width/3)-left, height:Math.round((row+1)*meta.height/2)-top});
      }
      const filename = `${id}_${expression}.webp`;
      const clean = await cleanAlpha(pipeline);
      await clean.resize(512,512,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}})
        .webp({quality:88,alphaQuality:100,effort:4}).toFile(path.join(out,filename));
      const check = await sharp(path.join(out,filename)).metadata();
      if (check.width !== 512 || check.height !== 512 || !check.hasAlpha) throw Error(`Invalid export: ${filename}`);
      assets[id][expression] = filename;
    }
  }
  await fs.writeFile(path.join(out,'manifest.json'), JSON.stringify({generator:'built-in image_gen',width:512,height:512,format:'webp',alpha:true,assets},null,2)+'\n');
  console.log(`Verified ${Object.values(assets).reduce((n,a)=>n+Object.keys(a).length,0)} transparent 512px WebP assets.`);
})().catch(e=>{console.error(e);process.exitCode=1;});
