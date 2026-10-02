import { randomBytes, createHash } from 'node:crypto';
import { writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
if (existsSync('src/course-access.json') && !process.env.COURSE_CODE) {
  console.log('Course code already configured. Set COURSE_CODE to replace it.');
  process.exit(0);
}
const code = process.env.COURSE_CODE?.trim() || `AI-${randomBytes(3).toString('hex').toUpperCase()}`;
if (code.length < 6) throw new Error('Course code must have at least 6 characters.');
const salt = randomBytes(16).toString('hex');
const config = {version: randomBytes(8).toString('hex'), salt, digest:createHash('sha256').update(salt+':'+code).digest('hex')};
writeFileSync('src/course-access.json', JSON.stringify(config,null,2)+'\n');
const privateFile = resolve('../ai-tools-workshop_課程管理.txt');
writeFileSync(privateFile, `AI 應用實作｜課程入口管理\n\n課程碼：${code}\n網站：https://minhuangyuntech.github.io/ai-tools-workshop/\n\n這是前端簡易入口，無法防止繞過或直接存取公開檔案。\n此檔案位於 repo 之外，請勿放入 public 或提交到 Git。\n換碼後請重新建置及推送。\n`);
console.log('Course code configured; private record: '+privateFile);
