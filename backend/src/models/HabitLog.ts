import mongoose, { Document, Schema } from 'mongoose';

export interface IHabitLog extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  habitId: mongoose.Types.ObjectId;
  date: Date;
  completed: boolean;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const habitLogSchema = new Schema<IHabitLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    habitId: {
      type: Schema.Types.ObjectId,
      ref: 'Habit',
      required: [true, 'Habit ID is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    completed: {
      type: Boolean,
      default: false,
    },
    note: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast queries
habitLogSchema.index({ userId: 1, habitId: 1, date: -1 });

export default mongoose.model<IHabitLog>('HabitLog', habitLogSchema);
