import { Schema, model } from 'mongoose';

export interface IWaitList {
  email: string
}
const waitlistSchema = new Schema<IWaitList>({
  email: { type: String }
})

const Waitlist = model<IWaitList>('waitlist', waitlistSchema);
export default Waitlist 