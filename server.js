const express=require('express');
const path=require('path');
const {analyzeGrowthStock,analyzeValueStock}=require('./src/analyzer');
const {fetchScreenerPage}=require('./src/screener');
const app=express(); app.use(express.json({limit:'5mb'})); app.use(express.static(path.join(__dirname,'public')));
app.post('/api/analyze',(req,res)=>{try{const {engine,data}=req.body||{};if(!data||typeof data!=='object')return res.status(400).json({error:'Provide stock financial data.'});const result=engine==='value'?analyzeValueStock(data):analyzeGrowthStock(data);res.json(result);}catch(e){res.status(400).json({error:e.message});}});
app.get('/api/screener',async(req,res)=>{try{if(!req.query.url)return res.status(400).json({error:'Provide a Screener company URL.'});const data=await fetchScreenerPage(req.query.url);res.json(data);}catch(e){res.status(400).json({error:e.message});}});
app.get('*',(req,res)=>res.sendFile(path.join(__dirname,'public','index.html')));
const port=process.env.PORT||3000;app.listen(port,()=>console.log(`Indian Stock Analyzer running at http://localhost:${port}`));
