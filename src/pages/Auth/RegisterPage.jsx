import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Phone, CreditCard, Eye, EyeOff, Check, ChevronRight } from 'lucide-react';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const STEPS = ['Account', 'Personal', 'KYC'];
const step1Schema = z.object({ email: z.string().email(), password: z.string().min(8), confirmPassword: z.string() }).refine(d => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });
const step2Schema = z.object({ name: z.string().min(2), phone: z.string().regex(/^[6-9]\d{9}$/), dob: z.string().min(1) });
const step3Schema = z.object({ pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/), aadhaar: z.string().regex(/^\d{12}$/), bankAccount: z.string().min(9), ifsc: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/) });
const SCHEMAS = [step1Schema, step2Schema, step3Schema];

export default function RegisterPage() {
  const [step, setStep]         = React.useState(0);
  const [formData, setFormData] = React.useState({});
  const [loading, setLoading]   = React.useState(false);
  const { login } = useAuthStore();
  const navigate  = useNavigate();

  const { register, handleSubmit, formState: { errors }, reset } = useForm({ resolver: zodResolver(SCHEMAS[step]) });

  const onNext = async (data) => {
    const merged = { ...formData, ...data };
    setFormData(merged);
    if (step < STEPS.length - 1) { setStep(s => s + 1); reset(); }
    else {
      setLoading(true);
      await new Promise(r => setTimeout(r, 1500));
      login({ id: 'USR' + Math.floor(Math.random()*100000), name: merged.name, email: merged.email, role: 'client', kycStatus: 'pending', joinedAt: new Date().toISOString().split('T')[0] }, 'mock_jwt_client');
      toast.success('Account created! Welcome to FundFlow 🎉');
      navigate('/client/dashboard');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white">Create account</h1>
        <p className="text-sm mt-1" style={{ color: '#7a94ab' }}>Start your investment journey today</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                style={
                  i < step  ? { background: '#059669', color: '#fff' } :
                  i === step ? { background: 'linear-gradient(135deg,#0e7ee4,#1b9af5)', color: '#fff', boxShadow: '0 0 16px rgba(27,154,245,0.4)' } :
                               { background: 'rgba(27,154,245,0.1)', color: '#7a94ab' }
                }>
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              <span className="text-xs font-medium" style={{ color: i === step ? '#42b4ff' : '#7a94ab' }}>{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-0.5 mx-2 mb-4 transition-all"
                style={{ background: i < step ? '#059669' : 'rgba(27,154,245,0.15)' }} />
            )}
          </React.Fragment>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.form key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}
          onSubmit={handleSubmit(onNext)} className="space-y-4">
          {step === 0 && (
            <>
              <Input label="Email Address" type="email" icon={Mail} placeholder="you@example.com" error={errors.email?.message} required {...register('email')} />
              <Input label="Password" type="password" icon={Lock} placeholder="Min 8 characters" error={errors.password?.message} required {...register('password')} />
              <Input label="Confirm Password" type="password" icon={Lock} placeholder="Repeat password" error={errors.confirmPassword?.message} required {...register('confirmPassword')} />
            </>
          )}
          {step === 1 && (
            <>
              <Input label="Full Name" icon={User} placeholder="As per PAN card" error={errors.name?.message} required {...register('name')} />
              <Input label="Mobile Number" type="tel" icon={Phone} placeholder="10-digit number" error={errors.phone?.message} required hint="Indian mobile numbers only" {...register('phone')} />
              <Input label="Date of Birth" type="date" error={errors.dob?.message} required hint="Must be 18+ to invest" {...register('dob')} />
            </>
          )}
          {step === 2 && (
            <>
              <div className="p-3 rounded-xl" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <p className="text-xs font-medium" style={{ color: '#fbbf24' }}>⚠️ KYC required per SEBI guidelines</p>
              </div>
              <Input label="PAN Number" icon={CreditCard} placeholder="ABCDE1234F" error={errors.pan?.message} required className="uppercase" {...register('pan')} />
              <Input label="Aadhaar Number" placeholder="12-digit Aadhaar" error={errors.aadhaar?.message} required hint="Masked for security" {...register('aadhaar')} />
              <Input label="Bank Account Number" placeholder="Savings/Current" error={errors.bankAccount?.message} required {...register('bankAccount')} />
              <Input label="IFSC Code" placeholder="e.g. HDFC0001234" error={errors.ifsc?.message} required className="uppercase" {...register('ifsc')} />
            </>
          )}

          <div className="flex gap-3 pt-2">
            {step > 0 && (
              <Button variant="secondary" type="button" onClick={() => { setStep(s => s - 1); reset(); }} className="flex-1">Back</Button>
            )}
            <Button type="submit" variant="primary" size="lg" fullWidth={step === 0} loading={loading}
              icon={step < STEPS.length - 1 ? ChevronRight : undefined} iconPosition="right"
              className={step > 0 ? 'flex-1' : ''} id="register-next">
              {step < STEPS.length - 1 ? 'Continue' : 'Create Account'}
            </Button>
          </div>
        </motion.form>
      </AnimatePresence>

      <p className="text-center text-sm" style={{ color: '#7a94ab' }}>
        Already have an account?{' '}
        <Link to="/login" className="font-bold" style={{ color: '#42b4ff' }}>Sign in</Link>
      </p>
    </div>
  );
}
