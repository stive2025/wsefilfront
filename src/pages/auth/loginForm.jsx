import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import "tailwindcss";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/authContext';
import { Loader2 } from "lucide-react";

const LoginForm = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const success = await login(credentials);
      if (success) {
        navigate("/chatList");
      } else {
        setError('Credenciales incorrectas');
      }
    } catch (error) {
      setError(error.message || 'Error al iniciar sesión');
    }
  };

  return (
    <div className="h-screen w-full bg-gradient-to-b from-[#FFCB8E] via-[#FF8C03] to-[#995B11] flex items-center justify-center relative">
      {/* Overlay de Loading */}
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm">
          <div className="rounded-full">
            <Loader2 className="h-12 w-12 animate-spin text-[#FFAA44]" />
          </div>
        </div>
      )}


      <Card className="w-[90%] max-w-sm md:max-w-md overflow-hidden bg-white rounded-lg shadow-lg drop-shadow-[15px_15px_5px_rgba(0,0,0,0.3)] border-none p-6">
        <CardContent className="bg-white flex flex-col md:flex-row items-center md:items-start">
          {/* Formulario */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-wide text-gray-900 text-center">
              BIENVENIDO
            </h1>
            <div>
              <img
                className='justify-center'
                src="./images/divLine.png"
                alt="-:-"
              />
            </div>
            <p className="text-sm text-gray-600 mt-1 text-center">Ingresa tus credenciales</p>

            {error && (
              <div className="mt-2 text-red-500 text-sm text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6 mt-4">
              <Input
                type="email"
                placeholder="Correo"
                className="px-4 py-2 border rounded-lg"
                value={credentials.email}
                onChange={(e) =>
                  setCredentials({ ...credentials, email: e.target.value })
                }
                required
              />

              <Input
                type="password"
                placeholder="Contraseña"
                className="px-4 py-2 border rounded-lg"
                value={credentials.password}
                onChange={(e) =>
                  setCredentials({ ...credentials, password: e.target.value })
                }
                required
              />

              <div className="flex justify-center mt-6">
                <Button
                  type="submit"
                  className="bg-[#FFAA44] text-white hover:bg-[#FF9619] rounded-lg py-2 w-full"
                >
                  Ingresar
                </Button>
              </div>
            </form>
          </div>

          {/* Imagen */}
          <div className="ml-8 hidden drop-shadow-[-7px_15px_5px_rgba(0,0,0,0.3)] md:block">
            <img
              src="./images/log_in.png"
              alt="CRM SEFIL"
              className="h-64 object-cover hidden md:block rounded-lg"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;