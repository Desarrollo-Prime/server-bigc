-- PostgreSQL database dump
--

-- Crear base de datos
CREATE DATABASE BIGC;

-- Tabla para Roles de Usuario
CREATE TABLE public."Role" (
    "Id" SERIAL PRIMARY KEY,
    "Name" VARCHAR(100) NOT NULL,
    "CreatedDate" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreatedBy" VARCHAR(100) NOT NULL,
    "ModifiedDate" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ModifiedBy" VARCHAR(100) NOT NULL,
    "Enable" BOOLEAN NOT NULL DEFAULT true
);

-- Tabla para Compañías
CREATE TABLE public."Company" (
    "Id" SERIAL PRIMARY KEY,
    "Name" VARCHAR(200) NOT NULL,
    "CreatedDate" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreatedBy" VARCHAR(100) NOT NULL,
    "ModifiedDate" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ModifiedBy" VARCHAR(100) NOT NULL,
    "Enabled" BOOLEAN DEFAULT true NOT NULL
);

-- Tabla para Áreas
CREATE TABLE public."Area" (
    "Id" SERIAL PRIMARY KEY,
    "CompanyId" INTEGER REFERENCES public."Company"("Id"),
    "Name" VARCHAR(100) NOT NULL,
    "Description" VARCHAR(500),
    "CreatedDate" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreatedBy" VARCHAR(100) NOT NULL,
    "ModifiedDate" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ModifiedBy" VARCHAR(100) NOT NULL
);

-- Tabla para Perfiles de Usuario
CREATE TABLE public."ProfileUser" (
    "Id" SERIAL PRIMARY KEY,
    "CompanyId" INTEGER REFERENCES public."Company"("Id"),
    "FirstName" VARCHAR(200) NOT NULL,
    "LastName" VARCHAR(200) NOT NULL,
    "Email" VARCHAR(500) UNIQUE NOT NULL,
    "UserName" VARCHAR(100) UNIQUE NOT NULL,
    "Password" VARCHAR(100) NOT NULL,
    "Phone" VARCHAR(100) NOT NULL,
    "CreatedDate" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreatedBy" VARCHAR(100) NOT NULL,
    "ModifiedDate" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ModifiedBy" VARCHAR(100) NOT NULL,
    "Enable" BOOLEAN NOT NULL DEFAULT true,
    "Blocked" BOOLEAN NOT NULL DEFAULT false
);

-- Tabla para Asignación de Roles a Usuarios
CREATE TABLE public."UserRole" (
    "Id" SERIAL PRIMARY KEY,
    "UserId" INTEGER NOT NULL REFERENCES public."ProfileUser"("Id"),
    "RoleId" INTEGER NOT NULL REFERENCES public."Role"("Id"),
    "CreatedDate" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreatedBy" VARCHAR(100) NOT NULL,
    "ModifiedDate" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ModifiedBy" VARCHAR(100) NOT NULL,
    UNIQUE ("UserId", "RoleId")
);

-- Tabla para Tipos de Documentos (Estados)
CREATE TABLE public."DocumentStatus" (
    "Id" SERIAL PRIMARY KEY,
    "Name" VARCHAR(100) NOT NULL,
    "Description" VARCHAR(500),
    "CreatedDate" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreatedBy" VARCHAR(100) NOT NULL,
    "ModifiedDate" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ModifiedBy" VARCHAR(100) NOT NULL
);

-- Tabla para Documentos
CREATE TABLE public."Document" (
    "Id" SERIAL PRIMARY KEY,
    "CompanyId" INTEGER NOT NULL REFERENCES public."Company"("Id"),
    "AreaId" INTEGER REFERENCES public."Area"("Id"),
    "UserId" INTEGER REFERENCES public."ProfileUser"("Id"),
    "Name" VARCHAR(500) NOT NULL,
    "Description" TEXT,
    "FileName" VARCHAR(500),
    "FileExtension" VARCHAR(100),
    "FilePath" VARCHAR(500) NOT NULL,
    "StatusId" INTEGER NOT NULL REFERENCES public."DocumentStatus"("Id"),
    "CreatedDate" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreatedBy" VARCHAR(100) NOT NULL,
    "ModifiedDate" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ModifiedBy" VARCHAR(100) NOT NULL
);

-- Tabla para Permisos de Documentos
CREATE TABLE public."DocumentPermission" (
    "Id" SERIAL PRIMARY KEY,
    "DocumentId" INTEGER NOT NULL REFERENCES public."Document"("Id"),
    "RoleId" INTEGER NOT NULL REFERENCES public."Role"("Id"),
    "CanView" BOOLEAN NOT NULL DEFAULT false,
    "CanEdit" BOOLEAN NOT NULL DEFAULT false,
    "CanDelete" BOOLEAN NOT NULL DEFAULT false,
    "CreatedDate" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreatedBy" VARCHAR(100) NOT NULL,
    "ModifiedDate" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ModifiedBy" VARCHAR(100) NOT NULL,
    UNIQUE ("DocumentId", "RoleId")
);

-- Insertar roles básicos
INSERT INTO public."Role" ("Name", "CreatedBy", "ModifiedBy") VALUES 
('SuperAdministrador', 'system', 'system'),
('Administrador', 'system', 'system'),
('Usuario', 'system', 'system');

-- Insertar estados básicos de documentos
INSERT INTO public."DocumentStatus" ("Name", "Description", "CreatedBy", "ModifiedBy") VALUES 
('Activo', 'Documento disponible para visualización', 'system', 'system'),
('Inactivo', 'Documento no disponible', 'system', 'system'),
('Pendiente', 'Documento pendiente de revisión', 'system', 'system'),
('Rechazado', 'Documento rechazado', 'system', 'system');

-- Insertar compañía por defecto
INSERT INTO public."Company" ("Name", "CreatedBy", "ModifiedBy") VALUES 
('Prime Digital', 'system', 'system');

-- Insertar usuario SuperAdministrador inicial
INSERT INTO public."ProfileUser" (
    "CompanyId", "FirstName", "LastName", "Email", "UserName", "Password", 
    "Phone", "CreatedBy", "ModifiedBy"
) VALUES (
    1, 'Admin', 'Prime', 'admin@prime.com', 'admin', 
    '914A8F1C07561D222A2E60F2E6F5DBD0ACF33C79FA16488C028359C7C2E9CEB8', -- Contraseña: Admin123*
    '3001234567', 'system', 'system'
);

-- Asignar rol de SuperAdministrador al usuario admin
INSERT INTO public."UserRole" ("UserId", "RoleId", "CreatedBy", "ModifiedBy") VALUES 
(1, 1, 'system', 'system');

-- Crear índices para mejorar rendimiento
CREATE INDEX idx_document_company ON public."Document" ("CompanyId");
CREATE INDEX idx_document_area ON public."Document" ("AreaId");
CREATE INDEX idx_document_user ON public."Document" ("UserId");
CREATE INDEX idx_document_status ON public."Document" ("StatusId");
CREATE INDEX idx_userrole_user ON public."UserRole" ("UserId");
CREATE INDEX idx_userrole_role ON public."UserRole" ("RoleId");
CREATE INDEX idx_documentpermission_document ON public."DocumentPermission" ("DocumentId");
CREATE INDEX idx_documentpermission_role ON public."DocumentPermission" ("RoleId");
CREATE INDEX idx_area_company ON public."Area" ("CompanyId");
CREATE INDEX idx_profileuser_company ON public."ProfileUser" ("CompanyId");


-- Crear Usuario Admin
-- Secrip para ejecutar despues
-- Insertar el usuario SuperAdministrador
INSERT INTO public."ProfileUser" (
    "CompanyId",
    "FirstName",
    "LastName",
    "Email",
    "UserName",
    "Password",
    "Phone",
    "CreatedBy",
    "ModifiedBy"
) VALUES (
    1, -- ID de la compañía Prime Digital (asumiendo que es 1)
    'Willson',
    'Russi Avila',
    'pqrs@primedigitale.com',
    'wrussi', -- Nombre de usuario generado
    'A4F1C3B962D5E7F890D1B2C3D4E5F6A7B8C9D0E1F2A3B4C5D6E7F8A9B0C1D2', -- Contraseña Colombia9. hasheada
    '3102048329',
    'system',
    'system'
);

-- Asignar rol de SuperAdministrador al nuevo usuario
INSERT INTO public."UserRole" (
    "UserId",
    "RoleId",
    "CreatedBy",
    "ModifiedBy"
) VALUES (
    (SELECT "Id" FROM public."ProfileUser" WHERE "Email" = 'pqrs@primedigitale.com'),
    (SELECT "Id" FROM public."Role" WHERE "Name" = 'SuperAdministrador'),
    'system',
    'system'
);

-- Verificar que el usuario fue creado correctamente
SELECT
    u."Id",
    u."FirstName",
    u."LastName",
    u."Email",
    u."UserName",
    u."Phone",
    r."Name" AS "Role"
FROM
    public."ProfileUser" u
JOIN
    public."UserRole" ur ON u."Id" = ur."UserId"
JOIN
    public."Role" r ON ur."RoleId" = r."Id"
WHERE
    u."Email" = 'pqrs@primedigitale.com';