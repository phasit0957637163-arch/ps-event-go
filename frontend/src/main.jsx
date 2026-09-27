import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles/app.css";

const initialEvents = [
  {id:1,title:"Thailand Game Show 2026",cat:"Gaming",date:"18–20 ต.ค. 2569",startAt:"2026-10-18",place:"QSNCC, กรุงเทพฯ",status:"attended",views:"18,542",rating:"4.8",desc:"มหกรรมเกมและไลฟ์สไตล์ รวมเกม เทคโนโลยี กิจกรรม และแบรนด์ชั้นนำ"},
  {id:2,title:"Techsauce Global Summit 2026",cat:"Technology",date:"30 ม.ค.–1 ก.พ. 2569",startAt:"2026-01-30",place:"QSNCC, กรุงเทพฯ",status:"planned",views:"12,421",rating:"4.6",desc:"งานรวมเทคโนโลยี สตาร์ทอัพ นักลงทุน และนวัตกรรมจากหลายประเทศ"},
  {id:3,title:"Thailand Coffee Fest 2026",cat:"Food & Beverage",date:"10–12 ก.ค. 2569",startAt:"2026-07-10",place:"ไบเทค บางนา",status:"planned",views:"9,821",rating:"4.9",desc:"เทศกาลกาแฟและวัฒนธรรมกาแฟที่รวมร้านคั่ว คาเฟ่ และผู้คนในวงการ"},
  {id:4,title:"Bangkok International Motor Show 2026",cat:"Automotive",date:"24 มี.ค.–4 เม.ย. 2569",startAt:"2026-03-24",place:"อิมแพ็ค เมืองทองธานี",status:"not_attended",views:"9,321",rating:"4.5",desc:"งานยานยนต์ที่รวบรวมรถยนต์ เทคโนโลยี และนวัตกรรมยานยนต์"},
  {id:5,title:"Amazing Thailand Marathon Bangkok 2026",cat:"Sport",date:"15 พ.ย. 2569",startAt:"2026-11-15",place:"สวนลุมพินี, กรุงเทพฯ",status:"planned",views:"7,521",rating:"4.7",desc:"อีเว้นท์กีฬาและกิจกรรมสำหรับนักวิ่งทุกระดับ"},
  {id:6,title:"Art & Culture Night",cat:"Art & Culture",date:"28 ส.ค. 2569",startAt:"2026-08-28",place:"River City Bangkok",status:"not_attended",views:"6,211",rating:"4.6",desc:"ค่ำคืนแห่งศิลปะ วัฒนธรรม นิทรรศการ และกิจกรรมสร้างสรรค์"}
];

function readStorage(key, fallback){
  try{
    const value=localStorage.getItem(key);
    return value?JSON.parse(value):fallback;
  }catch{return fallback}
}

function formatEventDate(value){
  if(!value)return "";
  return new Intl.DateTimeFormat("th-TH",{day:"numeric",month:"short",year:"numeric"}).format(new Date(`${value}T00:00:00`));
}

function Logo(){
  return <a className="logo" href="#/">
    <span className="logo-ps">PS</span>
    <span className="logo-event">Event</span>
    <span className="logo-go">GO!</span>
  </a>;
}

const API_URL=import.meta.env.VITE_API_URL||"";

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
      if(!API_URL)throw new Error("Local mode");
      const response=await fetch(`${API_URL}/api/auth/register`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:name.trim(),email:email.trim(),provider})});
      if(!response.ok)throw new Error();
      const user=await response.json();
      localStorage.setItem("ps-event-go-user",JSON.stringify(user));
      onLogin(user);
    }catch{
      const user={id:`local-${email.trim().toLowerCase()}`,name:name.trim(),email:email.trim(),provider,role:"user"};
      localStorage.setItem("ps-event-go-user",JSON.stringify(user));
      onLogin(user);
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
  const [showMobileNav,setShowMobileNav]=useState(false);
  const login=()=>{setIsAdmin(true);setShowAdminLogin(false)};
  const userLabel=visitor?.name||"เข้าสู่ระบบ";
  return <>
  <header className="topbar">
    <Logo/>
    <nav className={showMobileNav?"mobileNavOpen":""} onClick={()=>setShowMobileNav(false)}>
      <a className={location.hash===""||location.hash==="#/"?"active":""} href="#/">หน้าแรก</a>
      <a href="#/events">ค้นหาอีเว้นท์</a>
      <a href="#/calendar">ปฏิทิน</a>
      <a href="#/experiences">ประสบการณ์</a>
      {isAdmin && <a href="#/admin">Admin</a>}
    </nav>
    <div className="navActions">
      <button className="iconBtn" aria-label="ค้นหาอีเว้นท์" onClick={()=>location.hash="/events"}>⌕</button>
      <button className="iconBtn mobileMenuBtn" aria-label="เปิดเมนู" aria-expanded={showMobileNav} onClick={()=>setShowMobileNav(value=>!value)}>☰</button>
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

function StatusDot({value}){
  const labels={attended:"เข้าร่วมแล้ว",planned:"กำลังจะไป",not_attended:"ยังไม่ได้เข้าร่วม"};
  if(!labels[value])return null;
  return <span className={`statusDot ${value}`} role="img" aria-label={`สถานะ: ${labels[value]}`} title={labels[value]}/>;
}

function Hero({eventsList}){
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
        <div><b>{eventsList.length.toLocaleString("th-TH")}</b><span>อีเว้นท์ในระบบ</span></div>
        <div><b>{new Set(eventsList.map(event=>event.cat)).size.toLocaleString("th-TH")}</b><span>หมวดหมู่</span></div>
        <div><b>{new Set(eventsList.map(event=>event.place).filter(Boolean)).size.toLocaleString("th-TH")}</b><span>สถานที่จัดงาน</span></div>
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

function Home({eventsList,onOpen}){
  return <>
    <Hero eventsList={eventsList}/>
    <section className="section">
      <div className="sectionHead"><div><span className="eyebrow">DISCOVER</span><h2>อีเว้นท์แนะนำ</h2></div><a href="#/events" className="more">ดูทั้งหมด →</a></div>
      <div className="eventGrid">{eventsList.slice(0,5).map(e=><EventCard key={e.id} event={e} onOpen={onOpen}/>)}</div>
    </section>
  </>
}

function EventsPage({eventsList,onOpen}){
  const [q,setQ]=useState(""); const [cat,setCat]=useState("ทั้งหมด");
  const cats=["ทั้งหมด",...new Set(eventsList.map(event=>event.cat))];
  const filtered=useMemo(()=>eventsList.filter(e=>{
    const query=q.trim().toLocaleLowerCase();
    const matchesQuery=!query||[e.title,e.place,e.cat,e.desc].some(value=>value?.toLocaleLowerCase().includes(query));
    return (cat==="ทั้งหมด"||e.cat===cat)&&matchesQuery;
  }),[eventsList,q,cat]);
  return <main className="section">
    <span className="eyebrow">DISCOVER EVENTS</span><h2>ค้นหาอีเว้นท์</h2>
    <div className="searchBar"><input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==="Escape"&&setQ("")} placeholder="ค้นหาชื่องาน / สถานที่ / หมวดหมู่..."/><button type="button" onClick={()=>setQ(q.trim())}>ค้นหา</button></div>
    <div className="chips">{cats.map(c=><button className={cat===c?"chip activeChip":"chip"} onClick={()=>setCat(c)} key={c}>{c}</button>)}</div>
    {filtered.length?<div className="eventGrid">{filtered.map(e=><EventCard key={e.id} event={e} onOpen={onOpen}/>)}</div>:<section className="panel"><h3>ไม่พบอีเว้นท์</h3><p>ลองเปลี่ยนคำค้นหาหรือเลือกหมวดหมู่อื่น</p><button className="btn ghost" onClick={()=>{setQ("");setCat("ทั้งหมด")}}>ล้างตัวกรอง</button></section>}
  </main>
}

function EventDetail({event,isAdmin,status,experienceText,onStatusChange,onSaveExperience,onBack}){
  const [edit,setEdit]=useState(false);
  const [text,setText]=useState(experienceText||"บันทึกประสบการณ์ของ PS Event GO! เพิ่มเรื่องราว รูปภาพ และความรู้สึกหลังเข้าร่วมงานได้ที่นี่");
  const [images,setImages]=useState([]);
  const [savedImages,setSavedImages]=useState([]);
  const [comments,setComments]=useState(()=>readStorage(`ps-event-go-comments-${event.id}`,[]));
  const [commentDraft,setCommentDraft]=useState("");
  const [galleryCaptionEditing,setGalleryCaptionEditing]=useState(false);
  const [captionDraft,setCaptionDraft]=useState('');
  const [gallery,setGallery]=useState(null);
  const [galleryOrder,setGalleryOrder]=useState(()=>readStorage(`ps-event-go-gallery-order-${event.id}`,{}));
  const [imagePreferences,setImagePreferences]=useState(()=>readStorage(`ps-event-go-image-preferences-${event.id}`,{}));
  const galleryDragIndex=React.useRef(null);
  const fileInputRef = React.useRef(null);
  const uploadSourceRef = React.useRef("event");
  const triggerUpload = ()=>{
    if(!isAdmin)return alert('ต้องเป็น Admin เพื่ออัปโหลดรูป');
    setEdit(true);
    fileInputRef.current?.click();
  };
  const chooseUploadSource=source=>{
    uploadSourceRef.current=source;
    triggerUpload();
  };
  const openPhotoSlot=(source,slotImages)=>{
    if(slotImages.length){setGallery({source,index:0});return}
    chooseUploadSource(source);
  };
  const galleryImageKey=image=>String(image.id??image.url??image.image_url);
  const galleryEntryKey=image=>`${image.source||"event"}:${galleryImageKey(image)}`;
  const saveImagePreferences=(key,changes)=>{
    setImagePreferences(current=>{
      const next={...current,[key]:{...current[key],...changes}};
      localStorage.setItem(`ps-event-go-image-preferences-${event.id}`,JSON.stringify(next));
      return next;
    });
  };
  const moveImageToSource=(key,target)=>{
    const nextSavedImages=savedImages.map(image=>galleryImageKey(image)===key?{...image,source:target}:image);
    const nextPendingImages=images.map(image=>galleryImageKey(image)===key?{...image,source:target}:image);
    setSavedImages(nextSavedImages);
    setImages(nextPendingImages);
    localStorage.setItem(`ps-event-go-images-${event.id}`,JSON.stringify(nextSavedImages));
    const nextOrder={...galleryOrder};
    Object.keys(nextOrder).forEach(source=>{nextOrder[source]=nextOrder[source].filter(imageKey=>imageKey!==key)});
    nextOrder[target]=[...(nextOrder[target]||[]),key];
    setGalleryOrder(nextOrder);
    localStorage.setItem(`ps-event-go-gallery-order-${event.id}`,JSON.stringify(nextOrder));
    const image=[...savedImages,...images].find(item=>galleryImageKey(item)===key);
    if(image){
      const url=image.image_url||image.url;
      const sources=readStorage(`ps-event-go-image-sources-${event.id}`,{});
      sources[url]=target;
      localStorage.setItem(`ps-event-go-image-sources-${event.id}`,JSON.stringify(sources));
    }
    setGallery(null);
  };
  const galleryImages=gallery?[...savedImages.filter(image=>(image.source||"event")===gallery.source),...images.filter(image=>image.source===gallery.source)].sort((first,second)=>{
    const order=galleryOrder[gallery.source]||[];
    const firstIndex=order.indexOf(galleryImageKey(first));
    const secondIndex=order.indexOf(galleryImageKey(second));
    if(firstIndex<0&&secondIndex<0)return 0;
    if(firstIndex<0)return 1;
    if(secondIndex<0)return -1;
    return firstIndex-secondIndex;
  }):[];
  const moveGallery=direction=>setGallery(current=>current?({...current,index:(current.index+direction+galleryImages.length)%galleryImages.length}):current);
  const reorderGallery=(from,to)=>{
    if(!gallery||from===to||from<0||to<0||to>=galleryImages.length)return;
    const reordered=[...galleryImages];
    const [moved]=reordered.splice(from,1);
    reordered.splice(to,0,moved);
    const nextOrder={...galleryOrder,[gallery.source]:reordered.map(galleryImageKey)};
    setGalleryOrder(nextOrder);
    setGallery(current=>({...current,index:to}));
    localStorage.setItem(`ps-event-go-gallery-order-${event.id}`,JSON.stringify(nextOrder));
    const orderedSaved=reordered.filter(image=>savedImages.some(saved=>galleryImageKey(saved)===galleryImageKey(image)));
    const savedCopy=[...savedImages];
    const sourceIndexes=savedCopy.flatMap((image,index)=>(image.source||"event")===gallery.source?[index]:[]);
    sourceIndexes.forEach((targetIndex,index)=>{savedCopy[targetIndex]=orderedSaved[index]});
    setSavedImages(savedCopy);
    localStorage.setItem(`ps-event-go-images-${event.id}`,JSON.stringify(savedCopy));
    if(API_URL)orderedSaved.forEach((image,index)=>{
      if(String(image.id).startsWith("local-"))return;
      fetch(`${API_URL}/api/events/${event.id}/images/${image.id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({caption:image.caption,sort_order:index})}).catch(()=>{});
    });
  };
  useEffect(()=>{
    if(!gallery)return;
    const handleGalleryKeys=keyEvent=>{
      if(keyEvent.key==="Escape")setGallery(null);
      if(keyEvent.key==="ArrowRight")moveGallery(1);
      if(keyEvent.key==="ArrowLeft")moveGallery(-1);
    };
    window.addEventListener("keydown",handleGalleryKeys);
    return()=>window.removeEventListener("keydown",handleGalleryKeys);
  },[gallery,galleryImages.length]);
  useEffect(()=>{(async()=>{
    const sources=readStorage(`ps-event-go-image-sources-${event.id}`,{});
    if(API_URL){try{const r=await fetch(`${API_URL}/api/events/${event.id}/images`);if(r.ok){const j=await r.json();const withSources=j.map(image=>({...image,source:sources[image.image_url]||"event"}));setSavedImages(withSources);return}}catch(e){}}
    setSavedImages(readStorage(`ps-event-go-images-${event.id}`,[]).map(image=>({...image,source:image.source||sources[image.image_url]||"event"})))
  })()},[event.id]);
  const deleteImage = async (imageId)=>{
    if(!confirm('ลบรูปภาพนี้?')) return;
    const deleted=[...savedImages,...images].find(image=>image.id===imageId);
    try{
      if(API_URL&&savedImages.some(image=>image.id===imageId)&&!String(imageId).startsWith("local-"))await fetch(`${API_URL}/api/events/${event.id}/images/${imageId}`,{method:'DELETE'});
    }catch{}
    const nextSaved=savedImages.filter(image=>image.id!==imageId);
    const nextPending=images.filter(image=>image.id!==imageId);
    setSavedImages(nextSaved);
    setImages(nextPending);
    localStorage.setItem(`ps-event-go-images-${event.id}`,JSON.stringify(nextSaved));
    if(deleted){
      const key=galleryImageKey(deleted);
      const nextOrder={...galleryOrder};
      Object.keys(nextOrder).forEach(source=>{nextOrder[source]=nextOrder[source].filter(itemKey=>itemKey!==key)});
      setGalleryOrder(nextOrder);
      localStorage.setItem(`ps-event-go-gallery-order-${event.id}`,JSON.stringify(nextOrder));
    }
    if(gallery){
      if(galleryImages.length<=1)setGallery(null);
      else setGallery(current=>({...current,index:Math.min(current.index,galleryImages.length-2)}));
    }
  };
  const updateCaption = async (imageId, caption)=>{
    let updated;
    try{
      if(API_URL&&!String(imageId).startsWith("local-")){const r = await fetch(`${API_URL}/api/events/${event.id}/images/${imageId}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({caption})});if(r.ok)updated=await r.json()}
    }catch{}
    const nextSaved=savedImages.map(image=>image.id===imageId?{...image,...updated,caption}:image);
    const nextPending=images.map(image=>image.id===imageId?{...image,caption}:image);
    setSavedImages(nextSaved);
    setImages(nextPending);
    localStorage.setItem(`ps-event-go-images-${event.id}`,JSON.stringify(nextSaved));
  };
  const makeLocalImage = file=>new Promise((resolve,reject)=>{
    const objectUrl=URL.createObjectURL(file);
    const image=new Image();
    image.onload=()=>{
      const scale=Math.min(1,1440/Math.max(image.naturalWidth,image.naturalHeight));
      const canvas=document.createElement("canvas");
      canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));
      canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
      canvas.getContext("2d").drawImage(image,0,0,canvas.width,canvas.height);
      URL.revokeObjectURL(objectUrl);
      canvas.toBlob(blob=>{
        if(!blob){reject(new Error("แปลงไฟล์รูปไม่สำเร็จ"));return}
        const reader=new FileReader();
        reader.onload=()=>resolve(reader.result);
        reader.onerror=()=>reject(reader.error);
        reader.readAsDataURL(blob);
      },"image/webp",0.78);
    };
    image.onerror=()=>{URL.revokeObjectURL(objectUrl);reject(new Error("อ่านไฟล์รูปไม่สำเร็จ"))};
    image.src=objectUrl;
  });
  const uploadingFiles = async (files,source)=>{
    const arr = Array.from(files||[]);
    for(const f of arr){
      if(!f.type.startsWith("image/")){alert(`${f.name} ไม่ใช่ไฟล์รูปภาพ`);continue}
      const fd = new FormData(); fd.append('file', f);
      try{
        if(!API_URL)throw new Error("Local mode");
        const res = await fetch(`${API_URL}/api/uploads`, { method: 'POST', body: fd });
        if(!res.ok) throw new Error('upload failed');
        const j = await res.json();
        setImages(prev=>[...prev,{id:`local-${Date.now()}-${Math.random().toString(36).slice(2)}`,url:j.url,name:f.name,source}]);
      }catch{
        try{const url=await makeLocalImage(f);setImages(prev=>[...prev,{id:`local-${Date.now()}-${Math.random().toString(36).slice(2)}`,url,name:f.name,source}])}catch(e){alert(`เพิ่มรูป ${f.name} ไม่สำเร็จ: ${e.message}`)}
      }
    }
  };
  const saveEdits = async()=>{
    onSaveExperience(event.id,text);
    const newImages=[];
    for(const image of images){
      let saved;
      if(API_URL){
        try{
          const response=await fetch(`${API_URL}/api/events/${event.id}/images`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url:image.url,caption:image.name,sort_order:savedImages.length+newImages.length})});
          if(response.ok)saved=await response.json();
        }catch{}
      }
      newImages.push({...saved,source:image.source,id:saved?.id||image.id,event_id:event.id,image_url:saved?.image_url||image.url,caption:saved?.caption||image.name,sort_order:savedImages.length+newImages.length});
    }
    const nextImages=[...savedImages,...newImages];
    try{
      localStorage.setItem(`ps-event-go-images-${event.id}`,JSON.stringify(nextImages));
      const sources=readStorage(`ps-event-go-image-sources-${event.id}`,{});
      for(const image of newImages)sources[image.image_url]=image.source;
      localStorage.setItem(`ps-event-go-image-sources-${event.id}`,JSON.stringify(sources));
      const nextOrder={...galleryOrder};
      images.forEach((image,index)=>{
        const savedImage=newImages[index];
        const order=nextOrder[image.source]||[];
        const oldKey=String(image.id);
        const newKey=String(savedImage.id);
        const orderIndex=order.indexOf(oldKey);
        if(orderIndex>=0)order[orderIndex]=newKey;
        else order.push(newKey);
        nextOrder[image.source]=order;
      });
      setGalleryOrder(nextOrder);
      localStorage.setItem(`ps-event-go-gallery-order-${event.id}`,JSON.stringify(nextOrder));
      setSavedImages(nextImages);
    }catch{
      alert("พื้นที่จัดเก็บรูปในเบราว์เซอร์เต็ม กรุณาลดจำนวนรูปหรือลบรูปเก่าก่อน");
      return;
    }
    if(API_URL){
      try{
        const response=await fetch(`${API_URL}/api/events/${event.id}/images`);
        if(response.ok){const serverImages=await response.json();setSavedImages(serverImages);localStorage.setItem(`ps-event-go-images-${event.id}`,JSON.stringify(serverImages))}
      }catch{}
    }
    setEdit(false);
    setImages([]);
  };
  return <main className="section detailPage">
    <button className="back" onClick={onBack}>← กลับไปอีเว้นท์</button>
    <div className="detailHero"><div className="detailCover"><span>{event.cat}</span><h1>{event.title}</h1></div><div className="detailInfo"><Status value={status}/><h1>{event.title}</h1><p>▣ {event.date}</p><p>⌖ {event.place}</p><p>{event.desc}</p><div className="detailStats"><span>◉ {event.views} views</span><span>★ {event.rating}</span></div></div></div>
    <div className="detailColumns">
      <div>
        <section className="panel">
          <div className="panelHead"><div><span className="eyebrow">OUR EXPERIENCE</span><h2>ประสบการณ์ของ PS Event GO!</h2></div>{isAdmin&&<button className="editBtn" onClick={()=>setEdit(true)}>✎ Edit</button>}</div>
          <p className="experienceCopy">{experienceText||text}</p>
          <input className="uploadFileInput" ref={fileInputRef} type="file" accept="image/*" multiple onChange={e=>{uploadingFiles(e.target.files,uploadSourceRef.current);e.target.value=null;}}/>
          <div className="photoRow">
            {[["event","📷 รูปภาพ Event"],["atmosphere","📷 บรรยากาศ"],["activity","📷 กิจกรรม"]].map(([source,label])=>{
              const slotImages=[...savedImages.filter(image=>(image.source||"event")===source),...images.filter(image=>image.source===source)];
              return <button type="button" className={slotImages.length?"photoSlot hasImages":"photoSlot"} onClick={()=>openPhotoSlot(source,slotImages)} onDragOver={dragEvent=>isAdmin&&dragEvent.preventDefault()} onDrop={dragEvent=>{if(!isAdmin)return;dragEvent.preventDefault();try{const data=JSON.parse(dragEvent.dataTransfer.getData("application/x-ps-event-image"));moveImageToSource(data.key,source)}catch{}}} key={source}>
                {slotImages.length?<><span className="photoSlotGrid">{slotImages.slice(-4).map((image,index)=><img src={image.image_url||image.url} style={{objectFit:imagePreferences[galleryImageKey(image)]?.fit||"cover"}} alt={image.caption||image.name||label} key={`${source}:${galleryImageKey(image)}:${index}`}/>)}</span><span className="photoSlotLabel">{label.replace(/^📷\s*/,"")}{slotImages.length>1?` · ${slotImages.length} รูป`:""}</span></>:<span>{label}</span>}
              </button>;
            })}
          </div>
          {edit&&<div className="editor"><h3>แก้ไขประสบการณ์</h3><textarea value={text} onChange={e=>setText(e.target.value)}/>
            <div className="editorActions"><button type="button" className="btn ghost" onClick={()=>{setEdit(false);setImages([])}}>ยกเลิก</button><button type="button" className="btn primary" onClick={saveEdits}>💾 บันทึก</button></div></div>}
        </section>
        <section className="panel"><span className="eyebrow">COMMUNITY EXPERIENCE</span><h2>ประสบการณ์จากผู้เข้าร่วม</h2>{comments.map(comment=><div className="comment" key={comment.id}><b className="commentAuthor"><StatusDot value={comment.status||status}/>{comment.name}</b><p>{comment.text}</p></div>)}{!comments.length&&<p>ยังไม่มีความคิดเห็น เป็นคนแรกที่แชร์ประสบการณ์ได้เลย</p>}<form className="commentForm" onSubmit={submitEvent=>{submitEvent.preventDefault();if(!commentDraft.trim())return;const next=[...comments,{id:Date.now(),name:readStorage("ps-event-go-user",null)?.name||"ผู้เข้าร่วมงาน",text:commentDraft.trim(),status}];setComments(next);localStorage.setItem(`ps-event-go-comments-${event.id}`,JSON.stringify(next));setCommentDraft("")}}><textarea required maxLength="1000" value={commentDraft} onChange={event=>setCommentDraft(event.target.value)} placeholder="เขียนประสบการณ์หรือความคิดเห็นของคุณ"/><button className="btn primary" type="submit">ส่งความคิดเห็น</button></form></section>
      </div>
      <aside className="panel attendance"><h2>สถานะของคุณ</h2>{[["attended","🟢 ฉันเข้าร่วมแล้ว"],["planned","🔵 กำลังจะไป"],["not_attended","🔴 ยังไม่ได้เข้าร่วม"]].map(([v,t])=><button key={v} className={status===v?"attendanceBtn selected":"attendanceBtn"} onClick={()=>onStatusChange(event.id,v)}>{t}</button>)}</aside>
    </div>
    {gallery&&galleryImages.length>0&&<div className="galleryBackdrop" role="presentation" onClick={()=>setGallery(null)}><section className="galleryModal" role="dialog" aria-modal="true" aria-label="แกลเลอรีรูปภาพ" onClick={clickEvent=>clickEvent.stopPropagation()} onKeyDown={keyEvent=>{if(keyEvent.key==="Escape")setGallery(null);if(keyEvent.key==="ArrowRight")moveGallery(1);if(keyEvent.key==="ArrowLeft")moveGallery(-1)}}>
      <header className="galleryHeader"><div><span className="eyebrow">{gallery.source==="event"?"รูปภาพ Event":gallery.source==="atmosphere"?"บรรยากาศ":"กิจกรรม"}</span><span className="galleryCounter">{gallery.index+1} / {galleryImages.length}</span></div><div className="galleryActions">{isAdmin&&<><button type="button" className="btn ghost" onClick={()=>{const image=galleryImages[gallery.index];if(image)saveImagePreferences(galleryImageKey(image),{fit:imagePreferences[galleryImageKey(image)]?.fit==="cover"?"contain":"cover"})}}>{imagePreferences[galleryImageKey(galleryImages[gallery.index]||{})]?.fit==="cover"?"พอดีรูป":"เติมกรอบ"}</button><button type="button" className="btn ghost" onClick={()=>{const image=galleryImages[gallery.index];if(!image)return;setCaptionDraft(image.caption||image.name||"");setGalleryCaptionEditing(true)}}>✎ คำบรรยาย</button><button type="button" className="deleteBtn" onClick={()=>deleteImage(galleryImages[gallery.index]?.id)}>ลบรูป</button><button type="button" className="btn primary" onClick={()=>{const source=gallery.source;setGallery(null);chooseUploadSource(source)}}>＋ เพิ่มรูป</button></>}<button type="button" className="galleryClose" aria-label="ปิดแกลเลอรี" onClick={()=>setGallery(null)}>×</button></div></header>
      <div className="galleryStage">{galleryImages.length>1&&<button type="button" className="galleryArrow previous" aria-label="รูปก่อนหน้า" onClick={()=>moveGallery(-1)}>‹</button>}<img className={imagePreferences[galleryImageKey(galleryImages[gallery.index]||{})]?.fit==="cover"?"galleryMainImage cover":"galleryMainImage contain"} src={galleryImages[gallery.index]?.image_url||galleryImages[gallery.index]?.url} alt={galleryImages[gallery.index]?.caption||galleryImages[gallery.index]?.name||"รูปภาพ"}/>{galleryImages.length>1&&<button type="button" className="galleryArrow next" aria-label="รูปถัดไป" onClick={()=>moveGallery(1)}>›</button>}</div>
      <div className="galleryFooter"><div className="galleryCaption"><span>{galleryImages[gallery.index]?.caption||galleryImages[gallery.index]?.name||""}</span>{galleryCaptionEditing&&<form className="galleryCaptionEditor" onSubmit={submitEvent=>{submitEvent.preventDefault();const image=galleryImages[gallery.index];if(image)updateCaption(image.id,captionDraft);setGalleryCaptionEditing(false)}}><input autoFocus value={captionDraft} maxLength="255" onChange={inputEvent=>setCaptionDraft(inputEvent.target.value)} aria-label="คำบรรยายรูป"/><button type="submit" className="editBtn">บันทึก</button><button type="button" className="galleryCancelCaption" onClick={()=>setGalleryCaptionEditing(false)}>ยกเลิก</button></form>}{isAdmin&&<><small>คลิกรูปเพื่อดู · ลากรูปย่อทั้งใบเพื่อเรียงหรือย้ายหมวด</small><div className="galleryMoveTargets">{[["event","Event"],["atmosphere","บรรยากาศ"],["activity","กิจกรรม"]].map(([source,label])=><button type="button" className={source===gallery.source?"active":""} key={source} onDragOver={dragEvent=>dragEvent.preventDefault()} onDrop={dragEvent=>{dragEvent.preventDefault();try{const data=JSON.parse(dragEvent.dataTransfer.getData("application/x-ps-event-image"));moveImageToSource(data.key,source)}catch{}}} onClick={()=>source!==gallery.source&&moveImageToSource(galleryImageKey(galleryImages[gallery.index]),source)}>{label}</button>)}</div></>}</div>{galleryImages.length>1&&<div className="galleryThumbs">{galleryImages.map((image,index)=><div className={index===gallery.index?"galleryThumb active":"galleryThumb"} key={galleryEntryKey(image)} draggable={isAdmin} onDragStart={dragEvent=>{galleryDragIndex.current=index;dragEvent.dataTransfer.effectAllowed="move";dragEvent.dataTransfer.setData("text/plain",String(index));dragEvent.dataTransfer.setData("application/x-ps-event-image",JSON.stringify({key:galleryImageKey(image),source:gallery.source}))}} onDragOver={dragEvent=>dragEvent.preventDefault()} onDrop={dragEvent=>{dragEvent.preventDefault();try{const data=JSON.parse(dragEvent.dataTransfer.getData("application/x-ps-event-image"));if(data.source!==gallery.source){moveImageToSource(data.key,gallery.source);return}}catch{}const from=galleryDragIndex.current??Number(dragEvent.dataTransfer.getData("text/plain"));reorderGallery(from,index);galleryDragIndex.current=null}} onDragEnd={()=>{galleryDragIndex.current=null}}>
        <button type="button" className="galleryThumbView" aria-label={`ดูรูปที่ ${index+1}`} onClick={()=>setGallery(current=>({...current,index}))}><img src={image.image_url||image.url} alt=""/></button>
      </div>)}</div>}</div>
    </section></div>}
  </main>
}

function Experiences({eventsList,notes,onOpen}){
  const attended=eventsList.filter(event=>event.status==="attended"||notes[event.id]);
  const planned=eventsList.filter(event=>event.status==="planned");
  const list=(items,empty)=>items.length?items.map(event=><article className="experienceItem" key={event.id}><div><Status value={event.status}/><h3>{event.title}</h3><p>{event.date} · {event.place}</p>{notes[event.id]&&<p className="experienceNote">{notes[event.id]}</p>}</div><button className="editBtn" onClick={()=>onOpen(event.id)}>เปิดรายละเอียด</button></article>):<p>{empty}</p>;
  return <main className="section"><span className="eyebrow">COMMUNITY</span><h2>ประสบการณ์</h2><section className="panel"><div className="panelHead"><div><h2>งานที่เข้าร่วมและบันทึกไว้</h2><p>ประสบการณ์และสถานะของคุณจะแสดงที่นี่</p></div><a className="btn primary" href="#/events">ค้นหาอีเว้นท์</a></div>{list(attended,"ยังไม่มีงานที่บันทึกว่าเข้าร่วม เลือกสถานะจากหน้ารายละเอียดอีเว้นท์ได้")}</section><section className="panel"><h2>กำลังจะไป</h2>{list(planned,"ยังไม่มีอีเว้นท์ที่วางแผนจะไป")}</section></main>
}

function Calendar({eventsList,onOpen}){
  const [month,setMonth]=useState(()=>{const now=new Date();return new Date(now.getFullYear(),now.getMonth(),1)});
  const year=month.getFullYear();
  const monthIndex=month.getMonth();
  const firstWeekday=new Date(year,monthIndex,1).getDay();
  const daysInMonth=new Date(year,monthIndex+1,0).getDate();
  const monthLabel=new Intl.DateTimeFormat("th-TH",{month:"long",year:"numeric"}).format(month);
  const today=new Date();
  const cells=[...Array(firstWeekday).fill(null),...Array.from({length:daysInMonth},(_,index)=>index+1)];
  return <main className="section"><span className="eyebrow">EVENT CALENDAR</span><h2>ปฏิทินอีเว้นท์</h2><div className="calendarBox"><div className="calendarHead"><button className="iconBtn" aria-label="เดือนก่อน" onClick={()=>setMonth(new Date(year,monthIndex-1,1))}>‹</button><b>{monthLabel}</b><div><button className="iconBtn" aria-label="เดือนถัดไป" onClick={()=>setMonth(new Date(year,monthIndex+1,1))}>›</button><button className="editBtn" onClick={()=>setMonth(new Date(today.getFullYear(),today.getMonth(),1))}>วันนี้</button></div></div><div className="calendarGrid">{["อา","จ","อ","พ","พฤ","ศ","ส"].map(x=><b key={x}>{x}</b>)}{cells.map((day,index)=>{
    if(!day)return <div className="calendarEmpty" key={`empty-${index}`}/>;
    const key=`${year}-${String(monthIndex+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    const dayEvents=eventsList.filter(event=>event.startAt===key);
    const isToday=year===today.getFullYear()&&monthIndex===today.getMonth()&&day===today.getDate();
    return <div className={isToday?"calendarDay today":"calendarDay"} key={key}><span>{day}</span>{dayEvents.map(event=><button className="calendarEvent" key={event.id} onClick={()=>onOpen(event.id)} title={event.title}>{event.title}</button>)}</div>;
  })}</div></div></main>
}

function EventForm({event,categories,onCancel,onSave}){
  const [form,setForm]=useState(()=>event?{...event}:{title:"",cat:categories[0]||"General",startAt:"",place:"",desc:"",status:"not_attended",views:"0",rating:"-"});
  const set=(key,value)=>setForm(current=>({...current,[key]:value,...(key==="startAt"?{date:formatEventDate(value)}:{})}));
  return <div className="modalBackdrop" onClick={onCancel}><form className="eventForm" onClick={event=>event.stopPropagation()} onSubmit={event=>{event.preventDefault();onSave(form)}}>
    <button type="button" className="modalClose" aria-label="ปิด" onClick={onCancel}>×</button><span className="eyebrow">EVENT MANAGEMENT</span><h2>{event?"แก้ไขอีเว้นท์":"เพิ่มอีเว้นท์"}</h2>
    <label>ชื่องาน<input required maxLength="255" value={form.title} onChange={event=>set("title",event.target.value)}/></label>
    <div className="eventFormRow"><label>หมวดหมู่<input required list="event-categories" value={form.cat} onChange={event=>set("cat",event.target.value)}/><datalist id="event-categories">{categories.map(category=><option key={category} value={category}/>)}</datalist></label><label>วันที่เริ่ม<input required type="date" value={form.startAt||""} onChange={event=>set("startAt",event.target.value)}/></label></div>
    <label>สถานที่<input value={form.place||""} onChange={event=>set("place",event.target.value)}/></label><label>รายละเอียด<textarea rows="4" value={form.desc||""} onChange={event=>set("desc",event.target.value)}/></label>
    <div className="eventFormActions"><button type="button" className="btn ghost" onClick={onCancel}>ยกเลิก</button><button type="submit" className="btn primary">บันทึกอีเว้นท์</button></div>
  </form></div>
}

function Admin({eventsList,categories,onSave,onDelete,visitor}){
  const [editing,setEditing]=useState(undefined);
  const [range,setRange]=useState("all");
  const save=event=>{onSave(event);setEditing(undefined)};
  const visibleEvents=range==="all"?eventsList:eventsList.filter(event=>{
    if(!event.startAt)return false;
    const days=Number(range);
    const difference=(new Date(`${event.startAt}T00:00:00`)-new Date())/86400000;
    return difference>=0&&difference<=days;
  });
  const comments=visibleEvents.flatMap(event=>readStorage(`ps-event-go-comments-${event.id}`,[]).map(comment=>({...comment,eventTitle:event.title,eventId:event.id}))).sort((a,b)=>b.id-a.id);
  const visibleCategories=[...new Set(visibleEvents.map(event=>event.cat))];
  const statusCounts=[
    {key:"attended",label:"เข้าร่วมแล้ว",color:"#34d399",value:visibleEvents.filter(event=>event.status==="attended").length},
    {key:"planned",label:"กำลังจะไป",color:"#438dff",value:visibleEvents.filter(event=>event.status==="planned").length},
    {key:"not_attended",label:"ยังไม่ได้เข้าร่วม",color:"#ff4c68",value:visibleEvents.filter(event=>event.status==="not_attended").length}
  ];
  const categoryData=visibleCategories.map((name,index)=>({name,index,count:visibleEvents.filter(event=>event.cat===name).length}));
  const totalCategories=categoryData.reduce((sum,item)=>sum+item.count,0)||1;
  const palette=["#a24de0","#3989f4","#33be78","#f4bf32","#ef4c78","#28aabd","#8b9aae"];
  let offset=0;
  const donut=categoryData.map((item,index)=>{
    const start=offset;
    offset+=item.count/totalCategories*100;
    return `${palette[index%palette.length]} ${start}% ${offset}%`;
  }).join(", ")||"#273449 0% 100%";
  const topEvents=[...visibleEvents].sort((a,b)=>(parseInt(String(b.views).replace(/,/g,""),10)||0)-(parseInt(String(a.views).replace(/,/g,""),10)||0)).slice(0,5);
  const viewValues=topEvents.map(event=>parseInt(String(event.views).replace(/,/g,""),10)||0).reverse();
  const maximum=Math.max(1,...viewValues);
  const points=viewValues.map((value,index)=>`${viewValues.length===1?50:index/(viewValues.length-1)*100},${90-value/maximum*70}`).join(" ");
  const attendedCount=statusCounts[0].value;
  const plannedCount=statusCounts[1].value;
  const totalViews=visibleEvents.reduce((sum,event)=>sum+(parseInt(String(event.views).replace(/,/g,""),10)||0),0);
  const viewLabel=totalViews.toLocaleString("en-US");
  return <main className="adminWorkspace">
    <aside className="adminSidebar">
      <a className="adminBrand" href="#/"><span className="logo-ps">PS</span> Event <b>GO!</b></a>
      <div className="adminOwner"><span className="ownerIcon">♛</span><span><b>Owner Panel</b><small>สิทธิ์สูงสุด</small></span><span>›</span></div>
      <nav className="adminSideNav">
        <a className="selected" href="#/admin">⌂ <span>แดชบอร์ด</span></a>
        <button onClick={()=>document.getElementById("admin-analytics")?.scrollIntoView({behavior:"smooth"})}>⌁ <span>สถิติและรายงาน</span></button>
        <button onClick={()=>document.getElementById("admin-events")?.scrollIntoView({behavior:"smooth"})}>▣ <span>อีเว้นท์</span><span className="sideCount">{eventsList.length}</span></button>
        <button onClick={()=>document.getElementById("admin-community")?.scrollIntoView({behavior:"smooth"})}>♧ <span>คอมมูนิตี้</span><span className="sideCount">{comments.length}</span></button>
        <a href="#/experiences">◉ <span>ประสบการณ์</span></a>
      </nav>
      <div className="adminSidebarFoot"><span>PS Event GO!</span><small>Local workspace · v1.0.0</small></div>
    </aside>
    <div className="adminMain">
      <header className="adminToolbar"><div><span className="adminCrumb">แดชบอร์ด</span><span className="adminToolbarTitle">ภาพรวมกิจกรรม</span></div><div className="adminToolbarActions"><label className="rangeSelect">ช่วงวันที่<select value={range} onChange={event=>setRange(event.target.value)}><option value="all">ทั้งหมด</option><option value="7">7 วันข้างหน้า</option><option value="30">30 วันข้างหน้า</option><option value="90">90 วันข้างหน้า</option></select></label><button className="adminToolButton" onClick={()=>window.print()}>⇩ <span>พิมพ์รายงาน</span></button><span className="adminUser"><span className="adminAvatar">{visitor?.name?.[0]||"A"}</span><span><b>{visitor?.name||"Admin"}</b><small>ผู้ดูแลระบบ</small></span></span></div></header>
      <div className="adminDashboard">
        <div className="adminTitleRow"><div><span className="eyebrow">ADMIN CONTROL CENTER</span><h1>ภาพรวม Dashboard</h1></div><button className="adminPrimary" onClick={()=>setEditing(null)}>＋ เพิ่มอีเว้นท์</button></div>
        <section className="adminKpis">
          <article className="adminKpi purple"><div className="kpiTop"><span>ยอดเข้าชมรวม</span><i>◉</i></div><b>{viewLabel}</b><small>รวมจากข้อมูลอีเว้นท์</small><div className="sparkline"><svg viewBox="0 0 160 32" preserveAspectRatio="none"><polyline points="0,26 18,21 34,24 51,13 68,19 84,10 102,14 119,5 139,11 160,3"/></svg></div></article>
          <article className="adminKpi blue"><div className="kpiTop"><span>อีเว้นท์ทั้งหมด</span><i>▣</i></div><b>{visibleEvents.length.toLocaleString("th-TH")}</b><small>{visibleCategories.length} หมวดหมู่</small><div className="sparkline"><svg viewBox="0 0 160 32" preserveAspectRatio="none"><polyline points="0,25 16,25 32,18 48,21 64,9 80,16 96,12 112,18 128,7 144,11 160,2"/></svg></div></article>
          <article className="adminKpi green"><div className="kpiTop"><span>กำลังจะไป</span><i>▦</i></div><b>{plannedCount.toLocaleString("th-TH")}</b><small>สถานะที่ผู้เข้าชมเลือก</small><div className="sparkline"><svg viewBox="0 0 160 32" preserveAspectRatio="none"><polyline points="0,24 16,19 32,22 48,15 64,19 80,9 96,14 112,7 128,13 144,5 160,3"/></svg></div></article>
          <article className="adminKpi yellow"><div className="kpiTop"><span>เข้าร่วมแล้ว</span><i>✓</i></div><b>{attendedCount.toLocaleString("th-TH")}</b><small>สถานะที่ผู้เข้าชมเลือก</small><div className="sparkline"><svg viewBox="0 0 160 32" preserveAspectRatio="none"><polyline points="0,26 16,22 32,24 48,14 64,20 80,12 96,15 112,8 128,12 144,6 160,3"/></svg></div></article>
          <article className="adminKpi pink"><div className="kpiTop"><span>ความคิดเห็น</span><i>▰</i></div><b>{comments.length.toLocaleString("th-TH")}</b><small>จากประสบการณ์ผู้เข้าร่วม</small><div className="sparkline"><svg viewBox="0 0 160 32" preserveAspectRatio="none"><polyline points="0,23 16,20 32,25 48,12 64,17 80,9 96,17 112,11 128,14 144,3 160,8"/></svg></div></article>
        </section>
        <section className="adminChartGrid" id="admin-analytics">
          <article className="adminPanel adminLinePanel"><div className="adminPanelHead"><div><h2>ยอดเข้าชมอีเว้นท์</h2><p>เรียงตามอีเว้นท์ยอดนิยมที่มีข้อมูล</p></div><span className="chartLegend"><i/>ยอดเข้าชม</span></div><div className="lineChart"><div className="chartYAxis"><span>สูง</span><span>กลาง</span><span>ต่ำ</span><span>0</span></div><svg viewBox="0 0 600 190" preserveAspectRatio="none" role="img" aria-label="กราฟยอดเข้าชมอีเว้นท์"><defs><linearGradient id="viewsFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#a34cf2" stopOpacity=".3"/><stop offset="1" stopColor="#a34cf2" stopOpacity="0"/></linearGradient></defs><path className="chartGridLine" d="M0 25H600 M0 75H600 M0 125H600 M0 175H600"/><polygon points={`0,190 ${points} 600,190`} fill="url(#viewsFill)"/><polyline className="viewsLine" points={points}/>{viewValues.map((value,index)=><circle key={`${value}-${index}`} cx={viewValues.length===1?300:index/(viewValues.length-1)*600} cy={90-value/maximum*70} r="4"/>)}</svg></div><div className="chartXLabels">{topEvents.slice().reverse().map(event=><span key={event.id}>{event.title.split(" ").slice(0,2).join(" ")}</span>)}</div></article>
          <article className="adminPanel"><div className="adminPanelHead"><div><h2>สัดส่วนหมวดหมู่</h2><p>จำนวนอีเว้นท์แยกตามหมวดหมู่</p></div><span className="panelMore">{visibleCategories.length} หมวด</span></div><div className="donutLayout"><div className="adminDonut" style={{background:`conic-gradient(${donut})`}}><div><b>{visibleEvents.length}</b><small>อีเว้นท์</small></div></div><div className="donutLegend">{categoryData.slice(0,5).map(item=><div key={item.name}><i style={{background:palette[item.index%palette.length]}}/><span>{item.name}</span><b>{item.count}</b></div>)}</div></div></article>
          <article className="adminPanel"><div className="adminPanelHead"><div><h2>สถานะผู้เข้าร่วม</h2><p>สถานะที่เลือกในอีเว้นท์</p></div></div><div className="statusBars">{statusCounts.map((item,index)=><div className="statusBarRow" key={item.key}><span>{item.label}</span><div><i style={{width:`${Math.max(item.value/eventsList.length*100,eventsList.length?3:0)}%`,background:item.color}}/></div><b>{item.value}</b></div>)}</div><div className="statusSummary"><b>{(attendedCount+plannedCount).toLocaleString("th-TH")}</b><span>รายการที่มีแผนเข้าร่วม</span></div></article>
          <article className="adminPanel"><div className="adminPanelHead"><div><h2>อีเว้นท์ตามหมวดหมู่</h2><p>เปรียบเทียบจำนวนรายการ</p></div></div><div className="categoryBars">{categoryData.slice(0,6).map((item,index)=><div className="categoryBar" key={item.name}><div className="barTrack"><i style={{height:`${Math.max(item.count/Math.max(...categoryData.map(category=>category.count),1)*100,4)}%`,background:palette[index%palette.length]}}/></div><b>{item.count}</b><small>{item.name}</small></div>)}</div></article>
        </section>
        <section className="adminBottomGrid">
          <article className="adminPanel" id="admin-events"><div className="adminPanelHead"><div><h2>อีเว้นท์ยอดนิยม</h2><p>เรียงตามยอดเข้าชมในข้อมูลอีเว้นท์</p></div><button className="panelLink" onClick={()=>document.getElementById("admin-event-list")?.scrollIntoView({behavior:"smooth"})}>จัดการทั้งหมด →</button></div><div className="popularEvents">{topEvents.map((event,index)=><div className="popularEvent" key={event.id}><span className="eventRank">{index+1}</span><div className={`popularThumb ${event.cat.toLowerCase().replace(/[^a-z0-9]+/g,"-")}`}>{event.cat.slice(0,2).toUpperCase()}</div><div className="popularInfo"><b>{event.title}</b><small>{event.date} · {event.place}</small></div><span className="popularViews">◉ {event.views||0}</span><button className="tableEdit" onClick={()=>setEditing(event)}>แก้ไข</button></div>)}</div></article>
          <article className="adminPanel" id="admin-community"><div className="adminPanelHead"><div><h2>ประสบการณ์ล่าสุด</h2><p>ความคิดเห็นจากผู้เข้าร่วม</p></div><a href="#/experiences" className="panelLink">ดูทั้งหมด →</a></div><div className="recentComments">{comments.slice(0,5).map(comment=><div className="recentComment" key={`${comment.eventId}-${comment.id}`}><span className="commentAvatar">{comment.name?.[0]||"U"}</span><div><b>{comment.name}</b><small>{comment.eventTitle}</small><p>{comment.text}</p></div><StatusDot value={comment.status}/></div>)}{!comments.length&&<p className="emptyAdmin">ยังไม่มีความคิดเห็นจากผู้เข้าร่วม</p>}</div></article>
        </section>
        <section className="adminPanel adminEventManager" id="admin-event-list"><div className="adminPanelHead"><div><h2>จัดการอีเว้นท์</h2><p>{visibleEvents.length} รายการ{range!=="all"?" ในช่วงวันที่เลือก":""}</p></div><button className="adminPrimary" onClick={()=>setEditing(null)}>＋ เพิ่มอีเว้นท์</button></div>{visibleEvents.map(event=><div className="adminRow" key={event.id}><div><b>{event.title}</b><small>{event.date} · {event.place}</small></div><div className="adminRowActions"><button className="editBtn" onClick={()=>setEditing(event)}>✎ แก้ไข</button><button className="deleteBtn" onClick={()=>{if(confirm(`ลบ ${event.title}?`))onDelete(event.id)}}>ลบ</button></div></div>)}{!visibleEvents.length&&<p className="emptyAdmin">ไม่มีอีเว้นท์ในช่วงวันที่เลือก</p>}</section>
      </div>
    </div>
    {editing!==undefined&&<EventForm event={editing} categories={categories} onCancel={()=>setEditing(undefined)} onSave={save}/>}</main>
}

function App(){
  const [path,setPath]=useState(location.hash.slice(1)||"/");
  const [isAdmin,setIsAdmin]=useState(()=>localStorage.getItem("ps-event-go-admin")==="true");
  const [visitor,setVisitor]=useState(()=>{try{return JSON.parse(localStorage.getItem("ps-event-go-user"))}catch{return null}});
  const [eventsList,setEventsList]=useState(()=>readStorage("ps-event-go-events",initialEvents));
  const [attendance,setAttendance]=useState(()=>readStorage("ps-event-go-attendance",{}));
  const [experienceNotes,setExperienceNotes]=useState(()=>readStorage("ps-event-go-experiences",{}));
  const [selected,setSelected]=useState(null);
  const categories=[...new Set(eventsList.map(event=>event.cat))];
  const eventsForView=eventsList.map(event=>({...event,status:attendance[event.id]||event.status}));
  useEffect(()=>localStorage.setItem("ps-event-go-events",JSON.stringify(eventsList)),[eventsList]);
  useEffect(()=>localStorage.setItem("ps-event-go-attendance",JSON.stringify(attendance)),[attendance]);
  useEffect(()=>localStorage.setItem("ps-event-go-experiences",JSON.stringify(experienceNotes)),[experienceNotes]);
  useEffect(()=>localStorage.setItem("ps-event-go-admin",String(isAdmin)),[isAdmin]);
  useEffect(()=>{const f=()=>setPath(location.hash.slice(1)||"/");addEventListener("hashchange",f);return()=>removeEventListener("hashchange",f)},[]);
  useEffect(()=>{if(path.startsWith("/events/"))setSelected(eventsList.find(event=>event.id===Number(path.split("/")[2]))||null)},[path,eventsList]);
  useEffect(()=>{
    if(!visitor||!API_URL)return;
    const eventId=path.startsWith("/events/")?Number(path.split("/")[2]):null;
    fetch(`${API_URL}/api/page-views`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({userId:visitor.id,eventId,path})}).catch(()=>{});
  },[path,visitor]);
  const open=id=>{setSelected(eventsForView.find(event=>event.id===id)||null);location.hash="/events/"+id};
  const saveEvent=event=>{
    const normalized={...event,title:event.title.trim(),desc:event.desc?.trim()||"",date:event.date||formatEventDate(event.startAt)};
    setEventsList(current=>event.id?current.map(item=>item.id===event.id?normalized:item):[{...normalized,id:Math.max(0,...current.map(item=>Number(item.id)||0))+1},...current]);
  };
  const deleteEvent=id=>{
    setEventsList(current=>current.filter(event=>event.id!==id));
    setAttendance(current=>{const next={...current};delete next[id];return next});
    setExperienceNotes(current=>{const next={...current};delete next[id];return next});
    localStorage.removeItem(`ps-event-go-images-${id}`);
    localStorage.removeItem(`ps-event-go-comments-${id}`);
    if(Number(path.split("/")[2])===id)location.hash="/events";
  };
  const updateAttendance=(eventId,status)=>setAttendance(current=>({...current,[eventId]:status}));
  const saveExperience=(eventId,text)=>setExperienceNotes(current=>({...current,[eventId]:text}));
  let content=path==="/events"?<EventsPage eventsList={eventsForView} onOpen={open}/>:path==="/experiences"?<Experiences eventsList={eventsForView} notes={experienceNotes} onOpen={open}/>:path==="/calendar"?<Calendar eventsList={eventsForView} onOpen={open}/>:path==="/admin"&&isAdmin?<Admin eventsList={eventsForView} categories={categories} onSave={saveEvent} onDelete={deleteEvent} visitor={visitor}/>:selected&&path.startsWith("/events/")?<EventDetail key={selected.id} event={selected} isAdmin={isAdmin} status={attendance[selected.id]||selected.status} experienceText={experienceNotes[selected.id]} onSaveExperience={saveExperience} onStatusChange={updateAttendance} onBack={()=>{setSelected(null);location.hash="/events"}}/>:<Home eventsList={eventsForView} onOpen={open}/>;
  return <><Nav isAdmin={isAdmin} setIsAdmin={setIsAdmin} visitor={visitor} onVisitorLogin={setVisitor} onVisitorLogout={()=>{localStorage.removeItem("ps-event-go-user");setVisitor(null)}}/>{content}<footer><Logo/><p>Event Media & Community · PS Event GO!</p></footer></>
}
createRoot(document.getElementById("root")).render(<App/>);
