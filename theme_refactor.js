const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      filelist = walkSync(fullPath, filelist);
    } else {
      filelist.push(fullPath);
    }
  });
  return filelist;
};

const files = walkSync('./app').concat(walkSync('./components'));
const tsxFiles = files.filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));

const mappings = [
  // Backgrounds - make light mode background slightly off-white for depth
  { search: /(?<!dark:)bg-zinc-50\b/g, replace: 'bg-[#f8fafc] dark:bg-zinc-950' },
  
  // Cards - add subtle borders and shadows in light mode
  { search: /(?<!dark:)bg-white dark:bg-\[\#0a0a0a\]/g, replace: 'bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none' },
  { search: /(?<!dark:)bg-zinc-100 dark:bg-zinc-900/g, replace: 'bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-white/5 shadow-inner dark:shadow-none' },
  
  // Buttons - improve contrast
  { search: /(?<!dark:)bg-zinc-100 dark:bg-zinc-800/g, replace: 'bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-700' },
  
  // Text - ensure headings are sharp
  { search: /(?<!dark:)text-zinc-900 dark:text-white/g, replace: 'text-slate-900 dark:text-white' },
  { search: /(?<!dark:)text-zinc-500 dark:text-zinc-500/g, replace: 'text-slate-500 dark:text-zinc-500' },
  
  // Special cases for the admin dashboard badges
  { search: /bg-white dark:bg-white\/\[0\.03\]/g, replace: 'bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 shadow-sm' },
];

tsxFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  mappings.forEach(m => {
    content = content.replace(m.search, m.replace);
  });
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Polished ${file}`);
  }
});
