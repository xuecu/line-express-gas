// 📦 專案：Express 轉發 LINE 訊息給 GAS + 提供 GAS 查詢/發送的 API（ESM 版）

import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const LINE_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const GAS_ENDPOINT = process.env.GAS_ENDPOINT; // https://script.google.com/macros/s/XXX/exec

// 設定基本路由
app.get('/', (req, res) => {
	res.send('Hello, Zeabur!');
});

// ✅ 接收 LINE Webhook 並轉發給 GAS
app.post('/line-webhook', async (req, res) => {
	try {
		// 直接將整個 webhook payload 傳給 GAS
		await axios.post(GAS_ENDPOINT, req.body);

		return res.send('ok');
	} catch (err) {
		console.error('[Webhook Forward Error]', err.message);
		return res.status(500).send('fail');
	}
});
// app.post('/line-webhook', async (req, res) => {

// 	try {
// 		const event = req.body.events?.[0];
// 		if (!event || event.type !== 'message') return res.send('ignored');

// 		const userId = event.source.userId;
// 		const message = event.message.text;

// 		// 查詢使用者名稱
// 		const profileRes = await axios.get(`https://api.line.me/v2/bot/profile/${userId}`, {
// 			headers: {
// 				Authorization: `Bearer ${LINE_TOKEN}`,
// 			},
// 		});
// 		const displayName = profileRes.data.displayName;

// 		// 傳給 GAS 做紀錄
// 		await axios.post(GAS_ENDPOINT, {
// 			userId,
// 			message,
// 			name: displayName,
// 			time: new Date().toISOString(),
// 		});

// 		return res.send('ok');
// 	} catch (err) {
// 		console.error('[Webhook Error]', err.message);
// 		return res.status(500).send('fail');
// 	}
// });

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
