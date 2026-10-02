import './legacy.css';
import './styles.css';
import access from './course-access.json';

const $=(q,s=document)=>s.querySelector(q), $$=(q,s=document)=>[...s.querySelectorAll(q)];
const ACCESS_KEY='ai-tools-workshop.access.v2', STORE_KEY='ai-tools-workshop.progress.v2';
const allowed=['course','tools','agents','prompting','images','reviews','notebook','reports','skills','finish','downloads','sources'];
const base=import.meta.env.BASE_URL;
const page=document.body.dataset.page;
const titles={agents:'Agent 與 API',prompting:'提示詞練習',images:'生圖與修圖',reviews:'評論與查核',notebook:'NotebookLM 作品',reports:'報告與流程圖',skills:'Gemini Skills',finish:'成果與測驗',tools:'AI 工具比較'};
let store={checks:{},notes:{},lastPage:'tools',quiz:{}};
let persistent=true;
try{const saved=JSON.parse(localStorage.getItem(STORE_KEY)||'null');if(saved && typeof saved==='object')store={...store,...saved};}catch{persistent=false;}
function save(){try{localStorage.setItem(STORE_KEY,JSON.stringify(store));return true;}catch{persistent=false;return false;}}
let timer;function toast(text){const el=$('#toast');if(!el)return;el.textContent=text;el.classList.add('show');clearTimeout(timer);timer=setTimeout(()=>el.classList.remove('show'),3000);}
function hasAccess(){try{const token=JSON.parse(sessionStorage.getItem(ACCESS_KEY)||'null');return token?.version===access.version&&token.until>Date.now();}catch{return false;}}
async function digest(code){const value=new TextEncoder().encode(access.salt+':'+code.trim());return [...new Uint8Array(await crypto.subtle.digest('SHA-256',value))].map(n=>n.toString(16).padStart(2,'0')).join('');}
if(document.body.hasAttribute('data-course-page')){
 if(!hasAccess())location.replace(base+'index.html?next='+encodeURIComponent(page==='home'?'course':page)+'#access');
 else{document.documentElement.classList.remove('access-pending');initCourse();}
}else initLanding();
function initLanding(){
 const form=$('#access-form');if(!form)return;
 $('#course-code').addEventListener('input',()=>{$('#course-code').removeAttribute('aria-invalid');$('#access-error').textContent='';});
 $('#toggle-code').addEventListener('click',()=>{const input=$('#course-code'),show=input.type==='password';input.type=show?'text':'password';$('#toggle-code').textContent=show?'隱藏':'顯示';$('#toggle-code').setAttribute('aria-label',show?'隱藏課程碼':'顯示課程碼');$('#toggle-code').setAttribute('aria-pressed',String(show));});
 form.addEventListener('submit',async e=>{e.preventDefault();const status=$('#access-error');$('#enter-course').disabled=true;status.textContent='正在確認課程碼…';
 try{if(await digest($('#course-code').value)!==access.digest){status.textContent='課程碼不正確，請確認後再試一次。';$('#course-code').setAttribute('aria-invalid','true');$('#course-code').focus();return;}
 sessionStorage.setItem(ACCESS_KEY,JSON.stringify({version:access.version,until:Date.now()+8*60*60*1000}));
 const requested=new URLSearchParams(location.search).get('next');const next=allowed.includes(requested)?requested:'course';location.assign(base+next+'.html');
 }catch{status.textContent='無法保存課程入口狀態，請允許瀏覽器的網站儲存並使用 HTTPS 或本機預覽網址。';}finally{$('#enter-course').disabled=false;}});
}
function initCourse(){
 if(!['home','sources','downloads','finish'].includes(page)){store.lastPage=page;save();}
 const toggle=$('#menu-toggle');toggle?.addEventListener('click',()=>{const opened=$('#sidebar').classList.toggle('open');toggle.setAttribute('aria-expanded',String(opened));});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){$('#sidebar')?.classList.remove('open');toggle?.setAttribute('aria-expanded','false');}});
 $$('.leave-course').forEach(b=>b.addEventListener('click',()=>{sessionStorage.removeItem(ACCESS_KEY);location.assign(base+'index.html#access');}));
 $$('.progress-check').forEach((el,i)=>{const key=page+':'+i;el.checked=Boolean(store.checks[key]);el.addEventListener('change',()=>{store.checks[key]=el.checked;save();updateProgress();});});
 updateProgress();
 const resume=$('#resume-course');if(resume){const dest=allowed.includes(store.lastPage)?store.lastPage:'tools';resume.href=dest+'.html';resume.textContent=Object.values(store.checks).some(Boolean)?'繼續上次的練習':'開始第一個單元';}
 $$('[data-copy]').forEach(b=>b.addEventListener('click',()=>copy(document.getElementById(b.dataset.copy)?.textContent||'',b)));
 const builder=$('#prompt-builder');builder?.addEventListener('submit',e=>{e.preventDefault();const d=new FormData(builder);const labels={task:'任務',material:'材料',format:'格式',limit:'限制'};$('#builder-text').textContent=Object.entries(labels).map(([key,label])=>label+'：'+(String(d.get(key)||'').trim()||'未提供，請先補充。')).join('\n\n');$('#builder-result').hidden=false;toast('提示詞已組合，複製後即可使用。');});
 $$('.tabs').forEach(list=>{const tabs=$$('[role="tab"]',list);function activate(tab,focus=false){tabs.forEach(t=>{const active=t===tab;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;document.getElementById(t.getAttribute('aria-controls')).hidden=!active;});if(focus)tab.focus();}tabs.forEach((t,i)=>{t.addEventListener('click',()=>activate(t));t.addEventListener('keydown',e=>{let idx;if(e.key==='ArrowRight')idx=(i+1)%tabs.length;if(e.key==='ArrowLeft')idx=(i+tabs.length-1)%tabs.length;if(e.key==='Home')idx=0;if(e.key==='End')idx=tabs.length-1;if(idx!==undefined){e.preventDefault();activate(tabs[idx],true);}});});});
 $$('.quiz').forEach((q,i)=>{$$('button',q).forEach((b,j)=>{function answer(){ $$('button',q).forEach(x=>x.setAttribute('aria-pressed',String(x===b)));$('.feedback',q).textContent=b.dataset.feedback;store.quiz[i]=j;save();}b.addEventListener('click',answer);if(store.quiz[i]===j)answer();});});
 const note=$('#lesson-note');if(note){note.value=store.notes[page]||'';$('#save-note').addEventListener('click',()=>{store.notes[page]=note.value;const saved=save();$('#note-state').textContent=saved?'已儲存':'本次暫存';toast(saved?'筆記已儲存在這個瀏覽器。':'瀏覽器不允許儲存，請先下載學習紀錄。');});note.addEventListener('input',()=>$('#note-state').textContent='尚未儲存');}
 $$('[data-export-records]').forEach(b=>b.addEventListener('click',exportRecords));
 $('#clear-records')?.addEventListener('click',()=>{$('#clear-confirmation').hidden=false;$('#clear-records').setAttribute('aria-expanded','true');$('#cancel-clear').focus();});
 $('#cancel-clear')?.addEventListener('click',()=>{$('#clear-confirmation').hidden=true;$('#clear-records').setAttribute('aria-expanded','false');$('#clear-records').focus();});
 $('#confirm-clear')?.addEventListener('click',()=>{store={checks:{},notes:{},lastPage:'tools',quiz:{}};save();location.reload();});
 const summary=$('#records-summary');if(summary)summary.textContent=`已保存 ${Object.values(store.notes).filter(Boolean).length} 頁筆記，完成 ${Object.values(store.checks).filter(Boolean).length} 項成果檢查。`;
 const picker=$('#tool-task');picker?.addEventListener('change',()=>{$('#tool-result').textContent={sources:'先用 NotebookLM，加入來源後練習回查引用。',writing:'先用 ChatGPT、Gemini 或 Claude，提供材料並要求明確格式。',image:'使用 ChatGPT 或 Gemini 圖片功能，先產生一張，再指定修改。',agent:'認識 Codex 或 Claude Code，先說清楚檔案、功能與驗收條件。'}[picker.value];});
 const range=$('#compare-slider');range?.addEventListener('input',()=>{$('#image-reveal').style.clipPath=`inset(0 ${100-Number(range.value)}% 0 0)`;$('#compare-value').textContent=range.value+'%';});
 if($('#download-search'))initDownloads();
 if(!persistent)toast('目前無法長期保存進度，請在離開前下載學習紀錄。');
}
function updateProgress(){const done=Object.values(store.checks).filter(Boolean).length;const progress=$('#course-progress');if(progress)progress.value=done;const label=$('#progress-label');if(label)label.textContent=done+' / 8';const overview=$('#overview-progress');if(overview)overview.textContent=done+' / 8';$$('[data-nav-status],[data-card-status]').forEach(el=>{const id=el.dataset.navStatus||el.dataset.cardStatus;const keys=Object.keys(store.checks).filter(k=>k.startsWith(id+':'));const expected=id==='notebook'||id==='reviews'?1:1;const complete=keys.length>=expected&&keys.every(k=>store.checks[k]);if(el.dataset.navStatus){el.textContent=complete?'✓':'';}else el.textContent=complete?'已完成':'開始練習';});}
async function copy(text,b){let ok=false;try{await navigator.clipboard.writeText(text);ok=true;}catch{const t=document.createElement('textarea');t.value=text;t.style.cssText='position:fixed;opacity:0;left:0;top:0';document.body.append(t);t.select();try{ok=document.execCommand('copy');}catch{}t.remove();b.focus();}if(ok){const old=b.textContent;b.textContent='已複製';setTimeout(()=>b.textContent=old,1600);toast('已複製，切到 AI 分頁貼上即可。');}else toast('請手動選取提示詞，按 Ctrl＋C 或 Command＋C。');}
function exportRecords(){if($('#lesson-note')){store.notes[page]=$('#lesson-note').value;save();}const text=['AI 應用實作｜我的學習紀錄',new Date().toLocaleString('zh-TW'),'','完成項目：',...Object.entries(store.checks).filter(([,v])=>v).map(([k])=>'✓ '+(titles[k.split(':')[0]]||k)),'','測驗紀錄：',...Object.entries(store.quiz).map(([k,v])=>'第 '+(Number(k)+1)+' 題：選項 '+(Number(v)+1)),'','筆記：',...Object.entries(store.notes).filter(([,v])=>v).map(([k,v])=>'【'+(titles[k]||k)+'】\n'+v)].join('\n');const object=URL.createObjectURL(new Blob(['\ufeff'+text],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=object;a.download='AI課程_我的學習紀錄.txt';a.click();setTimeout(()=>URL.revokeObjectURL(object),1000);}
function initDownloads(){const search=$('#download-search'),type=$('#download-type');const rows=$$('.lesson-body tr').filter(r=>r.querySelector('a[download]')),cards=$$('.download-card');const items=[...rows,...cards];function category(item){const href=item.querySelector('a[download]')?.href||'';const ext=href.split('.').pop().toLowerCase();return ['png','jpg','jpeg','webp'].includes(ext)?'image':['mp4','webm'].includes(ext)?'video':ext==='zip'?'zip':'text';}function filter(){const q=search.value.trim().toLowerCase();let found=0;items.forEach(item=>{const visible=(!q||item.textContent.toLowerCase().includes(q))&&(type.value==='all'||category(item)===type.value);item.hidden=!visible;if(visible)found++;});$('#download-count').textContent=found?`顯示 ${found} 個檔案項目`:'沒有符合條件的檔案，請換個關鍵字。';}search.addEventListener('input',filter);type.addEventListener('change',filter);filter();}
