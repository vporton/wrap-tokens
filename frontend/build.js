const execSync = require('child_process').execSync;
const fs = require('fs');

execSync("npx react-scripts build");

fs.writeFileSync("build/CNAME", "erc1155.portonvictor.org");

const inhead = `
<!-- Global site tag (gtag.js) - Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-6ZX3GEN0J8"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-6ZX3GEN0J8');
</script>
`;

const bodyend = `
<!-- Go to www.addthis.com/dashboard to customize your tools -->
<script type="text/javascript" src="//s7.addthis.com/js/300/addthis_widget.js#pubid=ra-5fe51e96906ed44b"></script>
`;

const indexFileName = "build/index.html";
let index = fs.readFileSync(indexFileName, {encoding: 'utf-8'});
index = index.replace("<head>", "<head>" + inhead);
index = index.replace("</body>", bodyend + "</body>");
fs.writeFileSync(indexFileName, index);
