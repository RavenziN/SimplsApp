import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, User as UserIcon, ArrowLeft, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { User } from '../types';
import { getStoredUsers, saveStoredUsers, setActiveUser } from '../services/storage';
import { auth, db } from '../services/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  updateProfile 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthScreenProps {
  onLoginSuccess: (user: User) => void;
  initialMode?: 'login' | 'register';
  onOpenOnboarding?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onLoginSuccess,
  initialMode = 'login',
  onOpenOnboarding,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      const users = getStoredUsers();
      const storedUser = users.find((u) => u.id === firebaseUser.uid);

      // Keep a photo the user uploaded in the app; otherwise use the Google one.
      const googlePhoto = firebaseUser.photoURL || firebaseUser.providerData.find((p) => p.photoURL)?.photoURL;
      const photoUrl = storedUser?.photoUrl?.startsWith('data:')
        ? storedUser.photoUrl
        : googlePhoto?.replace(/=s\d+-c$/, '=s256-c') || undefined;

      const user: User = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuário Google',
        email: firebaseUser.email || '',
        ...(photoUrl ? { photoUrl } : {}),
      };

      saveStoredUsers([...users.filter((u) => u.id !== user.id), user]);
      setActiveUser(user);
      setIsLoading(false);
      onLoginSuccess(user);

      // Background Firestore sync
      setDoc(doc(db, 'users', user.id), user, { merge: true }).catch((err) => {
        console.error('Error syncing user to Firestore:', err);
      });
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Erro ao entrar com Google.');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Por favor, preencha o e-mail e a senha.');
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const firebaseUser = userCredential.user;

      let user: User = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || email.split('@')[0],
        email: firebaseUser.email || email.trim(),
        ...(firebaseUser.photoURL ? { photoUrl: firebaseUser.photoURL } : {}),
      };

      const users = getStoredUsers();
      saveStoredUsers([...users.filter((u) => u.id !== user.id), user]);
      setActiveUser(user);
      setIsLoading(false);
      onLoginSuccess(user);

      // Background Firestore sync
      setDoc(doc(db, 'users', firebaseUser.uid), user, { merge: true }).catch((err) => {
        console.error('Error syncing user to Firestore:', err);
      });
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage('E-mail ou senha inválidos. Verifique seus dados.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!name.trim()) {
      setErrorMessage('Por favor, informe seu nome.');
      return;
    }
    if (!email.trim()) {
      setErrorMessage('Por favor, informe seu e-mail.');
      return;
    }
    if (!password.trim() || password.length < 6) {
      setErrorMessage('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const firebaseUser = userCredential.user;

      if (firebaseUser) {
        updateProfile(firebaseUser, { displayName: name.trim() }).catch(() => {});
      }

      const newUser: User = {
        id: firebaseUser.uid,
        name: name.trim(),
        email: firebaseUser.email || email.trim(),
      };

      const users = getStoredUsers();
      saveStoredUsers([...users.filter((u) => u.id !== newUser.id), newUser]);
      setActiveUser(newUser);
      setIsLoading(false);
      onLoginSuccess(newUser);

      // Background Firestore sync
      setDoc(doc(db, 'users', newUser.id), newUser, { merge: true }).catch((err) => {
        console.error('Error syncing user to Firestore:', err);
      });
    } catch (err: any) {
      setIsLoading(false);
      if (err.code === 'auth/email-already-in-use') {
        setErrorMessage('Este e-mail já está cadastrado. Tente entrar.');
      } else {
        setErrorMessage(err.message || 'Erro ao criar conta.');
      }
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Informe seu e-mail para recuperar a senha.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSuccessMessage(`Instruções de redefinição foram enviadas para ${email}.`);
    }, 500);
  };

  const handleQuickDemo = () => {
    const demoUser: User = {
      id: 'demo-pedro',
      name: 'Pedro Otávio',
      email: 'pedrootavio10k@gmail.com',
    };
    const users = getStoredUsers();
    if (!users.some((u) => u.id === demoUser.id)) {
      saveStoredUsers([...users, demoUser]);
    }
    setActiveUser(demoUser);
    onLoginSuccess(demoUser);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col items-center justify-center p-4 sm:p-6 text-[#0A0A0A]">
      <div className="w-full max-w-[420px] bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-[#E5E5E5] transition-all">
        {mode === 'login' && (
          <div className="flex flex-col">
            {/* Logo */}
            <div className="mb-8 text-center">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-[#0A0A0A] font-sans">
                Simpls
              </h1>
              <h2 className="text-2xl font-bold tracking-tight text-[#0A0A0A] mt-4">
                Organize seu dia.
              </h2>
              <p className="text-sm text-[#737373] mt-1.5 font-normal">
                Tudo o que você precisa fazer, em um só lugar.
              </p>
            </div>

            {errorMessage && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-5 p-3.5 bg-neutral-100 border border-[#E5E5E5] rounded-xl flex items-center gap-2.5 text-xs text-[#0A0A0A]">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#0A0A0A]" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Google Sign-In Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-3.5 bg-white hover:bg-neutral-50 border border-[#E5E5E5] text-[#0A0A0A] font-medium text-sm rounded-2xl transition-all shadow-xs flex items-center justify-center gap-3 cursor-pointer disabled:opacity-70 mb-5"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continuar com o Google</span>
            </button>

            <div className="relative mb-5 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E5E5E5]"></div>
              </div>
              <span className="relative bg-white px-3 text-xs text-[#737373]">ou com e-mail</span>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <div className="relative flex items-center">
                  <Mail className="absolute left-4 w-4 h-4 text-[#737373]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="E-mail"
                    required
                    className="w-full pl-11 pr-4 py-3.5 bg-[#F7F7F7] border border-[#E5E5E5] rounded-2xl text-sm text-[#0A0A0A] placeholder-[#737373] focus:outline-none focus:border-[#0A0A0A] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="relative flex items-center">
                  <Lock className="absolute left-4 w-4 h-4 text-[#737373]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Senha"
                    required
                    className="w-full pl-11 pr-11 py-3.5 bg-[#F7F7F7] border border-[#E5E5E5] rounded-2xl text-sm text-[#0A0A0A] placeholder-[#737373] focus:outline-none focus:border-[#0A0A0A] focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 text-[#737373] hover:text-[#0A0A0A] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-[#0A0A0A] hover:bg-[#171717] active:scale-[0.99] text-white font-medium text-sm rounded-2xl transition-all shadow-sm flex items-center justify-center cursor-pointer disabled:opacity-70"
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  setSuccessMessage(null);
                  setMode('forgot');
                }}
                className="text-xs text-[#737373] hover:text-[#0A0A0A] transition-colors cursor-pointer"
              >
                Esqueci minha senha
              </button>
            </div>

            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E5E5E5]"></div>
              </div>
              <span className="relative bg-white px-3 text-xs text-[#737373]">ou</span>
            </div>

            {/* Quick test button */}
            <button
              type="button"
              onClick={handleQuickDemo}
              className="w-full py-3 bg-[#F7F7F7] hover:bg-[#E5E5E5] border border-[#E5E5E5] text-[#0A0A0A] font-medium text-xs rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserIcon className="w-3.5 h-3.5 text-[#0A0A0A]" />
              Acessar com Pedro Otávio (Demonstração)
            </button>

            <div className="mt-6 text-center text-xs text-[#737373]">
              Ainda não tem uma conta?{' '}
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  setSuccessMessage(null);
                  setMode('register');
                }}
                className="font-semibold text-[#0A0A0A] hover:underline cursor-pointer ml-1"
              >
                Criar conta
              </button>
            </div>

            {onOpenOnboarding && (
              <div className="mt-4 pt-4 border-t border-[#F0F0F0] text-center">
                <button
                  type="button"
                  onClick={onOpenOnboarding}
                  className="text-xs text-[#737373] hover:text-[#0A0A0A] font-medium flex items-center justify-center gap-1.5 mx-auto transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Conhecer a história do Simpls
                </button>
              </div>
            )}
          </div>
        )}

        {mode === 'register' && (
          <div className="flex flex-col">
            <button
              type="button"
              onClick={() => {
                setErrorMessage(null);
                setMode('login');
              }}
              className="self-start -ml-2 mb-6 p-2 rounded-full hover:bg-[#F7F7F7] text-[#737373] hover:text-[#0A0A0A] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-[#0A0A0A]">
                Criar conta
              </h2>
              <p className="text-sm text-[#737373] mt-1">
                Comece a organizar seus dias.
              </p>
            </div>

            {errorMessage && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <div className="relative flex items-center">
                  <UserIcon className="absolute left-4 w-4 h-4 text-[#737373]" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nome completo"
                    required
                    className="w-full pl-11 pr-4 py-3.5 bg-[#F7F7F7] border border-[#E5E5E5] rounded-2xl text-sm text-[#0A0A0A] placeholder-[#737373] focus:outline-none focus:border-[#0A0A0A] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="relative flex items-center">
                  <Mail className="absolute left-4 w-4 h-4 text-[#737373]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="E-mail"
                    required
                    className="w-full pl-11 pr-4 py-3.5 bg-[#F7F7F7] border border-[#E5E5E5] rounded-2xl text-sm text-[#0A0A0A] placeholder-[#737373] focus:outline-none focus:border-[#0A0A0A] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="relative flex items-center">
                  <Lock className="absolute left-4 w-4 h-4 text-[#737373]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Senha"
                    required
                    className="w-full pl-11 pr-11 py-3.5 bg-[#F7F7F7] border border-[#E5E5E5] rounded-2xl text-sm text-[#0A0A0A] placeholder-[#737373] focus:outline-none focus:border-[#0A0A0A] focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 text-[#737373] hover:text-[#0A0A0A] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-[#0A0A0A] hover:bg-[#171717] active:scale-[0.99] text-white font-medium text-sm rounded-2xl transition-all shadow-sm flex items-center justify-center cursor-pointer disabled:opacity-70 mt-2"
              >
                {isLoading ? 'Criando conta...' : 'Criar conta'}
              </button>
            </form>

            <p className="mt-6 text-center text-[11px] text-[#737373] leading-relaxed">
              Ao criar uma conta, você concorda com nossos Termos de Uso e Política de Privacidade.
            </p>

            <div className="mt-6 text-center text-xs text-[#737373]">
              Já possui uma conta?{' '}
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  setMode('login');
                }}
                className="font-semibold text-[#0A0A0A] hover:underline cursor-pointer ml-1"
              >
                Fazer login
              </button>
            </div>
          </div>
        )}

        {mode === 'forgot' && (
          <div className="flex flex-col">
            <button
              type="button"
              onClick={() => {
                setErrorMessage(null);
                setSuccessMessage(null);
                setMode('login');
              }}
              className="self-start -ml-2 mb-6 p-2 rounded-full hover:bg-[#F7F7F7] text-[#737373] hover:text-[#0A0A0A] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-[#0A0A0A]">
                Recuperar senha
              </h2>
              <p className="text-sm text-[#737373] mt-1">
                Enviaremos um link para você redefinir sua senha.
              </p>
            </div>

            {errorMessage && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-5 p-3.5 bg-neutral-100 border border-[#E5E5E5] rounded-xl flex items-center gap-2.5 text-xs text-[#0A0A0A]">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#0A0A0A]" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <div className="relative flex items-center">
                  <Mail className="absolute left-4 w-4 h-4 text-[#737373]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Seu e-mail cadastrado"
                    required
                    className="w-full pl-11 pr-4 py-3.5 bg-[#F7F7F7] border border-[#E5E5E5] rounded-2xl text-sm text-[#0A0A0A] placeholder-[#737373] focus:outline-none focus:border-[#0A0A0A] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-[#0A0A0A] hover:bg-[#171717] active:scale-[0.99] text-white font-medium text-sm rounded-2xl transition-all shadow-sm flex items-center justify-center cursor-pointer disabled:opacity-70"
              >
                {isLoading ? 'Enviando...' : 'Enviar instruções'}
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-[#737373]">
              Lembrou a senha?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="font-semibold text-[#0A0A0A] hover:underline cursor-pointer ml-1"
              >
                Voltar para o login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
