import mongoose, { Document, Schema } from 'mongoose';

export interface ICalculatorHistory extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  expression: string;
  result: string;
  createdAt: Date;
  updatedAt: Date;
}

const calculatorHistorySchema = new Schema<ICalculatorHistory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    expression: {
      type: String,
      required: [true, 'Expression is required'],
      trim: true,
    },
    result: {
      type: String,
      required: [true, 'Result is required'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast queries
calculatorHistorySchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<ICalculatorHistory>(
  'CalculatorHistory',
  calculatorHistorySchema
);
