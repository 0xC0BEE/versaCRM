import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../services/apiClient';
import toast from 'react-hot-toast';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import { QUICK_LOGIN_USERS } from '../../config/constants';

const LoginPage: React.FC = () => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const user = await apiClient.login(email);
            if (user) {
                toast.success(`Welcome back, ${user.name}!`);
                login(user);
            } else {
                toast.error('Invalid credentials. Please try again.');
            }
        } catch (error) {
            toast.error('An error occurred during login.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const quickLogin = async (email: string) => {
        setIsLoading(true);
        const user = await apiClient.login(email);
        if (user) {
             toast.success(`Welcome back, ${user.name}!`);
             login(user);
        }
        setIsLoading(false);
    }

    return (
        <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">VersaCRM</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <Input id="email" label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="super@crm.com" required />
                            <Input id="password" label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? 'Logging in...' : 'Sign In'}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex-col">
                         <div className="mt-4 pt-4 border-t border-border-subtle text-center text-sm w-full">
                            <p className="font-semibold mb-2 text-text-secondary">Quick Logins (Demo)</p>
                            <div className="flex flex-wrap justify-center gap-2">
                                {QUICK_LOGIN_USERS.map(user => (
                                    <Button key={user.email} size="sm" variant="outline" onClick={() => quickLogin(user.email)} disabled={isLoading}>{user.label}</Button>
                                ))}
                            </div>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default LoginPage;