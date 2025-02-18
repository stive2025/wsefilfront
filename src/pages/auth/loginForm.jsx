import { useState } from 'react';
import "tailwindcss";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const LoginForm = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí se conectaría con el backend
    console.log('Enviando credenciales:', credentials);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFCB8E]  via-[#FF8C03]  via-[#FF8C03]  via-[#FF8C03] via-[#BB6B0D] to-[#995B11] flex items-center justify-center p-4">
      <Card className="w-full max-w-md overflow-hidden">
        <CardContent className="p-6 bg-white">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-2xl font-bold tracking-wide text-gray-900">
                BIENVENIDO
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Ingresa tus credenciales
              </p>
            </div> 
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                type="email"
                placeholder="Correo"
                className="w-full px-4 py-2 border rounded-lg"
                value={credentials.email}
                onChange={(e) => setCredentials({
                  ...credentials,
                  email: e.target.value
                })}
              />
            </div>

            <div>
              <Input
                type="password"
                placeholder="Contraseña"
                className="w-full px-4 py-2 border rounded-lg"
                value={credentials.password}
                onChange={(e) => setCredentials({
                  ...credentials,
                  password: e.target.value
                })}
              />
            </div>

            <div className="flex gap-4 mt-6">
              <Button
                type="button"
                variant="secondary"
                className="w-1/2 bg-[#23AAA6] text-white hover:bg-[#009793] rounded-lg py-2"
              >
                Restablecer
              </Button>
              <Button
                type="submit"
                className="w-1/2 bg-[#FFAA44] text-white hover:bg-[#FF9619] rounded-lg py-2"
              >
                Ingresar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm; 