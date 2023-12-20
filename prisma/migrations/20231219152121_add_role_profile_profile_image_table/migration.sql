-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('GUEST', 'CUSTOMER', 'EMPLOYEE', 'MANAGER', 'ADMIN');

-- CreateTable
CREATE TABLE "profiles" (
    "id" VARCHAR(60) NOT NULL,
    "date_of_birth" TIMESTAMP(3),
    "sex" VARCHAR(8) NOT NULL DEFAULT 'male',
    "address" VARCHAR(450),
    "user_id" VARCHAR(60) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_images" (
    "id" VARCHAR(60) NOT NULL,
    "path" TEXT NOT NULL,
    "profile_id" VARCHAR(60) NOT NULL,

    CONSTRAINT "profile_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" VARCHAR(60) NOT NULL,
    "title" "RoleType" NOT NULL DEFAULT 'GUEST',

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_roles_uses" (
    "A" VARCHAR(60) NOT NULL,
    "B" VARCHAR(60) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_user_id_key" ON "profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "_roles_uses_AB_unique" ON "_roles_uses"("A", "B");

-- CreateIndex
CREATE INDEX "_roles_uses_B_index" ON "_roles_uses"("B");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_images" ADD CONSTRAINT "profile_images_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_roles_uses" ADD CONSTRAINT "_roles_uses_A_fkey" FOREIGN KEY ("A") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_roles_uses" ADD CONSTRAINT "_roles_uses_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
