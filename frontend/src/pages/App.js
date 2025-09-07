import React, { useState, useEffect, useReducer, createContext, useContext } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

// Variáveis de ambiente globais fornecidas pelo ambiente.
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Contexto de autenticação para compartilhar o estado do usuário.
const AuthContext = createContext(null);

const initialState = {
    isAuthReady: false,
    isAuthenticated: false,
    user: null,
    isAdmin: false,
    view: 'login', // 'login', 'register', 'dashboard', 'admin'
    message: '',
};

function authReducer(state, action) {
    switch (action.type) {
        case 'AUTH_READY':
            return { ...state, isAuthReady: true, isAuthenticated: !!action.payload, user: action.payload, isAdmin: action.payload?.isAdmin };
        case 'LOGIN':
            return { ...state, isAuthenticated: true, user: action.payload, isAdmin: action.payload.isAdmin, view: action.payload.isAdmin ? 'admin' : 'dashboard', message: 'Login realizado com sucesso.' };
        case 'LOGOUT':
            return { ...state, isAuthenticated: false, user: null, isAdmin: false, view: 'login', message: 'Desconectado.' };
        case 'SET_VIEW':
            return { ...state, view: action.payload, message: '' };
        case 'SET_MESSAGE':
            return { ...state, message: action.payload };
        default:
            throw new Error('Ação desconhecida.');
    }
}

// Componente principal da aplicação
export default function App() {
    const [state, dispatch] = useReducer(authReducer, initialState);
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState('');
    const [modalMessage, setModalMessage] = useState('');

    // Inicializa o Firebase e a autenticação.
    useEffect(() => {
        try {
            if (Object.keys(firebaseConfig).length === 0) {
                console.error("Firebase config is missing. Please provide it.");
                return;
            }

            const app = initializeApp(firebaseConfig);
            const authInstance = getAuth(app);
            const dbInstance = getFirestore(app);

            const setupAuth = async () => {
                try {
                    if (initialAuthToken) {
                        await signInWithCustomToken(authInstance, initialAuthToken);
                    } else {
                        await signInAnonymously(authInstance);
                    }
                    const currentUser = authInstance.currentUser;
                    if (currentUser) {
                        setUserId(currentUser.uid);
                        const userDocRef = doc(dbInstance, `artifacts/${appId}/users/${currentUser.uid}/profile/info`);
                        const userDocSnap = await getDoc(userDocRef);
                        if (userDocSnap.exists()) {
                            const userData = userDocSnap.data();
                            dispatch({ type: 'AUTH_READY', payload: userData });
                        } else {
                            // No user data found, treat as unauthenticated
                            dispatch({ type: 'AUTH_READY', payload: null });
                        }
                    } else {
                        setUserId(crypto.randomUUID());
                        dispatch({ type: 'AUTH_READY', payload: null });
                    }
                } catch (error) {
                    console.error('Erro na autenticação:', error);
                    setUserId(crypto.randomUUID());
                    dispatch({ type: 'AUTH_READY', payload: null });
                }
            };

            setupAuth();

            setAuth(authInstance);
            setDb(dbInstance);

        } catch (error) {
            console.error("Erro ao inicializar o Firebase:", error);
        }
    }, []);

    const handleAPIError = (error) => {
        console.error('Erro na requisição da API:', error);
        let errorMessage = 'Ocorreu um erro. Tente novamente.';
        if (error.response && error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message;
        }
        setModalMessage(errorMessage);
    };

    const handleLogin = async (email, password) => {
        dispatch({ type: 'SET_MESSAGE', payload: '' });
        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Falha no login.');
            }
            // Aqui você normalmente faria login com um token de retorno.
            // Para este exemplo, simulamos o estado.
            const user = data.user;
            dispatch({ type: 'LOGIN', payload: { ...user, token: data.token } });

            const userDocRef = doc(db, `artifacts/${appId}/users/${user.id}/profile/info`);
            await setDoc(userDocRef, { ...user, isAdmin: user.isAdmin });

        } catch (error) {
            handleAPIError(error);
        }
    };

    const handleRegister = async (username, email, password) => {
        dispatch({ type: 'SET_MESSAGE', payload: '' });
        try {
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Falha no cadastro.');
            }
            setModalMessage('Usuário cadastrado com sucesso. Faça login para continuar.');
            dispatch({ type: 'SET_VIEW', payload: 'login' });
        } catch (error) {
            handleAPIError(error);
        }
    };

    const handleLogout = () => {
        dispatch({ type: 'LOGOUT' });
    };

    const renderView = () => {
        const { view, isAuthenticated, isAdmin } = state;
        if (!state.isAuthReady) {
            return (
                <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
                    <div className="text-gray-900 dark:text-gray-100 text-lg">Carregando...</div>
                </div>
            );
        }

        if (!isAuthenticated) {
            switch (view) {
                case 'register':
                    return <Register onRegister={handleRegister} setView={(v) => dispatch({ type: 'SET_VIEW', payload: v })} />;
                default:
                    return <Login onLogin={handleLogin} setView={(v) => dispatch({ type: 'SET_VIEW', payload: v })} />;
            }
        }

        if (isAuthenticated && isAdmin) {
            return <AdminPanel />;
        }

        if (isAuthenticated) {
            return <Dashboard />;
        }

        return null;
    };

    return (
        <AuthContext.Provider value={{ ...state, dispatch, userId, handleLogout }}>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 p-8">
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">Sistema de Autenticação</h1>
                    <nav className="flex items-center space-x-4">
                        {state.isAuthenticated ? (
                            <>
                                <span className="text-sm">Olá, {state.user?.username}!</span>
                                <button
                                    onClick={handleLogout}
                                    className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-full shadow-md transition-colors"
                                >
                                    Sair
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => dispatch({ type: 'SET_VIEW', payload: 'login' })}
                                    className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-full shadow-md transition-colors"
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => dispatch({ type: 'SET_VIEW', payload: 'register' })}
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-full shadow-md transition-colors"
                                >
                                    Cadastrar
                                </button>
                            </>
                        )}
                    </nav>
                </header>
                <div className="flex justify-center">
                    {renderView()}
                </div>
                {state.message && <Modal message={state.message} onClose={() => dispatch({ type: 'SET_MESSAGE', payload: '' })} />}
                {modalMessage && <Modal message={modalMessage} onClose={() => setModalMessage('')} />}
            </div>
        </AuthContext.Provider>
    );
}

// -------------------------------------------------------------
// Componentes de visualização (Login, Cadastro, Dashboard, Admin)
// -------------------------------------------------------------

function Login({ onLogin, setView }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onLogin(email, password);
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="E-mail"
                    className="w-full px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Senha"
                    className="w-full px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                />
                <button
                    type="submit"
                    className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 rounded-full shadow-md transition-colors"
                >
                    Entrar
                </button>
            </form>
            <div className="mt-4 text-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Não tem uma conta?</span>
                <button
                    onClick={() => setView('register')}
                    className="ml-1 text-indigo-500 hover:underline font-semibold"
                >
                    Cadastre-se
                </button>
            </div>
        </div>
    );
}

function Register({ onRegister, setView }) {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onRegister(username, email, password);
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-2xl font-bold text-center mb-6">Cadastre-se</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Nome de Usuário"
                    className="w-full px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                />
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="E-mail"
                    className="w-full px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Senha"
                    className="w-full px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                />
                <button
                    type="submit"
                    className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 rounded-full shadow-md transition-colors"
                >
                    Criar Conta
                </button>
            </form>
            <div className="mt-4 text-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Já tem uma conta?</span>
                <button
                    onClick={() => setView('login')}
                    className="ml-1 text-indigo-500 hover:underline font-semibold"
                >
                    Entrar
                </button>
            </div>
        </div>
    );
}

function Dashboard() {
    const { user, userId } = useContext(AuthContext);
    return (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-2xl w-full">
            <h2 className="text-2xl font-bold mb-4">Bem-vindo, {user?.username || 'Usuário'}!</h2>
            <p className="text-gray-700 dark:text-gray-300">Este é o seu painel de usuário. Você pode acessar recursos exclusivos aqui.</p>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Seu ID de Usuário para colaboração: <span className="font-mono bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-md">{userId}</span></p>
        </div>
    );
}

function AdminPanel() {
    const { user } = useContext(AuthContext);
    return (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-3xl w-full">
            <h2 className="text-2xl font-bold mb-4">Painel de Administração</h2>
            <p className="text-gray-700 dark:text-gray-300">Olá, Administrador {user?.username}! Você tem acesso total ao sistema.</p>
            <div className="mt-4">
                {/* Aqui você adicionaria funcionalidades de administração, como listagem de usuários. */}
                <p className="text-gray-600 dark:text-gray-400">Funcionalidades de administração viriam aqui...</p>
            </div>
        </div>
    );
}

function Modal({ message, onClose }) {
    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm w-full text-center">
                <p className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">{message}</p>
                <button
                    onClick={onClose}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-full shadow-md transition-colors"
                >
                    Fechar
                </button>
            </div>
        </div>
    );
}
