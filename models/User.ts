import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';

// Interface para tipar os métodos de instância
interface UserDocument extends mongoose.Document {
  name: string;
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
    required: true,
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
  collection: 'users', 
});

// Middleware para hash de senha antes de salvar
userSchema.pre('save', async function(this: UserDocument, next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next(); 
});

userSchema.methods.matchPassword = async function(enteredPassword: string) {
  try {
    console.log("📝 Verificando senha...");
    console.log("🔐 Senha no banco:", this.password ? "***" + this.password.substr(-4) : "undefined");
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    console.error("❌ Erro ao comparar senha:", error);
    return false;
  }
};

let userModelInstance: any = null;

async function getUserModel() {
  if (userModelInstance) {
    console.log("♻️ Reutilizando modelo User existente");
    return userModelInstance;
  }

  await dbConnect();
  const db = mongoose.connection.useDb('saas-dashboard');
  
  if (db.models.User) {
    console.log("✅ Usando modelo User existente do mongoose");
    userModelInstance = db.models.User;
    return userModelInstance;
  }
  
  console.log("🔧 Criando novo modelo User");
  userModelInstance = db.model('User', userSchema);
  return userModelInstance;
}

export default getUserModel;