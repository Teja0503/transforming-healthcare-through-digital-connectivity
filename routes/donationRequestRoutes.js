
const express = require('express');
const DonationRequest = require('../models/DonationRequest');

const router = express.Router();

// Endpoint to handle donation or request submission
router.post('/submit', async (req, res) => {
  const { type, fullName, medicineName, quantity, phone, address } = req.body;

  if (!type || !fullName || !medicineName || !quantity || !phone || !address) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    // Create new DonationRequest based on form type
    const newDonationRequest = new DonationRequest({
      type,
      fullName,
      medicineName,
      quantity,
      phone,
      address,
    });

    await newDonationRequest.save();
    res.status(200).json({ message: 'Submission successful!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong, please try again.' });
  }
});

module.exports = router;
