import { Schema, model } from 'mongoose';

const bankAccountSchema = new Schema({
    userId: {
        type: String,
        required: [true, 'El userId es obligatorio'],
        unique: true,
        index: true,
    },
    accountNumbers: {
        type: [String],
        default: [],
        validate: {
            validator: (arr) => Array.isArray(arr) && arr.every(v => typeof v === 'string' && v.length >= 8),
            message: 'Todos los números de cuenta deben ser válidos',
        }
    },
    primaryAccountNumber: {
        type: String,
        default: null,
    },
    preferredCurrency: {
        type: String,
        default: 'GTQ',
        uppercase: true,
        maxlength: 3,
    },
    profileStatus: {
        type: String,
        enum: ['ACTIVE', 'SUSPENDED'],
        default: 'ACTIVE',
    },
    riskLevel: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH'],
        default: 'LOW',
    },
    notes: {
        type: String,
        default: '',
        maxlength: 500,
    }
}, {
    timestamps: true,
});

export default model('BankAccountProfile', bankAccountSchema);
