const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const DonationRequest = require('./models/DonationRequest'); // assuming your schema is in DonationRequest.js

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/medicine_donation', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Helper: validate 10-digit phone number
function isValidPhone(phone) {
  return /^\d{10}$/.test(phone);
}

// Test route
app.get('/', (req, res) => {
  res.send('Health Connect Bridge backend is running!');
});

// Handle donations
app.post('/donate', async (req, res) => {
  const { name, medicine, quantity, expiry, phone, address } = req.body;

  console.log('Donation data received:', req.body);

  if (!isValidPhone(phone)) {
    console.log('Invalid phone number:', phone);
    return res.status(400).json({ message: 'Phone number must be exactly 10 digits.' });
  }

  const donation = new DonationRequest({
    type: 'donation',
    fullName: name,
    medicineName: medicine.toLowerCase(),
    quantity: quantity,
    date: new Date(expiry),
    phone: phone,
    address: address
  });

  console.log('Donation object to be saved:', donation);

  try {
    await donation.save();
    console.log('Donation saved:', donation);
    res.status(200).json({ message: 'Donation submitted successfully!' });
  } catch (error) {
    console.error('Error saving donation:', error);
    res.status(500).json({ message: 'Error saving donation.' });
  }
});

// Handle requests
app.post('/request', async (req, res) => {
  const { name, medicine, quantity, phone, address } = req.body;

  console.log('Request data received:', req.body);

  if (!isValidPhone(phone)) {
    console.log('Invalid phone number:', phone);
    return res.status(400).json({ message: 'Phone number must be exactly 10 digits.' });
  }

  const requestedQty = parseInt(quantity);
  const now = new Date();
  const requestedMedicine = medicine.toLowerCase();

  try {
    console.log(`Searching for donation match for ${requestedMedicine}...`);
    const match = await DonationRequest.findOne({
      type: 'donation',
      medicineName: requestedMedicine,
      date: { $gt: now },
      quantity: { $gt: 0 }
    });

    if (!match) {
      console.log('No match found for requested medicine.');
      return res.status(200).json({ message: 'Sorry! The medicine is unavailable.' });
    }

    const availableQty = parseInt(match.quantity);
    console.log(`Found match with available quantity: ${availableQty}`);

    if (availableQty >= requestedQty) {
      match.quantity = (availableQty - requestedQty).toString();
      if (match.quantity === '0') {
        console.log(`All units of ${match.medicineName} donated. Deleting match.`);
        await match.deleteOne();
      } else {
        console.log(`Updated match with new quantity: ${match.quantity}`);
        await match.save();
      }
      return res.status(200).json({ message: 'Request submitted! Full quantity is available and will be provided.' });
    } else {
      console.log(`Only ${availableQty} unit(s) available. Deleting match.`);
      await match.deleteOne();
      return res.status(200).json({
        message: `Sorry for the unavailability, but we can provide you ${availableQty} unit(s) of ${match.medicineName}.`
      });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ message: 'Error processing request.' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
