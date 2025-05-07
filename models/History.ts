import mongoose from 'mongoose';

const historySchema = new mongoose.Schema(
  {
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: [true, 'Histórico deve estar associado a um documento'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Histórico deve estar associado a um usuário'],
    },
    // Versão anterior do conteúdo
    previousContent: {
      type: String,
      required: [true, 'Conteúdo anterior é obrigatório'],
    },
    // Resumo das alterações (opcional)
    changeDescription: {
      type: String,
      default: '',
    },
    // Campo para armazenar as alterações como diff
    diff: {
      type: String,
      default: '',
    },
    version: {
      type: Number,
      required: [true, 'Número da versão é obrigatório'],
    },
  },
  {
    timestamps: true,
  }
);

// Crie índices para pesquisa rápida
historySchema.index({ document: 1, version: -1 });

const History = mongoose.models.History || mongoose.model('History', historySchema);

export default History;
