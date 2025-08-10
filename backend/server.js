require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT ;
const MONGO_URI = process.env.MONGO_URI ;

// connect to MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=> console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err.message));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/pickups', require('./routes/pickups'));
app.use('/api/consults', require('./routes/consults'));
app.use('/api/chatbot', require('./routes/chatbot'));

// health
app.get('/', (req,res) => res.json({ok:true, msg: 'E-waste fullstack backend running'}));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
