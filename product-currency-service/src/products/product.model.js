import { Schema, model } from 'mongoose';

const productSchema = new Schema({
    code: {
        type: String,
        required: [true, 'El código del producto es obligatorio'],
        unique: true,
        uppercase: true,
        trim: true,
        minlength: 3,
        maxlength: 20,
    },
    name: {
        type: String,
        required: [true, 'El nombre del producto es obligatorio'],
        trim: true,
        maxlength: 120,
    },
    description: {
        type: String,
        required: [true, 'La descripción del producto es obligatoria'],
        trim: true,
        maxlength: 220,
    },
    category: {
        type: String,
        enum: ['ACCOUNT', 'CARD', 'LOAN', 'INVESTMENT', 'OTHER'],
        default: 'ACCOUNT',
    },
    minimumOpeningAmount: {
        type: Number,
        required: true,
        min: [0, 'El monto mínimo de apertura no puede ser negativo'],
        default: 0,
    },
    maintenanceFee: {
        type: Number,
        required: true,
        min: [0, 'La cuota de mantenimiento no puede ser negativa'],
        default: 0,
    },
    allowedCurrencies: {
        type: [String],
        default: ['GTQ'],
        validate: {
            validator: (values) => Array.isArray(values) && values.every((item) => typeof item === 'string' && item.trim().length === 3),
            message: 'Cada moneda permitida debe tener exactamente 3 caracteres',
        }
    },
    status: {
        type: Boolean,
        default: true,
    }
}, {
    timestamps: true,
});

productSchema.pre('save', function preSave(next) {
    if (Array.isArray(this.allowedCurrencies)) {
        this.allowedCurrencies = this.allowedCurrencies.map((item) => item.trim().toUpperCase());
    }
    next();
});

export default model('Product', productSchema);
