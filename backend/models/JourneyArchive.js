import mongoose from 'mongoose';

const JourneyArchiveSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Optional for unauthenticated users checking routes
  },
  fromLabel: {
    type: String,
    required: true,
  },
  toLabel: {
    type: String,
    required: true,
  },
  distance_m: {
    type: Number,
    required: true,
  },
  duration_s: {
    type: Number,
    required: true,
  },
  avgAqi: {
    type: Number,
    required: false,
  },
  travelMode: {
    type: String,
    enum: ['driving', 'walking', 'cycling'],
    required: true,
  },
  minuteVentilation: {
    type: Number,
    required: true,
  },
  totalInhaledMass_mg: {
    type: Number, // The PRIM dose
    required: true,
  },
  healthRiskLevel: {
    type: String, // 'low', 'moderate', 'high', 'critical'
    required: true,
  },
  routeCoordinates: {
    type: [[Number]], // Array of [lng, lat] pairs (optional for full fidelity)
    required: false,
  }
}, {
  timestamps: true
});

const JourneyArchive = mongoose.model('JourneyArchive', JourneyArchiveSchema);
export default JourneyArchive;
