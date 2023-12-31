import express from 'express';
import multer from 'multer';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();


import { registerValidation, loginValidation, postCreateValidation } from './validations.js';

import {UserController, PostController} from './controllers/index.js';

import {checkAuth, handleValidationErrors} from './utils/index.js';


mongoose
.connect(process.env.MONGO_URL)
.then(() => console.log('DB ok'))
.catch((err) => console.log('DB error', err))

const app = express();

const storage = multer.diskStorage({
    destination: (_, __, cb) => {
        cb(null, 'uploads');
    },
    filename: (_, file, cb) => {
        cb(null, file.originalname);
    },
})

const upload = multer({ storage })
const port = process.env.PORT || 4444;

app.use(express.json());
app.use(cors())
app.use('/uploads', express.static('uploads'))


app.post('/auth/login', loginValidation, handleValidationErrors, UserController.login)
app.post('/auth/register', registerValidation, handleValidationErrors, UserController.register);
app.get('/auth/me', checkAuth , UserController.getMe)
app.patch('/auth/me', checkAuth, UserController.update)

app.post('/upload', checkAuth, upload.single('image'), (req, res) =>{
    res.json({
        url: `uploads/${req.file.originalname}`,
    })
});



app.get('/tags', PostController.getLastTags)
app.get('/posts', PostController.getAll)
app.get('/posts/tags', PostController.getLastTags)
app.get('/posts/:id', PostController.getOne)
app.post('/posts', checkAuth, postCreateValidation, handleValidationErrors, PostController.create)
app.delete('/posts/:id', checkAuth, PostController.remove)
app.patch('/posts/:id', checkAuth, postCreateValidation, handleValidationErrors, PostController.update)
app.patch('/posts/like/:id', checkAuth, PostController.likesState)


app.listen(port, (err) => {
    if (err) {
        return console.log(err)
    };
    console.log(`The server is running on the port: ${port}`);
})
