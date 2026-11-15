import mongoose, { Document, Schema } from 'mongoose';

export interface IMeeting extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  location?: string;
  meetingLink?: string;
  participants: string[];
  category: string;
  reminder?: number;
  recurring?: 'none' | 'daily' | 'weekly' | 'monthly';
  createdAt: Date;
  updatedAt: Date;
}

const meetingSchema = new Schema<IMeeting>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    title: {
      type: String,
      required: [true, 'Meeting title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    date: {
      type: Date,
      required: [true, 'Meeting date is required'],
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required'],
    },
    location: {
      type: String,
      trim: true,
    },
    meetingLink: {
      type: String,
      trim: true,
    },
    participants: [
      {
        type: String,
        trim: true,
      },
    ],
    category: {
      type: String,
      default: 'General',
      trim: true,
    },
    reminder: {
      type: Number,
      default: 15,
    },
    recurring: {
      type: String,
      enum: ['none', 'daily', 'weekly', 'monthly'],
      default: 'none',
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast queries
meetingSchema.index({ userId: 1, startTime: -1 });

export default mongoose.model<IMeeting>('Meeting', meetingSchema);
