import mongoose, { Document, Schema } from 'mongoose';

export interface INote extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  category: string;
  pinned: boolean;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema<INote>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    title: {
      type: String,
      required: [true, 'Note title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    content: {
      type: String,
      required: [true, 'Note content is required'],
      maxlength: [5000, 'Content cannot exceed 5000 characters'],
    },
    category: {
      type: String,
      default: 'General',
      trim: true,
    },
    pinned: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      default: '#FEF08A',
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast queries
noteSchema.index({ userId: 1, pinned: -1, createdAt: -1 });

export default mongoose.model<INote>('Note', noteSchema);
