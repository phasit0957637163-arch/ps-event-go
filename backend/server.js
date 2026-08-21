import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pg from 'pg';
dotenv.config();
const {Pool}=pg;
const app=express();
const pool=new Pool({connectionString:process.env.DATABASE_URL});
app.use(cors()); app.use(express.json());
app.get('/api/health',async(req,res)=>{try{const r=await pool.query('SELECT NOW() AS now');res.json({ok:true,database:'connected',time:r.rows[0].now})}catch(e){res.status(500).json({ok:false,error:e.message})}});
app.get('/api/events',async(req,res)=>{try{const r=await pool.query('SELECT id,title,description,start_at,end_at,status FROM events ORDER BY start_at NULLS LAST');res.json(r.rows)}catch(e){res.status(500).json({error:e.message})}});
app.post('/api/auth/register',async(req,res)=>{
	const {name,email,provider}=req.body;
	if(!name||!email||!['facebook','instagram','email'].includes(provider))return res.status(400).json({error:'name, email and provider are required'});
	try{
		const result=await pool.query(`INSERT INTO users(name,email,provider) VALUES($1,$2,$3)
			ON CONFLICT(email) DO UPDATE SET name=EXCLUDED.name,provider=EXCLUDED.provider,updated_at=NOW()
			RETURNING id,name,email,provider,role`,[name,email,provider]);
		const user=result.rows[0];
		await pool.query('INSERT INTO login_logs(user_id,provider,success,user_agent) VALUES($1,$2,TRUE,$3)',[user.id,provider,req.get('user-agent')||null]);
		res.json(user);
	}catch(e){res.status(500).json({error:e.message})}
});
app.post('/api/page-views',async(req,res)=>{
	const {userId,eventId,path}=req.body;
	if(!userId||!path)return res.status(400).json({error:'userId and path are required'});
	try{
		await pool.query('INSERT INTO page_views(user_id,event_id,path,referrer,user_agent) VALUES($1,$2,$3,$4,$5)',[userId,eventId||null,path,req.get('referer')||null,req.get('user-agent')||null]);
		res.status(201).json({ok:true});
	}catch(e){res.status(500).json({error:e.message})}
});
app.listen(process.env.PORT||3000,()=>console.log('PS Event GO API running on http://localhost:'+ (process.env.PORT||3000)));
