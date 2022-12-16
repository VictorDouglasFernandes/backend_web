const express = require('express')
const { ObjectId } = require('bson')
// const cors = require('cors')

const { MongoClient } = require('mongodb')
const DB_NAME = 'project-web'
const MONGO_URL = `mongodb://localhost:27017/project-web`
var client = new MongoClient(MONGO_URL, { useUnifiedTopology: true })
var db = null
client.connect()
    .then((client) => {
        console.log('MONGO DB Connected...')
        db = client.db(DB_NAME)
    })
    .catch((error) => {
        console.log(error)
        if (client != null) {
            client.close
        }
    })

const app = express()

// app.use(cors({
//     origin: '*'
// }));

app.use(express.json())

app.use(express.static('./web'));
// app.get('*', (_, res) => {
//     res.sendFile('./build/web/index.html');
// });

app.get('/activities/:user', async (req, res) => {
    let login = req.params.user
    console.log(login)
    const findResult = await db.collection('activities').find({ 'user': { $eq: login } }).toArray();
    res.status(200).json(findResult);
})

app.post('/activity', async (req, res) => {
    console.log(req.body)
    let activity = req.body
    const collection = await db.collection('activities');
    await collection.insertOne(activity)
    res.status(200).json(activity);
})

app.put('/activity', async (req, res) => {
    console.log(req.body)
    let id = ObjectId(req.body.id)
    let title = req.body.title
    let description = req.body.description
    let user = req.body.user
    let share = req.body.share
    let activity = { title: title, description: description, user: user, share: share }
    console.log(id)
    const collection = await db.collection('activities');
    await collection.updateOne({ '_id': id }, { $set: activity }, { upsert: true })
    res.status(200).json(activity);
})

app.delete('/activity', async (req, res) => {
    console.log(req.body)
    let id = ObjectId(req.body.id)
    console.log(id)
    const collection = await db.collection('activities');
    await collection.deleteOne({ '_id': id })
    res.status(200).json({});
})

app.post('/user', async (req, res, next) => {
    console.log(req.body)
    let login = req.body.login
    let password = req.body.password
    let user = { login: login, password: password }
    const collection = await db.collection('users');
    let userFound = await collection.findOne({ 'login': login })
    if (userFound != null) {
        next(Error('Impossiblitado de cadastrar'))
    } else {
        await collection.insertOne(user)
        res.status(200).json({ success: true });
    }
})

app.put('/user', async (req, res) => {
    console.log(req.body)
    let login = req.body.login
    let password = req.body.password
    let user = { password: password }
    const collection = await db.collection('users');
    await collection.updateOne({ 'login': login }, { $set: user }, { upsert: true })
    res.status(200).json({ success: true });
})

app.post('/login', async (req, res, next) => {
    let login = req.body.login
    let password = req.body.password
    const collection = await db.collection('users');
    let userFound = await collection.findOne({ 'login': login })
    console.log(userFound)
    if (userFound != null && userFound.password == password) {
        res.status(200).json({ success: true });
    } else {
        next(Error('Impossiblitado de logar'))
    }
})

app.listen(3000, () => console.log("Listening..."))