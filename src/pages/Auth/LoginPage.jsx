import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, TrendingUp } from 'lucide-react';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { useAuthStore } from '../../store/authStore';
import { MOCK_USER, ROLES } from '../../utils/mockData';
import toast from 'react-hot-toast';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['client', 'cb', 'amc', 'admin']),
});

const DEMO_ACCOUNTS = [
  { role: 'client', email: 'client@fundflow.in', password: 'demo123', label: 'Investor' },
  { role: 'cb', email: 'cb@fundflow.in', password: 'demo123', label: 'Corporate Banking' },
  { role: 'amc', email: 'amc@fundflow.in', password: 'demo123', label: 'AMC Manager' },
  { role: 'admin', email: 'admin@fundflow.in', password: 'demo123', label: 'Administrator' },
];

const ROLE_REDIRECT = {
  client: '/client/dashboard',
  cb: '/cb/dashboard',
  amc: '/amc/dashboard',
  admin: '/admin/dashboard',
};

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: 'client', email: '', password: '' },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200)); // Simulate API

    // Mock auth — replace with real API call
    const mockUser = {
      ...MOCK_USER,
      role: data.role,
      email: data.email,
      name: data.role === 'admin' ? 'Admin User' :
            data.role === 'cb' ? 'Vikram CB' :
            data.role === 'amc' ? 'Mugilan AMC' : 'Suraj Kumar',
    };

    login(mockUser, 'mock_jwt_token_' + data.role);
    toast.success(`Welcome back, ${mockUser.name}!`);
    const from = location.state?.from?.pathname || ROLE_REDIRECT[data.role];
    navigate(from, { replace: true });
    setLoading(false);
  };

  const fillDemo = (account) => {
    setValue('email', account.email);
    setValue('password', account.password);
    setValue('role', account.role);
    toast(`Filled demo: ${account.label}`, { icon: '🔑' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white">Welcome back</h1>
        <p className="text-slate-400 mt-1">Sign in to your FundFlow account</p>
      </div>

      {/* Demo Accounts */}
      <div className="glass rounded-xl p-4 border border-blue-600/15">
        <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">⚡ Demo Accounts</p>
        <div className="grid grid-cols-2 gap-2">
          {DEMO_ACCOUNTS.map(acc => (
            <button
              key={acc.role}
              onClick={() => fillDemo(acc)}
              className="text-left px-3 py-2 rounded-lg glass-light hover:bg-navy-700 transition-colors"
            >
              <p className="text-xs font-semibold text-blue-400">{acc.label}</p>
              <p className="text-xs text-slate-500 truncate">{acc.email}</p>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Role Selector */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-300">Sign in as</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'client', label: 'Investor', icon: '📈' },
              { value: 'cb', label: 'Corp. Banking', icon: '🏦' },
              { value: 'amc', label: 'AMC', icon: '🏢' },
              { value: 'admin', label: 'Admin', icon: '⚙️' },
            ].map(r => (
              <label
                key={r.value}
                className="flex items-center gap-2 p-2.5 rounded-xl cursor-pointer glass-light border border-transparent has-[:checked]:border-blue-500 has-[:checked]:bg-blue-600/10 transition-all"
              >
                <input type="radio" value={r.value} {...register('role')} className="sr-only" />
                <span>{r.icon}</span>
                <span className="text-sm text-slate-300">{r.label}</span>
              </label>
            ))}
          </div>
        </div>

        <Input
          label="Email Address"
          type="email"
          icon={Mail}
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          icon={Lock}
          placeholder="••••••••"
          error={errors.password?.message}
          rightElement={
            <button type="button" onClick={() => setShowPassword(p => !p)} className="text-slate-400 hover:text-white">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
          {...register('password')}
        />

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" variant="gradient" size="lg" fullWidth loading={loading} id="login-submit">
          Sign In
        </Button>
      </form>

      <p className="text-center text-sm text-slate-400">
        New to FundFlow?{' '}
        <Link to="/register" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
          Create account
        </Link>
      </p>
    </div>
  );
}
