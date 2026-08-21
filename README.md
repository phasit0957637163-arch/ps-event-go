# PS Event GO!

## เปิดหน้าเว็บ
```powershell
cd frontend
npm install
npm run dev
```

จากนั้นเปิด http://localhost:5173

## Backend (ยังไม่จำเป็นสำหรับดู UI)
```powershell
cd backend
npm install
copy .env.example .env
npm run dev
```

## Database
ใช้ PostgreSQL + DBeaver และรัน `database/schema.sql`

## จุดที่ทำไว้ใน UI
- Logo PS Event GO! แบบตัวอักษร PS เหลือง / Event ขาว / GO! ชมพู
- หน้าแรกแบบ Event Media
- Event cards
- ค้นหาและกรองหมวดหมู่
- สถานะ เข้าร่วมแล้ว / กำลังจะไป / ไม่ได้เข้าร่วม
- Event Detail
- OUR EXPERIENCE + Admin Edit
- เพิ่มรูปภาพ UI
- Community Experience
- ปฏิทิน
- Admin Dashboard + statistics
- Responsive
