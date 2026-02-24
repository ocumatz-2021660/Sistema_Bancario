# Sistema_Bancario
Sistema bancario IN6BM

--Levantar Proyecto
1. Instalacion dependencias:  pnpm install.
2. Creacion de contenedor Docker: docker-compose up -d.
3. Creacion de base de datos postgresSQL a base del componente docker.
4. Levantar el proyecto: pnpm run dev

-- postman endpoints (importar endpoints)

• Funcionalidad Proyecto 

•Obtener Perfil administrador 
______________________________

Al inicializarse el proyecto por defecto se creara un usuario administrador ( "emailOrUsername": "admin",  "password": "Admin1234!")
-- (AUTH -> INICIAR_SESION -> LOGIN ) (genera token de administrador para funciones de rango ADMIN_ROLE)

•Crear y verificar Usuarios
___________________________
1. Crear 2 cuentas para futuras comparaciones (Transacciones)
verificar tener disposición de los correos electrónicos para recibir los tokens 
el correo administrador será el que se encuentre en sus variables de entorno (evite utilizarlo)

-- (AUTH -> USERS -> ADD_USERS ) 

user1 -("name": "Cumatz","surname": "Lopez","username": "ocumatz","email": "ocumatz-2021660@kinal.edu.gt","password": "Password123!","confirmPassword": "Password123!","phone": "55895932")
user2 -("name": "Sebas","surname": "lopez","username": "ElSebastianPro","email": "elsebastian259@gmail.com","password": "Password123!","confirmPassword": "Password123!","phone": "55895933")

2. verificar las cuentas por medio de correo electrónico (token)
-- (AUTH -> VERIFY_EMAIL -> VERIFY_EMAIL ) agregar el token enviado por correo electrónico 

3. Iniciar sesión con los datos del usuario ya verificado (si no esta verificado no iniciara sesión)(si los datos no coinciden durante 5 intentos se bloquea el inicio de sesión durante 60s)
-- (AUTH -> INICIAR_SESION -> LOGIN ) 
user1("emailOrUsername": "ocumatz","password": "Password123!")
user2("emailOrUsername": "ElSebastianPro","password": "Password123!")

• ((OPCIONAL) probar verificacion de contraseña)
_________________________________________________
1.agregar el correo electronico al que se desea cambiar la contraseña

-- (AUTH -> FORGET_PASSWORD -> VERIFY_ACCOUNT )
("email": "ocumatz-2021660@kinal.edu.gt")

2.agregar token encontrado por via electronica y verificar nueva contraseña
-- (AUTH -> FORGET_PASSWORD -> NEW_PASSWORD )
user1 ( "token": "FUsttZrZfpPo-bVh1XV9tYbzZD_G3SnYfA7hV5c0DkM","newPassword": "24489607","confirmPassword": "24489607")

• Funciones de ADMINISTRADOR (USER_ROLE -> ADMIN_ROLE)
_____________________________________________________

1. Obtener la lista de todos los usuarios existentes (require token de ADMINISTRADOR, si no pertenece a un administrador no realizara la peticion)
-- (ADMIN -> ADMIN_ROLES -> GET_ALL_USERS)
guardar el id del usuario que deseamos cambiar (user1 para seguir los pasos)

2. Actualizar el rango del usuario seleccionado, colocar su id en la ruta del endpoint (encabezado) y token ADMINISTRADOR, si no es administrador no realizara la acción 
puede cambiar de USER_ROLE a ADMIN_ROLE y viceversa
no puedes cambiar tu propia cuenta a USER_ROL
-- (ADMIN -> ADMIN_ROLES -> UPDATE_ROLE)
("roleName": "ADMIN_ROLE")

3.Desabilitar cuentas por medio de estado del usuario seleccionado, colocar su id en la ruta del endpoint (encabezado) y token ADMINISTRADOR, si no es administrador no realizara la acción 
si el usuario quiere iniciar sesión con su cuenta deshabilitada no se le permitirá ingresar asta que se comunique con un administrador
-- (ADMIN -> ADMIN_ROLES -> DESABILITI_USER)
("accountStatus": "deshabilitado") (user2 para seguir los pasos)
3.1 también se puede volver a activar la cuenta seleccionada por medio de una actualización de estado a activo
("accountStatus": "activo") (user2 para seguir los pasos)


• Crear cuenta (Requiere verificación de administradores (REQUEST_ACCOUNTS))
___________________________________________________________________________

1. Crear una cuenta con mínimo de 100Q, seleccionar los tipos existentes a un usuario activo, no puede tener 2 cuentas del mismo tipo (MONETARIA, AHORRO)
-- (ACCOUNT -> ADD_ACOUNT)
user1(  "saldo": 500,"tipo_cuenta": "AHORRO","usuario_cuenta": "usr_apkEBk4i8vpJ")
user2(  "saldo": 401,"tipo_cuenta": "MONETARIA", "usuario_cuenta": "usr_bZXirH3qSpNB")

Si la cuenta es de tipo AHORRO, esta generara intereses con el tiempo (1 minuto = +1 en el saldo de la cuenta) por medio de node-cron

2. al crear la cuenta se generara una solicitud de forma automática, Ingresar a solicitudes en estado PENDIENTE por default, ingresar en forma de administrador para continuar
Ingresar ala petición GET_REQUEST_ACCOUNTS(ADMIN) y agregar el token de administrador, si no es token de administrador no realizara la peticion
-- (REQUEST_ACCOUNTS -> GET_REQUEST_ACCOUNTS(ADMIN))

3. Existen 2 rutas para realizar acciones (APROVED_REQUEST)(DENIED_REQUEST) ambas requieren un token de administrador, si no es de administrador no realizara la accion
--(REQUEST_ACCOUNTS -> APROVED_REQUEST)(REQUEST_ACCOUNTS -> DENIED_REQUEST)
(APROVED_REQUEST) aprueba la solicitud que tenga su ID presente en la ruta (aprobar cuenta user1, user2 para probar transacciones)
(DENIED_REQUEST) niega la solicitud que tenga su ID presnte en la ruta y elimina la cuenta automáticamente

4. Ver cuentas creadas (solo administradores), ingresar el token de administrador para ver las cuentas existentes, si no es token de administrador no se 
-- (ACCOUNT -> GET_ACCOUNTS(ADMIN))
realizara la acción

5. Actualizar Salgo (Solo administradors), solo administradores pueden cambiar el saldo de las cuentas, si no es administrador no se realizara la accion (agregar token)
-- (ACCOUNT -> UPDATE_SALDO(ADMIN))

6.Desacrivar cuenta (Solo administradores) , cambia el estado de las cuentas y evita que realizen acciones y su uso, solo puede ser desactivada por administradores
-- (ACCOUNT -> DESACTIVE_ACCOUNTS(ADMIN))

• Realizar Transacciones (TRANSFERENCIA', 'DEPOSITO) 
____________________________________________________
1.Realisar una transaccion respetando los saldos de las cuentas (si se realiza una operacion sin saldo suficiente se cancelara)
--(TRANSACCION -> CREAR_TRANSACCION)
user1("monto": 50,"tipo_transaccion": "TRANSFERENCIA","cuenta_origen": "4637690266","cuenta_destinatoria": "1574769559")

2. Ver transacciones, se mostraran todas las transacciones realizadas en el sistema
-- (TRANSACCION -> LISTA_TRANSACCIONSE)

3. Busca el hisotiral de transacciones por medio de un no. de cuenta 
-- (TRANSACCION -> historial transaccion)

4. Eliminar transacciones (solo administradores pueden realizarlo) si pasa mas de 60s no se podrá eliminar la transacción y se almacenara los cambios de salgo en cada cuenta
si se cancela la transacción se regresara el dinero a la cuenta de origen y se restara a la cuenta destinada
se restaran los puntos de servicio al no haber realizado la operación
-- (TRANSACCION -> CANCELAR_TRANSACCION)
("monto": 10,"tipo_transaccion": "TRANSFERENCIA","cuenta_origen": "6805726024","cuenta_destinatoria": "8150512524")

• Conversion Monetaria (USD) 
______________________________
1. Al momento de ingresar la ruta Ver Transacciones, al final de la ruta especificar la moneda que se desea realizar la conversion (USD por ejemplo)


• Servicios
______________
En desarrollo

Aumento de 1Q por cada 10 segundos en cuentas de ahorro

crear servicios fijos

canjear servicios por medio de puntos (entidad canjear servicios)(validar puntos nesearios)

--extras
recuperacion de cuenta: Verificacion por token para restablecer la contraseña predeterminada

-- Créditos
Este proyecto utiliza como base el código de [AuthServiceIN6BM-NodeJS(https://github.com/esantos2019254/Node-AuthService-IN6B.git)].  
Desarollado por [Elmer Santos](https://github.com/esantos2019254).