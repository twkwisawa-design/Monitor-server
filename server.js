const express = require('express');
const axios = require('axios');
const os = require('os');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ข้อมูล LINE Channel
const CHANNEL_ID = '2012308758';
const CHANNEL_SECRET = '91a88db6ba51d3c270c92f0e56343260';
const REDIRECT_URI = 'https://monitor-server-c0wq.onrender.com/callback';

// รายชื่อพนักงานทั้งหมด 16 ท่าน (ซิงค์ตรงกับแอปพลิเคชันมือถือ)
let employees = [
    { id: "1", idNo: "1-6703-00033-67-5", name: "นายสมศักดิ์ คำสี", nickname: "ช่างศักดิ์", phone: "097-260-6457", role: "ช่างประจำแผนก", dept: "ช่างเชื่อม", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80" },
    { id: "2", idNo: "3-1009-05405-18-1", name: "นายสมชาย พาหงษ์", nickname: "ช่างสมชาย", phone: "086-008-3088", role: "ช่างประจำแผนก", dept: "ช่างเชื่อม", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80" },
    { id: "3", idNo: "3-4514-00558-37-0", name: "นายฉัตรชัย ศิริอรรถ", nickname: "ช่างฉัตร", phone: "097-308-1873", role: "ช่างประจำแผนก", dept: "ช่างเชื่อม", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80" },
    { id: "4", idNo: "3-6605-00320-11-9", name: "นายพิน จิ๋วน้อย", nickname: "ช่างพิน", phone: "080-563-5681", role: "ช่างประจำแผนก", dept: "ช่างเชื่อม", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80" },
    { id: "5", idNo: "00-1301-120945-6", name: "Mr. Min Aung Myo Oo", nickname: "ช่างอ๋อง", phone: "063-505-2152", role: "ช่างประจำแผนก", dept: "ช่างขัด", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80" },
    { id: "6", idNo: "6-6510-60415-877", name: "Mr. Min Thin Myint Oo", nickname: "ช่างแมน", phone: "099-187-3147", role: "ช่างประจำแผนก", dept: "ช่างขัด", avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80" },
    { id: "7", idNo: "6-6512-60211-595", name: "Mr. Min Thein Win Tun", nickname: "ช่างธร", phone: "063-474-6480", role: "ช่างประจำแผนก", dept: "ช่างขัด", avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80" },
    { id: "8", idNo: "00-1388-103394-7", name: "Mr. Tike Son", nickname: "ช่างมอญ", phone: "094-910-4736", role: "ช่างประจำแผนก", dept: "ช่างขัด", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80" },
    { id: "9", idNo: "6-6610-00473-619", name: "Mr. Talattha Phanthalath", nickname: "ช่างบี", phone: "062-072-9989", role: "ช่างประจำแผนก", dept: "ช่างตัด", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80" },
    { id: "10", idNo: "6-6611-0020-1872", name: "Mr. Sit Phanthalath", nickname: "ช่างสิท", phone: "082-796-6078", role: "ช่างประจำแผนก", dept: "ช่างตัด", avatar: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=200&auto=format&fit=crop&q=80" },
    { id: "11", idNo: "6-6610-0029-0619", name: "Mr. Khammany Vilavong", nickname: "ช่างคำ", phone: "094-562-3194", role: "ช่างประจำแผนก", dept: "ช่างตัด", avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&auto=format&fit=crop&q=80" },
    { id: "12", idNo: "1-3407-00475-07-4", name: "นายวิศวะ โลมากาล", nickname: "คุณนนท์ (CEO)", phone: "063-268-3040", role: "CEO ประธานเจ้าหน้าที่บริหาร", dept: "ออฟฟิศ", avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80" },
    { id: "13", idNo: "1-1002-00341-21-9", name: "น.ส.พนิดา เจริญทรัพย์", nickname: "คุณนิดา", phone: "081-456-7890", role: "เจ้าหน้าที่ธุรการ / การเงิน", dept: "ออฟฟิศ", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80" },
    { id: "14", idNo: "1-1005-00892-14-3", name: "นายธนทัต บุญโต", nickname: "คุณทัต", phone: "089-123-4567", role: "เจ้าหน้าที่จัดซื้อ / คลังสินค้า", dept: "ออฟฟิศ", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80" },
    { id: "15", idNo: "1-1008-00561-88-7", name: "น.ส.กนกพร อนุสรณ์กุล", nickname: "คุณกนก", phone: "086-789-0123", role: "เจ้าหน้าที่บัญชี / เอกสาร", dept: "ออฟฟิศ", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80" },
    { id: "16", idNo: "1-1012-00784-33-2", name: "นายศราวรณ์ นาสุริวงษ์", nickname: "ช่างศราวรณ์", phone: "095-234-5678", role: "ช่างเทคนิคงานสเตนเลส", dept: "ช่าง", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80" }
];

let leavesList = [
    { id: 1, employeeName: "นายสมศักดิ์ คำสี (ช่างศักดิ์ - ช่างเชื่อม)", type: "ลากิจ", durationType: "เต็มวัน", dateRange: "12 พ.ย. 2569", reason: "ติดภารกิจติดต่อส่วนราชการ", status: "รออนุมัติ" },
    { id: 2, employeeName: "Mr. Min Aung Myo Oo (ช่างอ๋อง - ช่างขัด)", type: "ลาป่วย", durationType: "เต็มวัน", dateRange: "10 พ.ย. 2569", reason: "ไข้ขึ้น ปวดศีรษะ", status: "อนุมัติแล้ว" },
    { id: 3, employeeName: "นายศราวรณ์ นาสุริวงษ์ (ช่างศราวรณ์ - ช่าง)", type: "ลากิจ", durationType: "ครึ่งวันเช้า", dateRange: "14 พ.ย. 2569", reason: "ไปต่ออายุใบขับขี่", status: "รออนุมัติ" },
    { id: 4, employeeName: "น.ส.พนิดา เจริญทรัพย์ (คุณนิดา - ออฟฟิศ)", type: "ลากิจ", durationType: "รายชั่วโมง", dateRange: "15 พ.ย. 2569 (2 ชม.)", reason: "รับบุตรที่โรงเรียน", status: "อนุมัติแล้ว" }
];

// CEO API: อนุมัติใบลา
app.post('/api/approve-leave', (req, res) => {
    const { leaveId, role } = req.body;
    if (role !== 'CEO') {
        return res.status(403).json({ error: 'เฉพาะสิทธิ์ CEO เท่านั้นที่อนุมัติการลาได้' });
    }
    const leave = leavesList.find(l => l.id == leaveId);
    if (leave) {
        leave.status = 'อนุมัติแล้ว';
        return res.json({ success: true, message: `CEO อนุมัติการลาของ ${leave.employeeName} เรียบร้อยแล้ว` });
    }
    res.status(404).json({ error: 'ไม่พบรายการใบลา' });
});

// CEO API: เพิ่มพนักงานใหม่
app.post('/api/add-employee', (req, res) => {
    const { role, name, nickname, phone, idNo, dept, empRole } = req.body;
    if (role !== 'CEO') {
        return res.status(403).json({ error: 'เฉพาะสิทธิ์ CEO เท่านั้นที่สามารถเพิ่มพนักงานได้' });
    }
    if (!name) {
        return res.status(400).json({ error: 'กรุณากรอกชื่อพนักงาน' });
    }
    const newEmp = {
        id: String(Date.now()),
        idNo: idNo || '0-0000-00000-00-0',
        name: name,
        nickname: nickname || 'พนักงานใหม่',
        phone: phone || '080-000-0000',
        role: empRole || 'ช่างประจำแผนก',
        dept: dept || 'ช่าง',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'
    };
    employees.push(newEmp);
    res.json({ success: true, message: `CEO เพิ่มพนักงานใหม่ (${name}) เรียบร้อยแล้ว`, employee: newEmp });
});

// CEO API: แก้ไขข้อมูลพนักงาน
app.post('/api/edit-employee', (req, res) => {
    const { role, id, name, nickname, phone, idNo, dept, empRole } = req.body;
    if (role !== 'CEO') {
        return res.status(403).json({ error: 'เฉพาะสิทธิ์ CEO เท่านั้นที่สามารถแก้ไขข้อมูลพนักงานได้' });
    }
    const emp = employees.find(e => e.id == id);
    if (emp) {
        if (name) emp.name = name;
        if (nickname) emp.nickname = nickname;
        if (phone) emp.phone = phone;
        if (idNo) emp.idNo = idNo;
        if (dept) emp.dept = dept;
        if (empRole) emp.role = empRole;
        return res.json({ success: true, message: `CEO แก้ไขข้อมูลพนักงาน (${emp.name}) เรียบร้อยแล้ว` });
    }
    res.status(404).json({ error: 'ไม่พบข้อมูลพนักงาน' });
});

// CEO API: ลบพนักงาน
app.post('/api/delete-employee', (req, res) => {
    const { role, id } = req.body;
    if (role !== 'CEO') {
        return res.status(403).json({ error: 'เฉพาะสิทธิ์ CEO เท่านั้นที่สามารถลบข้อมูลพนักงานได้' });
    }
    const index = employees.findIndex(e => e.id == id);
    if (index !== -1) {
        const deleted = employees.splice(index, 1);
        return res.json({ success: true, message: `CEO ลบข้อมูลพนักงาน (${deleted[0].name}) เรียบร้อยแล้ว` });
    }
    res.status(404).json({ error: 'ไม่พบข้อมูลพนักงาน' });
});

// หน้าหลัก PC Portal
app.get('/', (req, res) => {
    const currentRole = req.query.role || 'CEO';
    const lineAuthUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${CHANNEL_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=123456789&scope=profile%20openid%20email`;
    const isCEO = currentRole === 'CEO';

    res.send(`
        <!DOCTYPE html>
        <html lang="th">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>TWK Stainless - CEO PC Live Monitoring Portal</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
            <style>
                body { font-family: 'Sarabun', sans-serif; }
            </style>
        </head>
        <body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col">
            <!-- Top Banner Header -->
            <header class="bg-gradient-to-r from-red-950 via-red-800 to-red-600 border-b border-red-500/30 p-6 shadow-2xl">
                <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div class="flex items-center space-x-4">
                        <div class="bg-white/10 border-2 border-white px-5 py-2 rounded-2xl backdrop-blur-md text-center shadow-lg">
                            <h1 class="text-2xl font-black tracking-widest text-white">TWK</h1>
                            <div class="h-0.5 bg-white my-0.5"></div>
                            <p class="text-[10px] font-bold tracking-widest text-white">STAINLESS</p>
                        </div>
                        <div>
                            <div class="flex items-center gap-2">
                                <h2 class="text-xl font-black text-white">TWK Executive PC Portal</h2>
                                ${isCEO ? '<span class="bg-yellow-400/20 text-yellow-300 text-xs px-2.5 py-0.5 rounded-full font-bold border border-yellow-400/40">⚡ CEO Live Monitoring Console</span>' : '<span class="bg-slate-700 text-slate-300 text-xs px-2.5 py-0.5 rounded-full">Employee View</span>'}
                            </div>
                            <p class="text-xs text-red-100 mt-1">ศูนย์มอนิเตอร์ ตรวจสอบ แก้ไข เพิ่มรายชื่อ และจัดการสถานะพนักงานทุกคน (${employees.length} ท่าน)</p>
                        </div>
                    </div>

                    <!-- Role Selector & LINE Credentials -->
                    <div class="flex items-center gap-4">
                        <form method="GET" action="/" class="flex items-center bg-black/40 border border-white/20 p-2 rounded-xl text-xs">
                            <span class="text-slate-300 font-bold mr-2">สิทธิ์การเข้าถึง:</span>
                            <select name="role" onchange="this.form.submit()" class="bg-slate-900 border border-slate-700 text-white font-bold p-1.5 rounded-lg">
                                <option value="CEO" ${isCEO ? 'selected' : ''}>👑 CEO (มอนิเตอร์และจัดการพนักงานทุกคน)</option>
                                <option value="EMPLOYEE" ${!isCEO ? 'selected' : ''}>👤 Employee (พนักงานทั่วไป)</option>
                            </select>
                        </form>

                        <div class="bg-black/30 border border-white/20 p-2.5 rounded-xl text-right text-xs hidden lg:block">
                            <p class="font-bold text-emerald-400">🟢 LINE Channel ID: ${CHANNEL_ID}</p>
                            <p class="text-slate-300">User ID: U30ec3f45b62acc9de4229e337376f948</p>
                        </div>
                    </div>
                </div>
            </header>

            <!-- Main Portal Content -->
            <main class="max-w-7xl w-full mx-auto p-6 flex-1 space-y-6">

                ${!isCEO ? `
                    <!-- Non-CEO Lock Banner -->
                    <div class="bg-amber-500/10 border-2 border-amber-500/40 p-8 rounded-2xl text-center">
                        <div class="text-5xl mb-3">🔒</div>
                        <h3 class="text-xl font-bold text-amber-400">สงวนสิทธิ์การมอนิเตอร์และแก้ไขพนักงานเฉพาะสิทธิ์ CEO เท่านั้น</h3>
                        <p class="text-xs text-slate-300 mt-2">ท่านสามารถยื่นใบลาและตรวจสอบสถานะประจำตัวตนเองได้ หากต้องการทดสอบระบบมอนิเตอร์กรุณาเปลี่ยนสิทธิ์เป็น "CEO" ด้านบน</p>
                    </div>
                ` : `
                    <!-- CEO Quick Statistics Cards -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
                            <p class="text-xs text-slate-400 font-medium">บุคลากรทั้งหมดในระบบ</p>
                            <p class="text-3xl font-black text-sky-400 mt-1">${employees.length} ท่าน</p>
                            <p class="text-[11px] text-slate-500 mt-1">ช่างเชื่อม (${employees.filter(e=>e.dept==='ช่างเชื่อม').length}), ช่างขัด (${employees.filter(e=>e.dept==='ช่างขัด').length}), ช่างตัด (${employees.filter(e=>e.dept==='ช่างตัด').length}), ช่าง (${employees.filter(e=>e.dept==='ช่าง').length}), ออฟฟิศ (${employees.filter(e=>e.dept==='ออฟฟิศ').length})</p>
                        </div>

                        <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
                            <p class="text-xs text-slate-400 font-medium">คำร้องขอลา รอ CEO อนุมัติ</p>
                            <p class="text-3xl font-black text-amber-400 mt-1">${leavesList.filter(l => l.status === "รออนุมัติ").length} รายการ</p>
                            <p class="text-[11px] text-amber-500/80 mt-1">ต้องการการตรวจสอบอนุมัติจาก CEO</p>
                        </div>

                        <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
                            <p class="text-xs text-slate-400 font-medium">การลาอนุมัติแล้วเดือนนี้</p>
                            <p class="text-3xl font-black text-emerald-400 mt-1">${leavesList.filter(l => l.status === "อนุมัติแล้ว").length} รายการ</p>
                            <p class="text-[11px] text-emerald-500/80 mt-1">บันทึกลงปฏิทินระบบเรียบร้อยแล้ว</p>
                        </div>

                        <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
                            <p class="text-xs text-slate-400 font-medium">สถานะเซิร์ฟเวอร์มอนิเตอร์</p>
                            <p class="text-xl font-black text-emerald-400 mt-1 flex items-center gap-1.5">
                                <span class="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span>
                                Active (Render Cloud)
                            </p>
                            <p class="text-[11px] text-slate-500 mt-1">Redirect: ${REDIRECT_URI}</p>
                        </div>
                    </div>

                    <!-- CEO Live Employee Inspection & Management Console -->
                    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
                        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                            <div>
                                <h3 class="text-lg font-bold text-white flex items-center gap-2">
                                    <span class="text-yellow-400">👑</span> ตารางมอนิเตอร์ ตรวจสอบ แก้ไข และจัดการพนักงานทุกคน (ครบทั้ง ${employees.length} ท่าน)
                                </h3>
                                <p class="text-xs text-slate-400 mt-0.5">CEO สามารถดูรายละเอียด เพิ่มพนักงานใหม่ แก้ไขสถานะตำแหน่ง หรือลบข้อมูลพนักงานได้เรียลไทม์</p>
                            </div>

                            <button onclick="openAddModal()" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shadow-lg">
                                <span>+</span> เพิ่มพนักงานใหม่ (CEO)
                            </button>
                        </div>

                        <!-- Live Filter Controls -->
                        <div class="flex flex-col sm:flex-row items-center gap-3">
                            <input type="text" id="searchInput" onkeyup="filterEmployees()" placeholder="ค้นหาชื่อ, ชื่อเล่น, เบอร์โทร หรือเลขประจำตัว..." class="bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 w-full sm:w-80 focus:ring-2 focus:ring-emerald-500">
                            <select id="deptFilter" onchange="filterEmployees()" class="bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 w-full sm:w-48">
                                <option value="ALL">ทุกแผนก (${employees.size || employees.length} ท่าน)</option>
                                <option value="ช่างเชื่อม">ช่างเชื่อม</option>
                                <option value="ช่างขัด">ช่างขัด</option>
                                <option value="ช่างตัด">ช่างตัด</option>
                                <option value="ช่าง">ช่างทั่วไป</option>
                                <option value="ออฟฟิศ">ออฟฟิศ</option>
                            </select>
                        </div>

                        <!-- Employee Table -->
                        <div class="overflow-x-auto">
                            <table class="w-full text-left text-xs text-slate-300" id="empTable">
                                <thead class="bg-slate-950 uppercase text-slate-400 font-bold border-b border-slate-800">
                                    <tr>
                                        <th class="p-3.5">ลำดับ</th>
                                        <th class="p-3.5">รูป & ชื่อพนักงาน</th>
                                        <th class="p-3.5">แผนก</th>
                                        <th class="p-3.5">สถานะ / ตำแหน่ง</th>
                                        <th class="p-3.5">เบอร์โทร & เลขประจำตัว</th>
                                        <th class="p-3.5">ประวัติการลา</th>
                                        <th class="p-3.5 text-center">จัดการโดย CEO</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-800/80">
                                    ${employees.map((emp, idx) => {
                                        const empLeaves = leavesList.filter(l => l.employeeName.includes(emp.nickname) || l.employeeName.includes(emp.name));
                                        return `
                                            <tr class="hover:bg-slate-800/60 transition emp-row" data-name="${emp.name} ${emp.nickname} ${emp.phone} ${emp.idNo}" data-dept="${emp.dept}">
                                                <td class="p-3.5 text-slate-500 font-mono">#${idx + 1}</td>
                                                <td class="p-3.5 flex items-center gap-3">
                                                    <img src="${emp.avatar}" class="w-10 h-10 rounded-full object-cover ring-2 ring-slate-700">
                                                    <div>
                                                        <p class="font-bold text-white text-sm">${emp.name}</p>
                                                        <span class="bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded text-[11px] font-bold">${emp.nickname}</span>
                                                    </div>
                                                </td>
                                                <td class="p-3.5">
                                                    <span class="px-2.5 py-1 rounded-full text-[11px] font-bold ${emp.dept==='ช่างเชื่อม'?'bg-blue-500/20 text-blue-400 border border-blue-500/30':emp.dept==='ช่างขัด'?'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30':emp.dept==='ช่างตัด'?'bg-amber-500/20 text-amber-400 border border-amber-500/30':emp.dept==='ออฟฟิศ'?'bg-purple-500/20 text-purple-400 border border-purple-500/30':'bg-sky-500/20 text-sky-400 border border-sky-500/30'}">${emp.dept}</span>
                                                </td>
                                                <td class="p-3.5">
                                                    <span class="text-slate-200 font-semibold">${emp.role}</span>
                                                </td>
                                                <td class="p-3.5 font-mono">
                                                    <p class="text-emerald-400 font-bold">${emp.phone}</p>
                                                    <p class="text-slate-400 text-[10px]">${emp.idNo}</p>
                                                </td>
                                                <td class="p-3.5">
                                                    <span class="bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 font-bold ${empLeaves.length>0?'text-amber-400':'text-slate-400'}">
                                                        ลาไปแล้ว ${empLeaves.length} ครั้ง
                                                    </span>
                                                </td>
                                                <td class="p-3.5 text-center">
                                                    <div class="flex items-center justify-center gap-2">
                                                        <button onclick="openEditModal('${emp.id}', '${emp.name}', '${emp.nickname}', '${emp.phone}', '${emp.idNo}', '${emp.dept}', '${emp.role}')" class="bg-sky-600 hover:bg-sky-500 text-white font-bold px-2.5 py-1 rounded-lg text-[11px] transition shadow">
                                                            ✏️ แก้ไข
                                                        </button>
                                                        <button onclick="deleteEmployee('${emp.id}', '${emp.name}')" class="bg-red-600/80 hover:bg-red-500 text-white font-bold px-2.5 py-1 rounded-lg text-[11px] transition shadow">
                                                            🗑️ ลบ
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- CEO Leave Requests Approval Console -->
                    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
                        <h3 class="text-lg font-bold text-white mb-2 flex items-center gap-2">
                            <span>📑</span> รายการคำร้องขอลาที่รอ CEO อนุมัติบน PC
                        </h3>
                        <div class="overflow-x-auto mt-4">
                            <table class="w-full text-left text-xs text-slate-300">
                                <thead class="bg-slate-950 uppercase text-slate-400 font-bold border-b border-slate-800">
                                    <tr>
                                        <th class="p-3.5">ชื่อพนักงาน</th>
                                        <th class="p-3.5">ประเภทการลา</th>
                                        <th class="p-3.5">ช่วงเวลา</th>
                                        <th class="p-3.5">เหตุผล</th>
                                        <th class="p-3.5">สถานะ</th>
                                        <th class="p-3.5 text-center">คำสั่ง CEO</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-800">
                                    ${leavesList.map(l => `
                                        <tr class="hover:bg-slate-800/60">
                                            <td class="p-3.5 font-bold text-white">${l.employeeName}</td>
                                            <td class="p-3.5"><span class="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-slate-300 font-semibold">${l.type} (${l.durationType})</span></td>
                                            <td class="p-3.5 text-slate-400">${l.dateRange}</td>
                                            <td class="p-3.5 text-slate-300">${l.reason}</td>
                                            <td class="p-3.5">
                                                <span class="px-2.5 py-1 rounded-full font-bold text-[10px] ${l.status === 'อนุมัติแล้ว' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'}">${l.status}</span>
                                            </td>
                                            <td class="p-3.5 text-center">
                                                ${l.status === 'รออนุมัติ' ? `
                                                    <button onclick="approveLeave(${l.id})" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition shadow-md">
                                                        ✓ CEO อนุมัติการลา
                                                    </button>
                                                ` : `<span class="text-emerald-400 font-bold">✓ อนุมัติเรียบร้อย</span>`}
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                `}

                <!-- LINE Login OAuth Section -->
                <div class="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <h4 class="font-bold text-white text-base">เข้าสู่ระบบด้วย LINE สำหรับพนักงาน/ช่าง</h4>
                        <p class="text-xs text-slate-400 mt-0.5">ผูกบัญชี LINE OAuth 2.1 (Channel ID: ${CHANNEL_ID}) บนคลาวด์ Render</p>
                    </div>
                    <a href="${lineAuthUrl}" class="bg-[#06C755] hover:bg-[#05b34c] text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 transition shadow-lg text-sm">
                        <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 5.92 2 10.75c0 4.29 3.52 7.89 8.27 8.57.32.07.76.21.87.49.1.25.07.64.03.89l-.15.93c-.05.28-.21 1.09.95.6 1.16-.5 6.27-3.69 8.56-6.32C21.85 14.28 22 12.56 22 10.75 22 5.92 17.52 2 12 2z"/></svg>
                        ทดสอบ LINE Login
                    </a>
                </div>
            </main>

            <!-- Modal Form: เพิ่มพนักงานใหม่ (CEO Only) -->
            <div id="addModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm hidden flex items-center justify-center p-4 z-50">
                <div class="bg-slate-900 border border-slate-700 p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4">
                    <h3 class="text-lg font-bold text-white flex items-center gap-2">
                        <span class="text-emerald-400">+</span> เพิ่มพนักงานใหม่ในระบบ (CEO)
                    </h3>
                    <div class="space-y-3 text-xs">
                        <div>
                            <label class="block text-slate-300 mb-1 font-semibold">ชื่อ-นามสกุล:</label>
                            <input type="text" id="addName" placeholder="เช่น นายศราวุฒิ นามสมมุติ" class="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white">
                        </div>
                        <div>
                            <label class="block text-slate-300 mb-1 font-semibold">ชื่อเล่น:</label>
                            <input type="text" id="addNickname" placeholder="เช่น ช่างวุฒิ" class="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white">
                        </div>
                        <div>
                            <label class="block text-slate-300 mb-1 font-semibold">แผนก:</label>
                            <select id="addDept" class="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white">
                                <option value="ช่างเชื่อม">ช่างเชื่อม</option>
                                <option value="ช่างขัด">ช่างขัด</option>
                                <option value="ช่างตัด">ช่างตัด</option>
                                <option value="ช่าง">ช่างทั่วไป</option>
                                <option value="ออฟฟิศ">ออฟฟิศ</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-slate-300 mb-1 font-semibold">สถานะตำแหน่ง / หน้าที่:</label>
                            <input type="text" id="addRole" placeholder="เช่น ช่างประจำแผนก, ช่างเทคนิคงานสเตนเลส" class="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white">
                        </div>
                        <div>
                            <label class="block text-slate-300 mb-1 font-semibold">เบอร์โทรศัพท์:</label>
                            <input type="text" id="addPhone" placeholder="เช่น 080-123-4567" class="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white">
                        </div>
                        <div>
                            <label class="block text-slate-300 mb-1 font-semibold">เลขประจำตัวประชาชน / พาสปอร์ต:</label>
                            <input type="text" id="addIdNo" placeholder="เช่น 1-1000-00000-00-0" class="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white">
                        </div>
                    </div>
                    <div class="flex justify-end gap-2 pt-2">
                        <button onclick="closeAddModal()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl">ยกเลิก</button>
                        <button onclick="submitAddEmployee()" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl">บันทึกพนักงานใหม่</button>
                    </div>
                </div>
            </div>

            <!-- Modal Form: แก้ไขข้อมูลพนักงาน (CEO Only) -->
            <div id="editModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm hidden flex items-center justify-center p-4 z-50">
                <div class="bg-slate-900 border border-slate-700 p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4">
                    <h3 class="text-lg font-bold text-white flex items-center gap-2">
                        <span class="text-sky-400">✏️</span> แก้ไขข้อมูลและสถานะตำแหน่งพนักงาน (CEO)
                    </h3>
                    <input type="hidden" id="editId">
                    <div class="space-y-3 text-xs">
                        <div>
                            <label class="block text-slate-300 mb-1 font-semibold">ชื่อ-นามสกุล:</label>
                            <input type="text" id="editName" class="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white">
                        </div>
                        <div>
                            <label class="block text-slate-300 mb-1 font-semibold">ชื่อเล่น:</label>
                            <input type="text" id="editNickname" class="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white">
                        </div>
                        <div>
                            <label class="block text-slate-300 mb-1 font-semibold">แผนก:</label>
                            <select id="editDept" class="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white">
                                <option value="ช่างเชื่อม">ช่างเชื่อม</option>
                                <option value="ช่างขัด">ช่างขัด</option>
                                <option value="ช่างตัด">ช่างตัด</option>
                                <option value="ช่าง">ช่างทั่วไป</option>
                                <option value="ออฟฟิศ">ออฟฟิศ</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-slate-300 mb-1 font-semibold">สถานะตำแหน่ง / หน้าที่:</label>
                            <input type="text" id="editRole" class="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white">
                        </div>
                        <div>
                            <label class="block text-slate-300 mb-1 font-semibold">เบอร์โทรศัพท์:</label>
                            <input type="text" id="editPhone" class="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white">
                        </div>
                        <div>
                            <label class="block text-slate-300 mb-1 font-semibold">เลขประจำตัวประชาชน / พาสปอร์ต:</label>
                            <input type="text" id="editIdNo" class="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white">
                        </div>
                    </div>
                    <div class="flex justify-end gap-2 pt-2">
                        <button onclick="closeEditModal()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl">ยกเลิก</button>
                        <button onclick="submitEditEmployee()" class="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl">บันทึกการแก้ไข</button>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <footer class="bg-slate-950 border-t border-slate-900 p-4 text-center text-xs text-slate-500">
                TWK Stainless Corporate Portal © 2026 - CEO Executive PC Live Inspection Edition
            </footer>

            <script>
                // Filter Employees
                function filterEmployees() {
                    const search = document.getElementById('searchInput').value.toLowerCase();
                    const dept = document.getElementById('deptFilter').value;
                    const rows = document.querySelectorAll('.emp-row');

                    rows.forEach(row => {
                        const nameData = row.getAttribute('data-name').toLowerCase();
                        const deptData = row.getAttribute('data-dept');
                        const matchesSearch = search === '' || nameData.includes(search);
                        const matchesDept = dept === 'ALL' || deptData === dept;

                        if (matchesSearch && matchesDept) {
                            row.style.display = '';
                        } else {
                            row.style.display = 'none';
                        }
                    });
                }

                // CEO Action: Approve Leave
                async function approveLeave(id) {
                    if (!confirm('ยืนยันให้ CEO อนุมัติคำร้องขอการลานี้หรือไม่?')) return;
                    try {
                        const res = await fetch('/api/approve-leave', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ leaveId: id, role: '${currentRole}' })
                        });
                        const data = await res.json();
                        if (data.success) {
                            alert(data.message);
                            location.reload();
                        } else {
                            alert(data.error);
                        }
                    } catch (e) {
                        alert('เกิดข้อผิดพลาดในการส่งคำสั่งอนุมัติ');
                    }
                }

                // CEO Action: Open/Close Add Modal
                function openAddModal() { document.getElementById('addModal').classList.remove('hidden'); }
                function closeAddModal() { document.getElementById('addModal').classList.add('hidden'); }

                // CEO Action: Submit Add Employee
                async function submitAddEmployee() {
                    const name = document.getElementById('addName').value;
                    const nickname = document.getElementById('addNickname').value;
                    const dept = document.getElementById('addDept').value;
                    const empRole = document.getElementById('addRole').value;
                    const phone = document.getElementById('addPhone').value;
                    const idNo = document.getElementById('addIdNo').value;

                    if (!name) return alert('กรุณากรอกชื่อพนักงาน');

                    try {
                        const res = await fetch('/api/add-employee', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ role: '${currentRole}', name, nickname, dept, empRole, phone, idNo })
                        });
                        const data = await res.json();
                        if (data.success) {
                            alert(data.message);
                            location.reload();
                        } else {
                            alert(data.error);
                        }
                    } catch (e) {
                        alert('เกิดข้อผิดพลาดในการเพิ่มพนักงาน');
                    }
                }

                // CEO Action: Open/Close Edit Modal
                function openEditModal(id, name, nickname, phone, idNo, dept, role) {
                    document.getElementById('editId').value = id;
                    document.getElementById('editName').value = name;
                    document.getElementById('editNickname').value = nickname;
                    document.getElementById('editPhone').value = phone;
                    document.getElementById('editIdNo').value = idNo;
                    document.getElementById('editDept').value = dept;
                    document.getElementById('editRole').value = role;
                    document.getElementById('editModal').classList.remove('hidden');
                }
                function closeEditModal() { document.getElementById('editModal').classList.add('hidden'); }

                // CEO Action: Submit Edit Employee
                async function submitEditEmployee() {
                    const id = document.getElementById('editId').value;
                    const name = document.getElementById('editName').value;
                    const nickname = document.getElementById('editNickname').value;
                    const dept = document.getElementById('editDept').value;
                    const empRole = document.getElementById('editRole').value;
                    const phone = document.getElementById('editPhone').value;
                    const idNo = document.getElementById('editIdNo').value;

                    try {
                        const res = await fetch('/api/edit-employee', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ role: '${currentRole}', id, name, nickname, dept, empRole, phone, idNo })
                        });
                        const data = await res.json();
                        if (data.success) {
                            alert(data.message);
                            location.reload();
                        } else {
                            alert(data.error);
                        }
                    } catch (e) {
                        alert('เกิดข้อผิดพลาดในการแก้ไขข้อมูลพนักงาน');
                    }
                }

                // CEO Action: Delete Employee
                async function deleteEmployee(id, name) {
                    if (!confirm('ยืนยันให้ CEO ลบข้อมูลพนักงาน ' + name + ' ออกจากระบบหรือไม่?')) return;
                    try {
                        const res = await fetch('/api/delete-employee', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ role: '${currentRole}', id })
                        });
                        const data = await res.json();
                        if (data.success) {
                            alert(data.message);
                            location.reload();
                        } else {
                            alert(data.error);
                        }
                    } catch (e) {
                        alert('เกิดข้อผิดพลาดในการลบพนักงาน');
                    }
                }
            </script>
        </body>
        </html>
    `);
});

// Callback Route (LINE OAuth 2.1)
app.get('/callback', async (req, res) => {
    const code = req.query.code;
    if (!code) return res.status(400).send('ไม่พบ Authorization Code');

    try {
        // 1. แลก Access Token
        const tokenResponse = await axios.post('https://api.line.me/oauth2/v2.1/token', new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: REDIRECT_URI,
            client_id: CHANNEL_ID,
            client_secret: CHANNEL_SECRET
        }), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const accessToken = tokenResponse.data.access_token;

        // 2. ดึงข้อมูล LINE Profile
        const profileResponse = await axios.get('https://api.line.me/v2/profile', {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        const userProfile = profileResponse.data;

        // 3. แสดงหน้าจอเข้าสู่ระบบสำเร็จ
        res.send(`
            <!DOCTYPE html>
            <html lang="th">
            <head>
                <meta charset="UTF-8">
                <title>TWK Stainless - เข้าสู่ระบบสำเร็จ</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap" rel="stylesheet">
            </head>
            <body class="bg-slate-950 h-screen flex items-center justify-center font-sans text-white">
                <div class="bg-slate-900 p-8 rounded-2xl shadow-2xl text-center max-w-sm w-full border border-slate-800">
                    <img src="${userProfile.pictureUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'}" class="w-24 h-24 rounded-full mx-auto ring-4 ring-emerald-500 shadow-md">
                    <h2 class="text-xl font-bold text-white mt-4">${userProfile.displayName}</h2>
                    <p class="text-sm text-emerald-400 font-semibold mt-1">✓ ยืนยันตัวตน LINE Login สำเร็จ</p>
                    <p class="text-xs text-slate-400 mt-2">User ID: ${userProfile.userId}</p>
                    <p class="text-xs text-slate-400">Channel ID: ${CHANNEL_ID}</p>
                    <a href="https://monitor-server-c0wq.onrender.com?role=CEO" class="mt-6 block w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl text-sm font-bold transition">เข้าสู่หน้า CEO PC Monitoring Console</a>
                </div>
            </body>
            </html>
        `);
    } catch (error) {
        console.error('Error details:', error.response?.data || error.message);
        res.status(500).send('เกิดข้อผิดพลาดในการยืนยันตัวตนกับ LINE');
    }
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`========================================================`);
    console.log(`✅ TWK Stainless CEO PC Live Portal พร้อมใช้งานแล้วที่: http://localhost:3000`);
    console.log(`========================================================`);
});
