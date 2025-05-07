'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

export default function FirstProjectPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('authToken'); // Obter o token de autenticação
      console.log('Token recuperado do localStorage:', token); // Log para depuração

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token || '', // Enviar o token no cabeçalho
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        toast({
          title: 'Erro',
          description: data.message || 'Erro ao criar projeto',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      toast({
        title: 'Sucesso',
        description: 'Projeto criado com sucesso!',
      });

      // Redirecionar para o dashboard após criar o projeto
      router.push('/dashboard');
    } catch {
      toast({
        title: 'Erro',
        description: 'Erro ao criar projeto',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Criar Primeiro Projeto</CardTitle>
          <CardDescription>Configure seu primeiro projeto</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Projeto</Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Meu Projeto"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                name="description"
                type="text"
                value={formData.description}
                onChange={handleChange}
                placeholder="Uma breve descrição do seu projeto"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Criando...' : 'Criar Projeto'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
