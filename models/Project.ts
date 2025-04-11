import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome do projeto é obrigatório'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Projeto deve estar associado a um usuário']
  },
  collaborators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  // Dados de configuração específicos do projeto
  settings: {
    type: Object,
    default: {}
  }
}, {
  timestamps: true
});

const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);

export default Project;