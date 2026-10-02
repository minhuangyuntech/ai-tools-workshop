import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
const base='/ai-tools-workshop/';
const pages=readdirSync('dist').filter(f=>f.endsWith('.html'));
assert.equal(pages.length,14,'Expected landing, course overview, 11 units and 404');
let checked=0;
for(const page of pages){
  const html=readFileSync(join('dist',page),'utf8');
  assert.match(html,/<html lang="zh-Hant"/);
  assert.doesNotMatch(html,/hero-robot|female-robot|cover-robot/);
  if(!['index.html','404.html'].includes(page)){
    assert.match(html,/data-course-page/);
    assert.match(html,/access-pending/);
  }
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(new Set(ids).size,ids.length,`Duplicate IDs in ${page}`);
  for(const [,url] of html.matchAll(/(?:href|src)="([^"]+)"/g)){
    if(/^(https?:|mailto:|data:)/.test(url)) continue;
    const [path,fragment]=url.split('#');
    if(path.startsWith('/'))assert.ok(path.startsWith(base),`Wrong Pages base: ${url}`);
    const relative=path.startsWith(base)?path.slice(base.length):path;
    const target=join('dist',decodeURIComponent(relative||page));
    assert.ok(existsSync(target),`Missing file in ${page}: ${url}`);
    if(fragment&&target.endsWith('.html'))assert.match(readFileSync(target,'utf8'),new RegExp(`id="${fragment}"`),`Missing fragment in ${page}: ${url}`);
    checked++;
  }
}
function files(root){return readdirSync(root,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(join(root,e.name)):join(root,e.name));}
const source=resolve('../ai-course');
if(existsSync(source)){
  const originals=files(source);
  for(const file of originals){
    const dest=join('dist/workshop-files',file.slice(source.length+1));
    assert.ok(existsSync(dest),`Missing workshop source: ${dest}`);
    const hash=f=>createHash('sha256').update(readFileSync(f)).digest('hex');
    assert.equal(hash(file),hash(dest),`Workshop file changed: ${file}`);
  }
  console.log(`Verified ${originals.length} original workshop files by SHA-256.`);
}
for(const f of files('dist'))assert.ok(statSync(f).size<100*1024*1024,`File exceeds 100 MiB: ${f}`);
console.log(`Verified ${pages.length} pages and ${checked} local links/assets.`);
