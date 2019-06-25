const express = require('express')
const bodyParser = require('body-parser')
const axios = require('axios');
const cors = require('cors');
const https = require("https");
const fs = require('fs');
let port = process.env.PORT || 8080;


const app = express()
const whitelist = ['https://abhay07.github.io', 'http://localhost:8081','http://udemy.abhaysrivastav.net']
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}
app.listen(port, () => console.log(`Example app listening on port ${port}!`))


app.use(function (err, req, res, next) {
  res.status(500).send('Something broke!')
})

// app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}))


app.get('/getCourseInfo',(req,res,next)=>{
	let courseIds = req.query.courseIds;
	if(courseIds === undefined){
		courseIds = '238934';
	}
	console.log('test');
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
		res.send(body);
	})
	.catch(err=>{
		next(err);
	})
})

app.get('/getCourseInfoWeb',cors(corsOptions),(req,res,next)=>{
	let courseIds = req.query.courseIds;
	if(courseIds === undefined){
		courseIds = '238934';
	}
	courseIds = courseIds.split(",");
	let getCourses = courseIds.map(n=>{
		const url = `https://www.udemy.com/api-2.0/courses/${Number(n)}?fields[course]=title,num_subscribers,avg_rating,num_reviews`
		return axios.get(url);
	})
	Promise.all(getCourses).then(infos=>{
		let body = infos.map(n=>n.data);
		body = {
			"infos":body
		}
		res.send(body);
	})
	.catch(err=>{
		next(err);
	})
})

app.post('/test',(req,res)=>{
	// const imgUrl = req.body && req.body.message && (req.body.message.type === 'image') && req.body.message.body && req.body.message.body.url;
	const imgUrl = 'https://img.freepik.com/free-vector/illustration-data-folder-icon_53876-6329.jpg';
	// console.log(imgUrl);
	if(!imgUrl){
		return res.status(500).send('No image');
	}
	const downloadImg = ()=>{
		return new Promise((resolve,reject)=>{
			https.get(imgUrl, response => {
				resolve(response)
			});
		})
	}

	const convertToBuffer = (response)=>{
		const data = [];
		return new Promise((resolve,reject)=>{
			response.on('data', function(chunk) {
		        data.push(chunk);
		    }).on('end', function() {
		        //at this point data is an array of Buffers
		        //so Buffer.concat() can make us a new Buffer
		        //of all of them together
		        let buffer = Buffer.concat(data);
		        resolve(buffer);
		    });			
		})

	}

	const uploadFirst = (buffer)=>{
		const imgName = imgUrl.split("/").pop();
		const options = {
		    host: 'photoslibrary.googleapis.com',
		    path: '/v1/uploads',
		    method: 'POST',
		    headers: {
		        "Content-Type": "application/octet-stream",
		        "Authorization": "Bearer ya29.GlzuBumiwy1OqwpqjW7oe4qksbA5EGmupviNAOoLsfkEWHV_L3yOOARXJYoIrdwYakOCQHjJFv2Ud4oyxDDh71p3U6_ViSKrfeUVypgjArBM-tkkA3XcrRkqQ0lVOw",
		        "X-Goog-Upload-File-Name": imgName,
		        "X-Goog-Upload-Protocol": "raw"
		    }
		};
		return new Promise((resolve,reject)=>{
			const post_req = https.request(options, (res1, err) => {
			    if (res1.statusCode !== 200 || err) {
			    	return res.sendStatus(res1.statusCode);
			        reject(res1.statusCode);
			    }
			    let data = '';
			    res1.setEncoding('utf-8');
			    res1.on('data', function(chunk) {
			    	data += chunk;
			    })
			    .on('end',function(){
			    	resolve(data);
			    });
			})
			post_req.write(buffer);
			post_req.end()			
		})

	}

	const uploadSecond = (buffer)=>{
		const options = {
		    host: 'photoslibrary.googleapis.com',
		    path: '/v1/mediaItems:batchCreate',
		    method: 'POST',
		    headers: {
		        "Content-Type": "application/json",
		        "Authorization": "Bearer ya29.GlzuBumiwy1OqwpqjW7oe4qksbA5EGmupviNAOoLsfkEWHV_L3yOOARXJYoIrdwYakOCQHjJFv2Ud4oyxDDh71p3U6_ViSKrfeUVypgjArBM-tkkA3XcrRkqQ0lVOw",
		    }
		};
		const body = JSON.stringify({
		  "newMediaItems": [
		    {
		      "description": "caret image",
		      "simpleMediaItem": {
		        "uploadToken": buffer
		      }
		    }
		  ]
		})
		return  new Promise((resolve,reject)=>{
			const post_req = https.request(options, (res1, err) => {
			    if (err) {
			        reject(err);
			    }
			    res1.setEncoding('utf-8');
			    let data = '';
			    res1.on('data', function(chunk) {
			    	data+=(chunk);
			    })
			    .on('end',function(){
			    	resolve(JSON.parse(data));
			    });
			})
			post_req.write(body);
			post_req.end()
		})

	}

	downloadImg()
	.then(response=>{
		return convertToBuffer(response);
	})
	.then(buffer=>{
		return uploadFirst(buffer)
	})
	.then(buffer2=>{
		return uploadSecond(buffer2)
	})
	.then(response=>{
		res.send(response);
	})
	.catch(err=>{
		res.status(500).send('Something went wrong');
	})

})