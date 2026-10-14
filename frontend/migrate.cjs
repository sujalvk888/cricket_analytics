const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

// 1. Create directories
const dirs = [
  'styles',
  'components/Layout',
  'pages/Home',
  'pages/DataEntry',
  'pages/LiveMatch',
  'pages/AllDataSaved/components',
  'pages/EditSavedData'
];

dirs.forEach(d => {
  const fullPath = path.join(srcDir, d);
  if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
});

// 2. Split CSS
const indexCssPath = path.join(srcDir, 'index.css');
if (fs.existsSync(indexCssPath)) {
  const css = fs.readFileSync(indexCssPath, 'utf8');
  const lines = css.split('\n');
  
  const getLines = (start, end) => lines.slice(start, end).join('\n');
  
  let headerIdx = lines.findIndex(l => l.includes('/* Header */'));
  let mainContentIdx = lines.findIndex(l => l.includes('/* Main Content */'));
  let footerIdx = lines.findIndex(l => l.includes('/* Footer */'));
  let dataEntryIdx = lines.findIndex(l => l.includes('/* Data Entry Page */'));
  
  // Try to find the exact comment blocks
  const allSavedMatches = lines.map((l, i) => l.includes('ALL SAVED MATCH DATA PAGE') ? i : -1).filter(i => i !== -1);
  const editSavedMatches = lines.map((l, i) => l.includes('EDIT SAVED MATCH DATA PAGE') ? i : -1).filter(i => i !== -1);
  const liveMatchMatches = lines.map((l, i) => l.includes('LIVE MATCH INTERACTION DASHBOARD') ? i : -1).filter(i => i !== -1);

  let allSavedIdx = allSavedMatches.length > 0 ? allSavedMatches[0] : -1;
  let editSavedIdx = editSavedMatches.length > 0 ? editSavedMatches[0] : -1;
  let liveMatchIdx = liveMatchMatches.length > 0 ? liveMatchMatches[0] : -1;
  
  if (allSavedIdx !== -1) allSavedIdx -= 1; 
  if (editSavedIdx !== -1) editSavedIdx -= 1;
  if (liveMatchIdx !== -1) liveMatchIdx -= 1;

  const globalCss = getLines(0, headerIdx);
  const layoutCss = getLines(headerIdx, mainContentIdx) + '\n' + getLines(footerIdx, dataEntryIdx);
  const homeCss = getLines(mainContentIdx, footerIdx);
  const dataEntryCss = getLines(dataEntryIdx, allSavedIdx);
  const allSavedCss = getLines(allSavedIdx, editSavedIdx);
  const editSavedCss = getLines(editSavedIdx, liveMatchIdx);
  const liveMatchCss = getLines(liveMatchIdx, lines.length);

  fs.writeFileSync(path.join(srcDir, 'styles', 'global.css'), globalCss);
  fs.writeFileSync(path.join(srcDir, 'components', 'Layout', 'Layout.css'), layoutCss);
  fs.writeFileSync(path.join(srcDir, 'pages', 'Home', 'Home.css'), homeCss);
  fs.writeFileSync(path.join(srcDir, 'pages', 'DataEntry', 'DataEntry.css'), dataEntryCss);
  fs.writeFileSync(path.join(srcDir, 'pages', 'AllDataSaved', 'AllDataSaved.css'), allSavedCss);
  fs.writeFileSync(path.join(srcDir, 'pages', 'EditSavedData', 'EditSavedData.css'), editSavedCss);
  fs.writeFileSync(path.join(srcDir, 'pages', 'LiveMatch', 'LiveMatch.css'), liveMatchCss);
}

// 3. Move Files & Update Imports
const moveFile = (oldPath, newPath) => {
  const fullOld = path.join(srcDir, oldPath);
  const fullNew = path.join(srcDir, newPath);
  if (fs.existsSync(fullOld)) {
    fs.renameSync(fullOld, fullNew);
  }
};

moveFile('components/Layout.jsx', 'components/Layout/Layout.jsx');
moveFile('components/SavedInningsCard.jsx', 'pages/AllDataSaved/components/SavedInningsCard.jsx');
moveFile('pages/Home.jsx', 'pages/Home/Home.jsx');
moveFile('pages/DataEntry.jsx', 'pages/DataEntry/DataEntry.jsx');
moveFile('pages/LiveMatch.jsx', 'pages/LiveMatch/LiveMatch.jsx');
moveFile('pages/AllDataSaved.jsx', 'pages/AllDataSaved/AllDataSaved.jsx');
moveFile('pages/EditSavedData.jsx', 'pages/EditSavedData/EditSavedData.jsx');

// Update App.jsx imports
if (fs.existsSync(path.join(srcDir, 'App.jsx'))) {
  let appJsx = fs.readFileSync(path.join(srcDir, 'App.jsx'), 'utf8');
  appJsx = appJsx.replace(/import Layout from '.\/components\/Layout';/, "import Layout from './components/Layout/Layout';");
  appJsx = appJsx.replace(/import Home from '.\/pages\/Home';/, "import Home from './pages/Home/Home';");
  appJsx = appJsx.replace(/import DataEntry from '.\/pages\/DataEntry';/, "import DataEntry from './pages/DataEntry/DataEntry';");
  appJsx = appJsx.replace(/import LiveMatch from '.\/pages\/LiveMatch';/, "import LiveMatch from './pages/LiveMatch/LiveMatch';");
  appJsx = appJsx.replace(/import AllDataSaved from '.\/pages\/AllDataSaved';/, "import AllDataSaved from './pages/AllDataSaved/AllDataSaved';");
  appJsx = appJsx.replace(/import EditSavedData from '.\/pages\/EditSavedData';/, "import EditSavedData from './pages/EditSavedData/EditSavedData';");
  appJsx = appJsx.replace(/import '.\/index.css';/, "import './styles/global.css';");
  fs.writeFileSync(path.join(srcDir, 'App.jsx'), appJsx);
}

// Update main.jsx imports
if (fs.existsSync(path.join(srcDir, 'main.jsx'))) {
  let mainJsx = fs.readFileSync(path.join(srcDir, 'main.jsx'), 'utf8');
  mainJsx = mainJsx.replace(/import '.\/index.css';/, "import './styles/global.css';");
  fs.writeFileSync(path.join(srcDir, 'main.jsx'), mainJsx);
}

// Add CSS imports to JSX files & fix their local imports
const fixJsx = (fileRelPath, isPage, cssName) => {
  const fullPath = path.join(srcDir, fileRelPath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // add css import if not exists
    if (cssName && !content.includes(`import './${cssName}'`)) {
      content = content.replace(/(import .* from .*;\n)/, `$1import './${cssName}';\n`);
    }
    
    if (isPage && fileRelPath.includes('AllDataSaved.jsx')) {
      content = content.replace(/import SavedInningsCard from '..\/components\/SavedInningsCard';/, "import SavedInningsCard from './components/SavedInningsCard';");
    }
    
    fs.writeFileSync(fullPath, content);
  }
};

fixJsx('components/Layout/Layout.jsx', false, 'Layout.css');
fixJsx('pages/Home/Home.jsx', true, 'Home.css');
fixJsx('pages/DataEntry/DataEntry.jsx', true, 'DataEntry.css');
fixJsx('pages/LiveMatch/LiveMatch.jsx', true, 'LiveMatch.css');
fixJsx('pages/AllDataSaved/AllDataSaved.jsx', true, 'AllDataSaved.css');
fixJsx('pages/EditSavedData/EditSavedData.jsx', true, 'EditSavedData.css');

// Fix global.css background image path
const globalCssPath = path.join(srcDir, 'styles', 'global.css');
if (fs.existsSync(globalCssPath)) {
  let content = fs.readFileSync(globalCssPath, 'utf8');
  content = content.replace(/url\('\.\/assets\/stadium_bg\.png'\)/g, "url('../assets/stadium_bg.png')");
  fs.writeFileSync(globalCssPath, content);
}

// Delete unused
if (fs.existsSync(path.join(srcDir, 'App.css'))) fs.unlinkSync(path.join(srcDir, 'App.css'));
if (fs.existsSync(path.join(srcDir, 'index.css'))) fs.unlinkSync(path.join(srcDir, 'index.css'));

console.log("Migration complete!");
