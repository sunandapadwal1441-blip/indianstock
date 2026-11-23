const cheerio = require('cheerio');
const clean = s => String(s||'').replace(/\s+/g,' ').trim();
const num = s => { const x=clean(s).replace(/[₹,% ,]/g,'').replace(/x$/i,''); if(!x||x==='-'||x==='—')return null; const v=Number(x); return Number.isFinite(v)?v:null; };
function parseScreenerHtml(html, url) {
  const $=cheerio.load(html); const title=clean($('h1').first().text())||clean($('title').text());
  const tables=[];
  $('section, .card').each((_,section)=>{});
  $('table').each((i,table)=>{
    const rows=[];
    $(table).find('tr').each((_,tr)=>{const cells=$(tr).find('th,td').map((__,td)=>clean($(td).text())).get();if(cells.length)rows.push(cells);});
    if(rows.length) tables.push({index:i,rows});
  });
  const metrics={};
  $('li, .company-ratios li, .flex-row').each((_,el)=>{
    const t=clean($(el).text());
    const m=t.match(/^(.{2,40}?)\s+([\d,.%-]+)$/); if(m)metrics[clean(m[1])]=num(m[2]);
  });
  const findMetric=(...keys)=>{for(const k of keys){const hit=Object.keys(metrics).find(x=>x.toLowerCase()===k.toLowerCase()||x.toLowerCase().includes(k.toLowerCase()));if(hit)return metrics[hit];}return null;};
  const financialTables=tables.map(t=>({index:t.index,rows:t.rows}));
  return {company:title,sourceUrl:url,source:'Screener.in public company page',fetchedAt:new Date().toISOString(),metrics:{currentPrice:findMetric('Current Price'),marketCap:findMetric('Market Cap'),stockPE:findMetric('Stock P/E','P/E'),bookValue:findMetric('Book Value'),dividendYield:findMetric('Dividend Yield'),roe:findMetric('ROE'),roce:findMetric('ROCE'),debtToEquity:findMetric('Debt / Equity')},tables:financialTables,notice:'Raw tables are preserved for review. Map/confirm financial periods and units before using them in valuation.'};
}
async function fetchScreenerPage(url) {
  const parsed=new URL(url);
  if(parsed.hostname!=='www.screener.in'&&parsed.hostname!=='screener.in') throw new Error('Only screener.in company URLs are accepted.');
  if(!parsed.pathname.startsWith('/company/')) throw new Error('Enter a Screener company URL, for example https://www.screener.in/company/TCS/.');
  const response=await fetch(parsed.toString(),{headers:{'User-Agent':'Mozilla/5.0 (compatible; PersonalResearchTool/1.0)'},signal:AbortSignal.timeout(20000)});
  if(!response.ok) throw new Error(`Screener returned HTTP ${response.status}. Open the page in your browser or import its CSV/JSON data instead.`);
  const html=await response.text();
  if(/captcha|access denied|robot check/i.test(html)) throw new Error('Screener did not allow automated access. Open the page manually and import/export the data instead.');
  return parseScreenerHtml(html,parsed.toString());
}
module.exports={fetchScreenerPage,parseScreenerHtml};
