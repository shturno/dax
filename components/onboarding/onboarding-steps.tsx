import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronRight, 
  ChevronLeft, 
  BarChart, 
  Users, 
  ListTodo, 
  GitPullRequest,
  MessageSquare,
  Settings,
  Check
} from 'lucide-react';

// Tipagem para os passos de onboarding
interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

// Definindo os passos de onboarding
const steps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Bem-vindo ao Dax',
    description: 'Seu dashboard para gestão de startups',
    icon: <BarChart className="h-6 w-6" />,
    content: (
      <div className="space-y-4">
        <p>Obrigado por escolher o Dax para ajudar a gerenciar seu projeto!</p>
        <p>Vamos guiá-lo através das principais funcionalidades para que você possa começar rapidamente.</p>
        <p>Este tour rápido levará apenas alguns minutos.</p>
      </div>
    )
  },
  {
    id: 'dashboard',
    title: 'Dashboard Personalizado',
    description: 'Visualize métricas importantes',
    icon: <BarChart className="h-6 w-6" />,
    content: (
      <div className="space-y-4">
        <p>O dashboard principal exibe as métricas mais importantes do seu projeto.</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Visualize métricas de usuários e receita</li>
          <li>Acompanhe o crescimento ao longo do tempo</li>
          <li>Arraste e solte para reorganizar widgets</li>
        </ul>
        <p className="text-muted-foreground text-sm">Você pode personalizar quais widgets aparecem nas configurações.</p>
      </div>
    )
  },
  {
    id: 'team',
    title: 'Gestão de Equipe',
    description: 'Adicione membros e defina funções',
    icon: <Users className="h-6 w-6" />,
    content: (
      <div className="space-y-4">
        <p>Trabalhe em equipe de forma eficiente:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Convide novos membros via email</li>
          <li>Defina funções e permissões</li>
          <li>Acompanhe a produtividade da equipe</li>
        </ul>
        <p className="text-muted-foreground text-sm">Acesse a página Equipe para gerenciar membros.</p>
      </div>
    )
  },
  {
    id: 'tasks',
    title: 'Gerenciamento de Tarefas',
    description: 'Organize e priorize trabalho',
    icon: <ListTodo className="h-6 w-6" />,
    content: (
      <div className="space-y-4">
        <p>Mantenha seu projeto organizado:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Crie boards kanban para visualizar fluxo de trabalho</li>
          <li>Atribua tarefas a membros da equipe</li>
          <li>Defina prazos e prioridades</li>
          <li>Acompanhe o progresso em tempo real</li>
        </ul>
      </div>
    )
  },
  {
    id: 'roadmap',
    title: 'Roadmap de Projeto',
    description: 'Visualize e planeje o futuro',
    icon: <GitPullRequest className="h-6 w-6" />,
    content: (
      <div className="space-y-4">
        <p>Planeje o futuro do seu produto:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Crie um roadmap visual por trimestres</li>
          <li>Acompanhe marcos importantes</li>
          <li>Comunique a visão com stakeholders</li>
        </ul>
        <p className="text-muted-foreground text-sm">O roadmap é atualizado automaticamente quando o status das tarefas muda.</p>
      </div>
    )
  },
  {
    id: 'feedback',
    title: 'Coleta de Feedback',
    description: 'Obtenha insights dos usuários',
    icon: <MessageSquare className="h-6 w-6" />,
    content: (
      <div className="space-y-4">
        <p>Entenda o que seus usuários pensam:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Colete feedback via formulários ou integrações</li>
          <li>Categorize e priorize sugestões</li>
          <li>Transforme feedback em tarefas acionáveis</li>
        </ul>
      </div>
    )
  },
  {
    id: 'settings',
    title: 'Configurações',
    description: 'Personalize sua experiência',
    icon: <Settings className="h-6 w-6" />,
    content: (
      <div className="space-y-4">
        <p>Adapte o Dax às suas necessidades:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Personalize a aparência e tema</li>
          <li>Configure integrações com outras ferramentas</li>
          <li>Gerencie notificações e alertas</li>
          <li>Ajuste configurações de privacidade</li>
        </ul>
      </div>
    )
  },
  {
    id: 'complete',
    title: 'Pronto para Começar!',
    description: 'Você está pronto para usar o Dax',
    icon: <Check className="h-6 w-6" />,
    content: (
      <div className="space-y-4">
        <p className="font-medium">Parabéns por completar o tour de introdução!</p>
        <p>Agora você conhece as principais funcionalidades do Dax e está pronto para começar.</p>
        <p>Se precisar de ajuda, clique no ícone "?" no canto inferior direito para acessar a documentação ou entre em contato com o suporte.</p>
        <p className="text-muted-foreground text-sm">Você pode refazer este tour a qualquer momento nas configurações.</p>
      </div>
    )
  }
];

export interface OnboardingProps {
  onComplete: () => void;
  initialStep?: number;
}

export function OnboardingSteps({ onComplete, initialStep = 0 }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [completed, setCompleted] = useState<string[]>([]);
  
  const step = steps[currentStep];
  const progress = (currentStep / (steps.length - 1)) * 100;
  
  const handleNext = () => {
    // Marca o passo atual como concluído
    if (!completed.includes(step.id)) {
      setCompleted([...completed, step.id]);
    }
    
    // Avança para o próximo passo ou finaliza
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };
  
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center">
          <div className="p-2 bg-primary/10 rounded-full mr-4">
            {step.icon}
          </div>
          <div>
            <CardTitle>{step.title}</CardTitle>
            <CardDescription>{step.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="mb-6">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            Passo {currentStep + 1} de {steps.length}
          </p>
        </div>
        
        <div className="min-h-[200px]">
          {step.content}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>
        
        <Button onClick={handleNext}>
          {currentStep < steps.length - 1 ? (
            <>
              Próximo
              <ChevronRight className="h-4 w-4 ml-2" />
            </>
          ) : (
            'Concluir'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
} 