const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const userRouter = require('./routes/user');
const healthRouter = require('./routes/health');
const teamRouter = require('./routes/teams');
dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
app.use('/api', userRouter);
app.use('/api', healthRouter);
app.use('/api', teamRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log('Server started on port 5000'));
