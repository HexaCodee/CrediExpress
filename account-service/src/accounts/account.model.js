import { Schema, model } from 'mongoose';

const accountSchema = new Schema({
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
    ownerName: {
        type: String,
        required: [true, 'El nombre del titular es obligatorio'],
        trim: true,
        maxlength: 120,
    },
    accountType: {
        type: String,
        required: [true, 'El tipo de cuenta es obligatorio'],
        trim: true,
        uppercase: true,
    },
    currency: {
        type: String,
        default: 'GTQ',
        uppercase: true,
        maxlength: 3,
    },
    balance: {
        type: Number,
        required: true,
        min: [0, 'El saldo no puede ser negativo'],
        default: 0,
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'BLOCKED', 'CLOSED'],
        default: 'ACTIVE',
    },
    isPrimary: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true,
});

accountSchema.index({ userId: 1, accountType: 1, status: 1 });

export default model('Account', accountSchema);
