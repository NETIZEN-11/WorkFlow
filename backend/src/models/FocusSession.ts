import mongoose, { Document, Schema } from 'mongoose';

export interface IFocusSession extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  sessionType: 'focus' | 'shortBreak' | 'longBreak' | 'custom';
  duration: number;
  actualDuration: number;
  completed: boolean;
  startTime: Date;
  endTime?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const focusSessionSchema = new Schema<IFocusSession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    sessionType: {
      type: String,
      enum: ['focus', 'shortBreak', 'longBreak', 'custom'],
      required: true,
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: 1,
    },
    actualDuration: {
      type: Number,
      default: 0,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: Date,
    notes: String,
  },
  {
    timestamps: true,
  }
);

// Index for fast queries
focusSessionSchema.index({ userId: 1, startTime: -1 });

export default mongoose.model<IFocusSession>(
  'FocusSession',
  focusSessionSchema
);
