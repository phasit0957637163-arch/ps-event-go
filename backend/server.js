import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pg from 'pg';
import path from 'path';
import multer from 'multer';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
dotenv.config();
const {Pool}=pg;
const app=express();
const pool=new Pool({connectionString:process.env.DATABASE_URL});
const imageSchemaReady=pool.query('ALTER TABLE event_images ADD COLUMN IF NOT EXISTS gallery_section VARCHAR(30)').then(()=>pool.query("UPDATE event_images SET gallery_section='event' WHERE gallery_section IS NULL")).catch(e=>console.error('event_images migration error',e.message));
// Ensure uploads folder exists and serve it
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
import fs from 'fs';
fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// Multer setup for file uploads
const storage = multer.diskStorage({
	destination: function (req, file, cb) { cb(null, uploadsDir); },
	filename: function (req, file, cb) {
		const unique = Date.now() + '-' + Math.round(Math.random()*1E9);
		const safe = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g,'_');
		cb(null, unique + '-' + safe);
	}
});
const upload = multer({ storage });
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

// Upload endpoint: accepts single file field 'file' and returns public URL
app.post('/api/uploads', upload.single('file'), (req, res) => {
	if (!req.file) return res.status(400).json({ error: 'file is required' });
	// If S3 configured, upload file to S3 and remove local file
	if (process.env.S3_BUCKET) {
		(async ()=>{
			try{
				const s3client = new S3Client({ region: process.env.AWS_REGION });
				const fileStream = fs.createReadStream(req.file.path);
				const key = `uploads/${req.file.filename}`;
				const upload = new Upload({client: s3client, params:{Bucket:process.env.S3_BUCKET, Key:key, Body: fileStream, ContentType: req.file.mimetype}});
				await upload.done();
				// remove local file
				fs.unlink(req.file.path, ()=>{});
				const url = `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
				return res.json({ url });
			}catch(e){console.error(e); return res.status(500).json({error:e.message});}
		})();
		return;
	}
	const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
	res.json({ url });
});

// Save uploaded image URL to event_images
app.post('/api/events/:id/images', async (req, res) => {
	const { id } = req.params;
	const { url, caption, sort_order, gallery_section } = req.body;
	if (!url) return res.status(400).json({ error: 'url is required' });
	try {
		await imageSchemaReady;
		const r = await pool.query('INSERT INTO event_images(event_id,image_url,caption,sort_order,gallery_section) VALUES($1,$2,$3,$4,$5) RETURNING *', [id, url, caption||null, sort_order||0, gallery_section||'event']);
		res.status(201).json(r.rows[0]);
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

app.get('/api/events/:id/images', async (req, res) => {
	const { id } = req.params;
	try {
		await imageSchemaReady;
		const r = await pool.query('SELECT id,event_id,image_url,caption,sort_order,gallery_section FROM event_images WHERE event_id=$1 ORDER BY sort_order, id', [id]);
		res.json(r.rows);
	} catch (e) { res.status(500).json({ error: e.message }); }
});

// Update image metadata (caption, sort_order)
app.patch('/api/events/:id/images/:imageId', async (req, res) => {
	const { id, imageId } = req.params;
	const { caption, sort_order } = req.body;
	try {
		const r = await pool.query('UPDATE event_images SET caption=COALESCE($1,caption), sort_order=COALESCE($2,sort_order) WHERE id=$3 AND event_id=$4 RETURNING id,event_id,image_url,caption,sort_order,gallery_section', [caption, sort_order, imageId, id]);
		if (r.rows.length === 0) return res.status(404).json({ error: 'not found' });
		res.json(r.rows[0]);
	} catch (e) { res.status(500).json({ error: e.message }); }
});

// Delete image
app.delete('/api/events/:id/images/:imageId', async (req, res) => {
	const { id, imageId } = req.params;
	try {
		const q = await pool.query('SELECT image_url FROM event_images WHERE id=$1 AND event_id=$2 LIMIT 1',[imageId,id]);
		if(q.rows.length===0) return res.status(404).json({ error: 'not found' });
		const imageUrl = q.rows[0].image_url;
		const r = await pool.query('DELETE FROM event_images WHERE id=$1 AND event_id=$2 RETURNING id', [imageId, id]);
		if (r.rows.length === 0) return res.status(404).json({ error: 'not found' });
		// delete file from storage
		try{
			if(process.env.S3_BUCKET && imageUrl){
				const bucket = process.env.S3_BUCKET;
				const region = process.env.AWS_REGION;
				const prefix = `https://${bucket}.s3.${region}.amazonaws.com/`;
				if(imageUrl.startsWith(prefix)){
					const key = imageUrl.slice(prefix.length);
					const client = new S3Client({region});
					await client.send(new DeleteObjectCommand({Bucket:bucket,Key:key}));
				}
			}else if(imageUrl){
				const p = imageUrl.replace(`${req.protocol}://${req.get('host')}/uploads/`,'');
				const fp = path.join(uploadsDir, p);
				fs.unlink(fp, ()=>{});
			}
		}catch(e){console.error('delete file error',e)}
		res.status(204).send();
	} catch (e) { res.status(500).json({ error: e.message }); }
});

// Batch delete images by ids in body: { ids: [1,2,3] }
app.delete('/api/events/:id/images', async (req, res) => {
	const { id } = req.params;
	const { ids } = req.body;
	if(!Array.isArray(ids)||ids.length===0) return res.status(400).json({ error: 'ids required' });
	try{
		// fetch urls
		const r = await pool.query(`SELECT id,image_url FROM event_images WHERE event_id=$1 AND id=ANY($2::bigint[])`, [id, ids]);
		const rows = r.rows;
		// delete DB rows
		await pool.query(`DELETE FROM event_images WHERE event_id=$1 AND id=ANY($2::bigint[])`, [id, ids]);
		// delete files where possible
		for(const row of rows){
			try{
				if(process.env.S3_BUCKET){
					// derive key from s3 url
					const url = row.image_url;
					const bucket = process.env.S3_BUCKET;
					const region = process.env.AWS_REGION;
					const prefix = `https://${bucket}.s3.${region}.amazonaws.com/`;
					if(url && url.startsWith(prefix)){
						const key = url.slice(prefix.length);
						const client = new S3Client({region});
						await client.send(new DeleteObjectCommand({Bucket:bucket,Key:key}));
					}
				}else{
					// local
					const p = row.image_url.replace(`${req.protocol}://${req.get('host')}/uploads/`,'');
					const fp = path.join(uploadsDir, p);
					fs.unlink(fp, ()=>{});
				}
			}catch(e){console.error('delete file error',e)}
		}
		res.status(204).send();
	}catch(e){res.status(500).json({error:e.message})}
});

// Seed sample events (for local dev). Inserts events if title not exists.
app.post('/api/seed', async (req, res) => {
	const samples = [
		{id:1,title:'Thailand Game Show 2026',slug:'thailand-game-show-2026',date:'2026-10-18'},
		{id:2,title:'Techsauce Global Summit 2026',slug:'techsauce-global-summit-2026',date:'2026-01-30'},
		{id:3,title:'Thailand Coffee Fest 2026',slug:'thailand-coffee-fest-2026',date:'2026-07-10'},
		{id:4,title:'Bangkok International Motor Show 2026',slug:'bangkok-international-motor-show-2026',date:'2026-03-24'},
		{id:5,title:'Amazing Thailand Marathon Bangkok 2026',slug:'amazing-thailand-marathon-bangkok-2026',date:'2026-11-15'},
		{id:6,title:'Art & Culture Night',slug:'art-culture-night-2026',date:'2026-08-28'}
	];
	try{
		for(const s of samples){
			const exists = await pool.query('SELECT id FROM events WHERE slug=$1 LIMIT 1',[s.slug]);
			if(exists.rows.length) continue;
			await pool.query('INSERT INTO events(title,slug,description,start_at,status) VALUES($1,$2,$3,$4,$5)',[s.title,s.slug,s.title,s.date,'published']);
		}
		res.json({ok:true});
	}catch(e){res.status(500).json({error:e.message})}
});
app.listen(process.env.PORT||3000,()=>console.log('PS Event GO API running on http://localhost:'+ (process.env.PORT||3000)));
