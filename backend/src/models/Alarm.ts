import mongoose, { Document, Schema } from 'mongoose';

export interface IAlarm extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  time: string;
  label: string;
  enabled: boolean;
  daysOfWeek: number[];
  sound: string;
  snoozeInterval: number;
  createdAt: Date;
  updatedAt: Date;
}

const alarmSchema = new Schema<IAlarm>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    time: {
      type: String,
      required: [true, 'Alarm time is required'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'],
    },
    label: {
      type: String,
      trim: true,
      maxlength: [100, 'Label cannot exceed 100 characters'],
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    daysOfWeek: [
      {
        type: Number,
        min: 0,
        max: 6,
      },
    ],
    sound: {
      type: String,
      default: 'default',
    },
    snoozeInterval: {
      type: Number,
      default: 5,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast queries
alarmSchema.index({ userId: 1, enabled: 1 });

export default mongoose.model<IAlarm>('Alarm', alarmSchema);
