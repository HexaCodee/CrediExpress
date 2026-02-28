import { Schema, model } from 'mongoose';

const rateSnapshotSchema = new Schema({
    provider: {
        type: String,
        required: true,
        default: 'ExchangeRate-API',
    },
    baseCurrency: {
        type: String,
        required: true,
        uppercase: true,
        trim: true,
        minlength: 3,
        maxlength: 3,
        index: true,
    },
    rates: {
        type: Map,
        of: Number,
        required: true,
        default: {},
    },
    fetchedAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
    expiresAt: {
        type: Date,
        required: true,
        index: true,
    },
}, {
    timestamps: true,
});

rateSnapshotSchema.index({ baseCurrency: 1 }, { unique: true });

export default model('RateSnapshot', rateSnapshotSchema);
