import { Schema, model } from 'mongoose';

export interface ICard {
  type: string,
  number: string,
  expiry: string,
  name: string
}
const cardSchema = new Schema<ICard>({
  type: { type: String },
  number: { type: String },
  expiry: { type: String },
  name: { type: String },
})

const Card = model<ICard>('BankingCard', cardSchema);
export default Card 