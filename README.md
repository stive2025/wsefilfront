# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh


docker-compose up --build


docker exec -it react-vite-dev sh


npm run build

✅ OPCIÓN 2: Usar un contenedor temporal solo para construir
Si prefieres no entrar al contenedor sino ejecutar y salir, puedes usar este comando:

docker-compose run --rm vite-dev npm run build


--



docker build -f Dockerfile.dev -t react-vite-dev .


docker run -it --rm -v ${PWD}:/app -w /app -p 5173:5173 --name vite-shell react-vite-dev sh

docker start -ai vite-shell
