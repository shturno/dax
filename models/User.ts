import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Interface para tipar os métodos de instância
interface UserDocument extends mongoose.Document {
  username: string;
  email: string;
  password: string;
  fullName: string;
  bio: string;
  avatarUrl: string;
  location: string;
  website: string;
  settings: {
    projectName: string;
    projectDescription: string;
    notifications: boolean;
    autoSave: boolean;
    autoSaveInterval: number;
    fontSize: number;
    primaryColor: string;
  };
  createdAt: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Por favor forneça um nome de usuário'],
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Por favor forneça um email'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Por favor, forneça um email válido'],
  },
  password: {
    type: String,
    required: [true, 'Por favor forneça uma senha'],
    minlength: 6,
    select: false,
  },
  fullName: {
    type: String,
    default: '',
  },
  bio: {
    type: String,
    default: '',
  },
  avatarUrl: {
    type: String,
    default: '',
  },
  location: {
    type: String,
    default: '',
  },
  website: {
    type: String,
    default: '',
  },
  settings: {
    type: Object,
    default: {
      projectName: 'Meu Projeto',
      projectDescription: '',
      notifications: true,
      autoSave: true,
      autoSaveInterval: 5,
      fontSize: 16,
      primaryColor: 'default'
    }
  }
}, {
  timestamps: true,
});

// Middleware para hash de senha antes de salvar
userSchema.pre('save', async function(this: UserDocument, next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Método para verificar senha
userSchema.methods.matchPassword = async function(this: UserDocument, enteredPassword: string): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;