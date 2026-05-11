import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  description: string;
  date: Date;
  location: string;
  address: string;
  image?: string;
  category: 'cinema' | 'oficinas' | 'projetos';
  createdBy: mongoose.Types.ObjectId; // ONG User ID
  approved: boolean;
  featured: boolean;
  participants: mongoose.Types.ObjectId[]; // Users
  volunteers: mongoose.Types.ObjectId[]; // Users
  impact?: {
    people: number;
    communities: number;
    sessions: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>({
  title: {
    type: String,
    required: [true, 'Título é obrigatório'],
    trim: true,
    maxlength: [100, 'Título muito longo']
  },
  description: {
    type: String,
    required: [true, 'Descrição é obrigatória'],
    maxlength: [1000, 'Descrição muito longa']
  },
  date: {
    type: Date,
    required: [true, 'Data é obrigatória']
  },
  location: {
    type: String,
    required: [true, 'Local é obrigatório'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Endereço é obrigatório']
  },
  image: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: ['cinema', 'oficinas', 'projetos'],
    required: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approved: {
    type: Boolean,
    default: false
  },
  featured: {
    type: Boolean,
    default: false
  },
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  volunteers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  impact: {
    people: { type: Number, default: 0 },
    communities: { type: Number, default: 0 },
    sessions: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

const Event = mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);

export default Event;

