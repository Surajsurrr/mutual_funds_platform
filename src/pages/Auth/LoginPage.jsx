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
    <div className="auth-card-grid">
      {/* Left Column: Heading & Demo Quick-fill */}
      <div className="space-y-8 flex flex-col">
        <div>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#12B4C3', marginBottom: '0.5rem' }}>
            • SECURE GATEWAY
          </p>
          <h1 className="text-3xl font-black text-white" style={{ color: '#ffffff', fontFamily: 'Poppins, sans-serif' }}>Welcome back</h1>
          <p className="text-sm mt-1" style={{ color: '#b0c4d8' }}>Sign in to your FundFlow account</p>
        </div>

        {/* Demo Quick-fill Stack */}
        <div className="space-y-3.5">
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#12B4C3' }}>⚡ Demo Accounts</p>
          <div className="space-y-2.5">
            {DEMO_ACCOUNTS.map(acc => (
              <button key={acc.role}
                type="button"
                onClick={() => { setValue('email', acc.email); setValue('password', acc.password); setValue('role', acc.role); toast(`Demo: ${acc.label}`, { icon: '🔑' }); }}
                className="w-full text-left rounded-xl transition-all flex items-center gap-4.5"
                style={{
                  padding: '1.1rem 1.4rem',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1.5px solid rgba(18,180,195,0.1)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor='rgba(18,180,195,0.4)';
                  e.currentTarget.style.background='rgba(18,180,195,0.04)';
                  e.currentTarget.style.boxShadow='0 4px 16px rgba(18,180,195,0.2)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor='rgba(18,180,195,0.1)';
                  e.currentTarget.style.background='rgba(255,255,255,0.02)';
                  e.currentTarget.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)';
                }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '10px',
                  background: 'rgba(18,180,195,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1px solid rgba(18,180,195,0.2)',
                  fontSize: '1.25rem',
                  flexShrink: 0,
                }}>
                  {acc.emoji}
                </div>
                <div>
                  <p style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#12B4C3' }}>{acc.label}</p>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginTop: '2px' }}>{acc.email}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Form Container */}
      <div className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Role selector */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-white">Sign in as</label>
            <div className="grid grid-cols-2 gap-2">
              {ROLE_OPTS.map(r => (
                <label key={r.value}
                  className="flex items-center gap-3 rounded-xl cursor-pointer transition-all"
                  style={{
                    padding: '1.1rem 1.4rem',
                    border: `1px solid ${selectedRole === r.value ? '#12B4C3' : 'rgba(255,255,255,0.08)'}`,
                    background: selectedRole === r.value ? 'rgba(18,180,195,0.12)' : 'rgba(255,255,255,0.02)',
                  }}>
                  <input type="radio" value={r.value} {...register('role')} className="sr-only" />
                  <span>{r.emoji}</span>
                  <span className="text-sm font-medium" style={{ color: selectedRole === r.value ? '#12B4C3' : '#b0c4d8' }}>{r.label}</span>
                </label>
              ))}
            </div>
          </div>

          <Input label="Email Address" type="email" icon={Mail} placeholder="you@example.com" error={errors.email?.message} variant="dark" style={{ padding: '1.1rem 1rem 1.1rem 2.75rem' }} {...register('email')} />

          <Input label="Password" type={showPassword ? 'text' : 'password'} icon={Lock} placeholder="••••••••"
            error={errors.password?.message}
            variant="dark"
            style={{ padding: '1.1rem 1rem 1.1rem 2.75rem' }}
            rightElement={
              <button type="button" onClick={() => setShowPassword(p => !p)} style={{ color: '#7a94ab' }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
            {...register('password')} />

          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-xs font-medium hover:underline" style={{ color: '#12B4C3' }}>Forgot password?</Link>
          </div>

          <Button type="submit" variant="primary" size="lg" fullWidth loading={loading} id="login-submit"
            style={{
              padding: '1.1rem 1.5rem',
              background: 'linear-gradient(135deg,#0B667E,#12B4C3)',
              boxShadow: '0 0 16px rgba(18,180,195,0.3)',
            }}>
            Sign In
          </Button>
        </form>

        <p className="text-center text-sm" style={{ color: '#b0c4d8' }}>
          New to FundFlow?{' '}
          <Link to="/register" className="font-bold hover:underline" style={{ color: '#12B4C3' }}>Create account</Link>
        </p>
      </div>
    </div>
  );
}
