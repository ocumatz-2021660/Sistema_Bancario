# Sistema_Bancario
Sistema bancario IN6BM

--Levantar Proyecto
1. Instalacion dependencias:  pnpm install.
2. Creacion de contenedor Docker: docker-compose up -d.
3. Creacion de base de datos postgresSQL a base del componente docker.
4. Levantar el proyecto: pnpm run dev

-- postman endpoints (importar endpoints)
1. Autenticacion: crear usuario (por defaul rango normal) rango Administrador en desarrollo.
2. Autenticacion: Verificar email por medio del token compartido por correo.
3. Autenticacion: Login, iniciar sesión con los datos del usuario (Obtiene un nuevo token ).
4. Cuenta: Crear una cuenta para el usuario, agregar el id de usuario, alias opcional .(favoritos) puede ser cuenta de AHORRO o MONETARIA.
5. Solicitud: Entidad creada manualmente temporalmente, vincular la id para la solicitud de cuenta para ser verificada por un administrador y crear su cuenta luego de verificar el estado (Aprovada/Pendiente(DEFAUL)/Denegado) de la cuenta (Futuro Servicio).
6. Perfil: Visualizar perfil usuario solamente con el token personal creado al logear la cuenta, verificar si el token es valido o generar uno nuevo (Autenticacion: Auth Type: Bearer Token: Agregar token personal).
7. Transaccion: Nesesitas tener 2 cuentas en la base de datos, luego realizar una operacion monetaria y respetar los requerimientos para su cumplimiento (tiempo de espera en desarrollo) puede ralizar (TRANSFERENCIA o DEPOSITO).
8. Historial de transacciones: Realiza una busqueda de cuenta y muestra sus ulitmas 5 transacciones
9. Servicio: Servicio intercambiable por puntos acumulados por cada operacion bancaria realizado en las cuentas (En desarrollo (Solamente se crean servicios aun no son canjeables)).

--extras
recuperacion de cuenta: Verificacion por token para restablecer la contraseña predeterminada
