import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { useAuthStore } from '../../store/authStore';
import { MOCK_USER } from '../../utils/mockData';
import toast from 'react-hot-toast';

const schema = z.object({
  email:    z.string().email('Enter a valid email'),
  password: z.string().min(6, 'At least 6 characters'),
  role:     z.enum(['client','cb','amc','admin']),
});

const DEMO_ACCOUNTS = [
  { role: 'client', email: 'client@fundflow.in', password: 'demo123', label: 'Investor',      emoji: '📈' },
  { role: 'cb',     email: 'cb@fundflow.in',     password: 'demo123', label: 'Corp. Banking', emoji: '🏦' },
  { role: 'amc',    email: 'amc@fundflow.in',    password: 'demo123', label: 'AMC Manager',   emoji: '🏢' },
  { role: 'admin',  email: 'admin@fundflow.in',  password: 'demo123', label: 'Administrator', emoji: '⚙️' },
];

const ROLE_REDIRECT = { client: '/client/dashboard', cb: '/cb/dashboard', amc: '/amc/dashboard', admin: '/admin/dashboard' };
const ROLE_NAMES    = { client: 'Suraj Kumar', cb: 'Vikram CB', amc: 'Mugilan AMC', admin: 'Admin User' };

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const { login } = useAuthStore();
  const navigate  = useNavigate();
  const location  = useLocation();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: 'client', email: '', password: '' },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    const mockUser = { ...MOCK_USER, role: data.role, email: data.email, name: ROLE_NAMES[data.role] };
    login(mockUser, 'mock_jwt_token_' + data.role);
    toast.success(`Welcome, ${mockUser.name}!`);
    navigate(location.state?.from?.pathname || ROLE_REDIRECT[data.role], { replace: true });
    setLoading(false);
  };

  const ROLE_OPTS = [
    { value: 'client', label: 'Investor',      emoji: '📈' },
    { value: 'cb',     label: 'Corp. Banking', emoji: '🏦' },
    { value: 'amc',    label: 'AMC',           emoji: '🏢' },
    { value: 'admin',  label: 'Admin',         emoji: '⚙️' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white">Welcome back</h1>
        <p className="text-sm mt-1" style={{ color: '#7a94ab' }}>Sign in to your FundFlow account</p>
      </div>

      {/* Demo Quick-fill */}
      <div className="rounded-xl p-4" style={{ background: 'rgba(27,154,245,0.06)', border: '1px solid rgba(27,154,245,0.15)' }}>
        <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#42b4ff' }}>⚡ Demo Quick-fill</p>
        <div className="grid grid-cols-2 gap-2">
          {DEMO_ACCOUNTS.map(acc => (
            <button key={acc.role}
              onClick={() => { setValue('email', acc.email); setValue('password', acc.password); setValue('role', acc.role); toast(`Demo: ${acc.label}`, { icon: '🔑' }); }}
              className="text-left px-3 py-2.5 rounded-lg transition-all"
              style={{ background: 'rgba(27,154,245,0.08)', border: '1px solid rgba(27,154,245,0.12)' }}
              onMouseEnter={e => e.currentTarget.style.borderColor='rgba(27,154,245,0.4)'}
              onMouseLeave={e => e.currentTarget.style.borderColor='rgba(27,154,245,0.12)'}>
              <p className="text-xs font-bold text-white">{acc.emoji} {acc.label}</p>
              <p className="text-xs truncate mt-0.5" style={{ color: '#7a94ab' }}>{acc.email}</p>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Role selector */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-white">Sign in as</label>
          <div className="grid grid-cols-2 gap-2">
            {ROLE_OPTS.map(r => (
              <label key={r.value}
                className="flex items-center gap-2 p-2.5 rounded-xl cursor-pointer transition-all"
                style={{
                  border: `1px solid ${selectedRole === r.value ? '#1b9af5' : 'rgba(27,154,245,0.15)'}`,
                  background: selectedRole === r.value ? 'rgba(27,154,245,0.12)' : 'rgba(27,154,245,0.04)',
                }}>
                <input type="radio" value={r.value} {...register('role')} className="sr-only" />
                <span>{r.emoji}</span>
                <span className="text-sm font-medium" style={{ color: selectedRole === r.value ? '#42b4ff' : '#b0c4d8' }}>{r.label}</span>
              </label>
            ))}
          </div>
        </div>

        <Input label="Email Address" type="email" icon={Mail} placeholder="you@example.com" error={errors.email?.message} {...register('email')} />

        <Input label="Password" type={showPassword ? 'text' : 'password'} icon={Lock} placeholder="••••••••"
          error={errors.password?.message}
          rightElement={
            <button type="button" onClick={() => setShowPassword(p => !p)} style={{ color: '#7a94ab' }}>
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
          {...register('password')} />

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-xs font-medium" style={{ color: '#42b4ff' }}>Forgot password?</Link>
        </div>

        <Button type="submit" variant="primary" size="lg" fullWidth loading={loading} id="login-submit">
          Sign In
        </Button>
      </form>

      <p className="text-center text-sm" style={{ color: '#7a94ab' }}>
        New to FundFlow?{' '}
        <Link to="/register" className="font-bold" style={{ color: '#42b4ff' }}>Create account</Link>
      </p>
    </div>
  );
}
