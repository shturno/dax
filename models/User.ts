import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Interface para tipar os métodos de instância
interface UserDocument extends mongoose.Document {
  username: string;
  email: string;
  password: string;
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

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Por favor, forneça um nome de usuário'],
    unique: true,
  },
  email: {
    type: String,
    required: [true, 'Por favor, forneça um email'],
    unique: true,
    match: [/^\S+@\S+\.\S+$/, 'Por favor, forneça um email válido'],
  },
  password: {
    type: String,
    required: [true, 'Por favor, forneça uma senha'],
    minlength: 6,
    select: false,
  },
  settings: {
    projectName: { type: String, default: "AI Editor" },
    projectDescription: { type: String, default: "Editor com IA acessado via navegador" },
    notifications: { type: Boolean, default: true },
    autoSave: { type: Boolean, default: true },
    autoSaveInterval: { type: Number, default: 5 },
    fontSize: { type: Number, default: 16 },
    primaryColor: { type: String, default: "default" },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware para hash de senha antes de salvar
UserSchema.pre('save', async function(this: UserDocument, next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Método para verificar senha
UserSchema.methods.matchPassword = async function(this: UserDocument, enteredPassword: string): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default (mongoose.models.User as mongoose.Model<UserDocument>) || 
                mongoose.model<UserDocument>('User', UserSchema);