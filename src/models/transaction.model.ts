import { Schema, model } from 'mongoose';

export interface ITransaction {
    desc: string,
    bankName: string,
    status: string,
    amount: number,
    accNumber: string,
    createdAt: Date,
    userId: string,
    type: string
}
const transactionSchema = new Schema<ITransaction>({
    desc: { type: String },
    bankName: { type: String },
    status: { type: String },
    amount: { type: Number },
    accNumber: { type: String },
    userId: { type: String },
    type: { type: String },
    createdAt: { type: Date, default: Date.now }
})

const Transaction = model<ITransaction>('Transaction', transactionSchema);
export default Transaction