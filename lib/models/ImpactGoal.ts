import mongoose, { Schema, Document } from 'mongoose'

export interface IImpactGoal extends Document {
  ngoId?: mongoose.Types.ObjectId | null
  year: number
  metaPeople: number
  metaSessions: number
  updatedAt: Date
  createdAt: Date
}

const ImpactGoalSchema = new Schema<IImpactGoal>(
  {
    ngoId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    year: { type: Number, required: true, index: true },
    metaPeople: { type: Number, default: 0, min: [0, 'metaPeople não pode ser negativa'] },
    metaSessions: { type: Number, default: 0, min: [0, 'metaSessions não pode ser negativa'] },
  },
  { timestamps: true }
)

ImpactGoalSchema.index({ ngoId: 1, year: 1 }, { unique: true })

const ImpactGoal =
  mongoose.models.ImpactGoal || mongoose.model<IImpactGoal>('ImpactGoal', ImpactGoalSchema)

export default ImpactGoal

