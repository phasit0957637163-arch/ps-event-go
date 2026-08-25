import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles/app.css";

const events = [
  {id:1,title:"Thailand Game Show 2026",cat:"Gaming",date:"18–20 ต.ค. 2569",place:"QSNCC, กรุงเทพฯ",status:"attended",views:"18,542",rating:"4.8",desc:"มหกรรมเกมและไลฟ์สไตล์ รวมเกม เทคโนโลยี กิจกรรม และแบรนด์ชั้นนำ"},
  {id:2,title:"Techsauce Global Summit 2026",cat:"Technology",date:"30 ม.ค.–1 ก.พ. 2569",place:"QSNCC, กรุงเทพฯ",status:"planned",views:"12,421",rating:"4.6",desc:"งานรวมเทคโนโลยี สตาร์ทอัพ นักลงทุน และนวัตกรรมจากหลายประเทศ"},
  {id:3,title:"Thailand Coffee Fest 2026",cat:"Food & Beverage",date:"10–12 ก.ค. 2569",place:"ไบเทค บางนา",status:"planned",views:"9,821",rating:"4.9",desc:"เทศกาลกาแฟและวัฒนธรรมกาแฟที่รวมร้านคั่ว คาเฟ่ และผู้คนในวงการ"},
  {id:4,title:"Bangkok International Motor Show 2026",cat:"Automotive",date:"24 มี.ค.–4 เม.ย. 2569",place:"อิมแพ็ค เมืองทองธานี",status:"not_attended",views:"9,321",rating:"4.5",desc:"งานยานยนต์ที่รวบรวมรถยนต์ เทคโนโลยี และนวัตกรรมยานยนต์"},
  {id:5,title:"Amazing Thailand Marathon Bangkok 2026",cat:"Sport",date:"15 พ.ย. 2569",place:"สวนลุมพินี, กรุงเทพฯ",status:"planned",views:"7,521",rating:"4.7",desc:"อีเว้นท์กีฬาและกิจกรรมสำหรับนักวิ่งทุกระดับ"},
  {id:6,title:"Art & Culture Night",cat:"Art & Culture",date:"28 ส.ค. 2569",place:"River City Bangkok",status:"not_attended",views:"6,211",rating:"4.6",desc:"ค่ำคืนแห่งศิลปะ วัฒนธรรม นิทรรศการ และกิจกรรมสร้างสรรค์"}
];

function Logo(){
  return <a className="logo" href="#/">
    <span className="logo-ps">PS</span>
    <span className="logo-event">Event</span>
    <span className="logo-go">GO!</span>
  </a>;
}

const API_URL="http://localhost:3000";

function VisitorLogin({visitor,onLogin,onLogout,onAdminLogin,onClose}){
  const [provider,setProvider]=useState("");
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [error,setError]=useState("");
  const providers=[["facebook","Facebook"],["instagram","Instagram"],["email","อีเมล"]];
  const submit=async()=>{
    if(!provider||!name.trim()||!email.trim()){
      setError("กรุณาเลือกช่องทางและกรอกชื่อกับอีเมล");
      return;
    }
    try{
      const response=await fetch(`${API_URL}/api/auth/register`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:name.trim(),email:email.trim(),provider})});
      if(!response.ok)throw new Error();
      const user=await response.json();
      localStorage.setItem("ps-event-go-user",JSON.stringify(user));
      onLogin(user);
    }catch{
      setError("เชื่อมต่อระบบลงทะเบียนไม่ได้ กรุณาเปิด backend ก่อน");
    }
  };
  return <div className="modalBackdrop" onClick={onClose}><section className="visitorModal" onClick={e=>e.stopPropagation()}>
    <button className="modalClose" onClick={onClose}>×</button>
    <span className="eyebrow">WELCOME TO PS EVENT GO!</span><h2>{visitor?`ยินดีต้อนรับ ${visitor.name}`:"ลงทะเบียนเข้าชมเว็บไซต์"}</h2>
    <p className="modalHint">เลือกช่องทางที่ต้องการใช้เข้าสู่ระบบ</p>
    <div className="providerGrid">{providers.map(([value,label])=><button key={value} className={provider===value?"providerBtn selected":"providerBtn"} onClick={()=>{setProvider(value);setError("")}}>{label}</button>)}</div>
    {provider&&<div className="visitorFields"><input value={name} onChange={e=>setName(e.target.value)} placeholder="ชื่อผู้เข้าชม"/><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="อีเมล"/></div>}
    {error&&<p className="loginError">{error}</p>}
    <button className="btn primary modalSubmit" onClick={submit}>ลงทะเบียน / เข้าสู่ระบบ</button>
    {visitor&&<button className="adminLink" onClick={onLogout}>ออกจากระบบผู้เข้าชม</button>}
    <button className="adminLink" onClick={onAdminLogin}>เข้าสู่ระบบผู้ดูแล</button>
  </section></div>
}

function AdminLogin({onLogin,onClose}){
  const [adminId,setAdminId]=useState("");
  const [error,setError]=useState("");
  const login=()=>adminId.trim().toLowerCase()==="admin123"?onLogin() : setError("เฉพาะ Admin เท่านั้นที่เข้าสู่ระบบได้");
  return <div className="modalBackdrop" onClick={onClose}><section className="visitorModal adminModal" onClick={e=>e.stopPropagation()}>
    <button className="modalClose" onClick={onClose}>×</button><h2>เข้าสู่ระบบ Admin</h2>
    <input autoFocus value={adminId} onChange={e=>{setAdminId(e.target.value);setError("")}} onKeyDown={e=>e.key==="Enter"&&login()} placeholder="Admin ID"/>
    {error&&<p className="loginError">{error}</p>}<button className="btn primary modalSubmit" onClick={login}>เข้าสู่ระบบ</button>
  </section></div>
}

function Nav({isAdmin,setIsAdmin,visitor,onVisitorLogin,onVisitorLogout}){
  const [showLogin,setShowLogin]=useState(false);
  const [showAdminLogin,setShowAdminLogin]=useState(false);
  useEffect(()=>{if(!isAdmin&&!visitor)setShowLogin(true)},[isAdmin,visitor]);
  const login=()=>{setIsAdmin(true);setShowAdminLogin(false)};
  const userLabel=visitor?.name||"เข้าสู่ระบบ";
  return <>
  <header className="topbar">
    <Logo/>
    <nav>
      <a className={location.hash===""||location.hash==="#/"?"active":""} href="#/">หน้าแรก</a>
      <a href="#/events">ค้นหาอีเว้นท์</a>
      <a href="#/calendar">ปฏิทิน</a>
      <a href="#/experiences">ประสบการณ์</a>
      {isAdmin && <a href="#/admin">Admin</a>}
    </nav>
    <div className="navActions">
      <button className="iconBtn">⌕</button>
      <button className="loginBtn" onClick={()=>isAdmin?setIsAdmin(false):setShowLogin(true)}>{isAdmin?"ออกจากระบบ":userLabel}</button>
    </div>
  </header>
  {showLogin&&<VisitorLogin visitor={visitor} onLogin={user=>{onVisitorLogin(user);setShowLogin(false)}} onLogout={()=>{onVisitorLogout();setShowLogin(false)}} onAdminLogin={()=>{setShowLogin(false);setShowAdminLogin(true)}} onClose={()=>setShowLogin(false)}/>} 
  {showAdminLogin&&<AdminLogin onLogin={login} onClose={()=>setShowAdminLogin(false)}/>} 
  </>
}

function Status({value}){
  const map={
    attended:["🟢","เราเข้าร่วมแล้ว"],
    planned:["🔵","กำลังจะไป"],
    not_attended:["🔴","ไม่ได้เข้าร่วม"]
  };
  const [dot,text]=map[value]||map.not_attended;
  return <span className={"status "+value}>{dot} {text}</span>
}

function Hero(){
  return <section className="hero">
    <div className="heroCopy">
      <span className="eyebrow">EVENT MEDIA & COMMUNITY</span>
      <h1>ไปงานไหน?<br/><strong>PS Event GO!</strong></h1>
      <p>รวม Event ที่น่าสนใจจากทุกวงการ พร้อมข้อมูล ประสบการณ์ และ Community</p>
      <div className="heroButtons">
        <a className="btn primary" href="#/events">⌕ &nbsp;ค้นหา Event</a>
        <a className="btn ghost" href="#/experiences">♧ &nbsp;ดูประสบการณ์</a>
      </div>
      <div className="stats">
        <div><b>1,248+</b><span>อีเว้นท์ทั้งหมด</span></div>
        <div><b>15,892+</b><span>สมาชิก</span></div>
        <div><b>8,432+</b><span>ประสบการณ์</span></div>
      </div>
    </div>
    <div className="heroVisual">
      <div className="visualMain"><span>🎵</span><b>MUSIC<br/><i>CONCERT</i></b></div>
      <div className="visualSmall tech"><b>TECH<br/><i>EXPO</i></b></div>
      <div className="visualSmall game"><b>GAME<br/><i>TOURNAMENT</i></b></div>
      <div className="visualSmall business"><b>BUSINESS<br/><i>SEMINAR</i></b></div>
      <div className="visualMain festival"><span>🎉</span><b>FESTIVAL<br/><i>& PARTY</i></b></div>
    </div>
  </section>
}

function EventCard({event,onOpen}){
  const open=()=>onOpen(event.id);
  return <article className="eventCard" onClick={open} onKeyDown={e=>(e.key==="Enter"||e.key===" ")&&open()} role="button" tabIndex="0">
    <div className={"eventCover "+event.cat.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}>
      <span className="coverCat">{event.cat}</span>
      <h3>{event.title}</h3>
    </div>
    <div className="eventBody">
      <Status value={event.status}/>
      <h3>{event.title}</h3>
      <p>▣ {event.date}</p>
      <p>⌖ {event.place}</p>
      <div className="cardMeta"><span>◉ {event.views} views</span><span>★ {event.rating}</span></div>
      <button className="detailBtn" onClick={e=>{e.stopPropagation();open()}}>ดูรายละเอียด →</button>
    </div>
  </article>
}

function Home({onOpen}){
  return <>
    <Hero/>
    <section className="section">
      <div className="sectionHead"><div><span className="eyebrow">DISCOVER</span><h2>อีเว้นท์แนะนำ</h2></div><a href="#/events" className="more">ดูทั้งหมด →</a></div>
      <div className="eventGrid">{events.slice(0,5).map(e=><EventCard key={e.id} event={e} onOpen={onOpen}/>)}</div>
    </section>
  </>
}

function EventsPage({onOpen}){
  const [q,setQ]=useState(""); const [cat,setCat]=useState("ทั้งหมด");
  const cats=["ทั้งหมด","Technology","Gaming","Food & Beverage","Automotive","Sport","Art & Culture"];
  const filtered=useMemo(()=>events.filter(e=>(cat==="ทั้งหมด"||e.cat===cat)&&e.title.toLowerCase().includes(q.toLowerCase())),[q,cat]);
  return <main className="section">
    <span className="eyebrow">DISCOVER EVENTS</span><h2>ค้นหาอีเว้นท์</h2>
    <div className="searchBar"><input value={q} onChange={e=>setQ(e.target.value)} placeholder="ค้นหาชื่องาน / สถานที่ / หมวดหมู่..."/><button>ค้นหา</button></div>
    <div className="chips">{cats.map(c=><button className={cat===c?"chip activeChip":"chip"} onClick={()=>setCat(c)} key={c}>{c}</button>)}</div>
    <div className="eventGrid">{filtered.map(e=><EventCard key={e.id} event={e} onOpen={onOpen}/>)}</div>
  </main>
}

function EventDetail({event,isAdmin,onBack}){
  const [status,setStatus]=useState(event.status);
  const [edit,setEdit]=useState(false);
  const [text,setText]=useState("บันทึกประสบการณ์ของ PS Event GO! เพิ่มเรื่องราว รูปภาพ และความรู้สึกหลังเข้าร่วมงานได้ที่นี่");
  const [images,setImages]=useState([]);
  const [savedImages,setSavedImages]=useState([]);
  const [selectedImageIds,setSelectedImageIds]=useState([]);
  const [editingCaptionId,setEditingCaptionId]=useState(null);
  const [captionDraft,setCaptionDraft]=useState('');
  const [dragIndex,setDragIndex]=useState(null);
  const fileInputRef = React.useRef(null);
  const [uploadSource,setUploadSource]=useState(null);
  const triggerUpload = (source)=>{
    if(!isAdmin) return alert('ต้องเป็น Admin เพื่ออัปโหลดรูป');
    setUploadSource(source);
    if(!edit){ setEdit(true); setTimeout(()=>fileInputRef.current?.click(),100); }
    else fileInputRef.current?.click();
  };
  useEffect(()=>{(async()=>{try{const r=await fetch(`${API_URL}/api/events/${event.id}/images`);if(r.ok){const j=await r.json();setSavedImages(j);} }catch(e){}})()},[event.id]);
  const deleteImage = async (imageId)=>{
    if(!confirm('ลบรูปภาพนี้?')) return;
    try{
      const r = await fetch(`${API_URL}/api/events/${event.id}/images/${imageId}`,{method:'DELETE'});
      if(r.status===204){ setSavedImages(prev=>prev.filter(x=>x.id!=imageId)); }
    }catch(e){console.error(e)}
  };
  const toggleSelect = (id)=>{
    setSelectedImageIds(prev=> prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);
  };
  const deleteSelected = async ()=>{
    if(selectedImageIds.length===0) return alert('ยังไม่มีรูปที่เลือก');
    if(!confirm(`ลบ ${selectedImageIds.length} รูปใช่ไหม?`)) return;
    try{
      const r = await fetch(`${API_URL}/api/events/${event.id}/images`,{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({ids:selectedImageIds})});
      if(r.status===204){ setSavedImages(prev=>prev.filter(x=>!selectedImageIds.includes(x.id))); setSelectedImageIds([]); }
    }catch(e){console.error(e)}
  };
  const startEditCaption = (id, current)=>{ setEditingCaptionId(id); setCaptionDraft(current||''); };
  const saveCaption = async (id)=>{ await updateCaption(id, captionDraft); setEditingCaptionId(null); };

  const onDragStart = (e, idx)=>{ setDragIndex(idx); e.dataTransfer?.setData('text/plain', String(idx)); };
  const onDragOver = (e)=>{ e.preventDefault(); };
  const onDrop = async (e, idx)=>{
    e.preventDefault();
    const from = dragIndex!=null?dragIndex: Number(e.dataTransfer?.getData('text/plain'));
    const to = idx;
    if(from===to) return;
    const arr = [...savedImages];
    const [moved] = arr.splice(from,1);
    arr.splice(to,0,moved);
    // update sort_order in backend
    for(let i=0;i<arr.length;i++){ try{ await fetch(`${API_URL}/api/events/${event.id}/images/${arr[i].id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({sort_order:i})}); }catch(e){console.error(e)} }
    setSavedImages(arr);
    setDragIndex(null);
  };
  const updateCaption = async (imageId, caption)=>{
    try{
      const r = await fetch(`${API_URL}/api/events/${event.id}/images/${imageId}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({caption})});
      if(r.ok){const j=await r.json();setSavedImages(prev=>prev.map(x=>x.id==j.id?j:x));}
    }catch(e){console.error(e)}
  };
  const uploadingFiles = async (files)=>{
    const arr = Array.from(files||[]);
    for(const f of arr){
      const fd = new FormData(); fd.append('file', f);
      try{
        const res = await fetch(`${API_URL}/api/uploads`, { method: 'POST', body: fd });
        if(!res.ok) throw new Error('upload failed');
        const j = await res.json();
        setImages(prev=>[...prev,{url:j.url,name:f.name}]);
      }catch(e){console.error('upload error',e)}
    }
  };
  return <main className="section detailPage">
    <button className="back" onClick={onBack}>← กลับไปอีเว้นท์</button>
    <div className="detailHero"><div className="detailCover"><span>{event.cat}</span><h1>{event.title}</h1></div><div className="detailInfo"><Status value={status}/><h1>{event.title}</h1><p>▣ {event.date}</p><p>⌖ {event.place}</p><p>{event.desc}</p><div className="detailStats"><span>◉ {event.views} views</span><span>★ {event.rating}</span></div></div></div>
    <div className="detailColumns">
      <div>
        <section className="panel">
          <div className="panelHead"><div><span className="eyebrow">OUR EXPERIENCE</span><h2>ประสบการณ์ของ PS Event GO!</h2></div>{isAdmin&&<button className="editBtn" onClick={()=>setEdit(true)}>✎ Edit</button>}</div>
          <p>{text}</p>
          <div className="photoRow">
            <div style={{cursor:isAdmin?'pointer':'default'}} onClick={()=>triggerUpload('event')}>📷 รูปภาพ Event</div>
            <div style={{cursor:isAdmin?'pointer':'default'}} onClick={()=>triggerUpload('atmosphere')}>📷 บรรยากาศ</div>
            <div style={{cursor:isAdmin?'pointer':'default'}} onClick={()=>triggerUpload('activity')}>📷 กิจกรรม</div>
          </div>
          {edit&&<div className="editor"><h3>แก้ไขประสบการณ์</h3><textarea value={text} onChange={e=>setText(e.target.value)}/>
            <div style={{margin:'12px 0'}}>
              <input ref={fileInputRef} type="file" accept="image/*" multiple style={{display:'none'}} onChange={e=>{ uploadingFiles(e.target.files); e.target.value=null; }}/>
            </div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:12}}>
              <div style={{width:'100%',display:'flex',alignItems:'center',gap:12,marginBottom:8}}>
                <button className="btn ghost" onClick={deleteSelected}>✖ ลบที่เลือก</button>
                <div style={{color:'#9aa6bb'}}>{savedImages.length} รูป</div>
              </div>
              {savedImages.map((im,i)=>(
                <div key={'s'+i} draggable onDragStart={(e)=>onDragStart(e,i)} onDragOver={onDragOver} onDrop={(e)=>onDrop(e,i)} style={{width:120,height:80,overflow:'hidden',borderRadius:8,background:'#0b111c',display:'flex',alignItems:'center',justifyContent:'center',border:'1px solid #273247',position:'relative'}}>
                  <input type="checkbox" checked={selectedImageIds.includes(im.id)} onChange={()=>toggleSelect(im.id)} style={{position:'absolute',left:6,top:6,zIndex:5}}/>
                  <img src={im.image_url} style={{maxWidth:'100%',maxHeight:'100%'}} alt={im.caption||''}/>
                  <div style={{position:'absolute',top:6,right:6,display:'flex',gap:6}}>
                    {editingCaptionId===im.id? <>
                      <input value={captionDraft} onChange={e=>setCaptionDraft(e.target.value)} style={{width:140}} />
                      <button className="iconBtn" onClick={()=>saveCaption(im.id)}>✓</button>
                      <button className="iconBtn" onClick={()=>setEditingCaptionId(null)}>✖</button>
                    </> : <>
                      <button className="iconBtn" onClick={()=>startEditCaption(im.id,im.caption)}>✎</button>
                      <button className="iconBtn" onClick={()=>deleteImage(im.id)}>✖</button>
                    </>}
                  </div>
                </div>
              ))}
              {images.map((im,i)=><div key={'n'+i} style={{width:120,height:80,overflow:'hidden',borderRadius:8,background:'#0b111c',display:'flex',alignItems:'center',justifyContent:'center',border:'1px solid #273247'}}><img src={im.url} style={{maxWidth:'100%',maxHeight:'100%'}} alt={im.name}/></div>)}
            </div>
            <div><button className="btn ghost" onClick={()=>{setEdit(false);setImages([])}}>ยกเลิก</button><button className="btn primary" onClick={async()=>{
              // save images to event_images
              try{
                for(const im of images){
                  const res = await fetch(`${API_URL}/api/events/${event.id}/images`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:im.url})});
                  if(!res.ok) console.error('save image failed', await res.text());
                }
                // refresh saved images from server so UI shows newly saved items
                const r = await fetch(`${API_URL}/api/events/${event.id}/images`);
                if(r.ok){ const j = await r.json(); setSavedImages(j); }
              }catch(e){ console.error(e) }
              setEdit(false);setImages([]);
            }}>💾 บันทึก</button></div></div>}
        </section>
        <section className="panel"><span className="eyebrow">COMMUNITY EXPERIENCE</span><h2>ประสบการณ์จากผู้เข้าร่วม</h2><div className="comment"><b>ผู้เข้าร่วมงาน</b><p>งานจัดได้ดีมาก บรรยากาศสนุก และมีอะไรให้เดินดูเยอะครับ!</p></div><div className="comment"><b>Event Community</b><p>ใครไปงานนี้มาแล้ว มาแชร์ประสบการณ์กันได้เลย</p></div></section>
      </div>
      <aside className="panel attendance"><h2>สถานะของคุณ</h2>{isAdmin?[["attended","🟢 ฉันเข้าร่วมแล้ว"],["planned","🔵 กำลังจะไป"],["not_attended","🔴 ไม่ได้เข้าร่วม"]].map(([v,t])=><button key={v} className={status===v?"attendanceBtn selected":"attendanceBtn"} onClick={()=>setStatus(v)}>{t}</button>):<div className="currentStatus"><Status value={status}/></div>}</aside>
    </div>
  </main>
}

function Experiences(){return <main className="section"><span className="eyebrow">COMMUNITY</span><h2>ประสบการณ์</h2><div className="experienceGrid"><div className="panel"><h3>เราเข้าร่วมงานนี้แล้ว</h3><p>บันทึกเรื่องราว รูปภาพ และประสบการณ์ของคุณ เพื่อแบ่งปันให้คนอื่น</p><a className="btn primary" href="#/events">เลือก Event</a></div><div className="panel"><h3>ยังไม่ได้ไปงาน?</h3><p>ไม่เป็นไร! คุณสามารถอ่านข้อมูลเบื้องต้นและประสบการณ์จากคนอื่นได้</p></div></div></main>}

function Calendar(){return <main className="section"><span className="eyebrow">EVENT CALENDAR</span><h2>ปฏิทินอีเว้นท์</h2><div className="calendarBox"><div className="calendarHead"><b>สิงหาคม 2569</b><span>‹ &nbsp; สิงหาคม &nbsp; ›</span></div><div className="calendarGrid">{["อา","จ","อ","พ","พฤ","ศ","ส"].map(x=><b key={x}>{x}</b>)}{Array.from({length:31},(_,i)=><div className={i===15?"today":""} key={i}>{i+1}</div>)}</div></div></main>}

function Admin({eventsList,onOpen}){
  return <main className="section"><span className="eyebrow">ADMIN CONTROL CENTER</span><h2>Dashboard</h2><div className="adminStats"><div><b>12,842</b><span>ผู้เข้าชม</span></div><div><b>1,248</b><span>อีเว้นท์</span></div><div><b>8,432</b><span>ประสบการณ์</span></div><div><b>96.8%</b><span>Active Users</span></div></div><div className="adminGrid"><section className="panel"><div className="panelHead"><h2>จัดการ Event</h2><button className="editBtn">＋ เพิ่ม Event</button></div>{eventsList.map(e=><div className="adminRow" key={e.id}><div><b>{e.title}</b><small>{e.date} · {e.place}</small></div><button className="editBtn" onClick={()=>onOpen(e.id)}>✎ แก้ไข</button></div>)}</section><section className="panel"><h2>สถิติการเข้าชม</h2><div className="chart"><i style={{height:"45%"}}/><i style={{height:"68%"}}/><i style={{height:"55%"}}/><i style={{height:"82%"}}/><i style={{height:"72%"}}/><i style={{height:"94%"}}/><i style={{height:"88%"}}/></div><div className="chartLabels"><span>จ</span><span>อ</span><span>พ</span><span>พฤ</span><span>ศ</span><span>ส</span><span>อา</span></div></section></div></main>
}

function App(){
  const [path,setPath]=useState(location.hash.slice(1)||"/");
  const [isAdmin,setIsAdmin]=useState(false);
  const [visitor,setVisitor]=useState(()=>{try{return JSON.parse(localStorage.getItem("ps-event-go-user"))}catch{return null}});
  const [selected,setSelected]=useState(null);
  useEffect(()=>{const f=()=>setPath(location.hash.slice(1)||"/");addEventListener("hashchange",f);return()=>removeEventListener("hashchange",f)},[]);
  useEffect(()=>{if(path.startsWith("/events/"))setSelected(events.find(e=>e.id===Number(path.split("/")[2]))||events[0])},[path]);
  useEffect(()=>{
    if(!visitor)return;
    const eventId=path.startsWith("/events/")?Number(path.split("/")[2]):null;
    fetch(`${API_URL}/api/page-views`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({userId:visitor.id,eventId,path})}).catch(()=>{});
  },[path,visitor]);
  const open=id=>{setSelected(events.find(e=>e.id===id));location.hash="/events/"+id};
  let content=path==="/events"?<EventsPage onOpen={open}/>:path==="/experiences"?<Experiences/>:path==="/calendar"?<Calendar/>:path==="/admin"&&isAdmin?<Admin eventsList={events} onOpen={open}/>:selected&&path.startsWith("/events/")?<EventDetail event={selected} isAdmin={isAdmin} onBack={()=>{setSelected(null);location.hash="/events"}}/>:<Home onOpen={open}/>;
  return <><Nav isAdmin={isAdmin} setIsAdmin={setIsAdmin} visitor={visitor} onVisitorLogin={setVisitor} onVisitorLogout={()=>{localStorage.removeItem("ps-event-go-user");setVisitor(null)}}/>{content}<footer><Logo/><p>Event Media & Community · PS Event GO!</p></footer></>
}
createRoot(document.getElementById("root")).render(<App/>);
