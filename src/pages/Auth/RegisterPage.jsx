import React, { useState } from 'react';
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

const step1Schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'At least 8 characters'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const step2Schema = z.object({
  name: z.string().min(2, 'Enter your full name'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  dob: z.string().min(1, 'Date of birth is required'),
});

const step3Schema = z.object({
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format (e.g. ABCDE1234F)'),
  aadhaar: z.string().regex(/^\d{12}$/, 'Aadhaar must be 12 digits'),
  bankAccount: z.string().min(9, 'Enter valid account number'),
  ifsc: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code'),
});

const SCHEMAS = [step1Schema, step2Schema, step3Schema];

export default function RegisterPage() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(SCHEMAS[step]),
  });

  const onNext = async (data) => {
    const merged = { ...formData, ...data };
    setFormData(merged);

    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
      reset();
    } else {
      // Final submit
      setLoading(true);
      await new Promise(r => setTimeout(r, 1500));
      const newUser = {
        id: 'USR' + Math.floor(Math.random() * 100000),
        name: merged.name,
        email: merged.email,
        phone: merged.phone,
        pan: merged.pan,
        kycStatus: 'pending',
        role: 'client',
        joinedAt: new Date().toISOString().split('T')[0],
      };
      login(newUser, 'mock_jwt_token_client');
      toast.success('Account created successfully! Welcome to FundFlow 🎉');
      navigate('/client/dashboard');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white">Create account</h1>
        <p className="text-slate-400 mt-1">Start your investment journey today</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-0">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <div className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                i < step ? 'bg-emerald-500 text-white' :
                i === step ? 'gradient-primary text-white shadow-lg shadow-blue-600/30' :
                'bg-navy-700 text-slate-400'
              }`}>
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              <span className={`text-xs font-medium ${i === step ? 'text-blue-400' : 'text-slate-500'}`}>{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 mb-4 transition-all ${i < step ? 'bg-emerald-500' : 'bg-navy-700'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.form
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          onSubmit={handleSubmit(onNext)}
          className="space-y-4"
        >
          {step === 0 && (
            <>
              <Input label="Email Address" type="email" icon={Mail} placeholder="you@example.com" error={errors.email?.message} required {...register('email')} />
              <div className="relative">
                <Input label="Password" type={showPass ? 'text' : 'password'} icon={Lock} placeholder="Min 8 characters" error={errors.password?.message} required
                  rightElement={<button type="button" onClick={() => setShowPass(p => !p)} className="text-slate-400 hover:text-white"><EyeOff size={15} /></button>}
                  {...register('password')}
                />
              </div>
              <Input label="Confirm Password" type="password" icon={Lock} placeholder="Repeat password" error={errors.confirmPassword?.message} required {...register('confirmPassword')} />
            </>
          )}

          {step === 1 && (
            <>
              <Input label="Full Name" icon={User} placeholder="As per PAN card" error={errors.name?.message} required {...register('name')} />
              <Input label="Mobile Number" type="tel" icon={Phone} placeholder="10-digit number" error={errors.phone?.message} required
                hint="Indian mobile numbers only (6-9 XXXXXXXXX)"
                {...register('phone')}
              />
              <Input label="Date of Birth" type="date" error={errors.dob?.message} required
                hint="You must be 18+ to invest"
                {...register('dob')}
              />
            </>
          )}

          {step === 2 && (
            <>
              <div className="p-3 glass-light rounded-xl border border-amber-600/20">
                <p className="text-xs text-amber-400 font-medium">⚠️ KYC required for investments per SEBI guidelines</p>
              </div>
              <Input label="PAN Number" icon={CreditCard} placeholder="ABCDE1234F" error={errors.pan?.message} required
                className="uppercase" {...register('pan')}
              />
              <Input label="Aadhaar Number" placeholder="12-digit Aadhaar" error={errors.aadhaar?.message} required
                hint="Masked for security after verification"
                {...register('aadhaar')}
              />
              <Input label="Bank Account Number" placeholder="Savings/Current account" error={errors.bankAccount?.message} required {...register('bankAccount')} />
              <Input label="IFSC Code" placeholder="e.g. HDFC0001234" error={errors.ifsc?.message} required className="uppercase" {...register('ifsc')} />
            </>
          )}

          <div className="flex gap-3 pt-2">
            {step > 0 && (
              <Button variant="ghost" type="button" onClick={() => { setStep(s => s - 1); reset(); }} className="flex-1">
                Back
              </Button>
            )}
            <Button type="submit" variant="gradient" size="lg" fullWidth={step === 0} loading={loading}
              icon={step < STEPS.length - 1 ? ChevronRight : undefined}
              iconPosition="right"
              className={step > 0 ? 'flex-1' : ''}
              id="register-next"
            >
              {step < STEPS.length - 1 ? 'Continue' : 'Create Account'}
            </Button>
          </div>
        </motion.form>
      </AnimatePresence>

      <p className="text-center text-sm text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">Sign in</Link>
      </p>
    </div>
  );
}
