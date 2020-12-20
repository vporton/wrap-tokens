const execSync = require('child_process').execSync;
const fs = require('fs');

execSync("npx react-scripts build");

fs.writeFileSync("build/CNAME", "erc1155.portonvictor.org");

const inhead = `
<base href="http://localhost/~porton/erc/"/>
<!-- Global site tag (gtag.js) - Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-6ZX3GEN0J8"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-6ZX3GEN0J8');
</script>
<script>
//window.addEventListener('load', (event) => {
//  const head = document.querySelector('head');
//  head.innerHTML += "<base href='location.href=location.href.replace(/[\\^]*$/, \\\"\\\")'/>";
//});
</script>
`;

const indexFileName = "build/index.html";
let index = fs.readFileSync(indexFileName, {encoding: 'utf-8'});
index = index.replace("<head>", "<head>" + inhead);
fs.writeFileSync(indexFileName, index);
