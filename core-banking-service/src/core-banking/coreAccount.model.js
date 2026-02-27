import { Schema, model } from 'mongoose';

const coreAccountSchema = new Schema({
    accountNumber: {
        type: String,
        required: [true, 'El número de cuenta es obligatorio'],
        unique: true,
        index: true,
    },
    userId: {
        type: String,
        required: [true, 'El userId es obligatorio'],
        index: true,
    },
    currency: {
        type: String,
        default: 'GTQ',
        uppercase: true,
        maxlength: 3,
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'BLOCKED', 'CLOSED'],
        default: 'ACTIVE',
    },
    balance: {
        type: Number,
        required: true,
        min: [0, 'El saldo no puede ser negativo'],
        default: 0,
    }
}, {
    timestamps: true,
});

coreAccountSchema.index({ userId: 1, status: 1 });

export default model('CoreAccount', coreAccountSchema);
