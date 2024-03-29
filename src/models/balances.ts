import { Schema, model } from 'mongoose';

export interface IBalance {
    available: string,
    saving: string,
    fixed: string,
    userId: string
}
const balanceSchema = new Schema<IBalance>({
    available: { type: String },
    saving: { type: String },
    fixed: { type: String },
    userId: { type: String },
})

const Balance = model<IBalance>('BankingBalance', balanceSchema);
export default Balance 