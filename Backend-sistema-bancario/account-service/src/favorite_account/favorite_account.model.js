'use strict';
//importacion de mongo DB
import mongoose from "mongoose";

const favoriteAccountSchema = mongoose.Schema(
{
 dueno_favorito: {
    type: String,
    required: [true, 'Se requiere el dueño de la cuenta'],
    index: true
 },
 no_cuenta: {
    type: String,
    required: [true, 'Se requiere el número de cuenta'],
 },
 alias_favorito: {
    type: String,
    equired: [true, 'Se requiere un nombre para identificación de favorito'],
    maxlength: [50, 'El alias no debe exceder los 50 caracteres']

 }
},
{
    timestamps: true,
    versionKey: false
}   
);
favoriteAccountSchema.index({dueño_favorito: 1, no_cuenta: 1},{ unique: true});
export default mongoose.model('Favorito', favoriteAccountSchema);