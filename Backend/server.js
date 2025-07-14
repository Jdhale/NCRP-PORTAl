require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// === Middleware ===
app.use(cors());
app.use(express.json());

// === MongoDB Connect ===
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ncrp-portal')
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// === Request Logger (debug) ===
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url} ->`, req.body);
  next();
});

// === Mongoose Schemas ===
const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

const formSchema = new mongoose.Schema({
  name: String,
  email: String,
  category: String,
  date: String,
  time: String,
  location: String,
  reason: String,
  description: String
}, { timestamps: true });
const Form = mongoose.model('Form', formSchema);

// === Routes ===

// Root
app.get('/', (req, res) => {
  res.send('✅ NCRP Portal Backend is running');
});

// Register
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Missing fields' });

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    const user = new User({ email, password });
    await user.save();
    console.log('✅ Registered user:', user);
    res.json({ message: 'Registration successful' });
  } catch (err) {
    console.error('❌ Register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Missing fields' });

  try {
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    console.log('✅ User logged in:', email);
    res.json({ message: 'Login successful' });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Form submit
app.post('/api/submit-form', async (req, res) => {
  const { name, email, category, date, time, location, reason, description } = req.body;
  if (!name || !email || !category || !date || !time || !location || !description) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const form = new Form({ name, email, category, date, time, location, reason, description });
    await form.save();
    console.log('✅ Saved form data:', form);
    res.json({ message: 'Form submitted successfully' });
  } catch (error) {
    console.error('❌ Error saving form:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// === Start Server ===
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
