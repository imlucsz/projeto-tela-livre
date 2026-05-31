import mongoose, { Schema, Document, Model } from 'mongoose';

export enum EventCategory {
  CINEMA = 'cinema',
  OFICINAS = 'oficinas',
  PROJETOS = 'projetos'
}

export enum EventGenre {
  GERAL = 'geral',
  COMEDIA = 'comedia',
  DRAMA = 'drama',
  INFANTIL = 'infantil',
  ANIMACAO = 'animacao',
  DOCUMENTARIO = 'documentario',
  ACAO = 'acao',
  ROMANCE = 'romance',
  FICCAO = 'ficcao'
}

export interface ImpactData {
  people: number;
  communities: number;
  sessions: number;
}

export interface IEvent extends Document {
  title: string;
  description: string;
  date: Date;
  location: string;
  address: string;
  image?: string;
  category: EventCategory | string;
  genre?: EventGenre | string;
  createdBy: mongoose.Types.ObjectId;
  approved: boolean;
  featured: boolean;
  participants: mongoose.Types.ObjectId[];
  attended: mongoose.Types.ObjectId[];
  isClosed: boolean;
  volunteers: mongoose.Types.ObjectId[];
  impact: ImpactData;
  createdAt: Date;
  updatedAt: Date;
}

const ImpactSchema = new Schema<ImpactData>(
  {
    people: {
      type: Number,
      default: 0,
      min: [0, 'Número de pessoas não pode ser negativo']
    },
    communities: {
      type: Number,
      default: 0,
      min: [0, 'Número de comunidades não pode ser negativo']
    },
    sessions: {
      type: Number,
      default: 0,
      min: [0, 'Número de sessões não pode ser negativo']
    }
  },
  { _id: false }
);

const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, 'Título é obrigatório'],
      trim: true,
      maxlength: [100, 'Título não pode exceder 100 caracteres']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Descrição não pode exceder 1000 caracteres'],
      default: ''
    },
    date: {
      type: Date,
      required: [true, 'Data do evento é obrigatória']
    },
    location: {
      type: String,
      trim: true,
      maxlength: [150, 'Local não pode exceder 150 caracteres'],
      default: ''
    },
    address: {
      type: String,
      trim: true,
      maxlength: [300, 'Endereço não pode exceder 300 caracteres'],
      default: ''
    },
    image: {
      type: String,
      default: '',
      match: [
        /^(https?:\/\/.+\.(jpg|jpeg|png|gif|webp))|(^$)/i,
        'URL da imagem deve ser um link válido (http/https)'
      ]
    },
    category: {
      type: String,
      enum: {
        values: [EventCategory.CINEMA, EventCategory.OFICINAS, EventCategory.PROJETOS],
        message: 'Categoria deve ser: cinema, oficinas ou projetos'
      },
      required: [true, 'Categoria é obrigatória'],
      default: EventCategory.CINEMA
    },
    genre: {
      type: String,
      enum: {
        values: Object.values(EventGenre),
        message: 'Gênero inválido'
      },
      required: false,
      default: EventGenre.GERAL,
      index: true
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'ID do criador é obrigatório']
    },
    approved: {
      type: Boolean,
      default: false,
      index: true
    },
    featured: {
      type: Boolean,
      default: false,
      index: true
    },
    impact: {
      type: ImpactSchema,
      default: () => ({
        people: 0,
        communities: 0,
        sessions: 0
      })
    },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: []
      }
    ],
    attended: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: []
      }
    ],
    isClosed: {
      type: Boolean,
      default: false,
      index: true
    },
    volunteers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: []
      }
    ]
  },
  {
    timestamps: true
  }
);

// Índices para otimizar queries
EventSchema.index({ createdBy: 1, approved: 1 });
EventSchema.index({ category: 1, approved: 1 });
EventSchema.index({ date: 1 });
EventSchema.index({ featured: 1, approved: 1 });

const Event = mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);

export default Event;

