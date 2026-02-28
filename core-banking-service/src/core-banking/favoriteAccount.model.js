import { Schema, model } from 'mongoose';

const favoriteAccountSchema = new Schema({
    ownerUserId: {
        type: String,
        required: [true, 'El ownerUserId es obligatorio'],
        index: true,
    },
    accountNumber: {
        type: String,
        required: [true, 'El número de cuenta es obligatorio'],
        index: true,
    },
    accountType: {
        type: String,
        required: [true, 'El tipo de cuenta es obligatorio'],
        maxlength: 40,
    },
    alias: {
        type: String,
        required: [true, 'El alias es obligatorio'],
        maxlength: 60,
        trim: true,
    }
}, {
    timestamps: true,
});

favoriteAccountSchema.index({ ownerUserId: 1, alias: 1 }, { unique: true });
favoriteAccountSchema.index({ ownerUserId: 1, accountNumber: 1 }, { unique: true });

export default model('FavoriteAccount', favoriteAccountSchema);
