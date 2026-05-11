import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export enum UserRole {
  USER = 'USER',
  NGO = 'NGO',
  ADMIN = 'ADMIN'
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole | string;
  emailVerified?: boolean;
  image?: string;
  savedEvents: mongoose.Types.ObjectId[];
  participatingEvents: mongoose.Types.ObjectId[];
  isNgo?: boolean; // Campo legado para migração - será removido depois
  
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  name: { 
    type: String, 
    required: [true, 'Nome é obrigatório'],
    trim: true,
    maxlength: [50, 'Nome não pode exceder 50 caracteres']
  },
  email: { 
    type: String, 
    required: [true, 'Email é obrigatório'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  password: { 
    type: String, 
    required: [true, 'Senha é obrigatória'],
    minlength: [8, 'Senha deve ter pelo menos 8 caracteres']
  },
  role: {
    type: String,
    enum: [UserRole.USER, UserRole.NGO, UserRole.ADMIN],
    default: UserRole.USER,
    required: true
  },
  isNgo: {
    type: Boolean,
    default: undefined // Campo legado - será deletado
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  image: {
    type: String,
    default: ''
  },
  savedEvents: [{
    type: Schema.Types.ObjectId,
    ref: 'Event',
    default: []
  }],
  participatingEvents: [{
    type: Schema.Types.ObjectId,
    ref: 'Event',
    default: []
  }]
}, {
  timestamps: true
});

// Hash password antes de salvar
UserSchema.pre('save', async function(this: IUser) {
  
  if (!this.isModified('password')) {
    return;
  }
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password as string, salt);
  } catch (error) {
    throw error;
  }
});

UserSchema.methods.comparePassword = async function (candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password as string);
};

const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
