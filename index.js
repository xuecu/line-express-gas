// 📦 專案：Express 轉發 LINE 訊息給 GAS + 提供 GAS 查詢/發送的 API（ESM 版）

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import fetch from 'node-fetch';

const PORT = process.env.PORT || 3000;

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const LINE_TOKEN_STAFF = process.env.LINE_TOKEN_STAFF;
const LINE_TOKEN_XUEMI = process.env.LINE_TOKEN_XUEMI;
const GAS_ENDPOINT = process.env.GAS_ENDPOINT; // https://script.google.com/macros/s/XXX/exec

const token = {
	staff: process.env.LINE_TOKEN_STAFF,
	xuemi: process.env.LINE_TOKEN_XUEMI,
};

// 設定基本路由
app.get('/', (req, res) => {
	res.send('Hello, Zeabur!');
});

// ✅ 接收 LINE Webhook 並轉發給 GAS
app.post('/line-webhook/staff', (req, res) => {
	forwardToGAS(req.body, 'staff');
	res.send('200'); // 快速回應 LINE
});
app.post('/line-webhook/xuemi', (req, res) => {
	forwardToGAS(req.body, 'xuemi');
	res.send('200'); // 快速回應 LINE
});

async function forwardToGAS(payload, brand) {
	const enriched = {
		...payload,
		brand, // 加上品牌名稱/來源
	};

	try {
		await fetch(GAS_ENDPOINT, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(enriched),
		});
		console.log(`✅ Webhook from ${brand} 已轉發給 GAS`);
	} catch (err) {
		console.error(`❌ ${brand} webhook 發送失敗`, err.message);
	}
}
app.get('/search-user', async (req, res) => {
	const { userId, brand } = req.query;

	const brandToken = token[brand];
	if (!brandToken) {
		return res.status(400).send('Invalid brand');
	}

	try {
		const profile = await fetch(`https://api.line.me/v2/bot/profile/${userId}`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${brandToken}`,
			},
		});

		if (!profile.ok) {
			const errorText = await profile.text();
			console.error('[LINE API Error]', errorText);
			return res.status(profile.status).send(errorText);
		}

		const data = await profile.json();
		res.json(data); // 回傳整個 profile 給 GAS
	} catch (err) {
		console.error('[Profile Error]', err);
		res.status(500).send('fail');
	}
});

// ✅ GAS 可用此 API 發送訊息
// app.post('/push-message', async (req, res) => {
// 	const { userId, text } = req.body;
// 	try {
// 		await axios.post(
// 			'https://api.line.me/v2/bot/message/push',
// 			{
// 				to: userId,
// 				messages: [{ type: 'text', text }],
// 			},
// 			{
// 				headers: {
// 					Authorization: `Bearer ${LINE_TOKEN}`,
// 					'Content-Type': 'application/json',
// 				},
// 			}
// 		);
// 		res.send('message sent');
// 	} catch (err) {
// 		console.error('[Push Error]', err.message);
// 		res.status(500).send('fail');
// 	}
// });

// ✅ GAS 可用此 API 查使用者暱稱
// app.get('/get-profile', async (req, res) => {
// 	const { userId } = req.query;
// 	try {
// 		const profile = await axios.get(`https://api.line.me/v2/bot/profile/${userId}`, {
// 			headers: {
// 				Authorization: `Bearer ${LINE_TOKEN}`,
// 			},
// 		});
// 		res.json(profile.data);
// 	} catch (err) {
// 		console.error('[Profile Error]', err.message);
// 		res.status(500).send('fail');
// 	}
// });

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
