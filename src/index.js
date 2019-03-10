const axios = require('axios');
let currentInfo = '';


const headers = {
	'Accept':'application/json',
	'X-Access-Token':'MTJhMjBlNzdjODFkZjhiYjczNTFhNTBkNjg3YzdhNTYzMjIyMmJjYjZmOTIyNmIxZDhhOWI3Y2Q2YmJmOTI5ZA==',
	'Cache-Control':'no-cache'
}
const pushNotification = ()=>{
	let courseIds = '2018512,2018498,1866636,1866616,1858526';
	courseIds = courseIds.split(",");
	let getCourses = courseIds.map(n=>{
		const url = `https://www.udemy.com/api-2.0/courses/${Number(n)}?fields[course]=title,num_subscribers,avg_rating,num_reviews`
		return axios.get(url);
	})
	Promise.all(getCourses).then(infos=>{
		let body = infos.map(n=>n.data);
		const response = [];
		body.forEach(n=>{
			response.push({"text":n.title,"icon":"i22143"});
			response.push({"text":String(n.avg_rating),"icon":"i635"});
			response.push({"text":String(n.num_reviews),"icon":"i120"});
			response.push({"text":String(n.num_subscribers),"icon":"i2058"});
		})
		body = {
			"frames":response
		}
		let newInfo = JSON.stringify(body);
		if(newInfo !== currentInfo){
			currentInfo = newInfo;
			axios.post('https://developer.lametric.com/api/v1/dev/widget/update/com.lametric.838683764923d84f833723657dfe47a2',body,{headers:headers})
			.then(()=>{
				console.log('Notification Sent at '+Date.now());
			})
			.catch(()=>{
				console.log('Error occurred');
			})
		}
	})
	.catch(err=>{
		next(err);
	})
}

pushNotification();
setInterval(()=>{
	pushNotification();
},60000);