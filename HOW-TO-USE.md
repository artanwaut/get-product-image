# Get Product Image — วิธีใช้งาน

เครื่องมือดึง URL รูปสินค้าจากหน้าเว็บ OWNDAYS โดยอ่านจาก selector `#productImageSwiper .swiper-slide-active img`

---

## ความต้องการของระบบ

- **Node.js 18 ขึ้นไป** (แนะนำ Node 22)
- มี **npm** ติดตั้งแล้ว
- ถ้าใช้ nvm ให้รัน `nvm use` ในโฟลเดอร์โปรเจกต์ (มีไฟล์ `.nvmrc` กำหนดเป็น Node 22)

---

## ติดตั้งครั้งแรก

```bash
cd /Users/odt/Desktop/get-product-image

# สลับ Node version (ถ้าใช้ nvm)
nvm use

# ถ้ายังไม่มี Node 22
nvm install 22
nvm use 22

# ติดตั้ง dependencies
npm install
```

---

## วิธีรัน

```bash
npm start
```

Server จะรันที่ **http://localhost:3000**

เปิด browser แล้วเข้า URL ด้านบน **ห้ามเปิด `index.html` ตรงๆ** (file://) เพราะ browser จะบล็อกการ fetch ข้าม domain

### ใช้ port อื่น (ถ้า 3000 ถูกใช้งานอยู่)

```bash
PORT=3001 npm start
```

แล้วเปิด **http://localhost:3001**

---

## วิธีใช้งานหน้าเว็บ

1. กรอก URL หน้าสินค้าในช่อง textbox  
   ตัวอย่าง:
   ```
   https://www.owndays.com/jp/ja/products/OB2020G-5A?sku=9215
   ```

2. กด **+ Add text box** เพื่อเพิ่มช่อง URL (ถ้ามีหลายรายการ)

3. กด **ดึง URL รูป**

4. ระบบจะเข้าแต่ละ URL ตามลำดับ แล้วแสดง URL รูปใน textarea (1 บรรทัดต่อ 1 URL)

5. ถ้า URL ใดดึงไม่ได้ จะแสดง `[ERROR]` พร้อมข้อความ error ในบรรทัดนั้น

---

## แก้ปัญหาเบื้องต้น

### Error: `Cannot find module 'node:stream'`

Node.js เวอร์ชันเก่าเกินไป ให้สลับเป็น Node 18+:

```bash
nvm use 22
npm start
```

### Error: `Port 3000 is already in use`

Port ถูกใช้งานอยู่แล้ว ให้ปิด process เก่า:

```bash
lsof -ti:3000 | xargs kill
npm start
```

หรือใช้ port อื่น:

```bash
PORT=3001 npm start
```

### Error: `Image not found`

- ตรวจสอบว่า URL เป็นหน้าสินค้าที่มี `#productImageSwiper` จริง
- ตรวจสอบว่า URL เปิดได้ใน browser ปกติ

---

## โครงสร้างไฟล์

| ไฟล์ | หน้าที่ |
|------|---------|
| `index.html` | หน้า UI สำหรับกรอก URL และแสดงผลลัพธ์ |
| `server.js` | Backend ดึง HTML จาก URL ภายนอก แล้ว parse หา URL รูป |
| `package.json` | กำหนด dependencies และ script รัน server |
