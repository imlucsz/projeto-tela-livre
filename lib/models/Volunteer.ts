import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVolunteer extends Document {
  userId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  role?: string;
  createdAt: Date;
}

const VolunteerSchema = new Schema<IVolunteer>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  eventId: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  role: {
    type: String,
    enum: ['organizador', 'apoio', 'logistica'],
    default: 'apoio'
  }
}, {
  timestamps: true
});

const Volunteer = mongoose.models.Volunteer || mongoose.model<IVolunteer>('Volunteer', VolunteerSchema);

export default Volunteer;

