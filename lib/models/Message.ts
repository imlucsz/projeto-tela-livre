import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IMessage extends Document {
  name: string
  email: string
  subject: string
  content: string
  isRead: boolean
  createdAt: Date
  updatedAt: Date
}

const MessageSchema = new Schema<IMessage>(
  {
    name: {
      type: String,
      required: [true, 'Nome é obrigatório'],
      trim: true,
      maxlength: [100, 'Nome deve ter no máximo 100 caracteres'],
    },
    email: {
      type: String,
      required: [true, 'Email é obrigatório'],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email inválido'],
    },
    subject: {
      type: String,
      required: [true, 'Assunto é obrigatório'],
      trim: true,
      maxlength: [200, 'Assunto deve ter no máximo 200 caracteres'],
    },
    content: {
      type: String,
      required: [true, 'Conteúdo é obrigatório'],
      maxlength: [5000, 'Conteúdo deve ter no máximo 5000 caracteres'],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

// Índices para performance
MessageSchema.index({ createdAt: -1 })
MessageSchema.index({ isRead: 1, createdAt: -1 })
MessageSchema.index({ email: 1 })

const Message: Model<IMessage> =
  mongoose.models?.Message || mongoose.model<IMessage>('Message', MessageSchema)

export default Message
