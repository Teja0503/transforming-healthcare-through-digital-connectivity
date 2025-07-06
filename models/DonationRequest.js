
const mongoose = require('mongoose');

const donationRequestSchema = new mongoose.Schema({
  type: { type: String, required: true, enum: ['donation', 'request'] },
  fullName: { type: String, required: true },
  medicineName: { type: String, required: true },
  quantity: { type: String, required: true },
  date: { type: Date, default: Date.now },
  phone: { type: String, required: true },
  address: { type: String, required: true },
});

const DonationRequest = mongoose.model('DonationRequest', donationRequestSchema);
module.exports = DonationRequest;
