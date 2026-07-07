import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, TrendingUp, Landmark, Building2, Settings, ShieldCheck, LockKeyhole, Star } from 'lucide-react';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { useAuthStore } from '../../store/authStore';
import { writeClient } from '../../api/axiosClients';
import toast from 'react-hot-toast';

const schema = z.object({
  email:    z.string().email('Enter a valid email'),
  password: z.string().min(6, 'At least 6 characters'),
  role:     z.enum(['client','cb','amc','admin']),
});

const DEMO_ACCOUNTS = [
  { role: 'client', email: 'client@fundflow.in', password: 'demo123', label: 'Investor',      icon: TrendingUp },
  { role: 'cb',     email: 'cb@fundflow.in',     password: 'demo123', label: 'Corp. Banking', icon: Landmark },
  { role: 'amc',    email: 'amc@fundflow.in',    password: 'demo123', label: 'AMC Manager',   icon: Building2 },
  { role: 'admin',  email: 'admin@fundflow.in',  password: 'demo123', label: 'Administrator', icon: Settings },
];

const ROLE_REDIRECT = { client: '/client/dashboard', cb: '/cb/dashboard', amc: '/amc/dashboard', admin: '/admin/dashboard' };

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
    try {
      const res = await writeClient.post('/auth/login', {
        email: data.email,
        password: data.password,
        role: data.role,
      });
      const { user, token } = res.data;
      login(user, token);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(location.state?.from?.pathname || ROLE_REDIRECT[user.role], { replace: true });
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const ROLE_OPTS = [
    { value: 'client', label: 'Investor',      icon: TrendingUp },
    { value: 'cb',     label: 'Corp. Banking', icon: Landmark },
    { value: 'amc',    label: 'AMC',           icon: Building2 },
    { value: 'admin',  label: 'Admin',         icon: Settings },
  ];

  return (
    <div className="auth-card-grid">
      {/* Left Column: Heading & Demo Quick-fill */}
      <div className="flex flex-col justify-center h-full" style={{ minHeight: '100%' }}>
        <div>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#12B4C3', marginBottom: '0.5rem' }}>
            • SECURE GATEWAY
          </p>
          <h1 className="text-3xl font-black text-white" style={{ color: '#ffffff', fontFamily: 'Poppins, sans-serif' }}>Welcome back</h1>
          <p className="text-sm mt-1" style={{ color: '#b0c4d8' }}>Sign in to your FundFlow account</p>
        </div>

        {/* Demo Quick-fill Stack */}
        <div className="space-y-3" style={{ marginTop: '2rem' }}>
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#12B4C3' }}>Demo Accounts</p>
          <div className="grid grid-cols-2 gap-2.5">
            {DEMO_ACCOUNTS.map(acc => {
              const AccIcon = acc.icon;
              return (
                <button key={acc.role}
                  type="button"
                  onClick={() => { setValue('email', acc.email); setValue('password', acc.password); setValue('role', acc.role); toast(`Demo Autofilled: ${acc.label}`); }}
                  className="text-left rounded-xl transition-all flex items-center gap-3"
                  style={{
                    padding: '0.8rem 1rem',
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
                    width: '36px', height: '36px', borderRadius: '8px',
                    background: 'rgba(18,180,195,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid rgba(18,180,195,0.2)',
                    flexShrink: 0,
                  }}>
                    <AccIcon size={16} style={{ color: '#12B4C3' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#12B4C3' }}>{acc.label}</p>
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#ffffff', marginTop: '1px' }} className="truncate max-w-[120px]">{acc.email}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center gap-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '2rem', paddingTop: '1.25rem' }}>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span className="text-[11px] font-bold" style={{ color: '#b0c4d8' }}>SEBI Registered</span>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <LockKeyhole size={13} className="text-cyan-400" />
            <span className="text-[11px] font-bold" style={{ color: '#b0c4d8' }}>256-bit SSL</span>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Star size={13} style={{ color: '#fbbf24', fill: '#fbbf24' }} />
            <span className="text-[11px] font-bold" style={{ color: '#b0c4d8' }}>4.9 App Rating</span>
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
              {ROLE_OPTS.map(r => {
                const OptIcon = r.icon;
                return (
                  <label key={r.value}
                    className="flex items-center gap-3 rounded-xl cursor-pointer transition-all"
                    style={{
                      padding: '0.8rem 1rem',
                      border: `1px solid ${selectedRole === r.value ? '#12B4C3' : 'rgba(255,255,255,0.08)'}`,
                      background: selectedRole === r.value ? 'rgba(18,180,195,0.12)' : 'rgba(255,255,255,0.02)',
                    }}>
                    <input type="radio" value={r.value} {...register('role')} className="sr-only" />
                    <OptIcon size={15} style={{ color: selectedRole === r.value ? '#12B4C3' : '#7a94ab' }} />
                    <span className="text-xs font-semibold" style={{ color: selectedRole === r.value ? '#12B4C3' : '#b0c4d8' }}>{r.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <Input label="Email Address" type="email" icon={Mail} placeholder="you@example.com" error={errors.email?.message} variant="dark" {...register('email')} />

          <Input label="Password" type={showPassword ? 'text' : 'password'} icon={Lock} placeholder="••••••••"
            error={errors.password?.message}
            variant="dark"
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
              padding: '0.8rem 1.5rem',
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
