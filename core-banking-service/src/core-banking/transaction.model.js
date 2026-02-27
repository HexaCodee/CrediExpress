import { Schema, model } from 'mongoose';

const transactionSchema = new Schema({
    referenceId: {
        type: String,
        required: true,
        index: true,
    },
    type: {
        type: String,
        enum: ['DEPOSIT', 'TRANSFER_OUT', 'TRANSFER_IN'],
        required: true,
        index: true,
    },
    status: {
        type: String,
        enum: ['APPLIED', 'REVERSED'],
        default: 'APPLIED',
        index: true,
    },
    accountNumber: {
        type: String,
        required: true,
        index: true,
    },
    counterpartyAccountNumber: {
        type: String,
        default: null,
        index: true,
    },
    amount: {
        type: Number,
        required: true,
        min: [0.01, 'El monto debe ser mayor a 0'],
    },
    currency: {
        type: String,
        default: 'GTQ',
        uppercase: true,
        maxlength: 3,
    },
    description: {
        type: String,
        default: '',
        maxlength: 250,
    },
    createdByUserId: {
        type: String,
        default: null,
    },
    reversibleUntil: {
        type: Date,
        default: null,
    }
}, {
    timestamps: true,
});

transactionSchema.index({ accountNumber: 1, createdAt: -1 });
transactionSchema.index({ accountNumber: 1, type: 1, status: 1, createdAt: -1 });

export default model('Transaction', transactionSchema);
