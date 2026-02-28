import { Schema, model } from 'mongoose';

const conversionHistorySchema = new Schema({
    userId: {
        type: String,
        default: null,
        index: true,
    },
    fromCurrency: {
        type: String,
        required: true,
        uppercase: true,
        trim: true,
        minlength: 3,
        maxlength: 3,
    },
    toCurrency: {
        type: String,
        required: true,
        uppercase: true,
        trim: true,
        minlength: 3,
        maxlength: 3,
    },
    amount: {
        type: Number,
        required: true,
        min: [0.000001, 'El monto debe ser mayor a 0'],
    },
    exchangeRate: {
        type: Number,
        required: true,
    },
    convertedAmountBeforeCommission: {
        type: Number,
        required: true,
    },
    commissionPercent: {
        type: Number,
        required: true,
        default: 0,
    },
    commissionAmount: {
        type: Number,
        required: true,
        default: 0,
    },
    convertedAmount: {
        type: Number,
        required: true,
    },
    provider: {
        type: String,
        required: true,
        default: 'ExchangeRate-API',
    },
    source: {
        type: String,
        enum: ['live', 'cache'],
        required: true,
    },
    description: {
        type: String,
        trim: true,
        maxlength: 250,
        default: '',
    },
}, {
    timestamps: true,
});

export default model('ConversionHistory', conversionHistorySchema);
