"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type AdminRole = 'admin' | 'mla' | null;

interface User {
    email: string;
    role: AdminRole;
    loginTime: string;
}

interface LoginContextType {
    user: User | null;
    loading: boolean;
    checkExistingSession: () => void;
}

const LoginContext = createContext<LoginContextType | undefined>(undefined);

export function LoginProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const checkExistingSession = () => {
        try {
            setLoading(true);
            
            // Only check localStorage for existing session - no API calls
            const storedUser = localStorage.getItem('civicpath_user');
            if (storedUser) {
                try {
                    const userData: User = JSON.parse(storedUser);
                    // Check if session is still valid (less than 24 hours old)
                    const loginTime = new Date(userData.loginTime);
                    const now = new Date();
                    const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);
                    
                    if (hoursDiff < 24) {
                        setUser(userData);
                        console.log('✅ Existing session found on login page:', userData);
                        return;
                    } else {
                        // Session expired
                        localStorage.removeItem('civicpath_user');
                        console.log('⚠️ Session expired, cleared localStorage');
                    }
                } catch (parseError) {
                    console.error('Error parsing stored user data:', parseError);
                    localStorage.removeItem('civicpath_user');
                }
            }

            // No valid session found
            setUser(null);
            console.log('ℹ️ No existing session on login page');
            
        } catch (error) {
            console.error('Session check failed:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkExistingSession();
    }, []);

    const value: LoginContextType = {
        user,
        loading,
        checkExistingSession
    };

    return (
        <LoginContext.Provider value={value}>
            {children}
        </LoginContext.Provider>
    );
}

export function useLogin() {
    const context = useContext(LoginContext);
    if (context === undefined) {
        throw new Error('useLogin must be used within LoginProvider');
    }
    return context;
}