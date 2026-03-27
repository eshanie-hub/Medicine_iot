// mongo schema here
const mongoose = require('mongoose');

const MotionSchema = new mongoose.Schema({
  
  time: { 
    type: Date, 
    required: true,
    default: Date.now 
  },
  
  
  total_g: { 
    type: Number, 
    required: true 
  },
  
  
  net_g: { 
    type: Number, 
    required: true 
  },
  
 
  status: { 
    type: String, 
    required: true,
  },
  

  alert: { 
    type: Boolean, 
    required: true 
  }
  
}, { 
  timestamps: true 
});


MotionSchema.index({ time: -1 });

module.exports = mongoose.model('MotionLog', MotionSchema);