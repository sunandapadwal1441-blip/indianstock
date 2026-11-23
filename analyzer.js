const n = (v) => v === '' || v === null || v === undefined || !Number.isFinite(Number(v)) ? null : Number(v);
const pct = (v) => n(v) === null ? null : n(v) / 100;
const avg = (items) => { const a = items.filter(Number.isFinite); return a.length ? a.reduce((x,y)=>x+y,0)/a.length : null; };
const score = (value, bands) => { if (value === null) return null; for (const [test, points] of bands) if (test(value)) return points; return 0; };
const round = (v, d=2) => v === null || !Number.isFinite(v) ? null : Number(v.toFixed(d));
const sumKnown = (obj) => Object.values(obj).reduce((s,v)=>s+(v ?? 0),0);

function analyzeGrowthStock(d) {
  const missing = [];
  const required = ['currentPrice','revenueCagr5y','epsCagr5y','roe','roce','operatingCashFlow','netProfit','debtToEquity','forwardEps','expectedEpsGrowth'];
  required.forEach(k => { if (n(d[k]) === null) missing.push(k); });
  const growth = {
    revenueCagr5y: score(n(d.revenueCagr5y), [[v=>v>=25,6],[v=>v>=20,5],[v=>v>=15,4],[v=>v>=10,3],[v=>v>=5,1]]),
    epsCagr5y: score(n(d.epsCagr5y), [[v=>v>=25,6],[v=>v>=20,5],[v=>v>=15,4],[v=>v>=10,3],[v=>v>=5,1]]),
    revenueCagr3y: score(n(d.revenueCagr3y), [[v=>v>=25,4],[v=>v>=20,3.5],[v=>v>=15,3],[v=>v>=10,2],[v=>v>=5,1]]),
    epsCagr3y: score(n(d.epsCagr3y), [[v=>v>=25,4],[v=>v>=20,3.5],[v=>v>=15,3],[v=>v>=10,2],[v=>v>=5,1]]),
    futureGrowthVisibility: n(d.futureGrowthVisibilityScore)
  };
  const profitability = {
    roe: score(n(d.roe), [[v=>v>=20,4],[v=>v>=15,3],[v=>v>=10,2],[v=>v>=5,1]]),
    roce: score(n(d.roce), [[v=>v>=20,4],[v=>v>=15,3],[v=>v>=10,2],[v=>v>=5,1]]),
    operatingMargin: score(n(d.operatingMargin), [[v=>v>=20,3],[v=>v>=15,2.5],[v=>v>=10,2],[v=>v>=5,1]]),
    netMargin: score(n(d.netMargin), [[v=>v>=15,2],[v=>v>=10,1.5],[v=>v>=5,1]]),
    cashConversion: n(d.operatingCashFlow) === null || n(d.netProfit) === null || n(d.netProfit) <= 0 ? null : score(n(d.operatingCashFlow)/n(d.netProfit), [[v=>v>=1.2,4],[v=>v>=1,3],[v=>v>=.7,2],[v=>v>=.4,1]]),
    fcfConsistencyScore: n(d.fcfConsistencyScore)
  };
  const competitive = {
    marketLeadership: n(d.marketLeadershipScore), entryBarriers: n(d.entryBarrierScore), industryOpportunity: n(d.industryOpportunityScore), customerRetention: n(d.customerRetentionScore), scalability: n(d.scalabilityScore)
  };
  const financial = {
    leverage: score(n(d.debtToEquity), [[v=>v<=.3,4],[v=>v<=.7,3],[v=>v<=1.2,2],[v=>v<=2,1]]),
    promoterHolding: score(n(d.promoterHolding), [[v=>v>=50,3],[v=>v>=35,2],[v=>v>=20,1]]),
    governanceScore: n(d.governanceScore), capitalAllocationScore: n(d.capitalAllocationScore), dilutionScore: n(d.dilutionScore)
  };
  const valuation = {
    forwardPeg: score(n(d.forwardPeg), [[v=>v>0&&v<=.75,5],[v=>v<=1,4],[v=>v<=1.5,3],[v=>v<=2,2],[v=>v<=2.5,1]]),
    forwardPe: n(d.forwardPeScore), evEbitda: n(d.evEbitdaScore), dcfUpside: n(d.dcfUpside) === null || n(d.currentPrice) === null ? null : score((n(d.dcfUpside)/n(d.currentPrice)-1)*100, [[v=>v>=30,6],[v=>v>=20,5],[v=>v>=10,3],[v=>v>=0,2],[v=>v>=-10,1]]),
    marginOfSafety: n(d.fairValue) === null || n(d.currentPrice) === null || n(d.fairValue) <= 0 ? null : score((n(d.fairValue)-n(d.currentPrice))/n(d.fairValue)*100, [[v=>v>=30,5],[v=>v>=20,4],[v=>v>=10,3],[v=>v>=0,1]])
  };
  const pillars = { growth:round(sumKnown(growth)), profitability:round(sumKnown(profitability)), competitiveAdvantage:round(sumKnown(competitive)), financialStrength:round(sumKnown(financial)), valuation:round(sumKnown(valuation)) };
  const maxAvailable = {growth:25,profitability:20,competitiveAdvantage:15,financialStrength:15,valuation:25};
  const pillarInputs = { growth, profitability, competitiveAdvantage: competitive, financialStrength: financial, valuation };
  const pillarMax = { growth: {revenueCagr5y:6,epsCagr5y:6,revenueCagr3y:4,epsCagr3y:4,futureGrowthVisibility:5}, profitability: {roe:4,roce:4,operatingMargin:3,netMargin:2,cashConversion:4,fcfConsistencyScore:3}, competitiveAdvantage: {marketLeadership:3,entryBarriers:3,industryOpportunity:3,customerRetention:3,scalability:3}, financialStrength: {leverage:4,promoterHolding:3,governanceScore:3,capitalAllocationScore:3,dilutionScore:2}, valuation: {forwardPeg:5,forwardPe:5,evEbitda:4,dcfUpside:6,marginOfSafety:5} };
  const available = Object.keys(pillarInputs).reduce((s,k)=>s+Object.entries(pillarInputs[k]).reduce((a,[metric,value])=>a+(value===null?0:pillarMax[k][metric]),0),0);
  const rawTotal = sumKnown(pillars);
  const total = available ? round(rawTotal/available*100) : null;
  const risks = [];
  if (n(d.revenueCagr5y)!==null && n(d.revenueCagr5y)<5) risks.push('Revenue CAGR below 5%');
  if (n(d.epsCagr5y)!==null && n(d.epsCagr5y)<0) risks.push('Negative 5-year EPS CAGR');
  if (n(d.operatingCashFlow)!==null && n(d.operatingCashFlow)<0) risks.push('Negative operating cash flow');
  if (d.auditorQualified === true) risks.push('Auditor qualification — serious override');
  if (d.governanceConcern === true) risks.push('Governance concern — review required');
  if (n(d.forwardPeg)!==null && n(d.forwardPeg)>2.5) risks.push('Forward PEG above 2.5');
  if (d.financialDistress === true) risks.push('Financial distress — serious override');
  const category = d.businessCategory || 'Profitable Growth';
  const fairValue = n(d.fairValue);
  const priceRatio = fairValue && n(d.currentPrice)!==null ? n(d.currentPrice)/fairValue : null;
  const zone = priceRatio===null?'INSUFFICIENT_DATA':priceRatio<=.70?'STRONG_BUY':priceRatio<=.85?'BUY':priceRatio<=.95?'ACCUMULATE':priceRatio<=1.10?'HOLD':priceRatio<=1.25?'WATCH':'AVOID';
  let decision = !total || available < 60 ? 'DATA_INSUFFICIENT' : total<50 ? 'AVOID' : total<65 ? 'WATCH' : total<75 ? (['STRONG_BUY','BUY'].includes(zone)?'ACCUMULATE':zone) : total<85 ? ({STRONG_BUY:'BUY',BUY:'BUY',ACCUMULATE:'ACCUMULATE',HOLD:'HOLD',WATCH:'WATCH',AVOID:'AVOID'}[zone]) : ({STRONG_BUY:'STRONG_BUY',BUY:'BUY',ACCUMULATE:'BUY',HOLD:'HOLD',WATCH:'WATCH',AVOID:'AVOID'}[zone]);
  if (d.auditorQualified || d.governanceConcern || d.financialDistress) decision='AVOID — RISK OVERRIDE';
  const scenarios = {};
  for (const key of ['bear','base','bull']) {
    const s=d.scenarios?.[key]||{}; const growthRate=n(s.epsGrowth); const pe=n(s.forwardPe);
    const eps=n(d.forwardEps);
    const target=eps!==null&&growthRate!==null&&pe!==null ? eps*Math.pow(1+growthRate/100,1)*pe : null;
    scenarios[key]={epsGrowth:growthRate,forwardPe:pe,targetPrice:round(target),expectedReturn:target!==null&&n(d.currentPrice)>0?round((target/n(d.currentPrice)-1)*100):null};
  }
  return {engine:'GSVE',company:d.company||'Unnamed company',category,growthScore:total,scores:pillars,availableScoreCoverage:round(available),valuation:{currentPrice:n(d.currentPrice),fairValue,marginOfSafety:fairValue&&n(d.currentPrice)!==null?round((fairValue-n(d.currentPrice))/fairValue*100):null,forwardPE:n(d.forwardPe),forwardPEG:n(d.forwardPeg),priceZone:zone},scenarios,risks,missingFields:missing,confidence:missing.length>4?'LOW':missing.length?'MEDIUM':'HIGH',finalDecision:decision};
}

function analyzeValueStock(d) {
  const eps=n(d.eps), bvps=n(d.bvps), price=n(d.currentPrice), growth=n(d.epsCagr5y);
  const grahamNumber=eps>0&&bvps>0?Math.sqrt(22.5*eps*bvps):null;
  const lynchFairValue=eps>0&&growth>0?eps*Math.min(growth,25):null;
  const methods=[grahamNumber,lynchFairValue,n(d.historicalPeFairValue),n(d.dcfFairValue)].filter(v=>v!==null&&v>0);
  const fairValue=methods.length?avg(methods):null;
  const scores={piotroski:n(d.piotroskiScore),buffett:n(d.buffettScore),graham:n(d.grahamScore),lynch:n(d.lynchScore)};
  const valid=Object.values(scores).filter(v=>v!==null);
  const composite=valid.length?round(valid.reduce((s,v)=>s+v,0)/valid.length/10*100):null;
  const ratio=fairValue&&price?price/fairValue:null;
  const zone=ratio===null?'INSUFFICIENT_DATA':ratio<=.75?'STRONG_BUY':ratio<=.85?'BUY':ratio<=1.10?'HOLD':ratio<=1.25?'SELL':'STRONG_SELL';
  const risks=[];
  if(eps!==null&&eps<=0)risks.push('Non-positive EPS');
  if(n(d.piotroskiScore)!==null&&n(d.piotroskiScore)<=3)risks.push('Piotroski 0–3: financial-health gate');
  if(n(d.operatingCashFlow)!==null&&n(d.operatingCashFlow)<0)risks.push('Negative operating cash flow');
  if(d.auditorQualified)risks.push('Auditor qualification — serious override');
  let decision=valid.length<3||methods.length<1?'DATA_INSUFFICIENT':composite>=80&&zone==='STRONG_BUY'?'STRONG_BUY':composite>=70&&['STRONG_BUY','BUY'].includes(zone)?'BUY':composite>=60&&['STRONG_BUY','BUY','HOLD'].includes(zone)?'HOLD':'AVOID';
  if(n(d.piotroskiScore)!==null&&n(d.piotroskiScore)<=3)decision='AVOID / MANUAL REVIEW';
  if(d.auditorQualified)decision='AVOID — RISK OVERRIDE';
  return {engine:'VALUE',company:d.company||'Unnamed company',scores,compositeScore:composite,valuation:{currentPrice:price,grahamNumber:round(grahamNumber),lynchFairValue:round(lynchFairValue),historicalPeFairValue:n(d.historicalPeFairValue),dcfFairValue:n(d.dcfFairValue),compositeFairValue:round(fairValue),priceZone:zone,marginOfSafety:fairValue&&price?round((fairValue-price)/fairValue*100):null},risks,finalDecision:decision};
}
module.exports={analyzeGrowthStock,analyzeValueStock};
