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
<div className=" bg-gradient-to-b from-[#FFCB8E] via-[#FF8C03] to-[#995B11] flex items-center justify-center">
  <Card className="w-md overflow-hidden bg-white rounded-lg shadow-lg drop-shadow-[15px_15px_5px_rgba(0,0,0,0.3)] border-none">  
    <CardContent className="p-8 bg-white flex flex-col md:flex-row items-center md:items-start">
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
        <p className="text-sm text-gray-600 mt-1  text-center">Ingresa tus credenciales</p>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <Input
            type="email"
            placeholder="Correo"
            className="w-full px-4 py-2 border rounded-lg"
            value={credentials.email}
            onChange={(e) =>
              setCredentials({ ...credentials, email: e.target.value })
            }
          />

          <Input
            type="password"
            placeholder="Contraseña"
            className="w-full px-4 py-2 border rounded-lg"
            value={credentials.password}
            onChange={(e) =>
              setCredentials({ ...credentials, password: e.target.value })
            }
          />

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
      </div>

      {/* Imagen */}
      <div className="ml-8 flex drop-shadow-[-7px_15px_5px_rgba(0,0,0,0.3)]  hidden md:block">
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