import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import "tailwindcss";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useFetchAndLoad } from "/src/hooks/fechAndload.jsx";
import { loginService,setAuthToken,setUserData  } from "/src/services/authService.js"; // Asegúrate de importar loginService

const LoginForm = () => {
  const navigate = useNavigate();
  const { loading, callEndpoint } = useFetchAndLoad();
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
  
    try {
      const apiCall = loginService(credentials);      
      const response = await callEndpoint(apiCall, 'login');
  
      if (response && response.token) {
        // Use authService functions instead of direct cookie access
        setAuthToken(response.token.plainTextToken);
        
        if (response.user) {
          setUserData(response.user);
        }
  
        navigate("/chatList");
      } else {
        setError('No se recibió token de autenticación');
      }
    } catch (error) {
      setError(error.message || 'Error al iniciar sesión');
    }
  };

  const handleReset = () => {
    setCredentials({
      email: '',
      password: ''
    });
    setError('');
  };

  return (
    <div className="h-screen w-full bg-gradient-to-b from-[#FFCB8E] via-[#FF8C03] to-[#995B11] flex items-center justify-center">
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
                src="/src/assets/images/divLine.png"
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

              <div className="flex gap-4 mt-6 flex items-center justify-center">
                <Button
                  type="button"
                  variant="secondary"
                  className="bg-[#23AAA6] text-white hover:bg-[#009793] rounded-lg py-2"
                  onClick={handleReset}
                  disabled={loading}
                >
                  Restablecer
                </Button>
                <Button
                  type="submit"
                  className="bg-[#FFAA44] text-white hover:bg-[#FF9619] rounded-lg py-2"
                  disabled={loading}
                >
                  {loading ? 'Cargando...' : 'Ingresar'}
                </Button>
              </div>
            </form>
          </div>

          {/* Imagen */}
          <div className="ml-8 flex drop-shadow-[-7px_15px_5px_rgba(0,0,0,0.3)] hidden md:block">
            <img
              src="/src/assets/images/log_in.png"
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
