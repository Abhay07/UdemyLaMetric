const express = require('express')
const bodyParser = require('body-parser')
const axios = require('axios');
const cors = require('cors');


const app = express()
const whitelist = ['https://abhay07.github.io', 'http://localhost:8081','http://udemy.abhaysrivastav.net','http://udemy.music-prod.com']
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}
app.listen(8080, () => console.log('Example app listening on port 3000!'))


app.use(function (err, req, res, next) {
  res.status(500).send('Something broke!')
})

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended:true}))


app.get('/getCourseInfo',(req,res,next)=>{
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