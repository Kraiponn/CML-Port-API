-- CreateEnum
CREATE TYPE "NurseJobTypes" AS ENUM ('MAIN', 'OVERTIME', 'HOLIDAY', 'MEETING');

-- CreateTable
CREATE TABLE "users" (
    "id" VARCHAR(60) NOT NULL,
    "first_name" VARCHAR(50),
    "last_name" VARCHAR(50),
    "email" VARCHAR(100) NOT NULL,
    "password" TEXT NOT NULL,
    "refresh_token" TEXT,
    "date_of_birth" TIMESTAMP(3),
    "sex" VARCHAR(8) DEFAULT 'male',
    "address" VARCHAR(450),
    "phone_no" VARCHAR(20) DEFAULT '099-999-9999',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_images" (
    "id" VARCHAR(60) NOT NULL,
    "path" TEXT NOT NULL,
    "user_id" VARCHAR(60) NOT NULL,

    CONSTRAINT "profile_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" VARCHAR(60) NOT NULL,
    "title" VARCHAR(30) NOT NULL DEFAULT 'MEMBER',

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nurse_locations" (
    "id" VARCHAR(60) NOT NULL,
    "title_th" VARCHAR(100) NOT NULL DEFAULT 'โรงพยาบาลราชวิถี',
    "title_en" VARCHAR(100) NOT NULL DEFAULT 'Rajavithi Hospital',
    "address" VARCHAR(400),

    CONSTRAINT "nurse_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nurses" (
    "id" VARCHAR(60) NOT NULL,
    "job_type" "NurseJobTypes" NOT NULL DEFAULT 'MAIN',
    "working_time" TIMESTAMP(3) NOT NULL,
    "total_time" INTEGER NOT NULL,
    "nurse_location_id" VARCHAR(60) NOT NULL,
    "work_mate_id" VARCHAR(60),

    CONSTRAINT "nurses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_roles_uses" (
    "A" VARCHAR(60) NOT NULL,
    "B" VARCHAR(60) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_roles_uses_AB_unique" ON "_roles_uses"("A", "B");

-- CreateIndex
CREATE INDEX "_roles_uses_B_index" ON "_roles_uses"("B");

-- AddForeignKey
ALTER TABLE "profile_images" ADD CONSTRAINT "profile_images_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nurses" ADD CONSTRAINT "nurses_nurse_location_id_fkey" FOREIGN KEY ("nurse_location_id") REFERENCES "nurse_locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nurses" ADD CONSTRAINT "nurses_work_mate_id_fkey" FOREIGN KEY ("work_mate_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_roles_uses" ADD CONSTRAINT "_roles_uses_A_fkey" FOREIGN KEY ("A") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_roles_uses" ADD CONSTRAINT "_roles_uses_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
