import mongoose from 'mongoose';

const cityAQISchema = new mongoose.Schema(
    {
        city: {
            type: String,
            required: [true, 'City name is required'],
            trim: true,
        },
        state: {
            type: String,
            trim: true,
            default: null,
        },
        country: {
            type: String,
            trim: true,
            default: 'India',
        },
        lat: {
            type: Number,
            required: true,
        },
        lng: {
            type: Number,
            required: true,
        },
        lastAqi: {
            type: Number,
            default: null,
        },
        lastStatus: {
            type: String,
            default: 'Unknown',
        },
        lastChecked: {
            type: Date,
            default: null,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

// Ensure unique city entries (combination of city + country)
cityAQISchema.index({ city: 1, country: 1 }, { unique: true });

const CityAQI = mongoose.model('CityAQI', cityAQISchema);
export default CityAQI;
