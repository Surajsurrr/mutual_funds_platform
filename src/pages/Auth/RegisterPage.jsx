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

  const STEP_DETAILS = [
    { title: 'Account Settings', desc: 'Secure email and password combination', icon: Mail },
    { title: 'Personal Profile', desc: 'Full name, mobile and birth date details', icon: User },
    { title: 'KYC Verification', desc: 'SEBI regulatory PAN, Aadhaar and bank details', icon: CreditCard }
  ];

  return (
    <div className="auth-card-grid">
      {/* Left Column: Heading & Stepper Stack */}
      <div className="space-y-8 flex flex-col">
        <div>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#12B4C3', marginBottom: '0.5rem' }}>
            • STEPS TO JOIN
          </p>
          <h1 className="text-3xl font-black text-white" style={{ color: '#ffffff', fontFamily: 'Poppins, sans-serif' }}>Create account</h1>
          <p className="text-sm mt-1" style={{ color: '#b0c4d8' }}>Start your investment journey today</p>
        </div>

        {/* Vertical Stepper Stack */}
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#12B4C3' }}>📋 Registration Progress</p>
          <div className="space-y-3">
            {STEP_DETAILS.map((sDetail, i) => {
              const StepIcon = sDetail.icon;
              const isActive = step === i;
              const isCompleted = step > i;

              return (
                <div key={i}
                  className="p-3.5 rounded-xl transition-all flex items-center gap-4.5"
                  style={{
                    padding: '1.1rem 1.4rem',
                    background: 'rgba(255,255,255,0.02)',
                    border: `1.5px solid ${isActive ? '#12B4C3' : 'rgba(255,255,255,0.05)'}`,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    opacity: isCompleted || isActive ? 1 : 0.45,
                  }}>
                  {/* Status Circle */}
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '10px',
                    background: isCompleted ? 'rgba(5, 150, 105, 0.15)' : (isActive ? 'rgba(18, 180, 195, 0.15)' : 'rgba(255,255,255,0.05)'),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: `1px solid ${isCompleted ? '#059669' : (isActive ? '#12B4C3' : 'rgba(255,255,255,0.1)')}`,
                    color: isCompleted ? '#059669' : (isActive ? '#12B4C3' : '#7a94ab'),
                    flexShrink: 0,
                  }}>
                    {isCompleted ? <Check size={18} /> : (
                      <StepIcon size={18} />
                    )}
                  </div>
                  <div>
                    <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: isCompleted ? '#059669' : (isActive ? '#12B4C3' : '#b0c4d8') }}>
                      Step {i+1}: {sDetail.title}
                    </p>
                    <p style={{ fontSize: '0.8rem', color: isCompleted || isActive ? '#ffffff' : '#7a94ab', marginTop: '2px' }}>
                      {sDetail.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Column: Form Inputs */}
      <div className="space-y-6">
        <AnimatePresence mode="wait">
          <motion.form key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}
            onSubmit={handleSubmit(onNext)} className="space-y-4">
            {step === 0 && (
              <>
                <Input label="Email Address" type="email" icon={Mail} placeholder="you@example.com" error={errors.email?.message} required variant="dark" style={{ padding: '1.1rem 1rem 1.1rem 2.75rem' }} {...register('email')} />
                <Input label="Password" type="password" icon={Lock} placeholder="Min 8 characters" error={errors.password?.message} required variant="dark" style={{ padding: '1.1rem 1rem 1.1rem 2.75rem' }} {...register('password')} />
                <Input label="Confirm Password" type="password" icon={Lock} placeholder="Repeat password" error={errors.confirmPassword?.message} required variant="dark" style={{ padding: '1.1rem 1rem 1.1rem 2.75rem' }} {...register('confirmPassword')} />
              </>
            )}
            {step === 1 && (
              <>
                <Input label="Full Name" icon={User} placeholder="As per PAN card" error={errors.name?.message} required variant="dark" style={{ padding: '1.1rem 1rem 1.1rem 2.75rem' }} {...register('name')} />
                <Input label="Mobile Number" type="tel" icon={Phone} placeholder="10-digit number" error={errors.phone?.message} required hint="Indian mobile numbers only" variant="dark" style={{ padding: '1.1rem 1rem 1.1rem 2.75rem' }} {...register('phone')} />
                <Input label="Date of Birth" type="date" error={errors.dob?.message} required hint="Must be 18+ to invest" variant="dark" style={{ padding: '1.1rem 1rem' }} {...register('dob')} />
              </>
            )}
            {step === 2 && (
              <>
                <div className="p-3 rounded-xl" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
                  <p className="text-xs font-semibold" style={{ color: '#fbbf24' }}>⚠️ KYC required per SEBI guidelines</p>
                </div>
                <Input label="PAN Number" icon={CreditCard} placeholder="ABCDE1234F" error={errors.pan?.message} required className="uppercase" variant="dark" style={{ padding: '1.1rem 1rem 1.1rem 2.75rem' }} {...register('pan')} />
                <Input label="Aadhaar Number" placeholder="12-digit Aadhaar" error={errors.aadhaar?.message} required hint="Masked for security" variant="dark" style={{ padding: '1.1rem 1rem' }} {...register('aadhaar')} />
                <Input label="Bank Account Number" placeholder="Savings/Current" error={errors.bankAccount?.message} required variant="dark" style={{ padding: '1.1rem 1rem' }} {...register('bankAccount')} />
                <Input label="IFSC Code" placeholder="e.g. HDFC0001234" error={errors.ifsc?.message} required className="uppercase" variant="dark" style={{ padding: '1.1rem 1rem' }} {...register('ifsc')} />
              </>
            )}

            <div className="flex gap-3 pt-2">
              {step > 0 && (
                <Button variant="secondary" type="button" onClick={() => { setStep(s => s - 1); reset(); }} className="flex-1" style={{ padding: '1.1rem 1.5rem' }}>Back</Button>
              )}
              <Button type="submit" variant="primary" size="lg" fullWidth={step === 0} loading={loading}
                icon={step < STEPS.length - 1 ? ChevronRight : undefined} iconPosition="right"
                className={step > 0 ? 'flex-1' : ''} id="register-next"
                style={{
                  padding: '1.1rem 1.5rem',
                  background: 'linear-gradient(135deg,#0B667E,#12B4C3)',
                  boxShadow: '0 0 16px rgba(18,180,195,0.3)',
                }}>
                {step < STEPS.length - 1 ? 'Continue' : 'Create Account'}
              </Button>
            </div>
          </motion.form>
        </AnimatePresence>

        <p className="text-center text-sm" style={{ color: '#b0c4d8' }}>
          Already have an account?{' '}
          <Link to="/login" className="font-bold hover:underline" style={{ color: '#12B4C3' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
