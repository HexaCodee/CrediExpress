import { Schema, model } from 'mongoose';

const roleSchema = Schema({
    name: {
        type: String,
        required: [true, "El nombre del rol es obligatorio"],
        unique: true,
        uppercase: true,
        enum: ['CLIENT', 'BANK_ADMIN', 'CASHIER'] // Solo acepta estos valores
    },
    description: {
        type: String,
        required: [true, "La descripción es obligatoria"]
    },
    status: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

export default model('Role', roleSchema);