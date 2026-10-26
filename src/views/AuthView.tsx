/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Shield,
  Award,
  Lock,
  Mail,
  User,
  Church,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  KeyRound,
} from 'lucide-react';
import { UserProfile } from '../types/index.ts';
import { ASSETS } from '../assets/assets.ts';

interface AuthViewProps {
  onLogin: (email: string, pass: string) => Promise<UserProfile>;
  onRegisterClub: (data: {
    clubName: string;
    region: string;
    district: string;
    church: string;
    motto?: string;
    directorName: string;
    directorEmail: string;
    passwordPlain: string;
  }) => Promise<UserProfile>;
  onRecoverPassword: (email: string) => Promise<{ success: boolean; message: string }>;
}

export const AuthView: React.FC<AuthViewProps> = ({
  onLogin,
  onRegisterClub,
  onRecoverPassword,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'recover'>('login');

  // Login inputs
  const [email, setEmail] = useState<string>('admin@desbravapro.com.br');
  const [password, setPassword] = useState<string>('admin123');

  // Register club inputs
  const [clubName, setClubName] = useState<string>('');
  const [region, setRegion] = useState<string>('5ª Região');
  const [district, setDistrict] = useState<string>('Distrito Central');
  const [church, setChurch] = useState<string>('IASD Central');
  const [motto, setMotto] = useState<string>('Pela graça de Deus, serei puro, bondoso e leal!');
  const [directorName, setDirectorName] = useState<string>('');
  const [directorEmail, setDirectorEmail] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');

  // Recover input
  const [recoverEmail, setRecoverEmail] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    try {
      setIsLoading(true);
      await onLogin(email, password);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Erro ao realizar login.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (newPassword.length < 6) {
      setErrorMessage('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    try {
      setIsLoading(true);
      await onRegisterClub({
        clubName,
        region,
        district,
        church,
        motto,
        directorName,
        directorEmail,
        passwordPlain: newPassword,
      });
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Erro ao cadastrar clube.');
    }
  };

  const handleRecoverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    try {
      setIsLoading(true);
      const res = await onRecoverPassword(recoverEmail);
      setIsLoading(false);
      setSuccessMessage(res.message);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Erro ao solicitar recuperação.');
    }
  };

  const fillAdminLogin = () => {
    setEmail('admin@desbravapro.com.br');
    setPassword('admin123');
    setMode('login');
  };

  const fillDirectorLogin = () => {
    setEmail('diretoria@desbravapro.com.br');
    setPassword('desbrava123');
    setMode('login');
  };

  return (
    <div className="min-h-screen w-full bg-[#031426] flex items-center justify-center p-4 selection:bg-[#FFC21A]/30 selection:text-[#FFC21A]">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-3">
            <img
              src={ASSETS.crestShield}
              alt="DesbravaPro Brasão"
              referrerPolicy="no-referrer"
              className="h-20 w-20 rounded-2xl border-2 border-[#FFC21A] object-cover shadow-2xl shadow-[#FFC21A]/20 drop-shadow-[0_10px_25px_rgba(255,194,26,0.25)]"
            />
            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#FFC21A] text-[#031426] shadow">
              <Award className="h-3.5 w-3.5 stroke-[2.5]" />
            </div>
          </div>

          <h1 className="text-2xl font-black tracking-tight text-white">
            DesbravaPro
          </h1>
          <p className="mt-1 text-xs text-[#8FA6C2] max-w-xs">
            Plataforma Oficial de Gestão e Ranking de Excelência dos Clubes de Desbravadores
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-[#092642]/60 rounded-xl border border-[#092642]">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-[#FFC21A] text-[#031426] shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-[#FFC21A] text-[#031426] shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Cadastrar Clube
          </button>
        </div>

        {/* Messages */}
        {errorMessage && (
          <div className="flex items-center gap-2 rounded-xl bg-red-950/70 border border-red-800 p-3 text-xs text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-950/70 border border-emerald-800 p-3 text-xs text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form Container */}
        <div className="rounded-2xl border border-[#092642] bg-[#092642]/30 p-6 shadow-xl backdrop-blur-xs">
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                  E-mail da Direção
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="diretoria@desbravapro.com.br"
                    className="w-full rounded-xl border border-[#092642] bg-[#031426]/70 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#FFC21A] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-200">
                    Senha de Acesso
                  </label>
                  <button
                    type="button"
                    onClick={() => setMode('recover')}
                    className="text-[11px] text-[#FFC21A] hover:underline cursor-pointer"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-[#092642] bg-[#031426]/70 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#FFC21A] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FFC21A] to-[#F59E0B] py-3 text-xs font-bold text-[#031426] shadow-lg shadow-[#FFC21A]/20 transition-all hover:brightness-105 active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                <span>{isLoading ? 'Autenticando...' : 'Acessar Painel do Clube'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              {/* Demo 1-Click Access Shortcuts */}
              <div className="pt-2 flex flex-col gap-1.5 text-center">
                <button
                  type="button"
                  onClick={fillAdminLogin}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-purple-900/50 bg-purple-950/30 py-1.5 px-3 text-[11px] font-semibold text-purple-300 hover:bg-purple-950/60 transition-colors cursor-pointer"
                >
                  <Sparkles className="h-3 w-3 text-[#FFC21A]" />
                  <span>Entrar como Administrador (admin@desbravapro.com.br)</span>
                </button>
                <button
                  type="button"
                  onClick={fillDirectorLogin}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#092642] bg-[#092642]/40 py-1.5 px-3 text-[11px] text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <span>Entrar como Diretor (diretoria@desbravapro.com.br)</span>
                </button>
              </div>
            </form>
          )}

          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Nome do Clube de Desbravadores *
                </label>
                <div className="relative">
                  <Church className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={clubName}
                    onChange={(e) => setClubName(e.target.value)}
                    placeholder="Ex.: Clube Guerreiros do Vale"
                    className="w-full rounded-xl border border-[#092642] bg-[#031426]/70 pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-[#FFC21A] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-200 mb-1">
                    Região/Associação
                  </label>
                  <input
                    type="text"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full rounded-xl border border-[#092642] bg-[#031426]/70 px-3 py-1.5 text-xs text-white focus:border-[#FFC21A] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-200 mb-1">
                    Igreja Local
                  </label>
                  <input
                    type="text"
                    value={church}
                    onChange={(e) => setChurch(e.target.value)}
                    className="w-full rounded-xl border border-[#092642] bg-[#031426]/70 px-3 py-1.5 text-xs text-white focus:border-[#FFC21A] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Nome do(a) Diretor(a) Responsável *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={directorName}
                    onChange={(e) => setDirectorName(e.target.value)}
                    placeholder="Nome completo do diretor"
                    className="w-full rounded-xl border border-[#092642] bg-[#031426]/70 pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-[#FFC21A] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  E-mail de Login do Diretor *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={directorEmail}
                    onChange={(e) => setDirectorEmail(e.target.value)}
                    placeholder="diretor@meuclube.org"
                    className="w-full rounded-xl border border-[#092642] bg-[#031426]/70 pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-[#FFC21A] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Criar Senha de Acesso *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full rounded-xl border border-[#092642] bg-[#031426]/70 pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-[#FFC21A] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FFC21A] to-[#F59E0B] py-3 text-xs font-bold text-[#031426] shadow-lg shadow-[#FFC21A]/20 transition-all hover:brightness-105 active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                <span>{isLoading ? 'Cadastrando Clube...' : 'Criar Clube & Iniciar'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}

          {mode === 'recover' && (
            <form onSubmit={handleRecoverSubmit} className="space-y-4">
              <div className="text-xs text-[#8FA6C2] leading-relaxed">
                Informe o e-mail cadastrado na direção do seu clube para receber as instruções de recuperação de acesso.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                  E-mail Cadastrado
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={recoverEmail}
                    onChange={(e) => setRecoverEmail(e.target.value)}
                    placeholder="email@desbravadores.org"
                    className="w-full rounded-xl border border-[#092642] bg-[#031426]/70 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#FFC21A] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#FFC21A] py-2.5 text-xs font-bold text-[#031426] hover:bg-[#FFD147] transition-all cursor-pointer"
              >
                <KeyRound className="h-4 w-4" />
                <span>{isLoading ? 'Enviando instruções...' : 'Recuperar Senha'}</span>
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  Voltar para tela de login
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Security & RLS badge */}
        <div className="text-center text-[11px] text-[#8FA6C2] flex items-center justify-center gap-1.5">
          <Shield className="h-3.5 w-3.5 text-[#FFC21A]" />
          <span>Isolamento seguro de dados por clube · Criptografia ativa</span>
        </div>
      </div>
    </div>
  );
};
