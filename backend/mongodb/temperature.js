const mongoose = require("mongoose");

const temperatureSchema = new mongoose.Schema(
  {
    box_id: { type: String, required: true },
    route_id: { type: String, default: null },
    temp: { type: Number, default: null },
    temp_status: { type: String, required: true },
    fan: { type: String, default: "OFF" },
    timestamp: { type: String, required: true },

    // TinyML + alert fields
    threshold_breach: { type: Boolean, default: false },
    ml_class: { type: String, default: null },
    ml_conf: { type: Number, default: null },
    alert: { type: Boolean, default: false },

  },
  {
    timestamps: true,
    collection: "temperature_logs",
  }
);

module.exports = mongoose.model("TemperatureLog", temperatureSchema);