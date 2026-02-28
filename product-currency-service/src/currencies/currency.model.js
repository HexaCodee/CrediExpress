import { Schema, model } from 'mongoose';

const currencySchema = new Schema({
    code: {
        type: String,
        required: [true, 'El código de la divisa es obligatorio'],
        unique: true,
        uppercase: true,
        trim: true,
        minlength: 3,
        maxlength: 3,
    },
    name: {
        type: String,
        required: [true, 'El nombre de la divisa es obligatorio'],
        trim: true,
        maxlength: 80,
    },
    symbol: {
        type: String,
        required: [true, 'El símbolo de la divisa es obligatorio'],
        trim: true,
        maxlength: 5,
    },
    rateToGTQ: {
        type: Number,
        required: [true, 'La tasa hacia GTQ es obligatoria'],
        min: [0.000001, 'La tasa debe ser mayor a 0'],
    },
    isBase: {
        type: Boolean,
        default: false,
    },
    status: {
        type: Boolean,
        default: true,
    }
}, {
    timestamps: true,
});

export default model('Currency', currencySchema);
