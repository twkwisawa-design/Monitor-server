const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ข้อมูล LINE Channel
const CHANNEL_ID = '2012308758';
const CHANNEL_SECRET = '91a88db6ba51d3c270c92f0e56343260';
const REDIRECT_URI = 'http://localhost:3000/callback';

// ข้อมูลบุคลากร TWK Stainless
let employees = [
    { id: "1", idNo: "1-6703-00033-67-5", name: "นายสมศักดิ์ คำสี", nickname: "ช่างศักดิ์", phone: "097-260-6457", role: "ช่างประจำแผนก", dept: "ช่างเชื่อม", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80" },
    { id: "2", idNo: "3-1009-05405-18-1", name: "นายสมชาย พาหงษ์", nickname: "ช่างสมชาย", phone: "086-008-3088", role: "ช่างประจำแผนก", dept: "ช่างเชื่อม", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80" },
    { id: "3", idNo: "3-4514-00558-37-0", name: "นายฉัตรชัย ศิริอรรถ", nickname: "ช่างฉัตร", phone: "097-308-1873", role: "ช่างประจำแผนก", dept: "ช่างเชื่อม", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80" },
    { id: "4", idNo: "3-6605-00320-11-9", name: "นายพิน จิ๋วน้อย", nickname: "ช่างพิน", phone: "080-563-5681", role: "ช่างประจำแผนก", dept: "ช่างเชื่อม", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80" },
    { id: "5", idNo: "00-1301-120945-6", name: "Mr. Min Aung Myo Oo", nickname: "ช่างอ๋อง", phone: "063-505-2152", role: "ช่างประจำแผนก", dept: "ช่างขัด", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80" },
    { id: "6", idNo: "6-6510-60415-877", name: "Mr. Min Thin Myint Oo", nickname: "ช่างแมน", phone: "099-187-3147", role: "ช่างประจำแผนก", dept: "ช่างขัด", avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80" },
    { id: "7", idNo: "1-3407-00475-07-4", name: "นายวิศวะ โลมากาล", nickname: "คุณนนท์ (CEO)", phone: "063-268-3040", role: "CEO ประธานเจ้าหน้าที่บริหาร", dept: "ออฟฟิศ", avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80" }
];

let leavesList = [
    { id: 1, employeeName: "นายสมศักดิ์ คำสี (ช่างศักดิ์)", type: "ลากิจ", durationType: "เต็มวัน", dateRange: "12 พ.ย. 2569", reason: "ติดภารกิจส่วนตัว", status: "รออนุมัติ" },
    { id: 2, employeeName: "Mr. Min Aung Myo Oo (ช่างอ๋อง)", type: "ลาป่วย", durationType: "เต็มวัน", dateRange: "10 พ.ย. 2569", reason: "มีไข้สูง", status: "อนุมัติแล้ว" }
];

// CEO Approve Leave API
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

// หน้าแรก PC Portal
app.get('/', (req, res) => {
    const currentRole = req.query.role || 'CEO'; // ค่าเริ่มต้นสำหรับการมอนิเตอร์บนคอมคือสิทธิ์ CEO
    const lineAuthUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${CHANNEL_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=123456789&scope=profile%20openid%20email`;

    const isCEO = currentRole === 'CEO';

    res.send(`
        <!DOCTYPE html>
        <html lang="th">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>TWK Stainless - CEO Live PC Monitoring Portal</title>
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
                                ${isCEO ? '<span class="bg-yellow-400/20 text-yellow-300 text-xs px-2.5 py-0.5 rounded-full font-bold border border-yellow-400/40">⚡ CEO Monitoring Console</span>' : '<span class="bg-slate-700 text-slate-300 text-xs px-2.5 py-0.5 rounded-full">Employee View</span>'}
                            </div>
                            <p class="text-xs text-red-100 mt-1">ศูนย์มอนิเตอร์และตรวจสอบสถานะพนักงานทุกคนในองค์กร สำหรับผู้บริหารบนระบบ PC</p>
                        </div>
                    </div>

                    <!-- Role Selector & LINE Info -->
                    <div class="flex items-center gap-4">
                        <form method="GET" action="/" class="flex items-center bg-black/40 border border-white/20 p-2 rounded-xl text-xs">
                            <span class="text-slate-300 font-bold mr-2">สิทธิ์เข้าถึง:</span>
                            <select name="role" onchange="this.form.submit()" class="bg-slate-900 border border-slate-700 text-white font-bold p-1.5 rounded-lg">
                                <option value="CEO" ${isCEO ? 'selected' : ''}>👑 CEO (มอนิเตอร์พนักงานทุกคน)</option>
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

            <!-- Main Portal Body -->
            <main class="max-w-7xl w-full mx-auto p-6 flex-1 space-y-6">

                ${!isCEO ? `
                    <!-- Non-CEO Lock Message -->
                    <div class="bg-amber-500/10 border-2 border-amber-500/40 p-6 rounded-2xl text-center">
                        <div class="text-4xl mb-2">🔒</div>
                        <h3 class="text-lg font-bold text-amber-400">สงวนสิทธิ์การมอนิเตอร์พนักงานทุกคนเฉพาะสิทธิ์ CEO เท่านั้น</h3>
                        <p class="text-xs text-slate-300 mt-1">ท่านสามารถยื่นใบลาและตรวจสอบสถานะตนเองได้ กรุณาเปลี่ยนสิทธิ์เป็น "CEO" ด้านบนเพื่อทดสอบการมอนิเตอร์</p>
                    </div>
                ` : `
                    <!-- CEO Executive Quick Summary Cards -->
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
                            <p class="text-xs text-slate-400 font-medium">บุคลากรทั้งหมดในระบบ</p>
                            <p class="text-3xl font-black text-sky-400 mt-1">${employees.length} ท่าน</p>
                            <p class="text-[11px] text-slate-500 mt-1">ช่างเชื่อม, ช่างขัด, ช่างตัด, ออฟฟิศ</p>
                        </div>

                        <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
                            <p class="text-xs text-slate-400 font-medium">คำร้องขอลา รอ CEO อนุมัติ</p>
                            <p class="text-3xl font-black text-amber-400 mt-1">${leavesList.filter(l => l.status === "รออนุมัติ").length} รายการ</p>
                            <p class="text-[11px] text-amber-500/80 mt-1">ต้องการการตรวจสอบจาก CEO</p>
                        </div>

                        <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
                            <p class="text-xs text-slate-400 font-medium">อนุมัติแล้วเดือนนี้</p>
                            <p class="text-3xl font-black text-emerald-400 mt-1">${leavesList.filter(l => l.status === "อนุมัติแล้ว").length} รายการ</p>
                            <p class="text-[11px] text-emerald-500/80 mt-1">ลงบันทึกในปฏิทินระบบแล้ว</p>
                        </div>

                        <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
                            <p class="text-xs text-slate-400 font-medium">สถานะการเชื่อมต่อ LINE</p>
                            <p class="text-xl font-black text-emerald-400 mt-1 flex items-center gap-1.5">
                                <span class="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span>
                                Online (Active)
                            </p>
                            <p class="text-[11px] text-slate-500 mt-1">Channel ID: ${CHANNEL_ID}</p>
                        </div>
                    </div>

                    <!-- CEO Live Personnel Monitoring Table -->
                    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
                        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                            <div>
                                <h3 class="text-lg font-bold text-white flex items-center gap-2">
                                    <span class="text-yellow-400">⚡</span> ตารางมอนิเตอร์และตรวจสอบพนักงานทุกคน (CEO Employee Live Inspection)
                                </h3>
                                <p class="text-xs text-slate-400 mt-0.5">ผู้บริหารระดับ CEO สามารถดูรายละเอียดพนักงานทุกแผนก เบอร์โทร เลขประจำตัว และประวัติการลา</p>
                            </div>
                        </div>

                        <div class="overflow-x-auto">
                            <table class="w-full text-left text-xs text-slate-300">
                                <thead class="bg-slate-950 uppercase text-slate-400 font-bold border-b border-slate-800">
                                    <tr>
                                        <th class="p-3.5">รูป & ชื่อพนักงาน</th>
                                        <th class="p-3.5">แผนก / ตำแหน่ง</th>
                                        <th class="p-3.5">เลขประจำตัว / เบอร์โทร</th>
                                        <th class="p-3.5">ประวัติการลา</th>
                                        <th class="p-3.5 text-center">สถานะมอนิเตอร์</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-800">
                                    ${employees.map(emp => {
                                        const empLeaves = leavesList.filter(l => l.employeeName.includes(emp.nickname) || l.employeeName.includes(emp.name));
                                        return `
                                            <tr class="hover:bg-slate-800/60 transition">
                                                <td class="p-3.5 flex items-center gap-3">
                                                    <img src="${emp.avatar}" class="w-10 h-10 rounded-full object-cover ring-2 ring-slate-700">
                                                    <div>
                                                        <p class="font-bold text-white text-sm">${emp.name}</p>
                                                        <span class="bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded text-[11px] font-bold">${emp.nickname}</span>
                                                    </div>
                                                </td>
                                                <td class="p-3.5">
                                                    <p class="font-semibold text-slate-200">${emp.dept}</p>
                                                    <p class="text-[11px] text-slate-400">${emp.role}</p>
                                                </td>
                                                <td class="p-3.5 font-mono">
                                                    <p class="text-slate-300">${emp.idNo}</p>
                                                    <p class="text-emerald-400 font-bold">${emp.phone}</p>
                                                </td>
                                                <td class="p-3.5">
                                                    <span class="bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 font-bold text-slate-300">
                                                        ลาไปแล้ว ${empLeaves.length} ครั้ง
                                                    </span>
                                                </td>
                                                <td class="p-3.5 text-center">
                                                    <span class="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-[10px] font-extrabold">
                                                        ✓ ปฏิบัติงานปกติ
                                                    </span>
                                                </td>
                                            </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- CEO Leave Approval Management Console -->
                    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
                        <h3 class="text-lg font-bold text-white mb-2 flex items-center gap-2">
                            <span>📑</span> คำร้องขอลาที่รอ CEO อนุมัติบน PC
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
                        <p class="text-xs text-slate-400 mt-0.5">ผูกบัญชี LINE OAuth 2.1 (Channel ID: ${CHANNEL_ID}) เพื่อยืนยันตัวตนบนคอมพิวเตอร์</p>
                    </div>
                    <a href="${lineAuthUrl}" class="bg-[#06C755] hover:bg-[#05b34c] text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 transition shadow-lg text-sm">
                        <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 5.92 2 10.75c0 4.29 3.52 7.89 8.27 8.57.32.07.76.21.87.49.1.25.07.64.03.89l-.15.93c-.05.28-.21 1.09.95.6 1.16-.5 6.27-3.69 8.56-6.32C21.85 14.28 22 12.56 22 10.75 22 5.92 17.52 2 12 2z"/></svg>
                        ทดสอบ LINE Login
                    </a>
                </div>
            </main>

            <!-- Footer -->
            <footer class="bg-slate-950 border-t border-slate-900 p-4 text-center text-xs text-slate-500">
                TWK Stainless Corporate Portal © 2026 - CEO Executive PC Live Monitoring Edition
            </footer>

            <script>
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
                    <a href="http://localhost:3000?role=CEO" class="mt-6 block w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl text-sm font-bold transition">เข้าสู่หน้า CEO PC Monitoring Console</a>
                </div>
            </body>
            </html>
        `);
    } catch (error) {
        console.error('Error details:', error.response?.data || error.message);
        res.status(500).send('เกิดข้อผิดพลาดในการยืนยันตัวตนกับ LINE');
    }
});

const os = require('os');
const PORT = 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`========================================================`);
    console.log(`✅ TWK Stainless CEO PC Server เปิดใช้งานเรียบร้อยแล้ว!`);
    console.log(`--------------------------------------------------------`);
    console.log(`💻 เข้าใช้งานบนคอมพิวเตอร์นี้:    http://localhost:3000?role=CEO`);

    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                console.log(`📱 เข้าใช้งานผ่านมือถือ/วง LAN:    http://${iface.address}:${PORT}`);
            }
        }
    }
    console.log(`========================================================`);
});
