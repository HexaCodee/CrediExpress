import { Schema, model } from 'mongoose';

const accountTypeSchema = new Schema({
    name: {
        type: String,
        required: [true, 'El nombre del tipo de cuenta es obligatorio'],
        unique: true,
        uppercase: true,
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'La descripción del tipo de cuenta es obligatoria'],
        trim: true,
        maxlength: 180,
    },
    minimumOpeningAmount: {
        type: Number,
        required: true,
        min: [0, 'El monto mínimo de apertura no puede ser negativo'],
        default: 0,
    },
    monthlyMaintenanceFee: {
        type: Number,
        required: true,
        min: [0, 'La cuota mensual no puede ser negativa'],
        default: 0,
    },
    dailyTransferLimit: {
        type: Number,
        required: true,
        min: [0, 'El límite diario de transferencia no puede ser negativo'],
        default: 10000,
    },
    perTransferLimit: {
        type: Number,
        required: true,
        min: [0, 'El límite por transferencia no puede ser negativo'],
        default: 2000,
    },
    status: {
        type: Boolean,
        default: true,
    }
}, {
    timestamps: true,
});

export default model('AccountType', accountTypeSchema);
