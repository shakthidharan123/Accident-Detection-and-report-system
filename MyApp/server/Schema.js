const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], required: true },
  phoneNumber : {type :String , required:true},
  licenseNumber : {type :String , required:true},
  vehicleNumber : {type :String , required:true},
  name : {type :String , required:true},

  location: { type: String }, // User's location
  active_status: {
    type: Boolean,
    default: false // Default value is false (inactive)
  },
  accidents: [
    {
      accident: { type: mongoose.Schema.Types.ObjectId, ref: 'Accident' },
      status: { type: String, enum: ['ongoing', 'completed'], required: true }
    }
  ]
});

const accidentSchema = new mongoose.Schema({
  location: { type: String, required: true },
  lat: { type: String, required: true },
  lng: { type: String, required: true },
  maps_link: { type: String },
  datetime: { type: String, required: true },
  severity_label: { type: String, enum: ['accident', 'severe', 'major'], required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
});


module.exports = {
  User: mongoose.model('User', userSchema),
  Accident: mongoose.model('Accident', accidentSchema),
};
