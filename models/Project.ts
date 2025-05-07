import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

export type ProjectData = {
  _id?: ObjectId;
  ownerId: ObjectId | string;
  name: string;
  description: string;
  tasks: string[];
  notes: string[];
  roadmap: string[];
  features: string[];
  ideas: string[];
  feedback: string[];
  collaborators?: ObjectId[];
  isPublic?: boolean;
  tags?: string[];
  settings?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
};

const projectSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Projeto deve ter um dono'],
    },
    name: {
      type: String,
      required: [true, 'Nome do projeto é obrigatório'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    collaborators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isPublic: {
      type: Boolean,
      default: false,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    tasks: [String],
    notes: [String],
    roadmap: [String],
    features: [String],
    ideas: [String],
    feedback: [String],
    settings: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Índices para melhor performance
projectSchema.index({ ownerId: 1 });
projectSchema.index({ name: 1 });
projectSchema.index({ isPublic: 1 });

const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);

export default Project;
